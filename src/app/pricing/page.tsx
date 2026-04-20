import Link from "next/link";

export const metadata = {
  title: "定價 - SkillsSense",
  description: "SkillsSense 訂閱方案 - $3/月，解鎖無限技能下載",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block">
            ← 返回首頁
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            定價方案
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            簡單透明，無隱藏費用
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-blue-900">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              SkillsSense 訂閱
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              無限下載所有技能套餐
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                $3
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-lg">
                /月
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              訂閱包含：
            </h3>
            <ul className="space-y-3">
              {[
                "無限下載所有技能套餐",
                "每日 1 次免費下載（無需訂閱）",
                "每月持續更新新技能",
                "完整詳細教學內容",
                "ZIP 格式方便離線使用",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <strong>免費使用：</strong>每天可免費下載 1 個技能套餐。訂閱後解鎖無限下載。
            </p>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            透過 Stripe 處理，支援信用卡、借記卡、PayPal 等多種支付方式。
            <br />
            如有問題，請聯繫 support@skillssense.com
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            常見問題
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "如何取消訂閱？",
                a: "您可以隨時通過 Paddle 帳戶入口取消訂閱，取消後在當前計費周期結束前仍可使用付費功能。",
              },
              {
                q: "退款政策是什麼？",
                a: "我們提供 7 天無條件退款保障。如有任何問題，請聯繫 support@skillssense.com。",
              },
              {
                q: "支援哪些支付方式？",
                a: "Paddle 支援信用卡、借記卡、PayPal 等多種支付方式，具體取決於您所在地區。",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
