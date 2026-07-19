import { NAKSHATRAS, normalizeDegrees, type Planet } from "./constants";

const NAKSHATRA_SPAN = 360 / 27; // 13.3333...deg
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333...deg

export interface NakshatraInfo {
  index: number; // 0-26
  name: string;
  lord: Planet;
  pada: number; // 1-4
  degreeInNakshatra: number; // 0-13.33
}

/** Nakshatra + pada for a sidereal ecliptic longitude (0-360 deg). */
export function getNakshatra(siderealLongitude: number): NakshatraInfo {
  const lon = normalizeDegrees(siderealLongitude);
  const index = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const degreeInNakshatra = lon - index * NAKSHATRA_SPAN;
  const pada = Math.floor(degreeInNakshatra / PADA_SPAN) + 1;
  const { name, lord } = NAKSHATRAS[index];
  return { index, name, lord, pada, degreeInNakshatra };
}

/** Elapsed fraction (0-1) of the Moon's current nakshatra, used to seed Dasha. */
export function nakshatraElapsedFraction(siderealLongitude: number): number {
  const { degreeInNakshatra } = getNakshatra(siderealLongitude);
  return degreeInNakshatra / NAKSHATRA_SPAN;
}
