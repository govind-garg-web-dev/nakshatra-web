// Core Vedic astrology reference data. Deterministic, no external calls.

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type Sign = (typeof SIGNS)[number];

export const SIGNS_HI: Record<Sign, string> = {
  Aries: "Mesh",
  Taurus: "Vrishabh",
  Gemini: "Mithun",
  Cancer: "Kark",
  Leo: "Simha",
  Virgo: "Kanya",
  Libra: "Tula",
  Scorpio: "Vrishchik",
  Sagittarius: "Dhanu",
  Capricorn: "Makar",
  Aquarius: "Kumbh",
  Pisces: "Meen",
};

export const SIGN_SLUGS: Record<Sign, string> = {
  Aries: "aries",
  Taurus: "taurus",
  Gemini: "gemini",
  Cancer: "cancer",
  Leo: "leo",
  Virgo: "virgo",
  Libra: "libra",
  Scorpio: "scorpio",
  Sagittarius: "sagittarius",
  Capricorn: "capricorn",
  Aquarius: "aquarius",
  Pisces: "pisces",
};

export const SLUG_TO_SIGN: Record<string, Sign> = Object.fromEntries(
  SIGNS.map((s) => [SIGN_SLUGS[s], s])
) as Record<string, Sign>;

export const SIGN_LORDS: Record<Sign, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

export const PLANETS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

export type Planet = (typeof PLANETS)[number];

export const PLANETS_HI: Record<Planet, string> = {
  Sun: "Surya",
  Moon: "Chandra",
  Mars: "Mangal",
  Mercury: "Budh",
  Jupiter: "Guru",
  Venus: "Shukra",
  Saturn: "Shani",
  Rahu: "Rahu",
  Ketu: "Ketu",
};

// 27 Nakshatras with ruling (Dasha) planet, in order.
export const NAKSHATRAS: { name: string; lord: Planet }[] = [
  { name: "Ashwini", lord: "Ketu" },
  { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" },
  { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" },
  { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" },
  { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" },
  { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" },
  { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" },
  { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" },
  { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" },
  { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" },
  { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" },
  { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" },
  { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" },
];

// Vimshottari Dasha sequence and total years (adds up to 120).
export const DASHA_SEQUENCE: Planet[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

export const DASHA_YEARS: Record<Planet, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const TOTAL_DASHA_YEARS = Object.values(DASHA_YEARS).reduce((a, b) => a + b, 0); // 120

// Lahiri (Chitrapaksha) ayanamsha, approximated with a linear model anchored
// at J2000 (Jan 1, 2000, ayanamsha ~ 23.85 deg, drifting ~50.29"/year).
// TODO(founder): swap for a precise IAU precession/nutation model or Swiss
// Ephemeris via WASM if arc-minute accuracy is ever required.
const AYANAMSHA_AT_J2000 = 23.85;
const AYANAMSHA_DRIFT_PER_YEAR = 50.29 / 3600; // arcseconds -> degrees

export function lahiriAyanamsha(julianDay: number): number {
  const yearsSinceJ2000 = (julianDay - 2451545.0) / 365.25;
  return AYANAMSHA_AT_J2000 + AYANAMSHA_DRIFT_PER_YEAR * yearsSinceJ2000;
}

export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}
