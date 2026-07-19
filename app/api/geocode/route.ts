import { NextResponse } from "next/server";
import { z } from "zod";
import { geocodeCity } from "@/lib/utils/geocode";
import { logger } from "@/lib/utils/logger";

const bodySchema = z.object({
  city: z.string().min(2).max(200),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await geocodeCity(parsed.data.city);
    if (!result) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    logger.error("geocode failed", { error: String(err) });
    return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
  }
}
