// Shubh Muhurat — auspicious timing windows. Scores candidate days by tithi,
// Moon nakshatra, and weekday for a given event type, and returns the top
// windows with a plain-language reason. This is a simplified day-level scorer
// (not minute-precise hora/choghadiya); good enough for "pick a good week" use.
// TODO(founder): add hora/choghadiya-level scoring within a day if users ask
// for sub-day precision.

import { toJulianDay, getPlanetLongitudes } from "./ephemeris";
import { normalizeDegrees } from "./constants";
import { getNakshatra } from "./nakshatra";

export type EventType =
  | "wedding"
  | "travel"
  | "business_launch"
  | "house_warming"
  | "education"
  | "general";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima/Amavasya",
];

// Rikta (4, 9, 14 of each paksha) are traditionally avoided for new beginnings.
const RIKTA_TITHI_OF_PAKSHA = new Set([4, 9, 14]);

const GOOD_WEEKDAYS: Record<EventType, number[]> = {
  wedding: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
  travel: [1, 3, 4, 5],
  business_launch: [1, 3, 4], // Mon, Wed, Thu
  house_warming: [1, 3, 4, 5],
  education: [1, 3, 4, 5],
  general: [1, 3, 4, 5],
};

const AVOID_WEEKDAYS: Record<EventType, number[]> = {
  wedding: [2, 0], // Tue, Sun (commonly avoided by many families)
  travel: [2],
  business_launch: [0, 6],
  house_warming: [2, 0],
  education: [2],
  general: [],
};

const GOOD_NAKSHATRAS: Record<EventType, string[]> = {
  wedding: ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati", "Swati", "Anuradha"],
  travel: ["Pushya", "Ashwini", "Revati", "Hasta", "Shravana"],
  business_launch: ["Pushya", "Hasta", "Chitra", "Anuradha", "Revati"],
  house_warming: ["Rohini", "Mrigashira", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada"],
  education: ["Hasta", "Chitra", "Swati", "Pushya", "Punarvasu"],
  general: ["Pushya", "Ashwini", "Anuradha", "Revati"],
};

function computeTithi(jd: number): { number: number; name: string; paksha: "Shukla" | "Krishna" } {
  const longs = getPlanetLongitudes(jd);
  const diff = normalizeDegrees(longs.Moon - longs.Sun);
  const tithiNumber = Math.floor(diff / 12) + 1; // 1-30
  const paksha: "Shukla" | "Krishna" = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const withinPaksha = paksha === "Shukla" ? tithiNumber : tithiNumber - 15;
  const name = withinPaksha === 15 ? TITHI_NAMES[14] : TITHI_NAMES[withinPaksha - 1];
  return { number: withinPaksha, name, paksha };
}

export interface MuhurtaWindow {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  weekday: string;
  tithi: string;
  nakshatra: string;
  reason: string;
}

export function findMuhurtaWindows(
  eventType: EventType,
  from: string,
  to: string,
  limit = 5
): MuhurtaWindow[] {
  const [fy, fm, fd] = from.split("-").map((s) => parseInt(s, 10));
  const [ty, tm, td] = to.split("-").map((s) => parseInt(s, 10));
  const start = new Date(Date.UTC(fy, fm - 1, fd));
  const end = new Date(Date.UTC(ty, tm - 1, td));

  const results: MuhurtaWindow[] = [];

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const jd = toJulianDay(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 12);
    const tithi = computeTithi(jd);
    const weekdayIndex = d.getUTCDay();
    const weekday = WEEKDAY_NAMES[weekdayIndex];
    const moonLongitude = getPlanetLongitudes(jd).Moon;
    const nakshatra = getNakshatra(moonLongitude).name;

    let score = 50;
    const reasons: string[] = [];

    if (RIKTA_TITHI_OF_PAKSHA.has(tithi.number)) {
      score -= 25;
      reasons.push(`${tithi.name} tithi is traditionally avoided for new beginnings`);
    } else {
      score += 10;
    }

    if (GOOD_WEEKDAYS[eventType].includes(weekdayIndex)) {
      score += 15;
      reasons.push(`${weekday} favors ${eventType.replace("_", " ")}`);
    }
    if (AVOID_WEEKDAYS[eventType].includes(weekdayIndex)) {
      score -= 15;
      reasons.push(`${weekday} is often avoided for ${eventType.replace("_", " ")}`);
    }

    if (GOOD_NAKSHATRAS[eventType].includes(nakshatra)) {
      score += 20;
      reasons.push(`Moon in ${nakshatra} nakshatra is auspicious for this`);
    }

    score = Math.max(0, Math.min(100, score));

    results.push({
      date: d.toISOString().slice(0, 10),
      score,
      weekday,
      tithi: `${tithi.paksha} ${tithi.name}`,
      nakshatra,
      reason: reasons[0] ?? `${weekday}, ${tithi.paksha} ${tithi.name}, Moon in ${nakshatra}`,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
