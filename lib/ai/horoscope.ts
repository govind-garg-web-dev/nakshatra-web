import { generateText } from "./claude";
import type { Sign } from "@/lib/astro/constants";

// In-memory cache keyed by "sign:date". Resets on redeploy/restart — fine for
// an MVP daily horoscope.
// TODO(founder): persist this in Supabase once Phase 5 lands, so a redeploy
// mid-day doesn't regenerate every sign's text.
const cache = new Map<string, string>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailyHoroscope(sign: Sign): Promise<{ date: string; text: string }> {
  const date = todayKey();
  const cacheKey = `${sign}:${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return { date, text: cached };

  const text = await generateText({
    system:
      "You are Tara, Nakshatra's astrologer. Write daily horoscopes that are warm, specific, and actionable in Hinglish — never vague ('things will improve'), always name a theme (love/career/money/health) and one concrete action for today.",
    prompt: `Write today's (${date}) horoscope for ${sign}. 3-4 sentences. Cover one clear theme and one concrete action. Warm, confident tone, no disclaimers.`,
    maxTokens: 220,
  });

  cache.set(cacheKey, text);
  return { date, text };
}
