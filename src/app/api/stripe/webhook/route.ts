/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler for subscription events.
 *
 * Configure in Stripe Dashboard:
 *   Developers → Webhooks → Add endpoint
 *   URL: https://yourdomain.com/api/stripe/webhook
 *
 * Events to listen for:
 *   checkout.session.completed    → first payment succeeded, activate subscription
 *   customer.subscription.updated  → plan changed, resumed, etc.
 *   customer.subscription.deleted  → canceled/expired
 *   invoice.payment_failed        → payment failed
 *
 * Env vars needed:
 *   STRIPE_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyStripeWebhookSignature, getStripe } from "@/lib/stripe";
import { upsertMembership } from "@/lib/membership";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractEmailFromSession(session: Stripe.Checkout.Session): string | null {
  // customer_email is set when we pass it during checkout
  return session.customer_email || null;
}

async function extractEmailFromSubscription(sub: Stripe.Subscription): Promise<string | null> {
  // Retrieve customer to get email
  try {
    const customer = await getStripe().customers.retrieve(String(sub.customer), {
      expand: ["email"],
    }) as Stripe.Customer;
    return customer.email || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    if (!signature || !secret) {
      // Fallback: parse without verification (dev only)
      console.warn("[stripe/webhook] No signature or secret — parsing without verification");
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
    }
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "webhook_error" }, { status: 400 });
  }

  console.log(`[stripe/webhook] Event type: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = extractEmailFromSession(session);

        if (!email) {
          console.warn("[stripe/webhook] No email in checkout.session.completed");
          break;
        }

        // Retrieve full subscription to get current period end
        if (session.subscription && typeof session.subscription === "string") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = await getStripe().subscriptions.retrieve(session.subscription) as any;
          const expiresAt = new Date(sub.current_period_end * 1000).toISOString();
          await upsertMembership(email, "monthly", expiresAt);
          console.log(`[stripe/webhook] Activated subscription for ${email}, expires ${expiresAt}`);
        } else {
          await upsertMembership(email, "monthly");
          console.log(`[stripe/webhook] Activated subscription for ${email}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = event.data.object as any;
        const email = subData.customer_email || String(subData.customer);

        if (!email || !email.includes("@")) {
          console.warn("[stripe/webhook] No valid email in subscription event:", subData.id);
          break;
        }

        const expiresAt = new Date(subData.current_period_end * 1000).toISOString();
        const isActive = ["active", "trialing"].includes(subData.status);

        if (isActive) {
          await upsertMembership(email, "monthly", expiresAt);
          console.log(`[stripe/webhook] Updated subscription for ${email}, status=${subData.status}, expires=${expiresAt}`);
        } else {
          // paused, canceled, incomplete, etc — keep existing membership until expiresAt
          await upsertMembership(email, "monthly", expiresAt);
          console.log(`[stripe/webhook] Subscription ${subData.status} for ${email}, access until ${expiresAt}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = event.data.object as any;
        const email = subData.customer_email || String(subData.customer);

        if (!email || !email.includes("@")) {
          console.warn("[stripe/webhook] No valid email in subscription.deleted");
          break;
        }

        // Subscription permanently deleted — set expiresAt to now
        const expiresAt = new Date().toISOString();
        await upsertMembership(email, "monthly", expiresAt);
        console.log(`[stripe/webhook] Subscription deleted for ${email}, access revoked`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe/webhook] Payment failed for invoice ${invoice.id}`);
        // Could notify user or downgrade — for now just log
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[stripe/webhook] Handler error:", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
