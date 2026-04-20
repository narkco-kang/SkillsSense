import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  return NextResponse.json({
    keyPrefix: key ? key.slice(0, 8) + "..." : "UNDEFINED",
    model: model || "UNDEFINED",
    keyLength: key ? key.length : 0,
  });
}
