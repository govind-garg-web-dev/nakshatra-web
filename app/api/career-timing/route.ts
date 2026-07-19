import { NextResponse } from "next/server";
import { z } from "zod";
import { computeKundli } from "@/lib/astro/kundli";
import { geocodeCity } from "@/lib/utils/geocode";
import { chartToReadableText } from "@/lib/ai/context";
import { generateText } from "@/lib/ai/claude";
import { logger } from "@/lib/utils/logger";
import { SIGNS } from "@/lib/astro/constants";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
    const tenthHouseLordEntry = Object.entries(chart.planets).find(([, p]) => p.house === 10);
    const tenthHouseSign = SIGNS[(SIGNS.indexOf(chart.lagna.sign) + 9) % 12];

    const prompt = `${chartToReadableText(chart, name)}

Write a "Career Timing" reading for ${name} focused specifically on: (1) the 10th house (career) and any planet placed there, (2) the current Mahadasha/Antardasha's effect on career, (3) two concrete windows (specific months, within the next 12 months) that favor job changes, interviews, or promotions, and (4) one concrete action to take this month. Warm Hinglish, under 250 words, no disclaimers.`;

    const text = await generateText({
      system:
        "You are Tara, Nakshatra's astrologer, specializing in career timing for Gen Z. Always cite specific planets, houses, and Dasha periods — never generic advice like 'good things are coming'. Reply in plain prose only — no markdown (no **bold**, no headings, no bullet lists).",
      prompt,
      maxTokens: 500,
    });

    return NextResponse.json({
      reading: text,
      tenthHouseSign,
      tenthHousePlanet: tenthHouseLordEntry?.[0] ?? null,
      mahadasha: chart.mahadasha,
    });
  } catch (err) {
    logger.error("career-timing generation failed", { error: String(err) });
    return NextResponse.json({ error: "Could not generate your reading — please try again" }, { status: 502 });
  }
}
