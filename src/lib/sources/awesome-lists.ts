/**
 * Awesome Lists 爬蟲
 * 
 * 來源：https://github.com/sindresorhus/awesome 等 Awesome lists
 * 以及其他熱門的 awesome- 系列列表
 * 
 * 優勢：人工精選的高品質工具列表，可信度最高
 */

const AWESOME_LISTS = [
  { name: "awesome", url: "https://github.com/sindresorhus/awesome", category: "general" },
  { name: "awesome-python", url: "https://github.com/vinta/awesome-python", category: "python" },
  { name: "awesome-nodejs", url: "https://github.com/sindresorhus/awesome-nodejs", category: "nodejs" },
  { name: "awesome-go", url: "https://github.com/avelino/awesome-go", category: "go" },
  { name: "awesome-rust", url: "https://github.com/rust-unofficial/awesome-rust", category: "rust" },
  { name: "awesome-machine-learning", url: "https://github.com/josephmisiti/awesome-machine-learning", category: "ml" },
  { name: "awesome-deep-learning", url: "https://github.com/ChristosChristofidis/awesome-deep-learning", category: "deep-learning" },
  { name: "awesome-ai", url: "https://github.com/owainlewis/awesome-artificial-intelligence", category: "ai" },
  { name: "awesome-devops", url: "https://github.com/wmariuss/awesome-devops", category: "devops" },
  { name: "awesome-docker", url: "https://github.com/veggiemonk/awesome-docker", category: "docker" },
  { name: "awesome-kubernetes", url: "https://github.com/ramitsurana/awesome-kubernetes", category: "kubernetes" },
  { name: "awesome-react", url: "https://github.com/enaqx/awesome-react", category: "react" },
  { name: "awesome-vue", url: "https://github.com/vuejs/awesome-vue", category: "vue" },
  { name: "awesome-angular", url: "https://github.com/PatrickJS/awesome-angular", category: "angular" },
  { name: "awesome-api", url: "https://github.com/maisyminds/awesome-api", category: "api" },
  { name: "awesome-graphql", url: "https://github.com/chentsulin/awesome-graphql", category: "graphql" },
  { name: "awesome-open-source", url: "https://github.com/hlf20010508/awesome-open-source", category: "open-source" },
  { name: "awesome-github", url: "https://github.com/phillipadsmith/awesome-github", category: "github" },
  { name: "awesome-git", url: "https://github.com/dictcp/awesome-git", category: "git" },
  { name: "awesome-github-actions", url: "https://github.com/sdras/awesome-actions", category: "github-actions" },
  { name: "awesome-cloud-native", url: "https://github.com/rootsongjc/awesome-cloud-native", category: "cloud-native" },
  { name: "awesome-serverless", url: "https://github.com/anaurelian/awesome-serverless", category: "serverless" },
  { name: "awesome-terraform", url: "https://github.com/shuaibiyy/awesome-terraform", category: "terraform" },
  { name: "awesome-vscode", url: "https://github.com/viatsko/awesome-vscode", category: "vscode" },
  { name: "awesome-productivity", url: "https://github.com/altryne/awesome-productivity", category: "productivity" },
  { name: "awesome-selfhosted", url: "https://github.com/awesome-selfhosted/awesome-selfhosted", category: "selfhosted" },
  { name: "awesome-open-source-ai", url: "https://github.com/its-lee/awesome-open-source-ai", category: "open-source-ai" },
  { name: "awesome-claude", url: "https://github.com/alexanderjeurissen/awesome-claude", category: "claude" },
  { name: "awesome-chatgpt", url: "https://github.com/sindresorhus/awesome-chatgpt", category: "chatgpt" },
];

export type AwesomeResult = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  sourceList: string;
  stars?: number;
};

/**
 * 搜尋 Awesome Lists
 * 
 * 策略：
 * 1. 先嘗試直接從緩存中關鍵詞匹配
 * 2. 如果本地匹配不到，再動態爬取相關的 awesome list
 */
export async function searchAwesomeLists(
  query: string,
  intent?: { summary: string; keywords: string[]; domain?: string },
  limit = 5
): Promise<AwesomeResult[]> {
  const results: AwesomeResult[] = [];
  const queryLower = query.toLowerCase();

  try {
    // 1. 本地關鍵詞快速匹配
    const localMatches = matchAwesomeLocally(queryLower, intent);
    results.push(...localMatches);

    // 2. 如果本地匹配不夠，嘗試爬取相關 list
    if (results.length < limit) {
      const dynamicResults = await searchAwesomeListsDynamically(queryLower, limit);
      results.push(...dynamicResults);
    }

  } catch (err) {
    console.warn("[awesome-lists] search failed:", err);
  }

  // 去重並返回
  const seen = new Set<string>();
  return results
    .filter(r => {
      if (seen.has(r.name)) return false;
      seen.add(r.name);
      return true;
    })
    .slice(0, limit);
}

