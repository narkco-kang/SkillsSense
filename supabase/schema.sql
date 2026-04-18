-- SkillsSense · Supabase schema
-- Run in Supabase SQL editor, or via `psql` against your project.

-- 1) pgvector extension (OpenAI text-embedding-3-small uses 1536 dims)
create extension if not exists vector;

-- 2) skills table
create table if not exists public.skills (
  id            text primary key,
  name          text not null,
  category      text not null,
  description   text not null,
  when_to_use   text,
  tags          text[] not null default '{}',
  source        text not null default 'hermes',
  url           text not null default '',
  path          text,
  embedding     vector(1536),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists skills_category_idx on public.skills (category);
create index if not exists skills_tags_idx on public.skills using gin (tags);

-- IVFFlat index for cosine similarity. Tune `lists` to ~sqrt(rows).
create index if not exists skills_embedding_idx
  on public.skills using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 3) RPC for semantic search
create or replace function public.match_skills(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  id text,
  name text,
  category text,
  description text,
  when_to_use text,
  tags text[],
  source text,
  url text,
  similarity float
)
language sql stable
as $$
  select
    s.id, s.name, s.category, s.description, s.when_to_use,
    s.tags, s.source, s.url,
    1 - (s.embedding <=> query_embedding) as similarity
  from public.skills s
  where s.embedding is not null
    and 1 - (s.embedding <=> query_embedding) > similarity_threshold
  order by s.embedding <=> query_embedding
  limit match_count;
$$;

-- 4) RLS: read-only public access for the MVP (safe because all data is public anyway)
alter table public.skills enable row level security;

drop policy if exists "Skills are publicly readable" on public.skills;
create policy "Skills are publicly readable"
  on public.skills for select
  using (true);
