/**
 * Tutorial Generator — shared between /api/search and /api/custom-skills
 */

import OpenAI from "openai";

const TUTORIAL_MODEL = "deepseek/deepseek-chat-v3";

type Skill = {
  id?: string;
  name: string;
  category: string;
  description: string;
  whenToUse: string;
  tags: string[];
  url: string;
  source?: string;
};

export async function generateTutorial(
  client: OpenAI,
  query: string,
  skill: Skill,
  lang: "en" | "zh"
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
    max_tokens: 800,
  });

  return res.choices[0]?.message?.content?.trim() || "";
}
