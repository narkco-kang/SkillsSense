"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

// ─── Translations ──────────────────────────────────────────────
const T = {
  en: {
    badge: "Custom Skill Generator",
    heroTitle: "Build Your Perfect Skill",
    heroSub:
      "Tell AI your goal, get a complete skill package — SKILL.md, tutorial, examples & templates. Download as a ZIP.",
    step1Title: "What do you want to accomplish?",
    step1Sub: "Describe your goal in plain language",
    step2Title: "Choose your context",
    step2Sub: "Where will you use this skill?",
    step3Title: "Your proficiency level",
    step3Sub: "This helps AI tailor the tutorial complexity",
    step4Title: "Ready to generate!",
    scenario: {
      label: "Use case",
      personal: "Personal productivity",
      team: "Team collaboration",
      product: "Product development",
      learning: "Learning & research",
      other: "Other",
    },
    proficiency: {
      label: "Proficiency",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      expert: "Expert",
    },
    goalPlaceholder: "e.g. I want to automate my daily report generation with Python...",
    btnNext: "Next →",
    btnBack: "← Back",
    btnGenerate: "🎯 Generate My Custom Skill",
    generating: "AI is crafting your skill...",
    generatedTitle: "Your Custom Skill is Ready! 🎉",
    downloadLabel: "Download Package (ZIP)",
    downloadBtn: "📦 Download ZIP",
    skillCard: "Skill Card",
    tutorialPreview: "Tutorial Preview",
    freeLabel: "FREE",
    freeDesc: "You have 1 free generation + download",
    subscribeLabel: "Subscribe",
    subscribeDesc: "$3/month · Unlimited downloads",
    subscribedBadge: "Pro Member · Unlimited Downloads",
    backToHome: "Back to Home",
    emailPlaceholder: "Enter email (for membership tracking)",
    footer: "SkillsSense · Connect everyone with the right AI tools",
    github: "GitHub ↗",
    stepLabels: ["Describe", "Context", "Level", "Download"],
    goalRequired: "Please describe your goal (at least 5 characters)",
  },
  zh: {
    badge: "定制技能生成器",
    heroTitle: "打造你的專屬 Skill",
    heroSub:
      "告訴 AI 你的目標，獲得完整技能包 — SKILL.md、教程、範例與模板。打包成 ZIP 下載。",
    step1Title: "你想達成什麼目標？",
    step1Sub: "用自然語言描述你的需求",
    step2Title: "選擇應用場景",
    step2Sub: "這個 skill 會在哪裡使用？",
    step3Title: "你的熟練程度",
    step3Sub: "這能幫助 AI 調整教程的複雜度",
    step4Title: "準備開始生成！",
    scenario: {
      label: "應用場景",
      personal: "個人效率",
      team: "團隊協作",
      product: "產品開發",
      learning: "學習研究",
      other: "其他",
    },
    proficiency: {
      label: "熟練程度",
      beginner: "初學者",
      intermediate: "中級",
      advanced: "高級",
      expert: "專家",
    },
    goalPlaceholder: "例如：我想用 Python 自動化每日報告生成...",
    btnNext: "下一步 →",
    btnBack: "← 上一步",
    btnGenerate: "🎯 生成我的定製化 Skill",
    generating: "AI 正在為你打造 skill...",
    generatedTitle: "你的定製化 Skill 已準備好！🎉",
    downloadLabel: "下載完整包（ZIP）",
    downloadBtn: "📦 下載 ZIP",
    skillCard: "技能卡片",
    tutorialPreview: "教程預覽",
    freeLabel: "免費",
    freeDesc: "你有 1 次免費生成 + 下載機會",
    subscribeLabel: "訂閱下載",
    subscribeDesc: "$3/月 · 無限次下載",
    subscribedBadge: "Pro 會員 · 無限下載",
    backToHome: "回到首頁",
    emailPlaceholder: "輸入 Email（可追蹤會員狀態）",
    footer: "SkillsSense · 用 AI 連接每個人和最適合他的工具",
    github: "GitHub ↗",
    stepLabels: ["描述需求", "選擇場景", "選擇程度", "下載"],
    goalRequired: "請描述你的目標（至少 5 個字符）",
  },
} as const;

