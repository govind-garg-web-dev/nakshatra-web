import { NextResponse } from "next/server";
import { z } from "zod";
import { computeKundli } from "@/lib/astro/kundli";
import { geocodeCity } from "@/lib/utils/geocode";
import { logger } from "@/lib/utils/logger";

const bodySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dob must be YYYY-MM-DD"),
  tob: z.string().max(60).optional(),
  city: z.string().min(2).max(200),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, dob, tob, city } = parsed.data;

  try {
    const place = await geocodeCity(city);
    if (!place) {
      return NextResponse.json({ error: "Could not find that place" }, { status: 404 });
    }

    const chart = computeKundli({ dob, tob, lat: place.latitude, lon: place.longitude });

    return NextResponse.json({
      chart,
      input: { name, dob, tob, city: place.displayName, lat: place.latitude, lon: place.longitude },
    });
  } catch (err) {
    logger.error("kundli computation failed", { error: String(err) });
    return NextResponse.json({ error: "Could not compute chart" }, { status: 500 });
  }
}
