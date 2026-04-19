/**
 * GET /api/offerwall/show
 *
 * Renders the Offer4All offerwall in an iframe-friendly page.
 * The user watches an offer (ad) and earns a download credit.
 *
 * Offer4All flow:
 *   1. User lands here → we generate an Offer4All iframe URL
 *   2. User completes an offer → Offer4All calls /api/offerwall/callback
 *   3. Callback credits the IP and redirects to success page
 *   4. User sees "Download Ready" and closes the popup
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "127.0.0.1";

  // Detect language from query param ?lang=zh|en, default to EN
  const lang = req.nextUrl.searchParams.get("lang") === "zh" ? "zh" : "en";

  const apiKey = process.env.OFFER4ALL_API_KEY || "";

  const offerWallId = process.env.OFFER4ALL_WALL_ID || "YOUR_WALL_ID";
  const clickId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const offerUrl = new URL(`https://${offerWallId}.offer4all.io/landing`);
  offerUrl.searchParams.set("click_id", clickId);
  offerUrl.searchParams.set("ip", ip);
  offerUrl.searchParams.set("subid", ip);

  const T = {
    zh: {
      title: "解鎖下載 · Unlock Download",
      heading: "👁 觀看廣告解鎖下載",
      description: "完成一個廣告 Offer 後即可下載。<br/>完成後此視窗將自動關閉。",
      loading: "載入中，請稍候...",
      later: "稍後再說",
    },
    en: {
      title: "Unlock Download · Watch an Ad",
      heading: "👁 Watch an Ad to Unlock Your Download",
      description: "Complete one ad offer to unlock your next download.<br/>This window will close automatically after completion.",
      loading: "Loading, please wait...",
      later: "Maybe Later",
    },
  };
  const t = T[lang];

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 24px;
      padding: 40px;
      max-width: 560px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
    }
    h1 { font-size: 24px; margin-bottom: 8px; color: #1a1a2e; }
    p { color: #666; font-size: 15px; margin-bottom: 28px; line-height: 1.6; }
    .offerframe {
      width: 100%;
      height: 520px;
      border: 1px solid #eee;
      border-radius: 16px;
      margin-bottom: 24px;
      background: #fafafa;
    }
    .close-btn {
      background: #f0f0f0;
      border: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 14px;
      cursor: pointer;
      color: #666;
      transition: background 0.2s;
    }
    .close-btn:hover { background: #e0e0e0; color: #333; }
    .spinner {
      display: inline-block;
      width: 20px; height: 20px;
      border: 2px solid rgba(102,126,234,0.3);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading { color: #667eea; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${t.heading}</h1>
    <p>${t.description}</p>

    <iframe
      id="offerwall"
      src="${offerUrl.toString()}"
      class="offerframe"
      frameborder="0"
      allow="autoplay"
    ></iframe>

    <p class="loading"><span class="spinner"></span>${t.loading}</p>

    <br/>
    <button class="close-btn" onclick="window.close()">${t.later}</button>
  </div>

  <script>
    window.addEventListener("message", function(event) {
      try {
        var origin = new URL(event.origin);
        if (origin.hostname.endsWith("offer4all.io")) {
          if (event.data === "offer_complete" || event.data === "completed") {
            window.close();
          }
        }
      } catch(e) {}
    });
    window.addEventListener("blur", function() {
      setTimeout(function() {
        setTimeout(function() { window.close(); }, 1500);
      }, 500);
    });
  </script>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
