/**
 * Multi-Source Crawler Hub
 * 
 * 並行查詢多個技能來源，以相似度評分合併結果
 * 
 * 來源優先級：
 * 1. Hugging Face (AI/ML 技能) - 最大量
 * 2. GitHub Topics (開發工具)
 * 3. Awesome Lists (精選工具)
 * 4. 本地 Skills (AI 生成 + 精選)
 */

import type { Skill } from "../skills-data";
import { searchHuggingFace, type HFSearchResult } from "./huggingface";
import { searchGitHubTopics, type GitHubTopicResult } from "./github-topics";
import { searchAwesomeLists, type AwesomeResult } from "./awesome-lists";

export type SourceResult = {
  skill: Partial<Skill>;
  source: "huggingface" | "github-topic" | "awesome-list";
  sourceScore: number; // 0-1, 來源可信度
  matchScore: number;  // 0-1, 關鍵詞/語意匹配度
};

export type SearchSourcesOptions = {
  query: string;
  intent?: {
    summary: string;
    keywords: string[];
    domain?: string;
  };
  intentEmbedding?: number[];
  limitPerSource?: number;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_LIMIT = 5;

// 來源可信度權重
const SOURCE_WEIGHTS: Record<string, number> = {
  "huggingface": 0.7,   // 數量多但品質參差不齊
  "github-topic": 0.8,  // 社群驗證，有 stars
  "awesome-list": 0.9,  // 人工精選，最高可信度
};

/**
 * 並行搜尋所有來源，返回合併後的結果
 */
export async function searchAllSources(
  options: SearchSourcesOptions
): Promise<SourceResult[]> {
  const {
    query,
    intent,
    intentEmbedding,
    limitPerSource = DEFAULT_LIMIT,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);

  try {
    // 並行發起所有搜尋
    const results = await Promise.allSettled([
      searchHuggingFace(query, intent, limitPerSource),
      searchGitHubTopics(query, intent, limitPerSource),
      searchAwesomeLists(query, intent, limitPerSource),
    ]);

    // 收集成功的結果
    const allResults: SourceResult[] = [];

    // Hugging Face results
    if (results[0].status === "fulfilled") {
      const hfResults = results[0].value;
      for (const r of hfResults) {
        allResults.push({
          skill: hfResultToSkill(r),
          source: "huggingface",
          sourceScore: SOURCE_WEIGHTS["huggingface"],
          matchScore: calculateMatchScore(query, intent, r.name, r.description, r.tags),
        });
      }
    }

    // GitHub Topics results
    if (results[1].status === "fulfilled") {
      const ghResults = results[1].value;
      for (const r of ghResults) {
        allResults.push({
          skill: ghResultToSkill(r),
          source: "github-topic",
          sourceScore: SOURCE_WEIGHTS["github-topic"],
          matchScore: calculateMatchScore(query, intent, r.name, r.description, r.labels),
        });
      }
    }

    // Awesome Lists results
    if (results[2].status === "fulfilled") {
      const awesomeResults = results[2].value;
      for (const r of awesomeResults) {
        allResults.push({
          skill: awesomeResultToSkill(r),
          source: "awesome-list",
          sourceScore: SOURCE_WEIGHTS["awesome-list"],
          matchScore: calculateMatchScore(query, intent, r.name, r.description, r.tags),
        });
      }
    }

    // 按綜合分數排序
    allResults.sort((a, b) => {
      const scoreA = a.sourceScore * 0.3 + a.matchScore * 0.7;
      const scoreB = b.sourceScore * 0.3 + b.matchScore * 0.7;
      return scoreB - scoreA;
    });

    return allResults;

  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 計算關鍵詞匹配分數
 */
function calculateMatchScore(
  query: string,
  intent: SearchSourcesOptions["intent"],
  name: string,
  description: string,
  tags: string[]
): number {
  const haystack = [name, description, ...tags].join(" ").toLowerCase();
  const queryLower = query.toLowerCase();
  const intentKeywords = intent?.keywords || [];

  let score = 0;

  // 直接關鍵詞匹配
  const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 2);
  for (const word of queryWords) {
    if (haystack.includes(word)) {
      score += 0.2;
    }
  }

  // Intent 關鍵詞匹配
  for (const kw of intentKeywords) {
    if (haystack.includes(kw.toLowerCase())) {
      score += 0.15;
    }
  }

  // 名稱精確匹配
  if (name.toLowerCase().includes(queryLower) || queryLower.includes(name.toLowerCase())) {
    score += 0.3;
  }

  return Math.min(score, 1);
}

// 轉換函數
function hfResultToSkill(r: HFSearchResult): Partial<Skill> {
  return {
    id: `hf-${r.id}`,
    name: r.name,
    description: r.description,
    category: r.type === "model" ? "ai-ml" : r.type,
    tags: r.tags,
    whenToUse: `Use ${r.name} for ${r.task || r.description.slice(0, 50)}`,
    source: "huggingface",
    url: r.url,
  };
}

function ghResultToSkill(r: GitHubTopicResult): Partial<Skill> {
  return {
    id: `gh-${r.name}`,
    name: r.displayName || r.name,
    description: r.description || "",
    category: "software-development",
    tags: r.labels,
    whenToUse: `Explore ${r.name} on GitHub for development tools and libraries`,
    source: "github-topic",
    url: r.url,
  };
}

function awesomeResultToSkill(r: AwesomeResult): Partial<Skill> {
  return {
    id: `awesome-${r.name}`,
    name: r.name,
    description: r.description,
    category: r.category || "productivity",
    tags: r.tags,
    whenToUse: r.description,
    source: "awesome-list",
    url: r.url,
  };
}

/**
 * 檢查來源是否啟用
 */
export function isSourceEnabled(source: string): boolean {
  switch (source) {
    case "huggingface":
      return process.env.ENABLE_HUGGINGFACE !== "false";
    case "github-topic":
      return process.env.ENABLE_GITHUB_TOPICS !== "false";
    case "awesome-list":
      return process.env.ENABLE_AWESOME_LISTS !== "false";
    default:
      return true;
  }
}
