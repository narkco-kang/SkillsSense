import Link from "next/link";

export const metadata = {
  title: "退款政策 - SkillsSense",
  description: "SkillsSense 退款政策",
};

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-6 inline-block">
          ← 返回首頁
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          退款政策
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          最後更新：2026 年 4 月 20 日
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">7 天無條件退款保障</h2>
            <p>我們提供 7 天無條件退款保障。如果您對 SkillsSense 訂閱不滿意，在首次付款後 7 天內，您可以申請全額退款，無需任何理由。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">如何申請退款</h2>
            <p>請通過電子郵件聯繫我們：</p>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mt-3">
              <p><strong>Email：</strong><a href="mailto:support@skillssense.com" className="text-blue-600 hover:underline">support@skillssense.com</a></p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">請在郵件中提供您的註冊郵箱地址</p>
            </div>
            <p className="mt-3">我們將在收到申請後 3-5 個工作日內處理退款。款項將退回到您原來的付款方式。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">退款進度說明</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>信用卡/借記卡：</strong>退款通常在 5-10 個工作日內到帳，具體取決於發卡銀行</li>
              <li><strong>PayPal：</strong>退款通常在 3-5 個工作日內到帳</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">特殊情況</h2>
            <p>如果您遇到以下情況，請立即聯繫我們：</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>重複扣款</li>
              <li>未使用服務但被扣款</li>
              <li>技術問題導致無法使用訂閱功能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">取消訂閱（不影響退款申請）</h2>
            <p>如果您只是想取消訂閱而非退款，取消後服務將持續到當前計費周期結束，不會再扣除任何費用。取消方式：登錄 Paddle 帳戶或聯繫 support@skillssense.com。</p>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>提示：</strong>在提交退款申請前，請確保您已嘗試聯繫我們解決問題。我們樂意幫助您解決任何使用上的困惑。
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">聯繫方式</h2>
            <p>如有問題，請聯繫：<a href="mailto:support@skillssense.com" className="text-blue-600 hover:underline">support@skillssense.com</a></p>
          </section>

        </div>
      </div>
    </main>
  );
}
