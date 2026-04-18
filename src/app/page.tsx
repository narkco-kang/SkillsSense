"use client";

import { useState, useEffect, useRef } from "react";

type Skill = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  whenToUse: string;
  source: string;
  url: string;
  generatedFrom?: string[];
};

type Result = {
  skill: Skill;
  score: number;
  tutorial: string;
  source: "local" | "huggingface" | "github-topic" | "awesome-list";
  sourceLabel: string;
};

type GeneratedSkill = {
  name: string;
  category: string;
  description: string;
  tags: string[];
  tutorial: string;
  savedPath?: string;
};

type GuidanceStep = {
  step: number;
  question: string;
  suggestions: string[];
};

type ApiResponse = {
  query?: string;
  intent?: { summary: string; keywords: string[]; domain?: string };
  results?: Result[];
  error?: string;
  message?: string;
  skillsmpFound?: boolean;
  skillsmpUrl?: string;
  generatedSkill?: GeneratedSkill;
  guidance?: GuidanceStep[];
  language?: "en" | "zh";
};

// ─── Translations ──────────────────────────────────────────────
const T = {
  en: {
    badge: "AI-Powered Skill Discovery",
    heroTitle1: "Describe what you want to do",
    heroTitle2: "Find the perfect Skill",
    heroSub: "AI parses your need, recommends tools, and generates tutorials —",
    heroSub2: "no more \"can't find, can't use, can't trust\".",
    searchPlaceholder: "e.g. I want to transcribe YouTube videos into text...",
    searchBtn: "Search →",
    thinking: "Thinking...",
    footer: "SkillsSense · Connect everyone with the right AI tools",
    github: "GitHub ↗",
    intentLabel: "AI understood",
    intentSource: "Source",
    skillSaved: "Saved locally",
    viewTutorial: "📖 View AI-generated tutorial",
    guidanceTitle: "Need help refining your request?",
    goToSkillsmp: "Found on skillsMP!",
    clickToView: "Click to view full info",
    aiGenerated: "AI-generated for you",
    resultGo: "Go ↗",
    stepLabels: ["Parse intent", "Match skills", "Generate tutorial"],
    // Examples
    ex1: "Fine-tune an open-source LLM as a customer service bot",
    ex2: "Plan a multi-step refactoring project",
    ex3: "Transcribe meeting recordings into transcripts",
    ex4: "Run a code review but don't know where to start",
    ex5: "Generate a sci-fi style illustration with AI",
    ex6: "Monitor production error rates and SLOs",
  },
  zh: {
    badge: "AI 驅動的技能發現平台",
    heroTitle1: "說出你想做的事",
    heroTitle2: "找到最適合的 Skill",
    heroSub: "AI 幫你解析需求、推薦工具、生成教程 —",
    heroSub2: "「不會找、不會用、不敢信」的問題，到這裡為止。",
    searchPlaceholder: "例如：我想把 YouTube 影片轉成逐字稿...",
    searchBtn: "搜尋 →",
    thinking: "思考中...",
    footer: "SkillsSense · 用 AI 連接每個人和最適合他的工具",
    github: "GitHub ↗",
    intentLabel: "AI 理解到的意圖",
    intentSource: "來源",
    skillSaved: "已保存到本地",
    viewTutorial: "📖 查看 AI 生成的教程",
    guidanceTitle: "需要幫你細化需求嗎？",
    goToSkillsmp: "在 skillsMP 找到了！",
    clickToView: "點擊前往 skillsMP 查看完整資訊",
    aiGenerated: "AI 為你量身打造的新技能",
    resultGo: "前往 ↗",
    stepLabels: ["解析意圖", "匹配 skill", "生成教程"],
    // Examples
    ex1: "我想微調一個開源 LLM 做客服機器人",
    ex2: "幫我規劃一個多步驟的重構計劃",
    ex3: "需要把公司會議錄音轉成逐字稿",
    ex4: "要跑一輪 code review 但不知道從哪看起",
    ex5: "想用 AI 生成一張科幻風格的插畫",
    ex6: "需要監控生產環境的錯誤率和 SLO",
  },
} as const;

type Lang = keyof typeof T;

// ─── Client-only animated badge (avoids SSR/hydration mismatch) ───
function LiveBadge({ lang }: { lang: Lang }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
      </span>
      {T[lang].badge}
    </span>
  );
}

