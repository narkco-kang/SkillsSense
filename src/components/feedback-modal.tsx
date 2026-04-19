"use client";

import { useState, useEffect, useRef } from "react";

type FeedbackModalProps = {
  onClose: () => void;
};

const LABELS = {
  en: {
    title: "Share your feedback",
    sub: "Help us improve SkillsSense",
    placeholder: "What did you like? What could be better?",
    send: "Send Feedback",
    sending: "Sending...",
    success: "Thanks! Your feedback helps us grow 🙏",
    error: "Failed to send. Try again or email us directly.",
    close: "Close",
  },
  zh: {
    title: "分享你的想法",
    sub: "幫助我們做得更好",
    placeholder: "你喜歡什麼？哪裡可以改進？",
    send: "發送反饋",
    sending: "發送中...",
    success: "感謝！你的反饋是我們最大的動力 🙏",
    error: "發送失敗。請直接聯繫我們。",
    close: "關閉",
  },
};

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [lang, setLang] = useState<"en" | "zh">("zh");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const overlayRef = useRef<HTMLDivElement>(null);
  const t = LABELS[lang];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && rating === 0) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text: text.trim(), lang }),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="animate-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ animationDuration: "200ms" }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        style={{ animationDuration: "200ms" }}
      >
        {/* Language switcher */}
        <div className="absolute right-5 top-5 flex gap-1.5">
          {(["en", "zh"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                lang === l
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {l === "en" ? "EN" : "中文"}
            </button>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute left-5 top-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label={t.close}
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="text-5xl">🙏</div>
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-200">{t.success}</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mb-1 text-3xl">💬</div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{t.sub}</p>
            </div>

            {/* Star rating */}
            <div className="mb-5 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl transition hover:scale-110"
                  aria-label={`${star} star`}
                >
                  {(hover || rating) >= star ? (
                    <span className="text-amber-400">★</span>
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-600">☆</span>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.placeholder}
                rows={4}
                className="resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-indigo-500/20"
              />

              {status === "error" && (
                <p className="text-sm text-rose-500">{t.error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || (!text.trim() && rating === 0)}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t.sending}
                  </>
                ) : (
                  t.send
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
