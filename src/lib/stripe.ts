/**
 * Stripe SDK Client
 *
 * Docs: https://stripe.com/docs/api
 *
 * Environment variables needed:
 *   STRIPE_SECRET_KEY         - From Stripe Dashboard → Developers → API Keys
 *   STRIPE_WEBHOOK_SECRET     - From Stripe Dashboard → Developers → Webhooks
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - From Stripe Dashboard → Developers → API Keys
 *   STRIPE_MONTHLY_PRICE_ID   - From Stripe Dashboard → Products → [your product] → Price ID
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export type StripeCheckoutResult = {
  checkoutUrl: string;
};

/**
 * Create a Stripe Checkout Session for a $3/month subscription.
 * Returns the hosted checkout page URL for the user to complete payment.
 */
export async function createStripeCheckoutSession(params: {
  priceId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const { priceId, email, successUrl, cancelUrl } = params;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        source: "skillssense-custom-skills",
      },
    },
  };

  // Pre-fill customer email if provided
  if (email) {
    (sessionParams as Stripe.Checkout.SessionCreateParams & { customer_email?: string }).customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("No checkout URL returned from Stripe");
  }

  return session.url;
}

/**
 * Verify a Stripe webhook signature.
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!secret) {
    console.warn("[stripe] No webhook secret configured — skipping verification");
    return true;
  }
  if (!signature) return false;

  const crypto = require("crypto") as typeof import("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Stripe signature format: t=timestamp,v1=signature
  const parts = signature.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const actual = v1Part.slice(3);

  // Check timestamp to prevent replay attacks (within 5 minutes)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) {
    console.warn("[stripe] Webhook timestamp too old:", age, "seconds");
    return false;
  }

  return expected === actual;
}

/**
 * Retrieve a subscription by ID.
 */
export async function getStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}
