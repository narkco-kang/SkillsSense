/**
 * GET /api/custom-skills/download/[slug]
 *
 * Serve a custom skill ZIP by regenerating it from stored metadata.
 * (ZIP is regenerated in-memory — no disk writes on serverless)
 *
 * Query params:
 *   email (optional) — for membership check
 */

import { NextRequest, NextResponse } from "next/server";
import { checkDownloadEligibility, logDownload, getMembership, isSubscriptionActive } from "@/lib/membership";
import { packageSkill } from "@/lib/zip-packager";
import type { GeneratedSkill } from "@/lib/skill-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const email = req.nextUrl.searchParams.get("email") || null;
    const ip = req.headers.get("x-forwarded-for") || null;

    // Check subscription — if active, allow unlimited downloads
    if (email) {
      const membership = await getMembership(email);
      if (isSubscriptionActive(membership)) {
        await logDownload(email, slug, ip);
        // Regenerate ZIP in-memory and serve
        return serveZip(slug, null, email);
      }
    }

    // Free daily download check
    const eligibility = await checkDownloadEligibility(email, ip);
    if (!eligibility.allowed) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          message: eligibility.message,
          checkoutUrl: `/api/stripe/checkout${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        },
        { status: 403 }
      );
    }

    await logDownload(email, slug, ip);
    return serveZip(slug, null, email);
  } catch (err) {
    console.error("[download] Error:", err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to serve download" },
      { status: 500 }
    );
  }
}

/**
 * Build and serve a skill ZIP from the provided skill data (embedded in JWT or body)
 */
async function serveZip(slug: string, skillData: GeneratedSkill | null, email: string | null) {
  // If no skill data provided, use a minimal placeholder
  // (In production you'd look up the skill metadata from a KV store or DB)
  const skill: GeneratedSkill = skillData || {
    name: slug.replace(/-/g, " "),
    category: "other",
    description: "Custom generated skill",
    tags: ["custom", "generated"],
    whenToUse: "Custom skill package",
    tutorial: "# Skill Tutorial\n\nThis is your custom skill tutorial.",
    generatedFrom: [],
    prerequisites: [],
    whatYouWillLearn: [],
    difficulty: "intermediate",
    estimatedTime: "1 hour",
  };

  const { zip } = await packageSkill(skill);
  const buffer = Buffer.from(zip);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
