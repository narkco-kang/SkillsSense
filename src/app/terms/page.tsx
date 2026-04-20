import Link from "next/link";

export const metadata = {
  title: "服務條款 - SkillsSense",
  description: "SkillsSense 服務條款",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-6 inline-block">
          ← 返回首頁
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          服務條款
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          最後更新：2026 年 4 月 20 日
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. 服務說明</h2>
            <p>SkillsSense 是一個 AI 驅動的技能發現平台，用戶可以通過自然語言描述需求，獲得個性化的技能推薦和詳細教程。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. 訂閱服務</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>訂閱費用為 $3 美元/月，通過第三方支付平台 Paddle 處理。</li>
              <li>訂閱後用戶可無限下載技能套餐。</li>
              <li>未訂閱用戶每日可免費下載 1 個技能套餐。</li>
              <li>訂閱為自動續訂，計費周期為每月。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. 取消與退款</h2>
            <p>用戶可隨時取消訂閱。取消後服務將持續到當前計費周期結束。我們提供 7 天無條件退款保障。如需退款，請聯繫 support@skillssense.com。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. 知識產權</h2>
            <p>SkillsSense 生成的技能套餐和教程內容僅供個人學習使用。未經授權，不得用於商業轉售或分發。用戶對其自行上傳或輸入的內容負責。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. 免責聲明</h2>
            <p>SkillsSense 盡力確保平台提供的資訊準確完整，但不對內容的時效性、準確性或完整性做任何明示或暗示的保證。用戶需自行判斷如何合理使用這些技能和工具。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6. 服務變更</h2>
            <p>我們保留隨時修改或終止服務（或其任何部分）的權利，並將在合理範圍內提前通知用戶。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">7. 聯繫方式</h2>
            <p>如有疑問，請聯繫：<a href="mailto:support@skillssense.com" className="text-blue-600 hover:underline">support@skillssense.com</a></p>
          </section>

        </div>
      </div>
    </main>
  );
}
