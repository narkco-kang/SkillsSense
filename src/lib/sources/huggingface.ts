/**
 * Hugging Face 爬蟲
 * 
 * 來源：Hugging Face Hub API
 * - Models: https://huggingface.co/api/models
 * - Datasets: https://huggingface.co/api/datasets
 * 
 * 優勢：10萬+ AI/ML 模型和資料集
 */

const HF_BASE = "https://huggingface.co";
const HF_API = "https://huggingface.co/api";

export type HFSearchResult = {
  id: string;
  name: string;
  description: string;
  type: "model" | "dataset";
  task?: string;
  tags: string[];
  likes: number;
  downloads?: number;
  url: string;
};

type HFModelInfo = {
  id: string;
  modelId: string;
  sha: string;
  lastModified: string;
  private: boolean;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag?: string;
  createdAt?: string;
};

type HFDatasetInfo = {
  id: string;
  id_: string;
  lastModified: string;
  private: boolean;
  downloads: number;
  likes: number;
  tags: string[];
  createdAt?: string;
};

/**
 * 搜尋 Hugging Face Models + Datasets
 */
export async function searchHuggingFace(
  query: string,
  intent?: { summary: string; keywords: string[]; domain?: string },
  limit = 5
): Promise<HFSearchResult[]> {
  const results: HFSearchResult[] = [];

  try {
    // 並行搜尋 models 和 datasets
    const [models, datasets] = await Promise.allSettled([
      searchHFModels(query, limit),
      searchHFDatasets(query, limit),
    ]);

    if (models.status === "fulfilled") {
      results.push(...models.value);
    }

    if (datasets.status === "fulfilled") {
      results.push(...datasets.value);
    }

  } catch (err) {
    console.warn("[huggingface] search failed:", err);
  }

  return results;
}

async function searchHFModels(query: string, limit: number): Promise<HFSearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // 使用 Hugging Face API 搜尋模型
    const params = new URLSearchParams({
      search: query,
      limit: String(limit * 2), // 多取一些因為會過濾
      sort: "likes",
      direction: "-1",
    });

    const res = await fetch(`${HF_API}/models?${params}`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "SkillsSense/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`HF models API failed: ${res.status}`);
    }

    const data: HFModelInfo[] = await res.json();

    return data.slice(0, limit).map((m) => ({
      id: m.id,
      name: m.modelId,
      description: m.pipeline_tag ? `[${m.pipeline_tag}] ${m.tags.slice(0, 3).join(", ")}` : m.tags.slice(0, 3).join(", "),
      type: "model" as const,
      task: m.pipeline_tag,
      tags: m.tags.slice(0, 8),
      likes: m.likes,
      downloads: m.downloads,
      url: `${HF_BASE}/${m.modelId}`,
    }));

  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function searchHFDatasets(query: string, limit: number): Promise<HFSearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const params = new URLSearchParams({
      search: query,
      limit: String(limit * 2),
      sort: "likes",
      direction: "-1",
    });

    const res = await fetch(`${HF_API}/datasets?${params}`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "SkillsSense/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`HF datasets API failed: ${res.status}`);
    }

    const data: HFDatasetInfo[] = await res.json();

    return data.slice(0, limit).map((d) => ({
      id: d.id,
      name: d.id_,
      description: d.tags.slice(0, 3).join(", ") || "Hugging Face Dataset",
      type: "dataset" as const,
      task: undefined,
      tags: d.tags.slice(0, 8),
      likes: d.likes,
      downloads: d.downloads,
      url: `${HF_BASE}/datasets/${d.id_}`,
    }));

  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 檢查 Hugging Face 是否可用
 */
export function isHuggingFaceEnabled(): boolean {
  return process.env.ENABLE_HUGGINGFACE !== "false";
}
