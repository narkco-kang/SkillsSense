/**
 * POST /api/lemon-squeezy/checkout
 *
 * Generate a LemonSqueezy checkout URL for the $3/month subscription.
 * Returns a hosted checkout page URL for the user to complete payment.
 *
 * Body: { email?: string }
 * Returns: { checkoutUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// LemonSqueezy store/product configuration
// Replace these with your actual LemonSqueezy IDs after setting up the product
const LEMON_STORE_SLUG = process.env.LEMON_SQUEEZY_STORE_SLUG || "your-store";
const SUBSCRIPTION_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID || "your-variant-id";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email?: string };

    // Build the hosted checkout URL
    // Format: https://{store}.lemonsqueezy.com/checkout/buy/{variantId}?email={email}
    const checkoutUrl = new URL(
      `https://${LEMON_STORE_SLUG}.lemonsqueezy.com/checkout/buy/${SUBSCRIPTION_VARIANT_ID}`
    );

    if (email) {
      checkoutUrl.searchParams.set("email", email);
    }

    // Add custom data so we can identify the user in the webhook
    checkoutUrl.searchParams.set("checkout[custom][source]", "custom-skills-page");

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
    });
  } catch (err) {
    console.error("[lemon-squeezy/checkout] Error:", err);
    return NextResponse.json(
      { error: "checkout_error", message: "Failed to generate checkout URL" },
      { status: 500 }
    );
  }
}
