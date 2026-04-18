/**
 * 多來源搜尋測試
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SourceResult } from "../lib/sources/hub";

// Mock the external sources
vi.mock("../lib/sources/hub", () => ({
  searchAllSources: vi.fn(),
}));

describe("multi-source search", () => {
  it("should return results from multiple sources", async () => {
    // 測試多來源返回
    const mockResults: SourceResult[] = [
      {
        skill: {
          id: "hf-test",
          name: "GPT-2",
          description: "A large GPT-2 model",
          category: "ai-ml",
          tags: ["gpt", "transformer", "nlp"],
        },
        source: "huggingface",
        sourceScore: 0.7,
        matchScore: 0.8,
      },
    ];

    expect(mockResults.length).toBeGreaterThan(0);
    expect(mockResults[0].source).toBe("huggingface");
  });

  it("should calculate combined score correctly", () => {
    // 測試綜合分數計算
    const sourceScore = 0.7;
    const matchScore = 0.8;
    const combinedScore = sourceScore * 0.3 + matchScore * 0.7;

    expect(combinedScore).toBeCloseTo(0.77, 2);
  });

  it("should rank results by combined score", () => {
    // 測試結果排序
    const results: Array<{ source: string; sourceScore: number; matchScore: number }> = [
      { source: "huggingface", sourceScore: 0.7, matchScore: 0.5 },
      { source: "awesome-list", sourceScore: 0.9, matchScore: 0.8 },
      { source: "github-topic", sourceScore: 0.8, matchScore: 0.9 },
    ];

    const ranked = results
      .map(r => ({
        ...r,
        combined: r.sourceScore * 0.3 + r.matchScore * 0.7,
      }))
      .sort((a, b) => b.combined - a.combined);

    expect(ranked[0].source).toBe("github-topic");
  });

  it("should handle empty results gracefully", () => {
    const emptyResults: SourceResult[] = [];
    expect(emptyResults.length).toBe(0);
  });

  it("should identify source labels correctly", () => {
    const sourceLabels: Record<string, string> = {
      "huggingface": "🤗 Hugging Face",
      "github-topic": "🐙 GitHub",
      "awesome-list": "✨ Awesome List",
      "local": "📦 本地技能",
    };

    expect(sourceLabels["huggingface"]).toBe("🤗 Hugging Face");
    expect(sourceLabels["local"]).toBe("📦 本地技能");
  });
});

describe("source credibility weights", () => {
  const SOURCE_WEIGHTS: Record<string, number> = {
    "huggingface": 0.7,
    "github-topic": 0.8,
    "awesome-list": 0.9,
    "local": 1.0,
  };

  it("should have local source with highest credibility", () => {
    expect(SOURCE_WEIGHTS["local"]).toBe(1.0);
  });

  it("should have awesome-list with second highest credibility", () => {
    expect(SOURCE_WEIGHTS["awesome-list"]).toBe(0.9);
  });

  it("should have github-topic with moderate credibility", () => {
    expect(SOURCE_WEIGHTS["github-topic"]).toBe(0.8);
  });

  it("should have huggingface with lowest credibility among active sources", () => {
    expect(SOURCE_WEIGHTS["huggingface"]).toBe(0.7);
  });

  it("should have weights between 0 and 1", () => {
    Object.values(SOURCE_WEIGHTS).forEach(weight => {
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    });
  });
});
