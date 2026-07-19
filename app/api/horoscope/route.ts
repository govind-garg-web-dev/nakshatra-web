import { NextResponse } from "next/server";
import { SIGN_SLUGS, SLUG_TO_SIGN } from "@/lib/astro/constants";
import { getDailyHoroscope } from "@/lib/ai/horoscope";
import { logger } from "@/lib/utils/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("sign") ?? "").toLowerCase();
  const sign = SLUG_TO_SIGN[slug];

  if (!sign) {
    return NextResponse.json(
      { error: `Unknown sign. Use one of: ${Object.keys(SIGN_SLUGS).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { date, text } = await getDailyHoroscope(sign);
    return NextResponse.json({ sign, date, text }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (err) {
    logger.error("horoscope generation failed", { error: String(err), sign });
    return NextResponse.json(
      { error: "Horoscope temporarily unavailable — please check back soon." },
      { status: 502 }
    );
  }
}
