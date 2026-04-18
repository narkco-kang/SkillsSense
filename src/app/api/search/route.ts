/**
 * POST /api/search
 *
 * Multi-source search flow with streaming tutorials:
 *  1. AI parse intent (fast, return immediately)
 *  2. Parallel search across multiple sources
 *  3. Stream tutorials as they complete (not waiting for all)
 *  4. If nothing found → AI generate new skill + guidance
 *
 * Response format: Server-Sent Events (SSE) with JSON
 */

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getAllSkills, type Skill } from "@/lib/skills-data";
import { isSupabaseConfigured, matchSkills } from "@/lib/supabase";
import { isEmbeddingConfigured, embed } from "@/lib/embeddings";
import { searchSkillsmp, isSkillsmpEnabled } from "@/lib/skillsmp";
import { findSimilarSkills, generateNewSkill, saveGeneratedSkill, loadGeneratedSkills } from "@/lib/skill-generator";
import { generateGuidance, type GuidanceStep } from "@/lib/guidance";
import { searchAllSources, isSourceEnabled, type SourceResult } from "@/lib/sources";

export const runtime = "nodejs";
export const maxDuration = 90;

const BodySchema = z.object({
  query: z.string().min(2).max(500),
  language: z.enum(["en", "zh", "auto"]).optional().default("auto"),
  stream: z.boolean().optional().default(true),
});

const IntentSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()),
  domain: z.string().optional(),
  language: z.enum(["en", "zh"]).optional(),
});

type Intent = z.infer<typeof IntentSchema>;

function detectLanguage(text: string): "en" | "zh" {
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
  const cjkMatches = text.match(cjkRegex) || [];
  const cjkRatio = cjkMatches.length / text.length;
  return cjkRatio > 0.3 ? "zh" : "en";
}

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
// Use fast model for intent, quality model for tutorials
const INTENT_MODEL = "deepseek/deepseek-chat-v3";
const TUTORIAL_MODEL = "deepseek/deepseek-chat-v3";

function getOpenRouter(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: OPENROUTER_BASE,
    defaultHeaders: {
      "HTTP-Referer": "https://skillssense.app",
      "X-Title": "SkillsSense",
    },
  });
}

async function parseIntent(client: OpenAI, query: string, lang: "en" | "zh"): Promise<Intent> {
  const sys = `You parse user needs into structured intents for a skill-discovery platform.
Return STRICT JSON: { "summary": string, "keywords": string[], "domain": string }.
- summary: one sentence (<= 20 words, in the SAME LANGUAGE as the user's input) describing what the user is trying to do.
- keywords: 4-8 lowercase english tags covering topic, tools, verbs, domain.
- domain: one of [software-development, ai-ml, data, devops, productivity, research, creative, other].
No prose, no markdown, JSON only.`;
  const res = await client.chat.completions.create({
    model: INTENT_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: query },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 300,
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = IntentSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { ...parsed.data, language: lang };
  } catch {
    // fall through
  }
  return {
    summary: query.slice(0, 120),
    keywords: query.toLowerCase().split(/\s+/).slice(0, 8),
    domain: "other",
    language: lang,
  };
}

function scoreSkill(skill: Skill, intent: Intent): number {
  const hay = [
    skill.name,
    skill.description,
    skill.category,
    skill.whenToUse,
    ...skill.tags,
  ]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const kw of intent.keywords) {
    const k = kw.toLowerCase().trim();
    if (!k || k.length < 2) continue;
    if (hay.includes(k)) score += 2;
  }
  if (intent.domain && skill.category.toLowerCase().includes(intent.domain))
    score += 1;
  for (const w of intent.summary.toLowerCase().split(/\W+/)) {
    if (w.length >= 4 && hay.includes(w)) score += 0.25;
  }
  return score;
}

