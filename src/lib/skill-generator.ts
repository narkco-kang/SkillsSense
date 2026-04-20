/**
 * AI 生成新 Skill
 *
 * 當用戶需求的 skill 在 skillsmp 和本地都找不到時：
 * 1. AI 分析用戶需求，識別核心目標和子步驟
 * 2. 從本地 skills 庫找出最相似的 2-3 個 skills
 * 3. 結合需求和相似 skills，生成一個新的完整 skill
 * 4. 存入 skills/ 目錄
 */

import path from "path";
import fs from "fs/promises";
import OpenAI from "openai";
import type { Skill } from "./skills-data";

export type GeneratedSkill = {
  name: string;
  category: string;
  description: string;
  tags: string[];
  whenToUse: string;
  tutorial: string;
  generatedFrom: string[];
};

type SkillWithScore = { skill: Skill; score: number };

const SKILLS_DIR = path.join(process.cwd(), "skills");

/**
 * 找到與需求最相似的 N 個 skills
 */
export function findSimilarSkills(
  skills: Skill[],
  intent: { summary: string; keywords: string[]; domain?: string },
  topN = 3
): Skill[] {
  const scored: SkillWithScore[] = skills.map((s) => ({
    skill: s,
    score: scoreSkillForIntent(s, intent),
  }));

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.skill);
}

function scoreSkillForIntent(
  skill: Skill,
  intent: { summary: string; keywords: string[]; domain?: string }
): number {
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
    if (kw.length < 2) continue;
    if (hay.includes(kw.toLowerCase())) score += 2;
  }
  if (intent.domain && skill.category.toLowerCase().includes(intent.domain)) {
    score += 1;
  }
  for (const w of intent.summary.toLowerCase().split(/\W+/)) {
    if (w.length >= 4 && hay.includes(w)) score += 0.25;
  }
  return score;
}

/**
 * 讓 AI 生成一個新 skill（使用 OpenRouter）
 */
export async function generateNewSkill(
  openai: OpenAI,
  userQuery: string,
  intent: { summary: string; keywords: string[]; domain?: string },
  similarSkills: Skill[]
): Promise<GeneratedSkill> {
  const similarSkillsInfo = similarSkills
    .map((s) => `- ${s.name}: ${s.description} (tags: ${s.tags.join(", ")})`)
    .join("\n");

  const systemPrompt = `You are a skill architect for a skill-discovery platform called SkillsSense.
Your task is to create a new SKILL.md file for a skill that doesn't exist yet.

Return STRICT JSON with this exact shape:
{
  "name": "Skill Name (Title Case)",
  "category": "one of: software-development, ai-ml, data, devops, productivity, research, creative, other",
  "description": "2-3 sentences explaining what this skill does and why it's useful",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "whenToUse": "One sentence on when to use this skill"
}

The skill should:
- Solve the user's specific need
- Be composable from or inspired by the similar skills provided
- Have practical, actionable steps
- Be realistic and implementable

Respond with JSON only, no markdown, no explanation.`;

  const userPrompt = `User need: "${userQuery}"

AI understood intent: ${intent.summary}
Keywords: ${intent.keywords.join(", ")}
Domain: ${intent.domain || "other"}

Similar existing skills for reference:
${similarSkillsInfo}

Generate a new skill that best solves this need. Respond with JSON only.`;

  const res = await openai.chat.completions.create({
      model: (process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5").trim(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 400,
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  let parsed: Partial<GeneratedSkill>;

  // Strip markdown code fences if the model wrapped JSON in ```json ... ```
  const stripped = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error(`Failed to parse generated skill: ${raw}`);
  }

  return {
    name: parsed.name || "Generated Skill",
    category: parsed.category || "other",
    description: parsed.description || "",
    tags: parsed.tags || [],
    whenToUse: parsed.whenToUse || "",
    tutorial: "", // 教程由單獨的 LLM call 生成
    generatedFrom: similarSkills.map((s) => s.name),
  };
}

/**
 * 將生成的新 skill 保存到本地
 */
export async function saveGeneratedSkill(
  skill: GeneratedSkill,
  _tutorial: string
): Promise<string> {
  // 確保 skills 目錄存在
  await fs.mkdir(SKILLS_DIR, { recursive: true });

  // 創建 skill 的目錄和檔案
  const slug = skill.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const skillDir = path.join(SKILLS_DIR, slug);
  await fs.mkdir(skillDir, { recursive: true });

  // 生成 SKILL.md 內容
  const frontmatter = `---
name: ${skill.name}
category: ${skill.category}
description: ${skill.description}
tags: [${skill.tags.join(", ")}]
whenToUse: ${skill.whenToUse}
source: generated
url: ""
generatedFrom: [${skill.generatedFrom.map((s) => `"${s}"`).join(", ")}]
---

# ${skill.name}

${skill.description}

## When to Use

${skill.whenToUse}

## Related Skills

This skill was generated by AI based on: ${skill.generatedFrom.join(", ")}.
`;

  const filePath = path.join(skillDir, "SKILL.md");
  await fs.writeFile(filePath, frontmatter, "utf-8");

  return filePath;
}

/**
 * 載入本地生成的所有 skills
 */
export async function loadGeneratedSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    await fs.mkdir(SKILLS_DIR, { recursive: true });
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(entry.path, entry.name, "SKILL.md");
      try {
        const content = await fs.readFile(skillPath, "utf-8");
        const skill = parseSkillFile(content, entry.name);
        if (skill) skills.push(skill);
      } catch {
        // 跳過無法解析的檔案
      }
    }
  } catch {
    // 目錄不存在，返回空陣列
  }

  return skills;
}

function parseSkillFile(content: string, slug: string): Skill | null {
  // 解析 YAML frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;

  const yaml = match[1];
  const body = content.slice(match[0].length);

  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");

  let currentKey = "";
  let currentArray: string[] = [];

  for (const line of lines) {
    if (line.match(/^(\w+):/)) {
      // 保存之前的陣列
      if (currentKey && currentArray.length) {
        result[currentKey] = currentArray;
      }

      const [key, ...valueParts] = line.split(":");
      currentKey = key.trim();
      const value = valueParts.join(":").trim();

      if (value) {
        // 單行值
        if (value.startsWith("[") && value.endsWith("]")) {
          // 陣列
          currentArray = value
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""));
          result[currentKey] = currentArray;
          currentArray = [];
        } else {
          result[currentKey] = value.replace(/^["']|["']$/g, "");
        }
        currentKey = "";
      } else {
        currentArray = [];
      }
    } else if (line.trim().startsWith("[") && line.trim().endsWith("]")) {
      // 內聯陣列
      currentArray = line
        .trim()
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      if (currentKey) {
        result[currentKey] = currentArray;
        currentKey = "";
        currentArray = [];
      }
    } else if (currentKey && !line.startsWith(" ")) {
      // 多行字串
      const trimmed = line.trim();
      if (trimmed) {
        if (result[currentKey]) {
          result[currentKey] += " " + trimmed;
        } else {
          result[currentKey] = trimmed;
        }
      }
    }
  }

  // 保存最後的陣列
  if (currentKey && currentArray.length) {
    result[currentKey] = currentArray;
  }

  if (!result.name) return null;

  return {
    id: slug,
    name: result.name as string,
    category: (result.category as string) || "other",
    description: (result.description as string) || "",
    tags: Array.isArray(result.tags) ? result.tags : [],
    whenToUse: (result.whenToUse as string) || "",
    source: "generated",
    url: "",
    path: `${slug}/SKILL.md`,
    generatedFrom: Array.isArray(result.generatedFrom)
      ? result.generatedFrom
      : [],
  };
}
