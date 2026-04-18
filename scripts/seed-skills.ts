/**
 * Seed the Supabase `skills` table from src/lib/skills-data.ts.
 * Computes embeddings and upserts in batches.
 *
 * Usage:
 *   npx tsx scripts/seed-skills.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (required — bypasses RLS for upsert)
 *   OPENAI_API_KEY              (for embeddings)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { SKILLS } from "../src/lib/skills-data";
import { getSupabase } from "../src/lib/supabase";
import { embedBatch, EMBED_MODEL } from "../src/lib/embeddings";

function embeddingInput(s: (typeof SKILLS)[number]): string {
  return [
    `Name: ${s.name}`,
    `Category: ${s.category}`,
    `Description: ${s.description}`,
    `When to use: ${s.whenToUse}`,
    `Tags: ${s.tags.join(", ")}`,
  ].join("\n");
}

async function main() {
  const sb = getSupabase();
  if (!sb) {
    console.error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  console.log(`Seeding ${SKILLS.length} skills using ${EMBED_MODEL}...`);

  const BATCH = 20;
  for (let i = 0; i < SKILLS.length; i += BATCH) {
    const chunk = SKILLS.slice(i, i + BATCH);
    const inputs = chunk.map(embeddingInput);
    console.log(
      `  [${i + 1}-${Math.min(i + BATCH, SKILLS.length)}] embedding...`,
    );
    const embs = await embedBatch(inputs);

    const rows = chunk.map((s, idx) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      when_to_use: s.whenToUse,
      tags: s.tags,
      source: s.source,
      url: s.url,
      path: s.path ?? null,
      embedding: embs[idx],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await sb.from("skills").upsert(rows, { onConflict: "id" });
    if (error) {
      console.error("Upsert failed:", error);
      process.exit(1);
    }
    console.log(`    ✓ upserted ${rows.length} rows`);
  }

  const { count } = await sb
    .from("skills")
    .select("*", { count: "exact", head: true });
  console.log(`\nDone. Total rows in skills table: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
