/**
 * GET /api/membership/check
 *
 * Check if an email has an active subscription.
 * Query: ?email=user@example.com
 *
 * Returns: { active: boolean, plan: string | null, expiresAt: string | null }
 */

import { NextRequest, NextResponse } from "next/server";
import { getMembership, isSubscriptionActive } from "@/lib/membership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }

    const membership = await getMembership(email);

    if (!membership) {
      return NextResponse.json({ active: false, plan: null, expiresAt: null });
    }

    return NextResponse.json({
      active: isSubscriptionActive(membership),
      plan: membership.plan,
      expiresAt: membership.expires_at,
    });
  } catch (err) {
    console.error("[membership/check] Error:", err);
    return NextResponse.json({ active: false, plan: null, expiresAt: null });
  }
}
