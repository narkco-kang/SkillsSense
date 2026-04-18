import OpenAI from "openai";

/**
 * Embedding model config.
 * OpenAI text-embedding-3-small: 1536 dims, cheap ($0.02/1M tokens).
 *
 * OpenRouter does NOT currently proxy OpenAI embedding endpoints reliably,
 * so we use a direct OpenAI client here. Set OPENAI_API_KEY separately.
 *
 * If you prefer all-in-one on OpenRouter, swap for a hosted embedding model
 * like voyage-3 or cohere embed-english-v3 (update dims in schema.sql).
 */

export const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";
export const EMBED_DIMS = 1536;

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  client = new OpenAI({ apiKey: key });
  return client;
}

export function isEmbeddingConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function embed(text: string): Promise<number[]> {
  const c = getClient();
  if (!c) throw new Error("OPENAI_API_KEY not set");
  const res = await c.embeddings.create({
    model: EMBED_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const c = getClient();
  if (!c) throw new Error("OPENAI_API_KEY not set");
  const res = await c.embeddings.create({
    model: EMBED_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}
