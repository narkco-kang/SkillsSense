/**
 * POST /api/stripe/checkout
 *
 * Create a Stripe Checkout Session for the $3/month subscription.
 * Returns the hosted checkout URL for the user to complete payment.
 *
 * Body: { email?: string }
 * Returns: { checkoutUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_MONTHLY_PRICE_ID is not configured" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const checkoutUrl = await createStripeCheckoutSession({
      priceId,
      email,
      successUrl: `${baseUrl}/custom-skills?checkout=success`,
      cancelUrl: `${baseUrl}/custom-skills?checkout=canceled`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return NextResponse.json(
      { error: "checkout_error", message: String(err) },
      { status: 500 }
    );
  }
}
