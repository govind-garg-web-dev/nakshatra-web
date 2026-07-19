// AI-narrated readings layered on top of the deterministic astrology engine
// (lib/astro/*). The math (Lagna, houses, Dasha, Guna Milan, Muhurta scoring)
// is never AI-generated — only the explanatory prose is. This keeps every
// number on the page accurate and reproducible while still making each tool
// feel like it was written by an astrologer, not a template.

import type { KundliChart } from "@/lib/astro/kundli";
import type { GunaMilanResult } from "@/lib/astro/gunaMilan";
import type { MuhurtaWindow } from "@/lib/astro/muhurta";
import { chartToReadableText } from "./context";
import { generateText } from "./claude";

const NO_MARKDOWN =
  "Reply in plain prose only — no markdown (no **bold**, no headings, no bullet lists).";

export async function generateKundliReading(chart: KundliChart, name: string): Promise<string> {
  return generateText({
    system: `You are Tara, Nakshatra's astrologer, writing the free plain-language reading under someone's birth chart. Be warm, specific, and grounded in the actual placements given — never generic zodiac fluff. ${NO_MARKDOWN}`,
    prompt: `${chartToReadableText(chart, name)}

Write a short reading (120-160 words) explaining what this chart says about ${name}: their Lagna's effect on personality, their Moon/Nakshatra's effect on emotional nature, and what their current Mahadasha/Antardasha means right now. Warm Hinglish, no disclaimers.`,
    maxTokens: 320,
  });
}

export async function generateGunaMilanReading(
  chartA: KundliChart,
  chartB: KundliChart,
  nameA: string,
  nameB: string,
  result: GunaMilanResult
): Promise<string> {
  const breakdown = result.breakdown.map((k) => `${k.koota}: ${k.score}/${k.max}`).join(", ");

  return generateText({
    system: `You are Tara, Nakshatra's astrologer, explaining a Guna Milan result. Be warm, honest, and specific — cite the actual koota scores and chart placements given, never generic filler. ${NO_MARKDOWN}`,
    prompt: `${chartToReadableText(chartA, nameA)}

${chartToReadableText(chartB, nameB)}

Guna Milan score: ${result.total}/${result.maxTotal}. Koota breakdown: ${breakdown}. Mangal Dosha: ${result.mangalDosha.note}

Write a short reading (120-180 words) explaining what this score actually means for ${nameA} and ${nameB} — call out their strongest koota and their weakest one by name, and give one honest, concrete piece of relationship advice. Warm Hinglish, no disclaimers.`,
    maxTokens: 380,
  });
}

export async function generateMuhurtaReading(
  eventType: string,
  windows: MuhurtaWindow[]
): Promise<string> {
  const top = windows
    .slice(0, 3)
    .map((w) => `${w.date} (${w.weekday}, ${w.tithi}, Moon in ${w.nakshatra}, score ${w.score})`)
    .join("; ");

  return generateText({
    system: `You are Tara, Nakshatra's astrologer, recommending auspicious dates. Be warm, direct, and specific — cite the actual dates and reasons given, never vague mysticism. ${NO_MARKDOWN}`,
    prompt: `Event type: ${eventType.replace("_", " ")}. Top candidate windows: ${top}.

Write a short recommendation (80-120 words) telling the user which of these dates is the strongest choice and why, in plain terms. Warm Hinglish, no disclaimers.`,
    maxTokens: 260,
  });
}
