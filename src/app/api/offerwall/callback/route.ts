/**
 * POST /api/offerwall/callback
 *
 * Offer4All postback endpoint — called when user completes an offer.
 * Validates and credits the user's unlock.
 *
 * Query params from Offer4All:
 *   user_id, offer_id, amount, status, signature (if signed)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyOfferwallCallback } from "@/lib/offerwall-offer4all";
import { upsertMembership } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { user_id, offer_id, amount, status } = params;

    console.log("[offerwall/callback] Received:", params);

    // Validate the callback
    const verification = verifyOfferwallCallback(
      params,
      process.env.OFFERWALL_SECRET || ""
    );

    if (!verification.success) {
      console.warn("[offerwall/callback] Verification failed:", verification.error);
      return NextResponse.json({ error: "invalid_callback" }, { status: 400 });
    }

    // Credit the user with a one-time unlock
    // We store a flag in the memberships table using a special "ad" plan
    // For simplicity, we grant them a 1-day "ad" plan extension
    // In production, you'd track ad_unlocks separately
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    await upsertMembership(
      user_id,
      "monthly", // Plan — you might want a separate "ad" plan
      oneDayFromNow.toISOString()
    );

    console.log(`[offerwall/callback] Unlocked user ${user_id} for offer ${offer_id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[offerwall/callback] Error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
