import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, text, lang } = body;

    // Validate rating (1-5)
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Log feedback for now (in production you'd store this in a DB)
    console.log("[Feedback]", {
      rating,
      text: text?.slice(0, 500),
      lang,
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    // TODO: Store in Supabase or send to email service
    // For now, acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
