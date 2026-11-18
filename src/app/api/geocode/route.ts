import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/api/open-meteo";
import { checkRateLimit } from "@/lib/api/rate-limiter";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local_client";
  const rateLimit = checkRateLimit(`geo_${ip}`, { maxRequests: 60, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    const locations = await searchLocations(q);
    return NextResponse.json(locations, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: "Geocoding search failed", message },
      { status: 500 }
    );
  }
}