type Lang = keyof typeof T;

type Step = 1 | 2 | 3 | 4;

type GeneratedResult = {
  name: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  whenToUse: string;
  generatedFrom: string[];
  tutorialPreview: string;
  fullTutorial: string;
  downloadUrl?: string;
  zipBase64?: string;
  files?: string[];
};

type DownloadStatus = "free" | "subscribe-required" | "subscribed" | "generating" | "ready" | "error";

export default function CustomSkillsPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState("");
  const [scenario, setScenario] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [email, setEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("free");
  const [error, setError] = useState<string | null>(null);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const t = T[lang];

  const canProceed = {
    1: goal.trim().length >= 5,
    2: scenario !== "",
    3: proficiency !== "",
    4: result !== null,
  };

  function goNext() {
    if (step < 4 && canProceed[step as keyof typeof canProceed]) {
      setStep((step + 1) as Step);
    }
  }

  async function checkSubscriptionStatus(): Promise<boolean> {
    if (!email) return false;
    try {
      const res = await fetch(`/api/membership/check?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        return data.active === true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  async function handleGenerate() {
    if (!canProceed[1] || !canProceed[2] || !canProceed[3]) return;
    setGenerating(true);
    setError(null);
    setDownloadStatus("generating");

    try {
      // Check if subscribed first
      const isSubscribed = email ? await checkSubscriptionStatus() : false;

      const res = await fetch("/api/custom-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, scenario, proficiency, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Generation failed");
      }

      setResult(data);
      setDownloadStatus(isSubscribed ? "subscribed" : "free");
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setDownloadStatus("error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!result) return;

    // If we have zipBase64 from the generation response, use it directly
    if ("zipBase64" in result && result.zipBase64) {
      const link = document.createElement("a");
      link.href = `data:application/zip;base64,${result.zipBase64}`;
      link.download = `${result.slug}.zip`;
      link.click();
      setDownloadStatus("subscribe-required");
      return;
    }

    // Fallback: use the download endpoint
    const downloadUrl = new URL(`/api/custom-skills/download/${result.slug}`, window.location.origin);
    if (email) downloadUrl.searchParams.set("email", email);

    if (downloadStatus === "free") {
      try {
        const res = await fetch(downloadUrl.toString());
        if (res.status === 200) {
          const blob = await res.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${result.slug}.zip`;
          link.click();
          URL.revokeObjectURL(link.href);
          setDownloadStatus("subscribe-required");
          return;
        }
      } catch {
        // Fall through
      }
      window.open(downloadUrl.toString(), "_blank");
      setDownloadStatus("subscribe-required");
      return;
    }

    if (downloadStatus === "subscribe-required") {
      if (email && (await checkSubscriptionStatus())) {
        setDownloadStatus("subscribed");
        handleDownload();
        return;
      }
      return;
    }

    if (downloadStatus === "subscribed") {
      window.open(downloadUrl.toString(), "_blank");
    }
  }

  async function handleSubscribe() {
    const checkoutRes = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { checkoutUrl } = await checkoutRes.json();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-indigo-950 dark:via-zinc-950 dark:to-fuchsia-950">
      {/* Header */}
      <header className="w-full border-b border-black/5 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
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
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang Toggle */}
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
              href="https://github.com/narkco-kang/SkillsSense"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {t.github}
            </a>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? "☀️" : "🌙"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            {t.badge}
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">{t.heroSub}</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  s < step
                    ? "bg-indigo-600 text-white"
                    : s === step
                    ? "border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-2 border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              <span className={`text-xs ${s === step ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}>
                {t.stepLabels[s - 1]}
              </span>
              {s < 4 && (
                <div className={`h-px w-6 ${s < step ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t.step1Title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t.step1Sub}</p>
              </div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t.goalPlaceholder}
                rows={4}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
              {goal.trim().length > 0 && goal.trim().length < 5 && (
                <p className="text-xs text-rose-500">{t.goalRequired}</p>
              )}
            </div>
          )}

          {/* Step 2: Scenario */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t.step2Title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t.step2Sub}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(["personal", "team", "product", "learning", "other"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      scenario === s
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20"
                    }`}
                  >
                    {t.scenario[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Proficiency */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t.step3Title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t.step3Sub}</p>
              </div>
              <div className="space-y-3">
                {(["beginner", "intermediate", "advanced", "expert"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProficiency(p)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      proficiency === p
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20"
                    }`}
                  >
                    {t.proficiency[p]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Result / Download */}
          {step === 4 && result && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t.generatedTitle}</h2>
              </div>

              {/* Skill Card */}
              <div className="overflow-hidden rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white dark:border-fuchsia-500/30 dark:from-fuchsia-500/10 dark:to-transparent">
                <div className="border-b border-fuchsia-100 bg-white/60 px-5 py-3 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                    🆕 {t.skillCard}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-fuchsia-900 dark:text-fuchsia-100">{result.name}</h3>
                  <p className="mt-2 text-sm text-fuchsia-700 dark:text-fuchsia-300">{result.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {result.generatedFrom.length > 0 && (
                    <p className="mt-3 text-xs text-zinc-500">
                      Based on: {result.generatedFrom.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Tutorial Preview */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10">
                <div className="border-b border-zinc-100 bg-white/80 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {t.tutorialPreview}
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-5">
                  <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-sm">
                    {result.fullTutorial.split("\n").slice(0, 20).join("\n")}
                    {result.fullTutorial.split("\n").length > 20 && (
                      <span className="text-zinc-400">...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="space-y-3">
                {/* Email input */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-indigo-500"
                  />
                </div>

                {downloadStatus === "free" && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    <span>🎁</span>
                    <span>{t.freeDesc}</span>
                  </div>
                )}
                {downloadStatus === "subscribe-required" && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <span>🔓</span>
                    <span>{lang === "zh" ? "免費次數已用盡，訂閱解鎖無限下載" : "Free download used. Subscribe for unlimited downloads."}</span>
                  </div>
                )}
                {downloadStatus === "subscribed" && (
                  <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <span>✨</span>
                    <span>{t.subscribedBadge}</span>
                  </div>
                )}
                {downloadStatus === "generating" && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-600" />
                      {t.generating}
                    </div>
                  </div>
                )}
                {downloadStatus !== "generating" && (
                  <button
                    onClick={handleDownload}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:shadow-xl hover:shadow-fuchsia-500/30 active:scale-[0.98]"
                  >
                    {downloadStatus === "free"
                      ? `🎁 ${t.downloadBtn} (${t.freeLabel})`
                      : downloadStatus === "subscribe-required"
                      ? `🔓 ${t.subscribeLabel}`
                      : downloadStatus === "subscribed"
                      ? `📦 ${t.downloadBtn}`
                      : t.downloadBtn}
                  </button>
                )}
                {downloadStatus === "subscribe-required" && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubscribe}
                      className="flex-1 rounded-xl border border-fuchsia-200 bg-fuchsia-50 py-2.5 text-sm font-medium text-fuchsia-600 transition hover:bg-fuchsia-100 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:hover:bg-fuchsia-500/20"
                    >
                      {t.subscribeLabel} · {t.subscribeDesc}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 && step < 4 ? (
              <button
                onClick={() => setStep((step - 1) as Step)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {t.btnBack}
              </button>
            ) : (
              <div />
            )}

            {step < 3 && (
              <button
                onClick={goNext}
                disabled={!canProceed[step as keyof typeof canProceed]}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.btnNext}
              </button>
            )}

            {step === 3 && !generating && (
              <button
                onClick={handleGenerate}
                disabled={!canProceed[3]}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:shadow-xl hover:shadow-fuchsia-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.btnGenerate}
              </button>
            )}

            {generating && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-600" />
                <span className="text-sm">{t.generating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            ← {t.backToHome}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-black/5 py-6 text-center text-xs text-zinc-500 dark:border-white/10">
        {t.footer}
      </footer>
    </div>
  );
}