/**
 * 本地關鍵詞快速匹配
 * 
 * 預先定義熱門關鍵詞到 awesome list 的映射
 */
const KEYWORD_TO_AWESOME: Record<string, string[]> = {
  "python": ["awesome-python"],
  "nodejs": ["awesome-nodejs", "awesome-nodejs"],
  "node.js": ["awesome-nodejs"],
  "golang": ["awesome-go"],
  "go": ["awesome-go"],
  "rust": ["awesome-rust"],
  "machine learning": ["awesome-machine-learning"],
  "ml": ["awesome-machine-learning"],
  "deep learning": ["awesome-deep-learning"],
  "ai": ["awesome-ai", "awesome-artificial-intelligence"],
  "artificial intelligence": ["awesome-ai"],
  "devops": ["awesome-devops"],
  "docker": ["awesome-docker"],
  "kubernetes": ["awesome-kubernetes", "awesome-cloud-native"],
  "k8s": ["awesome-kubernetes"],
  "react": ["awesome-react"],
  "vue": ["awesome-vue"],
  "angular": ["awesome-angular"],
  "api": ["awesome-api"],
  "graphql": ["awesome-graphql"],
  "github": ["awesome-github"],
  "git": ["awesome-git"],
  "actions": ["awesome-github-actions"],
  "github actions": ["awesome-github-actions"],
  "cloud": ["awesome-cloud-native", "awesome-serverless"],
  "serverless": ["awesome-serverless"],
  "terraform": ["awesome-terraform"],
  "vscode": ["awesome-vscode"],
  "productivity": ["awesome-productivity"],
  "selfhosted": ["awesome-selfhosted"],
  "open source": ["awesome-open-source"],
  "claude": ["awesome-claude"],
  "chatgpt": ["awesome-chatgpt"],
  "gpt": ["awesome-chatgpt"],
};

function matchAwesomeLocally(
  query: string,
  intent?: { summary: string; keywords: string[]; domain?: string }
): AwesomeResult[] {
  const results: AwesomeResult[] = [];

  // 檢查 query 是否包含預定義關鍵詞
  const keywords = intent?.keywords || query.split(/\s+/);
  
  for (const keyword of keywords) {
    const k = keyword.toLowerCase();
    const matchedLists = KEYWORD_TO_AWESOME[k] || [];
    
    for (const listName of matchedLists) {
      const listInfo = AWESOME_LISTS.find(l => l.name === listName);
      if (listInfo) {
        results.push({
          name: listInfo.name,
          description: `Awesome ${listInfo.category} - Curated list of ${listInfo.category} resources`,
          category: listInfo.category,
          tags: [listInfo.category, "curated", "awesome"],
          url: listInfo.url,
          sourceList: listInfo.name,
        });
      }
    }
  }

  // 如果 intent 明確的 domain，也返回相關的 awesome list
  if (intent?.domain) {
    const domainMap: Record<string, string[]> = {
      "ai-ml": ["awesome-machine-learning", "awesome-deep-learning", "awesome-ai"],
      "software-development": ["awesome", "awesome-python", "awesome-nodejs", "awesome-go"],
      "devops": ["awesome-devops", "awesome-docker", "awesome-kubernetes"],
      "productivity": ["awesome-productivity", "awesome-vscode"],
    };

    const domainLists = domainMap[intent.domain] || [];
    for (const listName of domainLists) {
      if (!results.some(r => r.sourceList === listName)) {
        const listInfo = AWESOME_LISTS.find(l => l.name === listName);
        if (listInfo) {
          results.push({
            name: listInfo.name,
            description: `Awesome ${listInfo.category} - Curated list of ${listInfo.category} resources`,
            category: listInfo.category,
            tags: [listInfo.category, "curated", "awesome"],
            url: listInfo.url,
            sourceList: listInfo.name,
          });
        }
      }
    }
  }

  return results;
}

/**
 * 動態搜尋 Awesome Lists
 */
async function searchAwesomeListsDynamically(
  query: string,
  limit: number
): Promise<AwesomeResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // 使用 GitHub API 搜尋 awesome 相關的 repository
    const params = new URLSearchParams({
      q: `awesome ${query} in:readme`,
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

    return data.items.slice(0, limit).map((repo: any) => ({
      name: repo.full_name,
      description: repo.description || `Awesome ${query} list`,
      category: query,
      tags: repo.topics || ["awesome", "curated-list"],
      url: repo.html_url,
      sourceList: repo.name,
      stars: repo.stargazers_count,
    }));

  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 檢查是否啟用 Awesome Lists
 */
export function isAwesomeListsEnabled(): boolean {
  return process.env.ENABLE_AWESOME_LISTS !== "false";
}
