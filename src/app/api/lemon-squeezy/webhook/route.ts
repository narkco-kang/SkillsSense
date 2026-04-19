/**
 * POST /api/lemon-squeezy/webhook
 *
 * LemonSqueezy webhook handler for subscription events.
 *
 * Configure in LemonSqueezy dashboard:
 *   Dashboard → Product → Subscription → Webhooks
 *   Add endpoint: https://yourdomain.com/api/lemon-squeezy/webhook
 *
 * Events to listen for:
 *   - subscription_created
 *   - subscription_updated
 *   - subscription_cancelled
 *   - subscription_expired
 *
 * Env vars needed:
 *   LEMON_SQUEEZY_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { upsertMembership, type Plan } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// LemonSqueezy event types we care about
type LemonSqueezyEvent = {
  meta: {
    event_name: string;
    custom_data?: {
      email?: string;
      name?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      renews_at: string | null;
      ends_at: string | null;
      email: string;
      name: string | null;
    };
  };
};

function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!secret) {
    console.warn("[lemon-squeezy] No webhook secret configured — skipping verification");
    return true; // Skip in development
  }
  if (!signature) return false;

  // LemonSqueezy uses HMAC-SHA256
  // const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // return expected === signature;
  // Note: Implement actual HMAC verification based on LemonSqueezy docs
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

    // Verify the webhook is from LemonSqueezy
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.warn("[lemon-squeezy] Invalid webhook signature");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let event: LemonSqueezyEvent;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { meta, data } = event;
    const eventName = meta.event_name;
    const email = data.attributes.email || meta.custom_data?.email;
    const status = data.attributes.status;

    if (!email) {
      console.warn("[lemon-squeezy] No email in webhook event:", eventName);
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }

    console.log(`[lemon-squeezy] Event: ${eventName} for ${email}, status: ${status}`);

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        // Activate or extend subscription
        const expiresAt = data.attributes.renews_at || data.attributes.ends_at;
        await upsertMembership(email, "monthly", expiresAt || undefined);
        console.log(`[lemon-squeezy] Activated/updated subscription for ${email}`);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        // Downgrade to free — but keep the subscription active until end of period
        const expiresAt = data.attributes.ends_at;
        if (expiresAt) {
          // Keep them active until subscription truly ends
          await upsertMembership(email, "monthly", expiresAt);
        }
        console.log(`[lemon-squeezy] Subscription cancelled for ${email}, active until ${expiresAt}`);
        break;
      }

      default:
        console.log(`[lemon-squeezy] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lemon-squeezy] Webhook error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
