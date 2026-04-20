/**
 * Tutorial Generator — shared between /api/search and /api/custom-skills
 */

import OpenAI from "openai";

const TUTORIAL_MODEL = (process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5").trim();

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
    ? "你必須用繁體中文回覆，標題和內容都要用中文。"
    : "You must respond in English, including all headings and content.";

  const sys = `You are an expert technical educator writing a concise, vivid tutorial for a skill-based learning platform.
${langInstruction}

Write a tutorial in markdown with 4-6 sections:
1. "Why This Skill Fits Your Need" — 1 short paragraph connecting the skill to the user's specific query
2. "Quick Start" — 3-4 concrete steps to get started immediately
3. "Hands-On Example" — ONE specific, executable example with code/commands when possible
4. "Common Pitfalls" — 2-3 mistakes beginners make and how to avoid them
5. "Pro Tips" — 2 advanced tricks for better results
6. "Next Steps" — how to go deeper after finishing

Be concrete and warm. Use real examples with actual commands or code snippets. No meta commentary. No disclaimers.`;

  const user = `User's exact need: "${query}"

Skill to teach:
- Name: ${skill.name}
- Category: ${skill.category}
- Description: ${skill.description}
- When to use: ${skill.whenToUse}
- Tags: ${skill.tags.join(", ")}

Write the full tutorial now in markdown format.`;

  const res = await client.chat.completions.create({
    model: TUTORIAL_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const content = res.choices[0]?.message?.content?.trim() || "";
  if (!content) {
    return lang === "zh"
      ? `## 為什麼這個技能適合你\n\n這個技能可以幫助你完成「${query}」。\n\n## 快速開始\n\n1. 了解基本概念\n2. 設定環境\n3. 嘗試第一個例子\n\n## 實用範例\n\n請下載完整教程查看詳細內容。\n\n## 常見陷阱\n\n- 請確保所有前置條件已滿足\n- 詳細內容請參考 TUTORIAL.md`
      : `## Why This Skill Fits Your Need\n\nThis skill helps you accomplish: "${query}".\n\n## Quick Start\n\n1. Understand the basics\n2. Set up your environment\n3. Try the first example\n\n## Hands-On Example\n\nSee TUTORIAL.md for the full guide.\n\n## Common Pitfalls\n\n- Make sure all prerequisites are met\n- Check the full tutorial for detailed steps`;
  }
  return content;
}
