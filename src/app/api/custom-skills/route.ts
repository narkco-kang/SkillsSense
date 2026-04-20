/**
 * POST /api/custom-skills
 * Generate a custom skill and return a ZIP as base64
 *
 * Body: { goal, scenario, proficiency, email? }
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateNewSkill } from "@/lib/skill-generator";
import { generateTutorial } from "@/lib/tutorial-generator";
import { packageSkill } from "@/lib/zip-packager";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Parse intent from user goal for custom skill generation
 */
async function parseCustomIntent(
  router: OpenAI,
  goal: string,
  scenario: string,
  proficiency: string
): Promise<{ summary: string; keywords: string[]; domain?: string }> {
  const systemPrompt = `You are an AI intent parser for a skill-discovery platform.
Analyze the user's skill request and extract structured intent.

Return JSON with this exact shape:
{
  "summary": "A 1-2 sentence summary of what the user wants to accomplish",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "domain": "primary category such as: software-development, ai-ml, data, devops, productivity, research, creative, other"
}`;

  const userPrompt = `User goal: "${goal}"
Use case: "${scenario}"
Proficiency level: "${proficiency}"

Analyze this request and return JSON.`;

  const res = await openai.chat.completions.create({
    model: (process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5").trim(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 200,
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {
      summary: goal,
      keywords: goal.toLowerCase().split(/\W+/).filter((w: string) => w.length > 2).slice(0, 5),
      domain: "other",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, scenario, proficiency } = body as {
      goal: string;
      scenario: string;
      proficiency: string;
    };

    if (!goal || typeof goal !== "string" || goal.trim().length < 5) {
      return NextResponse.json(
        { error: "invalid_request", message: "Goal must be at least 5 characters" },
        { status: 400 }
      );
    }

    // 1. Load local skills for reference (instant, no I/O)
    const { getAllSkills } = await import("@/lib/skills-data");
    const allSkills = getAllSkills();
    const { findSimilarSkills } = await import("@/lib/skill-generator");

    // 2. Run intent parsing + tutorial generation IN PARALLEL
    //    (both only need goal/scenario/proficiency, not each other's output)
    const [intent, tutorial] = await Promise.all([
      parseCustomIntent(openai, goal.trim(), scenario || "other", proficiency || "intermediate"),
      // Tutorial needs only userQuery, skill metadata, and lang — not the skill itself
      generateTutorial(
        openai,
        goal.trim(),
        {
          id: "temp",
          name: goal.trim(),
          category: "other",
          description: goal.trim(),
          whenToUse: goal.trim(),
          tags: [],
          url: "",
        },
        "en"
      ),
    ]);

    // 3. Find similar skills (instant computation)
    const similarSkills = findSimilarSkills(allSkills, intent, 3);

    // 4. Generate new skill (needs similarSkills for prompt context)
    const generated = await generateNewSkill(openai, goal, intent, similarSkills);

    const skillWithTutorial = { ...generated, tutorial };

    // 5. Package into ZIP (in-memory, no disk write)
    const { zip, slug, files } = await packageSkill(skillWithTutorial);
    const zipBase64 = zip.toString("base64");

    return NextResponse.json({
      success: true,
      skill: {
        name: generated.name,
        slug,
        category: generated.category,
        tags: generated.tags,
        description: generated.description,
        whenToUse: generated.whenToUse,
        generatedFrom: generated.generatedFrom,
        tutorialPreview: tutorial.slice(0, 500),
        fullTutorial: tutorial,
      },
      zipBase64,
      files,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    });
  } catch (err) {
    console.error("[custom-skills] Generation error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "generation_failed", message: msg },
      { status: 500 }
    );
  }
}