type Translations = typeof T.zh;

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  // Streaming state
  const [intent, setIntent] = useState<ApiResponse["intent"] | null>(null);
  const [streamingResults, setStreamingResults] = useState<Result[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [skillsmpFound, setSkillsmpFound] = useState(false);
  const [skillsmpUrl, setSkillsmpUrl] = useState<string | null>(null);
  const [generatedSkill, setGeneratedSkill] = useState<ApiResponse["generatedSkill"]>(undefined as any);
  const [guidance, setGuidance] = useState<ApiResponse["guidance"]>(undefined as any);
  const [done, setDone] = useState(false);

  const t: Translations = T[lang] as Translations;
  const EXAMPLES = [t.ex1, t.ex2, t.ex3, t.ex4, t.ex5, t.ex6];

  function resetStreamState() {
    setIntent(null);
    setStreamingResults([]);
    setStatusMsg("");
    setSkillsmpFound(false);
    setSkillsmpUrl(null);
    setGeneratedSkill(null as any);
    setGuidance(null as any);
    setDone(false);
  }

  async function runSearch(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setQuery(text);
    setLoading(true);
    setData(null);
    resetStreamState();

    // Use refs to capture live values from the stream (avoid closure stale-state bug)
    const liveIntent = { current: undefined as ApiResponse["intent"] };
    const liveResults = { current: [] as Result[] };
    const liveSkillsmpFound = { current: false };
    const liveSkillsmpUrl = { current: null as string | null };
    const liveGenerated = { current: undefined as ApiResponse["generatedSkill"] };
    const liveGuidance = { current: undefined as ApiResponse["guidance"] };

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, language: lang, stream: true }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) continue;
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const payload = JSON.parse(data);
              // Handle status events
              if (payload.step && payload.message) {
                setStatusMsg(payload.message);
              }
              // Handle intent
              else if (payload.summary && payload.keywords) {
                liveIntent.current = payload;
                setIntent(payload);
              }
              // Handle sources
              else if (payload.skillsmpFound !== undefined) {
                liveSkillsmpFound.current = payload.skillsmpFound;
                liveSkillsmpUrl.current = payload.skillsmpUrl || null;
                setSkillsmpFound(payload.skillsmpFound);
                setSkillsmpUrl(payload.skillsmpUrl || null);
              }
              // Handle tutorial result
              else if (payload.skill && payload.tutorial !== undefined) {
                const tutorialResult = payload as Result;
                liveResults.current = [...liveResults.current, tutorialResult];
                setStreamingResults(liveResults.current);
              }
              // Handle generated skill
              else if (payload.name && payload.description && !payload.skill) {
                liveGenerated.current = payload;
                setGeneratedSkill(payload);
              }
              // Handle guidance
              else if (Array.isArray(payload)) {
                liveGuidance.current = payload;
                setGuidance(payload);
              }
              // Handle done
              else if (Object.keys(payload).length === 0 || payload.done) {
                setDone(true);
              }
            } catch {}
          }
        }
      }

      // Build final data using the LIVE values captured during stream
      setData({
        query: text,
        intent: liveIntent.current,
        results: liveResults.current,
        skillsmpFound: liveSkillsmpFound.current,
        skillsmpUrl: liveSkillsmpUrl.current,
        generatedSkill: liveGenerated.current,
        guidance: liveGuidance.current,
        language: lang as "en" | "zh",
      } as ApiResponse);
    } catch (err) {
      setData({
        error: "Network error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
      setDone(true);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/30 via-fuchsia-400/30 to-rose-400/30 blur-3xl dark:from-indigo-500/20 dark:via-fuchsia-500/20 dark:to-rose-500/20" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tl from-cyan-300/20 to-transparent blur-3xl" />
      </div>

      <header className="relative z-10 w-full border-b border-black/5 backdrop-blur-sm dark:border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 font-bold text-white shadow-lg shadow-fuchsia-500/30">
              <span className="text-lg">S</span>
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                SkillsSense
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                Find · Use · Trust
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-white/80 p-0.5 backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
              <button
                onClick={() => setLang("en")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  lang === "en"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("zh")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  lang === "zh"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                中文
              </button>
            </div>

            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {t.github}
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <section className="flex flex-col items-center text-center">
          <LiveBadge lang={lang} />

          <h1 className="mt-6 max-w-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl">
            {t.heroTitle1}
            <br />
            {t.heroTitle2}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.heroSub}
            <br className="hidden sm:block" />
            {t.heroSub2}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
            className="mt-10 w-full"
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 opacity-0 blur transition group-focus-within:opacity-30" />
              <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-indigo-400 focus-within:shadow-lg dark:border-white/10 dark:bg-zinc-900">
                <svg
                  className="ml-5 h-5 w-5 shrink-0 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-zinc-400 dark:text-zinc-50"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="mr-2 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-fuchsia-500/20 transition hover:shadow-lg hover:shadow-fuchsia-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none dark:disabled:from-zinc-700 dark:disabled:to-zinc-800"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t.thinking}
                    </>
                  ) : (
                    <>{t.searchBtn}</>
                  )}
                </button>
              </div>
            </div>
          </form>

          {!data && !loading && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => runSearch(ex)}
                  className="group rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1.5 text-xs text-zinc-600 backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-indigo-400 dark:hover:bg-zinc-900"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          {/* Streaming status */}
          {loading && !done && (
            <div className="flex flex-col items-center gap-4 py-8">
              {statusMsg && (
                <div className="animate-pulse text-sm text-indigo-600 dark:text-indigo-400">
                  {statusMsg}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-500" style={{animationDelay: '0ms'}} />
                <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-500" style={{animationDelay: '150ms'}} />
                <div className="h-3 w-3 animate-bounce rounded-full bg-indigo-500" style={{animationDelay: '300ms'}} />
              </div>
              {streamingResults.length > 0 && (
                <div className="text-xs text-zinc-500">
                  已找到 {streamingResults.length} 個技能，正在生成教程...
                </div>
              )}
            </div>
          )}

          {data?.error && (
            <div className="animate-in rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠</span>
                <div>
                  <div className="font-medium">{data.error}</div>
                  {data.message && (
                    <div className="mt-1 text-rose-700/80 dark:text-rose-300/80">
                      {data.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {data?.results && data.results.length > 0 && (
            <div className="animate-in">
              {data.skillsmpFound && data.skillsmpUrl && (
                <a
                  href={data.skillsmpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 flex items-center gap-3 overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm transition hover:border-green-300 hover:shadow-md dark:border-green-500/30 dark:from-green-500/10 dark:to-emerald-500/10"
                >
                  <span className="text-xl">🔗</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t.goToSkillsmp}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {t.clickToView}
                    </div>
                  </div>
                  <span className="text-green-500">→</span>
                </a>
              )}

              {data.intent && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <span>✨</span>
                    {t.intentLabel}
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {data.intent.summary}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.intent.keywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generated Skill */}
              {data.generatedSkill && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white shadow-sm dark:border-fuchsia-500/30 dark:from-fuchsia-500/10 dark:to-transparent">
                  <div className="border-b border-fuchsia-100 bg-white/50 px-5 py-3 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                      <span>🆕</span>
                      {t.aiGenerated}
                      <span className="rounded bg-fuchsia-100 px-1.5 py-0.5 text-[10px] dark:bg-fuchsia-500/20">
                        {t.skillSaved}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-fuchsia-900 dark:text-fuchsia-100">
                      {data.generatedSkill.name}
                    </h3>
                    <p className="mt-2 text-sm text-fuchsia-700 dark:text-fuchsia-300">
                      {data.generatedSkill.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {data.generatedSkill.tags.map((t_tag) => (
                        <span
                          key={t_tag}
                          className="rounded-md bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300"
                        >
                          #{t_tag}
                        </span>
                      ))}
                    </div>
                    {data.generatedSkill.tutorial && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300">
                          {t.viewTutorial}
                        </summary>
                        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {data.generatedSkill.tutorial}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Guidance Section */}
              {data.guidance && data.guidance.length > 0 && !data.generatedSkill && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm dark:border-amber-500/30 dark:from-amber-500/10 dark:to-transparent">
                  <div className="border-b border-amber-100 bg-white/50 px-5 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <span>💡</span>
                      {t.guidanceTitle}
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    {data.guidance.map((step) => (
                      <div key={step.step}>
                        <div className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                          {step.step}. {step.question}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {step.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => runSearch(s)}
                              className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs text-amber-700 transition hover:border-amber-400 hover:bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {(streamingResults.length > 0 ? streamingResults : data.results || []).map((r, i) => (
                  <ResultCard key={r.skill.id} rank={i + 1} result={r} lang={lang} t={t} />
                ))}
                {done && streamingResults.length === 0 && !(data.results?.length) && !data.error && !data.guidance && !data.generatedSkill && (
                  <div className="text-center text-sm text-zinc-500 py-8">
                    找不到相關技能，試試其他關鍵詞？
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/5 py-6 text-center text-xs text-zinc-500 dark:border-white/10">
        {t.footer}
      </footer>
    </div>
  );
}

function LoadingState({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400" />
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          ✨
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        {t.stepLabels.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="transition-opacity" style={{ opacity: 0.4 + i * 0.2 }}>
              {s}
            </span>
            {i < t.stepLabels.length - 1 && <span className="text-zinc-300">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ rank, result, lang, t }: { rank: number; result: Result; lang: Lang; t: Translations }) {
  const { skill, tutorial } = result;
  const [open, setOpen] = useState(rank === 1);

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900 dark:hover:border-indigo-500/30">
      <header className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 font-bold text-white shadow-md shadow-fuchsia-500/20">
            {rank}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
              {skill.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-white/10">
                {skill.category}
              </span>
              <span>·</span>
              <span className={
                result.source !== "local"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500"
              }>
                {result.sourceLabel || result.source}
              </span>
            </div>
          </div>
        </div>
        <a
          href={skill.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-indigo-500/10"
        >
          {t.resultGo}
        </a>
      </header>

      <div className="px-5 pb-5">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {skill.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.map((t_tag) => (
            <span
              key={t_tag}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-400"
            >
              #{t_tag}
            </span>
          ))}
        </div>

        {tutorial && (
          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-white dark:border-white/5 dark:from-white/5 dark:to-transparent">
            <button
              onClick={() => setOpen(!open)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-zinc-800 transition hover:text-indigo-600 dark:text-zinc-200"
            >
              <span className="flex items-center gap-2">
                <span>📖</span>
                {lang === "zh" ? "AI 生成教程" : "AI-generated tutorial"}
              </span>
              <span className={`transition ${open ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {open && (
              <div className="border-t border-zinc-100 px-4 py-4 dark:border-white/5">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {tutorial}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
