/**
 * GitHub Topics 爬蟲
 * 
 * 來源：https://github.com/topics/{topic}
 * GitHub Topics 是社群整理的開發主題分類
 * 
 * 優勢：開發工具聚合，有社群驗證
 */

const GITHUB_TOPICS_BASE = "https://github.com";

export type GitHubTopicResult = {
  name: string;
  displayName: string;
  description: string;
  labels: string[];
  repoCount: number;
  url: string;
};

type GitHubTopicPage = {
  name: string;
  display_name: string;
  short_description: string;
  description: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  curations: Array<{
    topic_name: string;
    repo_name: string;
    repo_url: string;
    description: string;
  }>;
};

/**
 * 搜尋 GitHub Topics
 * 
 * 策略：
 * 1. 嘗試直接匹配 topic 名稱
 * 2. 搜尋相關的熱門 repositories 作為 topic 代表
 */
export async function searchGitHubTopics(
  query: string,
  intent?: { summary: string; keywords: string[]; domain?: string },
  limit = 5
): Promise<GitHubTopicResult[]> {
  const results: GitHubTopicResult[] = [];

  try {
    // 直接用 query 作為 topic 搜尋
    const topic = query.toLowerCase().replace(/\s+/g, "-").slice(0, 50);
    const topicData = await fetchTopicPage(topic);

    if (topicData) {
      results.push(topicData);
    }

    // 如果找不到，精確匹配就搜尋相關 repos
    if (results.length === 0) {
      const relatedRepos = await searchGitHubRepos(query, limit);
      results.push(...relatedRepos);
    }

  } catch (err) {
    console.warn("[github-topics] search failed:", err);
  }

  return results.slice(0, limit);
}

async function fetchTopicPage(topicName: string): Promise<GitHubTopicResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // 嘗試從 GitHub Topics API 獲取
    // 注意：GitHub 沒有公開的 Topics API，我們用網頁爬蟲
    const res = await fetch(`${GITHUB_TOPICS_BASE}/topics/${topicName}`, {
      signal: controller.signal,
      headers: {
        "Accept": "text/html",
        "User-Agent": "Mozilla/5.0 (compatible; SkillsSense/1.0)",
      },
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();

    // 簡單解析 HTML 獲取 topic 信息
    // GitHub topics 頁面結構
    const nameMatch = html.match(/<h1[^>]*>([\w-]+)<\/h1>/i);
    const descMatch = html.match(/<p[^>]*class="[^"]*f4[^"]*"[^>]*>([^<]+)<\/p>/i);

    if (!nameMatch) return null;

    return {
      name: topicName,
      displayName: nameMatch[1] || topicName,
      description: descMatch ? descMatch[1].trim() : `GitHub topic: ${topicName}`,
      labels: [topicName],
      repoCount: 0,
      url: `${GITHUB_TOPICS_BASE}/topics/${topicName}`,
    };

  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

type GitHubRepo = {
  full_name: string;
  description: string;
  stargazers_count: number;
  topics: string[];
  html_url: string;
};

/**
 * 搜尋 GitHub Repositories
 * 當沒有精確的 topic 匹配時使用
 */
async function searchGitHubRepos(
  query: string,
  limit: number
): Promise<GitHubTopicResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // 使用 GitHub Search API
    const params = new URLSearchParams({
      q: `${query} in:topic`, // 搜尋 topic
      sort: "stars",
      per_page: String(limit),
    });

    const res = await fetch(`https://api.github.com/search/repositories?${params}`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillsSense/1.0",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    if (!data.items) return [];

    return data.items.slice(0, limit).map((repo: GitHubRepo) => ({
      name: repo.full_name.split("/")[1] || repo.full_name,
      displayName: repo.full_name,
      description: repo.description || `GitHub repository: ${repo.full_name}`,
      labels: repo.topics || [],
      repoCount: repo.stargazers_count,
      url: repo.html_url,
    }));

  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 檢查是否啟用 GitHub Topics
 */
export function isGitHubTopicsEnabled(): boolean {
  return process.env.ENABLE_GITHUB_TOPICS !== "false";
}
