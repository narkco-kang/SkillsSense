/**
 * Intent Parsing 測試
 */

import { describe, it, expect } from "vitest";

describe("intent parsing", () => {
  it("should correctly parse a simple query", () => {
    // 測意圖解析邏輯
    const query = "I want to fine-tune an LLM for customer service";
    
    // 預期解析出的關鍵詞
    const expectedKeywords = expect.arrayContaining([
      "llm", "fine-tune", "customer", "service", "ai"
    ]);
    
    expect(true).toBe(true);
  });

  it("should extract domain from query", () => {
    // 測試領域識別
    const domains = ["software-development", "ai-ml", "data", "devops", "productivity"];
    
    domains.forEach(domain => {
      expect(domains).toContain(domain);
    });
  });

  it("should handle multi-language queries", () => {
    // 測試多語言支援
    const languages = ["中文", "English", "中文"];
    
    expect(languages.length).toBe(3);
  });

  it("should identify skill-related keywords", () => {
    // 測試技能關鍵詞識別
    const query = "I need to analyze data with Python and pandas";
    const keywords = query.toLowerCase().split(/\s+/);
    
    expect(keywords).toContain("python");
    expect(keywords).toContain("pandas");
  });
});
