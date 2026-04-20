/**
 * 需求拆分引導
 *
 * 當用戶需求的 skill 太寬泛，無法直接匹配時：
 * AI 分析需求，識別核心目標和子步驟，引導用戶細化需求
 */

import OpenAI from "openai";

export type GuidanceStep = {
  step: number;
  question: string;
  suggestions: string[];
  subIntent?: string;
};

/**
 * 分析用戶需求，生成引導問題
 */
export async function generateGuidance(
  openai: OpenAI,
  query: string,
  intent: { summary: string; keywords: string[]; domain?: string },
  lang: "en" | "zh" = "zh"
): Promise<GuidanceStep[]> {
  const isZh = lang === "zh";
  const systemPrompt = isZh
    ? `你是一個有用的 AI 助手，幫助用戶細化他們的技能搜索。
當用戶的請求太寬泛或模糊時，幫助將其拆分為具體、可操作的步驟。

返回嚴格的 JSON陣列，每個問題有 step、question、suggestions 欄位。
每個問題應幫助澄清用戶需求的某個特定方面。

JSON 格式：
{
  "steps": [
    {
      "step": 1,
      "question": "你具體想要哪種 X？",
      "suggestions": ["選項 A", "選項 B", "選項 C"]
    }
  ]
}

指南：
- 問題應該對話化且有幫助
- 建議應該是具體的選項
- 保持問題簡短（30 個字以內）
- 專注於原查詢中最模糊的部分`
    : `You are a helpful AI assistant that helps users refine their skill search.
When a user's request is too broad or vague, you help break it down into specific, actionable steps.

Return a JSON array of 2-4 guidance questions that help the user narrow down their need.
Each question should help clarify a specific aspect of what they're looking for.

Return STRICT JSON with this exact shape:
{
  "steps": [
    {
      "step": 1,
      "question": "What specific type of X are you looking for?",
      "suggestions": ["Option A", "Option B", "Option C"]
    }
  ]
}

Guidelines:
- Questions should be conversational and helpful
- Suggestions should be concrete options
- Keep questions short (under 30 words)
- Focus on the most ambiguous parts of the original query`;

  const userPrompt = isZh
    ? `用戶的原始查詢："${query}"
AI 目前的理解：${intent.summary}
關鍵詞：${intent.keywords.join(", ")}
領域：${intent.domain || "other"}

生成 2-4 個引導問題來幫助用戶細化他們的搜索。`
    : `User's original query: "${query}"
AI's current understanding: ${intent.summary}
Keywords: ${intent.keywords.join(", ")}
Domain: ${intent.domain || "other"}

Generate 2-4 guidance questions to help the user refine their search.`;

  try {
    const res = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500,
    });

    const raw = res.choices[0]?.message?.content ?? '{"steps":[]}';
    const parsed = JSON.parse(raw);

    return parsed.steps || [];
  } catch {
    // 如果失敗，返回預設的引導問題
    return getDefaultGuidance(query, intent, lang);
  }
}

function getDefaultGuidance(
  query: string,
  intent: { summary: string; keywords: string[]; domain?: string },
  lang: "en" | "zh"
): GuidanceStep[] {
  const isZh = lang === "zh";

  if (!isZh) {
    // English defaults
    const defaults: GuidanceStep[] = [
      {
        step: 1,
        question: `Your request "${query.slice(0, 20)}..." could be more specific. Which area interests you most?`,
        suggestions: ["Give me more context", "Specify a tool preference", "Describe the end goal", "Simplify the request"],
      },
    ];
    return defaults;
  }

  // 中文預設引導問題
  const domainGuidance: Record<string, GuidanceStep[]> = {
    "software-development": [
      {
        step: 1,
        question: "你想要做的是哪個類型的開發任務？",
        suggestions: ["前端開發", "後端開發", "全端開發", "DevOps/基礎設施"],
      },
      {
        step: 2,
        question: "你偏好什麼樣的工具或框架？",
        suggestions: ["React/Vue", "Node.js/Python", "Kubernetes/Docker", "不確定"],
      },
    ],
    "ai-ml": [
      {
        step: 1,
        question: "你想要使用 AI 還是開發/訓練 AI 模型？",
        suggestions: ["使用現成 AI 工具", "微調現有模型", "從頭訓練新模型", "部署 AI 模型"],
      },
      {
        step: 2,
        question: "你的使用場景是什麼？",
        suggestions: ["文字處理", "圖像/視覺", "語音/音頻", "數據分析"],
      },
    ],
    data: [
      {
        step: 1,
        question: "你需要對數據做什麼處理？",
        suggestions: ["數據收集/爬取", "數據清洗/預處理", "數據分析/視覺化", "數據儲存/管理"],
      },
    ],
    productivity: [
      {
        step: 1,
        question: "你想要提升哪方面的生產力？",
        suggestions: ["文檔/筆記", "日程/任務管理", "自動化工作流", "溝通/協作"],
      },
    ],
    default: [
      {
        step: 1,
        question: `你說的「${query.slice(0, 20)}...」，可以更具體描述一下嗎？`,
        suggestions: ["給我更多背景", "指定工具偏好", "說明最終目標", "簡化需求"],
      },
    ],
  };

  const domain = intent.domain || "default";
  const guidance = domainGuidance[domain] || domainGuidance.default;

  return guidance.map((g) => ({
    ...g,
    subIntent: `${intent.summary} + ${g.question}`,
  }));
}

/**
 * 根據用戶選擇的引導方向，更新 intent
 */
export function refineIntentWithGuidance(
  originalIntent: { summary: string; keywords: string[]; domain?: string },
  selectedSuggestions: string[]
): { summary: string; keywords: string[]; domain?: string } {
  // 將用戶選擇加入關鍵詞
  const newKeywords = [
    ...originalIntent.keywords,
    ...selectedSuggestions.flatMap((s) => s.toLowerCase().split(/\s+/)),
  ].filter((k, i, arr) => arr.indexOf(k) === i); // 去重

  return {
    summary: `${originalIntent.summary} (${selectedSuggestions.join(", ")})`,
    keywords: newKeywords.slice(0, 12),
    domain: originalIntent.domain,
  };
}
