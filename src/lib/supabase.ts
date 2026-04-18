import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type MatchedSkill = {
  id: string;
  name: string;
  category: string;
  description: string;
  when_to_use: string | null;
  tags: string[];
  source: string;
  url: string;
  similarity: number;
};

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function matchSkills(
  embedding: number[],
  matchCount = 5,
  threshold = 0.2,
): Promise<MatchedSkill[]> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const { data, error } = await sb.rpc("match_skills", {
    query_embedding: embedding,
    match_count: matchCount,
    similarity_threshold: threshold,
  });
  if (error) throw new Error(`Supabase match_skills failed: ${error.message}`);
  return (data ?? []) as MatchedSkill[];
}

export type { MatchedSkill };
