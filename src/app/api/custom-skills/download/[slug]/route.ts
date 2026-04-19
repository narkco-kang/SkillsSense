/**
 * GET /api/custom-skills/download/[slug]
 *
 * Serve the ZIP file for a generated custom skill.
 * Checks download eligibility before serving.
 *
 * Query params:
 *   email (optional) — for membership check
 *   token (optional) — ad unlock token
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { checkDownloadEligibility, logDownload, getMembership, isSubscriptionActive } from "@/lib/membership";

const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");

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

    // Find the ZIP file matching the slug
    const files = await fs.readdir(DOWNLOADS_DIR);
    const zipFile = files.find(
      (f) => f.startsWith(slug.replace(/[^a-z0-9-]/g, "-")) && f.endsWith(".zip")
    );

    if (!zipFile) {
      return NextResponse.json(
        { error: "not_found", message: "ZIP file not found" },
        { status: 404 }
      );
    }

    const zipPath = path.join(DOWNLOADS_DIR, zipFile);

    // Check subscription status first
    if (email) {
      const membership = await getMembership(email);
      if (isSubscriptionActive(membership)) {
        // Subscribed — log and serve
        await logDownload(email, slug, ip);
        const fileBuffer = await fs.readFile(zipPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${slug}.zip"`,
            "Content-Length": String(fileBuffer.length),
          },
        });
      }
    }

    // Check eligibility (free daily download or ad-required)
    const eligibility = await checkDownloadEligibility(email, ip);

    if (!eligibility.allowed) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          message: eligibility.message,
          checkoutUrl: `/api/lemon-squeezy/checkout${email ? `?email=${encodeURIComponent(email)}` : ""}`,
        },
        { status: 403 }
      );
    }

    // Eligible — log the download and serve
    await logDownload(email, slug, ip);
    const fileBuffer = await fs.readFile(zipPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.zip"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err) {
    console.error("[download] Error:", err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to serve download" },
      { status: 500 }
    );
  }
}
