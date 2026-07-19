import { toJulianDay, getPlanetLongitudes } from "./ephemeris";
import {
  lahiriAyanamsha,
  normalizeDegrees,
  SIGNS,
  SIGNS_HI,
  SIGN_LORDS,
  PLANETS,
  type Sign,
  type Planet,
} from "./constants";
import { getNakshatra } from "./nakshatra";
import { buildDashaTimeline, getActiveDasha } from "./dasha";

const DEG2RAD = Math.PI / 180;

/**
 * Parse a time-of-birth string into a 24-hour float (e.g. 6.3667 for 6:22 AM).
 * Accepts "6:22 AM", "18:22", common Hindi/Hinglish phrases, and "sunrise"/
 * "sunset". Falls back to 06:00 (sunrise default) when unparseable.
 */
export function parseTimeOfBirth(tob: string | undefined | null): number {
  if (!tob) return 6;
  const raw = tob.trim().toLowerCase();
  if (!raw) return 6;

  if (raw.includes("sunrise") || raw.includes("subah") || raw.includes("savere")) return 6;
  if (raw.includes("sunset") || raw.includes("shaam") || raw.includes("sham")) return 18;
  if (raw.includes("noon") || raw.includes("dopahar")) return 12;
  if (raw.includes("midnight") || raw.includes("madhyaratri") || raw.includes("aadhi raat"))
    return 0;
  if (raw.includes("raat") || raw.includes("night")) return 21;

  const ampm = raw.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10) % 12;
    const m = parseInt(ampm[2], 10);
    if (ampm[3].toLowerCase() === "pm") h += 12;
    return h + m / 60;
  }

  const h24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1], 10);
    const m = parseInt(h24[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) return h + m / 60;
  }

  return 6; // TODO(founder): improve NLP parsing of free-text birth times
}

function signOf(siderealLongitude: number): { sign: Sign; degree: number; signIndex: number } {
  const lon = normalizeDegrees(siderealLongitude);
  const signIndex = Math.floor(lon / 30) % 12;
  const degree = lon - signIndex * 30;
  return { sign: SIGNS[signIndex], degree, signIndex };
}

/** Mean obliquity of the ecliptic (degrees), low-precision Meeus formula. */
function meanObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.4392911 - 0.0130042 * T;
}

/** Greenwich Mean Sidereal Time in degrees. */
function gmstDegrees(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalizeDegrees(gmst);
}

/** Tropical ecliptic longitude of the Ascendant (Lagna), degrees. */
function ascendantTropicalLongitude(jd: number, latitude: number, longitude: number): number {
  const lst = normalizeDegrees(gmstDegrees(jd) + longitude); // local sidereal time, degrees
  const eps = meanObliquity(jd);
  const ramc = lst;

  const y = Math.cos(ramc * DEG2RAD);
  const x = -(
    Math.sin(ramc * DEG2RAD) * Math.cos(eps * DEG2RAD) +
    Math.tan(latitude * DEG2RAD) * Math.sin(eps * DEG2RAD)
  );

  return normalizeDegrees(Math.atan2(y, x) * (180 / Math.PI));
}

export interface PlanetPlacement {
  longitude: number; // sidereal, degrees, 0-360
  sign: Sign;
  sign_hi: string;
  degree: number; // degree within sign, 0-30
  house: number; // 1-12, whole-sign from lagna
  retrograde: boolean;
}

export interface KundliInput {
  dob: string; // "YYYY-MM-DD"
  tob?: string;
  lat: number;
  lon: number;
}

export interface KundliChart {
  lagna: {
    sign: Sign;
    sign_hi: string;
    degree: number;
    lord: string;
    lord_house: number;
  };
  planets: Record<Planet, PlanetPlacement>;
  moon: {
    sign: Sign;
    nakshatra: string;
    pada: number;
  };
  mahadasha: {
    lord: Planet;
    start: string;
    end: string;
    antardasha: { lord: Planet; start: string; end: string };
  } | null;
  meta: {
    ayanamsha: number;
    jd: number;
  };
}

const NEVER_RETROGRADE: Planet[] = ["Sun", "Moon"];
const ALWAYS_RETROGRADE: Planet[] = ["Rahu", "Ketu"];

export function computeKundli(input: KundliInput): KundliChart {
  const [year, month, day] = input.dob.split("-").map((s) => parseInt(s, 10));
  const hourFloat = parseTimeOfBirth(input.tob);
  const jd = toJulianDay(year, month, day, hourFloat);
  const ayanamsha = lahiriAyanamsha(jd);

  const tropical = getPlanetLongitudes(jd);
  const tropicalNextDay = getPlanetLongitudes(jd + 1);

  const ascTropical = ascendantTropicalLongitude(jd, input.lat, input.lon);
  const ascSidereal = normalizeDegrees(ascTropical - ayanamsha);
  const lagnaPlacement = signOf(ascSidereal);
  const lagnaLord = SIGN_LORDS[lagnaPlacement.sign];

  const planets = {} as Record<Planet, PlanetPlacement>;

  for (const planet of PLANETS) {
    const sidereal = normalizeDegrees(tropical[planet] - ayanamsha);
    const { sign, degree, signIndex } = signOf(sidereal);
    const house = ((signIndex - lagnaPlacement.signIndex + 12) % 12) + 1;

    let retrograde = false;
    if (ALWAYS_RETROGRADE.includes(planet)) {
      retrograde = true;
    } else if (!NEVER_RETROGRADE.includes(planet)) {
      const nextSidereal = normalizeDegrees(tropicalNextDay[planet] - ayanamsha);
      let delta = nextSidereal - sidereal;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      retrograde = delta < 0;
    }

    planets[planet] = {
      longitude: sidereal,
      sign,
      sign_hi: SIGNS_HI[sign],
      degree,
      house,
      retrograde,
    };
  }

  const moonNakshatra = getNakshatra(planets.Moon.longitude);

  const dob = new Date(Date.UTC(year, month - 1, day, Math.floor(hourFloat), (hourFloat % 1) * 60));
  const timeline = buildDashaTimeline(dob, planets.Moon.longitude);
  const active = getActiveDasha(timeline);

  const lagnaHouseOfLord = planets[lagnaLord as Planet]?.house ?? 1;

  return {
    lagna: {
      sign: lagnaPlacement.sign,
      sign_hi: SIGNS_HI[lagnaPlacement.sign],
      degree: lagnaPlacement.degree,
      lord: lagnaLord,
      lord_house: lagnaHouseOfLord,
    },
    planets,
    moon: {
      sign: planets.Moon.sign,
      nakshatra: moonNakshatra.name,
      pada: moonNakshatra.pada,
    },
    mahadasha: active
      ? {
          lord: active.mahadasha.lord,
          start: active.mahadasha.start.toISOString(),
          end: active.mahadasha.end.toISOString(),
          antardasha: {
            lord: active.antardasha.lord,
            start: active.antardasha.start.toISOString(),
            end: active.antardasha.end.toISOString(),
          },
        }
      : null,
    meta: { ayanamsha, jd },
  };
}