async function generateTutorial(
  client: OpenAI,
  query: string,
  skill: Skill,
  lang: "en" | "zh",
): Promise<string> {
  const langInstruction = lang === "zh"
    ? "你必須用繁體中文回覆。"
    : "You must respond in English.";
  const sys = `You write short, vivid tutorials that teach a user how to apply a skill to their specific need.
Format: markdown. 4-6 sections max. Each section ONE short paragraph or 2-3 bullets.
${langInstruction}
Include: (1) why this skill fits their need, (2) quick-start steps, (3) one concrete example, (4) a pitfall to avoid.
Be concrete and warm. No fluff. No meta commentary.`;

  const user = `User need: "${query}"

Skill: ${skill.name}
Category: ${skill.category}
Description: ${skill.description}
When to use: ${skill.whenToUse}
Tags: ${skill.tags.join(", ")}
Reference link: ${skill.url}

Write the tutorial now.`;

  const res = await client.chat.completions.create({
    model: TUTORIAL_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });
  return res.choices[0]?.message?.content?.trim() || "";
}

type PickedSkill = { skill: Skill; score: number; source: "local" | "huggingface" | "github-topic" | "awesome-list" };

type MultiSourceResult = {
  skill: Partial<Skill>;
  score: number;
  source: "huggingface" | "github-topic" | "awesome-list";
  matchScore: number;
  sourceScore: number;
};

async function pickSkills(
  query: string,
  intent: Intent,
  allSkills: Skill[],
): Promise<{ picks: PickedSkill[]; mode: "semantic" | "keyword" }> {
  if (isSupabaseConfigured() && isEmbeddingConfigured()) {
    try {
      const embedText = `${query}\n\n${intent.summary}\nkeywords: ${intent.keywords.join(", ")}`;
      const vec = await embed(embedText);
      const matched = await matchSkills(vec, 3, 0.15);
      if (matched.length > 0) {
        return {
          mode: "semantic",
          picks: matched.map((m) => ({
            skill: {
              id: m.id,
              name: m.name,
              category: m.category,
              description: m.description,
              whenToUse: m.when_to_use ?? "",
              tags: m.tags,
              source: m.source as Skill["source"],
              url: m.url,
            },
            score: m.similarity,
            source: "local" as const,
          })),
        };
      }
    } catch (err) {
      console.warn("[skillssense] semantic search failed, falling back:", err);
    }
  }

  const scored = allSkills
    .map((s) => ({ skill: s, score: scoreSkill(s, intent) }))
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3).filter((r) => r.score > 0);
  return {
    mode: "keyword",
    picks: top.length
      ? top.map((r) => ({ ...r, source: "local" as const }))
      : scored.slice(0, 3).map((r) => ({ ...r, source: "local" as const })),
  };
}

// Helper to send SSE event
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { query, stream } = parsed.data;
  const requestedLang = parsed.data.language || "auto";
  const detectedLang = requestedLang === "auto" ? detectLanguage(query) : requestedLang;

  const router = getOpenRouter();
  if (!router) {
    return Response.json(
      {
        error:
          "OPENROUTER_API_KEY not set. Add it to .env.local to enable AI search.",
      },
      { status: 503 }
    );
  }

  // Non-streaming fallback
  if (!stream) {
    return handleNonStreaming(req, router, query, detectedLang);
  }

  // Streaming mode
  return handleStreaming(router, query, detectedLang);
}

