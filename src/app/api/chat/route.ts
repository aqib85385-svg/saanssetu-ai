import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/gemini/schemas";
import { askSaansSetuAssistant } from "@/lib/gemini/client";
import { checkRateLimit } from "@/lib/api/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local_chat_client";
  const rateLimit = checkRateLimit(`chat_${ip}`, { maxRequests: 25, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit reached for AI conversations. Please pause a moment.",
        resetMs: rateLimit.resetMs,
      },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parseResult = ChatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const aiResponse = await askSaansSetuAssistant(parseResult.data);
    return NextResponse.json(aiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing assistant response";
    return NextResponse.json(
      { error: "Assistant execution error", message },
      { status: 500 }
    );
  }
}
