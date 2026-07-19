import Link from "next/link";
import { SIGNS, SIGNS_HI, SIGN_SLUGS } from "@/lib/astro/constants";

const SIGN_EMOJI: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

export function ZodiacGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {SIGNS.map((sign) => (
        <Link
          key={sign}
          href={`/horoscope/${SIGN_SLUGS[sign]}`}
          className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <span className="text-3xl">{SIGN_EMOJI[sign]}</span>
          <span className="font-medium text-ink">{sign}</span>
          <span className="text-xs text-ink/40">{SIGNS_HI[sign]}</span>
        </Link>
      ))}
    </div>
  );
}