async function handleNonStreaming(
  req: NextRequest,
  router: OpenAI,
  query: string,
  detectedLang: "en" | "zh",
) {
  // Simplified non-streaming path for compatibility
  const intent = await parseIntent(router, query, detectedLang);
  const allSkills = getAllSkills();

  const skillsmpResult = isSkillsmpEnabled()
    ? await searchSkillsmp(query).catch(() => ({ found: false, url: null }))
    : { found: false, url: null };

  const [localResult, externalResults] = await Promise.allSettled([
    pickSkills(query, intent, allSkills),
    searchAllSources({ query, intent, limitPerSource: 3, timeout: 10000 }),
  ]);

  const { picks: localPicks, mode } = localResult.status === "fulfilled"
    ? localResult.value
    : { picks: [] as PickedSkill[], mode: "keyword" as const };

  const externalPicks: MultiSourceResult[] = externalResults.status === "fulfilled"
    ? externalResults.value.map(r => ({
        skill: r.skill,
        score: r.matchScore,
        source: r.source,
        matchScore: r.matchScore,
        sourceScore: r.sourceScore,
      }))
    : [];

  const hasLocalResults = localPicks.some((p) => p.score > 0);
  const hasExternalResults = externalPicks.length > 0;

  // Phase 3: generate if nothing found
  let generatedSkill: { name: string; category: string; description: string; tags: string[]; tutorial: string; savedPath?: string } | null = null;
  let guidance: GuidanceStep[] | null = null;

  if (!hasLocalResults && !hasExternalResults) {
    const similarSkills = findSimilarSkills(allSkills, intent, 3);
    if (similarSkills.length > 0) {
      try {
        const generated = await generateNewSkill(router, query, intent, similarSkills);
        const tutorial = await generateTutorial(router, query, {
          ...generated,
          id: generated.name.toLowerCase().replace(/\s+/g, "-"),
          source: "generated",
          url: "",
        } as Skill, detectedLang);
        const savedPath = await saveGeneratedSkill({ ...generated, tutorial }, tutorial);
        generatedSkill = { ...generated, tutorial, savedPath };
      } catch (genErr) {
        console.warn("[skillssense] skill generation failed:", genErr);
        guidance = await generateGuidance(router, query, intent, detectedLang);
      }
    } else {
      guidance = await generateGuidance(router, query, intent, detectedLang);
    }
  }

  // Build all results with tutorials
  const topLocal = localPicks.slice(0, 3);
  const topExternal = externalPicks.slice(0, 3);

  const allPromises = [
    ...topLocal.map((r) => ({
      skill: r.skill, score: r.score, source: r.source,
      sourceLabel: r.source === "local" ? "本地技能" : r.source,
      p: generateTutorial(router, query, r.skill, detectedLang),
    })),
    ...topExternal.map((r) => ({
      skill: { id: r.skill.id || `ext-${r.source}-${r.skill.name}`, name: r.skill.name || "Unknown", category: r.skill.category || "other", description: r.skill.description || "", tags: r.skill.tags || [], whenToUse: r.skill.whenToUse || "", source: r.source, url: r.skill.url || "" } as Skill,
      score: r.score, source: r.source,
      sourceLabel: getSourceLabel(r.source),
      p: r.skill.description ? generateTutorial(router, query, r.skill as Skill, detectedLang) : Promise.resolve(""),
    })),
  ];

  const resolved = await Promise.all(allPromises.map(async (r) => ({ skill: r.skill, score: r.score, source: r.source, sourceLabel: r.sourceLabel, tutorial: await r.p })));

  const allResults = resolved.sort((a, b) => b.score - a.score).slice(0, 6);

  return Response.json({
    query,
    intent,
    mode,
    results: allResults,
    skillsmpFound: skillsmpResult.found,
    skillsmpUrl: skillsmpResult.url,
    generatedSkill,
    guidance,
    language: detectedLang,
    sourcesSearched: {
      local: hasLocalResults,
      huggingface: externalResults.status === "fulfilled",
      githubTopics: externalResults.status === "fulfilled",
      awesomeLists: externalResults.status === "fulfilled",
    },
  });
}

