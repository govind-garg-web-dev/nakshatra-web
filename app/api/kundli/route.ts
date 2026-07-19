import { NextResponse } from "next/server";
import { z } from "zod";
import { computeKundli } from "@/lib/astro/kundli";
import { geocodeCity } from "@/lib/utils/geocode";
import { generateKundliReading } from "@/lib/ai/readings";
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

    let reading: string | null = null;
    try {
      reading = await generateKundliReading(chart, name ?? "friend");
    } catch (err) {
      // AI narration is a nice-to-have on top of the (always-correct) chart
      // math above — never fail the whole request if Claude is unavailable.
      logger.error("kundli AI reading failed", { error: String(err) });
    }

    return NextResponse.json({
      chart,
      reading,
      input: { name, dob, tob, city: place.displayName, lat: place.latitude, lon: place.longitude },
    });
  } catch (err) {
    logger.error("kundli computation failed", { error: String(err) });
    return NextResponse.json({ error: "Could not compute chart" }, { status: 500 });
  }
}
