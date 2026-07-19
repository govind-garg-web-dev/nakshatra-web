import { NextResponse } from "next/server";
import { z } from "zod";
import { computeKundli } from "@/lib/astro/kundli";
import { gunaMilan } from "@/lib/astro/gunaMilan";
import { geocodeCity } from "@/lib/utils/geocode";
import { chartToReadableText } from "@/lib/ai/context";
import { generateText } from "@/lib/ai/claude";
import { logger } from "@/lib/utils/logger";

const personSchema = z.object({
  name: z.string().min(1).max(120),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tob: z.string().max(60).optional(),
  city: z.string().min(2).max(200),
});

const bodySchema = z.object({
  personA: personSchema,
  personB: personSchema,
  mode: z.enum(["guna", "psychology"]),
});

async function chartFor(person: z.infer<typeof personSchema>) {
  const place = await geocodeCity(person.city);
  if (!place) return null;
  return computeKundli({ dob: person.dob, tob: person.tob, lat: place.latitude, lon: place.longitude });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { personA, personB, mode } = parsed.data;

  const [chartA, chartB] = await Promise.all([chartFor(personA), chartFor(personB)]);
  if (!chartA || !chartB) {
    return NextResponse.json({ error: "Could not find one of the places given" }, { status: 404 });
  }

  if (mode === "guna") {
    const result = gunaMilan(chartA, chartB);
    return NextResponse.json({ result });
  }

  // mode === "psychology": ask Claude for a psychological compatibility read
  try {
    const prompt = `${chartToReadableText(chartA, personA.name)}

${chartToReadableText(chartB, personB.name)}

Write a warm, specific astro-psychology compatibility read for ${personA.name} and ${personB.name}, in Hinglish. Cover: their core temperament clash/match (Sun/Moon/Mars), communication style (Mercury), emotional needs (Moon), and one concrete piece of advice for the relationship. Under 220 words. No "it depends", no generic filler.`;

    const text = await generateText({
      system:
        "You are Tara, Nakshatra's astrologer. Be warm, direct, and specific — always reference actual planets/signs from the charts given, never generic zodiac fluff.",
      prompt,
      maxTokens: 500,
    });

    return NextResponse.json({ result: { text } });
  } catch (err) {
    logger.error("psychology compatibility generation failed", { error: String(err) });
    return NextResponse.json(
      { error: "Tara is unavailable right now — please try again shortly." },
      { status: 502 }
    );
  }
}
