import Link from "next/link";

export const metadata = {
  title: "隱私政策 - SkillsSense",
  description: "SkillsSense 隱私政策",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-6 inline-block">
          ← 返回首頁
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          隱私政策
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          最後更新：2026 年 4 月 20 日
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">1. 我們收集的資訊</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>帳戶資訊：</strong>電子郵件地址（用於訂閱管理）</li>
              <li><strong>使用數據：</strong>下載記錄、用戶查詢（用於改善服務質量）</li>
              <li><strong>支付資訊：</strong>由 Paddle 處理，我們不存儲信用卡或銀行帳戶資訊</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">2. 數據使用</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>提供和維護訂閱服務</li>
              <li>記錄下載歷史以控制免費下載限額</li>
              <li>改進平台功能和用戶體驗</li>
              <li>發送必要的服務通知（如訂閱相關郵件）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">3. 數據存儲</h2>
            <p>用戶數據存儲在 Supabase（我們的後端服務提供商）。支付相關數據由 Paddle 安全處理和存儲。我們採用行業標準的安全措施保護您的數據。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">4. Cookie</h2>
            <p>我們使用必要的 Cookie 來維持用戶登錄狀態和服務功能。Google Analytics 用於分析網站流量，您可以通過瀏覽器設置拒絕 Cookie。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5. 第三方服務</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase：</strong>數據庫和用戶認證</li>
              <li><strong>Paddle：</strong>支付處理和訂閱管理</li>
              <li><strong>OpenRouter：</strong>AI 技能推薦引擎</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6. 您的權利</h2>
            <p>您有權訪問、更正或刪除您的個人數據。如需行使這些權利，請聯繫 <a href="mailto:support@skillssense.com" className="text-blue-600 hover:underline">support@skillssense.com</a>。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">7. 政策更新</h2>
            <p>我們可能會不時更新本隱私政策。任何重大變更將通過網站公告或電子郵件通知您。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">8. 聯繫方式</h2>
            <p>如有隱私相關問題，請聯繫：<a href="mailto:support@skillssense.com" className="text-blue-600 hover:underline">support@skillssense.com</a></p>
          </section>

        </div>
      </div>
    </main>
  );
}
