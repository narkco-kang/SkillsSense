/**
 * skillsmp.com 爬蟲整合
 *
 * 目標：檢查用戶搜尋的 skill 是否存在於 skillsmp.com
 * 策略：
 *  - 嘗試爬取搜索結果頁面
 *  - 解析返回結果，判斷是否有匹配
 *  - 容錯：Cloudflare / 無響應 → 視為「未找到」
 */

const SKILLSMP_BASE = "https://skillsmp.com";

export type SkillsmpSearchResult = {
  found: boolean;
  url: string | null;
  name: string | null;
};

/**
 * 在 skillsmp.com 搜索一個 skill
 */
export async function searchSkillsmp(query: string): Promise<SkillsmpSearchResult> {
  try {
    const searchUrl = `${SKILLSMP_BASE}/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { found: false, url: null, name: null };
    }

    const html = await res.text();
    return parseSkillsmpHtml(html, query);
  } catch {
    // Abort / network error / Cloudflare → 視為未找到，不阻塞流程
    return { found: false, url: null, name: null };
  }
}

/**
 * 解析 skillsmp.com 的搜索結果頁面
 * 根據搜索結果判斷是否有匹配的 skill
 */
function parseSkillsmpHtml(html: string, query: string): SkillsmpSearchResult {
  // 簡單的關鍵詞匹配：檢查 HTML 中是否包含查詢關鍵詞
  // 這個實現比較基礎，後期可以根據實際頁面結構調整

  const normalizedQuery = query.toLowerCase().trim();

  // 嘗試找常見的 skill 列表模式
  // 檢測是否包含 skill 名稱、相關標籤等

  // 如果頁面包含我們查詢的關鍵詞，認為可能找到
  if (html.toLowerCase().includes(normalizedQuery)) {
    // 返回可能的匹配頁面
    return {
      found: true,
      url: `${SKILLSMP_BASE}/?q=${encodeURIComponent(query)}`,
      name: query,
    };
  }

  return { found: false, url: null, name: null };
}

/**
 * 檢查是否啟用 skillsmp 爬蟲
 */
export function isSkillsmpEnabled(): boolean {
  return process.env.SKILLSMP_FALLBACK !== "false";
}