async function handleStreaming(
  router: OpenAI,
  query: string,
  detectedLang: "en" | "zh",
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)));
      };

      try {
        // Step 1: Parse intent immediately
        send("status", { step: "intent", message: "解析需求中..." });
        const intent = await parseIntent(router, query, detectedLang);
        send("intent", intent);

        const allSkills = getAllSkills();

        // Step 2: Parallel search
        send("status", { step: "search", message: "搜索多個來源..." });
        const skillsmpResult = isSkillsmpEnabled()
          ? await searchSkillsmp(query).catch(() => ({ found: false, url: null }))
          : { found: false, url: null };

        const [localResult, externalResults] = await Promise.allSettled([
          pickSkills(query, intent, allSkills),
          searchAllSources({ query, intent, limitPerSource: 3, timeout: 10000 }),
        ]);

        const { picks: localPicks, mode } = localResult.status === "fulfilled"
          ? localResult.value
          : { picks: [] as PickedSkill[], mode: "keyword" as const };

        const externalPicks: MultiSourceResult[] = externalResults.status === "fulfilled"
          ? externalResults.value.map(r => ({
              skill: r.skill,
              score: r.matchScore,
              source: r.source,
              matchScore: r.matchScore,
              sourceScore: r.sourceScore,
            }))
          : [];

        const hasLocalResults = localPicks.some((p) => p.score > 0);
        const hasExternalResults = externalPicks.length > 0;

        send("sources", {
          skillsmpFound: skillsmpResult.found,
          skillsmpUrl: skillsmpResult.url,
          sourcesSearched: {
            local: hasLocalResults,
            huggingface: externalResults.status === "fulfilled",
            githubTopics: externalResults.status === "fulfilled",
            awesomeLists: externalResults.status === "fulfilled",
          },
        });

        // Step 3: Handle no-results case
        if (!hasLocalResults && !hasExternalResults) {
          send("status", { step: "generating", message: "找不到匹配，正在生成..." });
          const similarSkills = findSimilarSkills(allSkills, intent, 3);
          if (similarSkills.length > 0) {
            try {
              const generated = await generateNewSkill(router, query, intent, similarSkills);
              const tutorial = await generateTutorial(router, query, {
                ...generated,
                id: generated.name.toLowerCase().replace(/\s+/g, "-"),
                source: "generated",
                url: "",
              } as Skill, detectedLang);
              const savedPath = await saveGeneratedSkill({ ...generated, tutorial }, tutorial);
              send("generated", { ...generated, tutorial, savedPath });
            } catch {
              const guidance = await generateGuidance(router, query, intent, detectedLang);
              send("guidance", guidance);
            }
          } else {
            const guidance = await generateGuidance(router, query, intent, detectedLang);
            send("guidance", guidance);
          }
          send("done", {});
          controller.close();
          return;
        }

        // Step 4: Stream tutorials as they complete (preserve all 6 results)
        const topLocal = localPicks.slice(0, 3);
        const topExternal = externalPicks.slice(0, 3);

        // Create tutorial promises for all results
        const tutorialPromises = [
          ...topLocal.map((r, i) => ({
            idx: i,
            skill: r.skill,
            score: r.score,
            source: r.source as "local",
            sourceLabel: "本地技能" as const,
            promise: generateTutorial(router, query, r.skill, detectedLang),
          })),
          ...topExternal.map((r, i) => ({
            idx: topLocal.length + i,
            skill: { id: r.skill.id || `ext-${r.source}-${r.skill.name}`, name: r.skill.name || "Unknown", category: r.skill.category || "other", description: r.skill.description || "", tags: r.skill.tags || [], whenToUse: r.skill.whenToUse || "", source: r.source, url: r.skill.url || "" } as Skill,
            score: r.score,
            source: r.source,
            sourceLabel: getSourceLabel(r.source),
            promise: r.skill.description ? generateTutorial(router, query, r.skill as Skill, detectedLang) : Promise.resolve(""),
          })),
        ];

        // Stream each tutorial as it completes
        const completedResults: Array<{ skill: Skill; score: number; source: string; sourceLabel: string; tutorial: string }> = [];
        await Promise.all(
          tutorialPromises.map(async (item) => {
            const tutorial = await item.promise;
            const result = {
              skill: item.skill,
              score: item.score,
              source: item.source,
              sourceLabel: item.sourceLabel,
              tutorial,
            };
            completedResults.push(result);
            send("tutorial", result);
          })
        );

        send("done", {});
        controller.close();

      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send("error", { error: "LLM call failed", message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    "huggingface": "🤗 Hugging Face",
    "github-topic": "🐙 GitHub",
    "awesome-list": "✨ Awesome List",
    "local": "📦 本地技能",
  };
  return labels[source] || source;
}
