import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchAirQualityData } from "@/lib/api/open-meteo";
import { checkRateLimit } from "@/lib/api/rate-limiter";

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  name: z.string().optional().default("Selected Station"),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local_client";
  const rateLimit = checkRateLimit(`aq_${ip}`, { maxRequests: 60, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down.", resetMs: rateLimit.resetMs },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawParams = {
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
    name: searchParams.get("name") || undefined,
  };

  const validation = QuerySchema.safeParse(rawParams);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid geographic coordinates", details: validation.error.format() },
      { status: 400 }
    );
  }

  try {
    const { lat, lon, name } = validation.data;
    const data = await fetchAirQualityData(lat, lon, name);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: "Failed to fetch air quality data", message },
      { status: 500 }
    );
  }
}
