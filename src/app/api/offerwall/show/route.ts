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

  const apiKey = process.env.OFFER4ALL_API_KEY || "";

  // Generate the offerwall URL (direct link format)
  // https://{your-id}.offer4all.io/landing?click_id={click_id}&ip={ip}&subid={subid}
  const offerWallId = process.env.OFFER4ALL_WALL_ID || "YOUR_WALL_ID";
  const clickId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const offerUrl = new URL(`https://${offerWallId}.offer4all.io/landing`);
  offerUrl.searchParams.set("click_id", clickId);
  offerUrl.searchParams.set("ip", ip);
  offerUrl.searchParams.set("subid", ip); // use IP as subid for callback matching

  // Build a simple HTML page that shows the offerwall
  const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>解鎖下載 · Unlock Download</title>
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
    <h1>👁 觀看廣告解鎖下載</h1>
    <p>完成一個廣告 Offer 後即可下載。<br/>完成後此視窗將自動關閉。</p>

    <iframe
      id="offerwall"
      src="${offerUrl.toString()}"
      class="offerframe"
      frameborder="0"
      allow="autoplay"
    ></iframe>

    <p class="loading"><span class="spinner"></span>載入中，請稍候...</p>

    <br/>
    <button class="close-btn" onclick="window.close()">稍後再說</button>
  </div>

  <script>
    // Listen for messages from the iframe (Offer4All may post completion)
    window.addEventListener('message', function(event) {
      // Accept messages only from our offerwall domain
      try {
        const origin = new URL(event.origin);
        if (origin.hostname.endsWith('offer4all.io')) {
          if (event.data === 'offer_complete' || event.data === 'completed') {
            window.close();
          }
        }
      } catch(e) {}
    });

    // Fallback: check every 3s if iframe has redirected to success URL
    var checkInterval = setInterval(function() {
      try {
        var iframe = document.getElementById('offerwall');
        if (iframe && iframe.contentWindow) {
          // If the iframe URL contains 'success' or 'thankyou', close
          // (Offer4All typically redirects there after offer completion)
        }
      } catch(e) {}
    }, 3000);

    // Also listen for our own callback redirect (when user gets redirected back)
    window.addEventListener('blur', function() {
      // When user clicks away from the popup, assume they might have completed
      setTimeout(function() {
        // Give a moment for the callback to process
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
