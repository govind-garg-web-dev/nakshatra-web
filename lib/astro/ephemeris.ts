// Low-precision planetary ephemeris in pure TypeScript.
//
// Uses the classic two-body Keplerian orbital element model popularized by
// Paul Schlyter ("How to compute planetary positions") with Meeus' Julian Day
// conversion. This ignores planetary perturbations (beyond a handful of the
// largest lunar perturbation terms) and light-time/aberration corrections.
// Accuracy is roughly arc-minutes for the Moon and within about a degree for
// the outer planets over multi-decade spans — acceptable for an MVP kundli.
//
// TODO(founder): swap for Swiss Ephemeris via WASM (or a full VSOP87/ELP2000
// implementation) if arc-minute precision across centuries is ever required.

import { normalizeDegrees } from "./constants";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const sinD = (deg: number) => Math.sin(deg * DEG2RAD);
const cosD = (deg: number) => Math.cos(deg * DEG2RAD);
const atan2D = (y: number, x: number) => Math.atan2(y, x) * RAD2DEG;

/** Julian Day for a Gregorian calendar date/time (UT). Meeus' algorithm. */
export function toJulianDay(
  year: number,
  month: number,
  day: number,
  hourFloat = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    hourFloat / 24 +
    B -
    1524.5
  );
}

interface OrbitalElements {
  N: (d: number) => number; // longitude of ascending node
  i: (d: number) => number; // inclination
  w: (d: number) => number; // argument of perihelion
  a: (d: number) => number; // semi-major axis (AU, or Earth radii for the Moon)
  e: (d: number) => number; // eccentricity
  M: (d: number) => number; // mean anomaly
}

const SUN: OrbitalElements = {
  N: () => 0,
  i: () => 0,
  w: (d) => 282.9404 + 4.70935e-5 * d,
  a: () => 1.0,
  e: (d) => 0.016709 - 1.151e-9 * d,
  M: (d) => normalizeDegrees(356.047 + 0.9856002585 * d),
};

const MOON: OrbitalElements = {
  N: (d) => normalizeDegrees(125.1228 - 0.0529538083 * d),
  i: () => 5.1454,
  w: (d) => normalizeDegrees(318.0634 + 0.1643573223 * d),
  a: () => 60.2666,
  e: () => 0.0549,
  M: (d) => normalizeDegrees(115.3654 + 13.064992953 * d),
};

const MERCURY: OrbitalElements = {
  N: (d) => normalizeDegrees(48.3313 + 3.24587e-5 * d),
  i: (d) => 7.0047 + 5.0e-8 * d,
  w: (d) => normalizeDegrees(29.1241 + 1.01444e-5 * d),
  a: () => 0.387098,
  e: (d) => 0.205635 + 5.59e-10 * d,
  M: (d) => normalizeDegrees(168.6562 + 4.0923344368 * d),
};

const VENUS: OrbitalElements = {
  N: (d) => normalizeDegrees(76.6799 + 2.4659e-5 * d),
  i: (d) => 3.3946 + 2.75e-8 * d,
  w: (d) => normalizeDegrees(54.891 + 1.38374e-5 * d),
  a: () => 0.72333,
  e: (d) => 0.006773 - 1.302e-9 * d,
  M: (d) => normalizeDegrees(48.0052 + 1.6021302244 * d),
};

const MARS: OrbitalElements = {
  N: (d) => normalizeDegrees(49.5574 + 2.11081e-5 * d),
  i: (d) => 1.8497 - 1.78e-8 * d,
  w: (d) => normalizeDegrees(286.5016 + 2.92961e-5 * d),
  a: () => 1.523688,
  e: (d) => 0.093405 + 2.516e-9 * d,
  M: (d) => normalizeDegrees(18.6021 + 0.5240207766 * d),
};

const JUPITER: OrbitalElements = {
  N: (d) => normalizeDegrees(100.4542 + 2.76854e-5 * d),
  i: (d) => 1.303 - 1.557e-7 * d,
  w: (d) => normalizeDegrees(273.8777 + 1.64505e-5 * d),
  a: () => 5.20256,
  e: (d) => 0.048498 + 4.469e-9 * d,
  M: (d) => normalizeDegrees(19.895 + 0.0830853001 * d),
};

const SATURN: OrbitalElements = {
  N: (d) => normalizeDegrees(113.6634 + 2.3898e-5 * d),
  i: (d) => 2.4886 - 1.081e-7 * d,
  w: (d) => normalizeDegrees(339.3939 + 2.97661e-5 * d),
  a: () => 9.55475,
  e: (d) => 0.055546 - 9.499e-9 * d,
  M: (d) => normalizeDegrees(316.967 + 0.0334442282 * d),
};

/** Solve Kepler's equation E - e*sin(E) = M (degrees) by iteration. */
function solveKepler(mDeg: number, e: number): number {
  const m = normalizeDegrees(mDeg);
  let E = m + (e * RAD2DEG) * sinD(m) * (1 + e * cosD(m));
  for (let iter = 0; iter < 6; iter++) {
    const dM = m - (E - e * RAD2DEG * sinD(E));
    const dE = dM / (1 - e * cosD(E));
    E += dE;
    if (Math.abs(dE) < 1e-6) break;
  }
  return E;
}

interface HeliocentricPos {
  lonecl: number; // ecliptic longitude, degrees
  latecl: number; // ecliptic latitude, degrees
  r: number; // distance (AU or Earth radii)
  xh: number;
  yh: number;
  zh: number;
}

function heliocentricPosition(elements: OrbitalElements, d: number): HeliocentricPos {
  const N = elements.N(d);
  const i = elements.i(d);
  const w = elements.w(d);
  const a = elements.a(d);
  const e = elements.e(d);
  const M = elements.M(d);

  const E = solveKepler(M, e);

  const xv = a * (cosD(E) - e);
  const yv = a * (Math.sqrt(1 - e * e) * sinD(E));

  const r = Math.sqrt(xv * xv + yv * yv);
  const v = atan2D(yv, xv);

  const vw = v + w;
  const xh = r * (cosD(N) * cosD(vw) - sinD(N) * sinD(vw) * cosD(i));
  const yh = r * (sinD(N) * cosD(vw) + cosD(N) * sinD(vw) * cosD(i));
  const zh = r * (sinD(vw) * sinD(i));

  const lonecl = normalizeDegrees(atan2D(yh, xh));
  const latecl = atan2D(zh, Math.sqrt(xh * xh + yh * yh));

  return { lonecl, latecl, r, xh, yh, zh };
}

/** Sun's geocentric ecliptic longitude (tropical, degrees) and distance (AU). */
function sunPosition(d: number): { lon: number; r: number } {
  const pos = heliocentricPosition(SUN, d);
  // For the Sun (Earth's orbit, N=i=0) the heliocentric longitude IS the
  // geocentric ecliptic longitude of the Sun.
  return { lon: pos.lonecl, r: pos.r };
}

/** Moon's geocentric ecliptic longitude with main perturbation terms applied. */
function moonPosition(d: number, sunM: number, sunW: number): number {
  const pos = heliocentricPosition(MOON, d);

  const Lm = normalizeDegrees(MOON.N(d) + MOON.w(d) + MOON.M(d)); // mean longitude of Moon
  const Ls = normalizeDegrees(sunW + sunM); // mean longitude of Sun
  const Mm = MOON.M(d);
  const Ms = sunM;
  const D = Lm - Ls; // mean elongation
  const F = Lm - MOON.N(d); // argument of latitude

  let perturbation = 0;
  perturbation += -1.274 * sinD(Mm - 2 * D);
  perturbation += 0.658 * sinD(2 * D);
  perturbation += -0.186 * sinD(Ms);
  perturbation += -0.059 * sinD(2 * Mm - 2 * D);
  perturbation += -0.057 * sinD(Mm - 2 * D + Ms);
  perturbation += 0.053 * sinD(Mm + 2 * D);
  perturbation += 0.046 * sinD(2 * D - Ms);
  perturbation += 0.041 * sinD(Mm - Ms);
  perturbation += -0.035 * sinD(D);
  perturbation += -0.031 * sinD(Mm + Ms);
  perturbation += -0.015 * sinD(2 * F - 2 * D);
  perturbation += 0.011 * sinD(Mm - 4 * D);

  return normalizeDegrees(pos.lonecl + perturbation);
}

/** Geocentric ecliptic longitude of an outer/inner planet (tropical, degrees). */
function planetGeocentricLongitude(
  elements: OrbitalElements,
  d: number,
  sunLon: number,
  sunR: number
): number {
  const helio = heliocentricPosition(elements, d);

  const xs = sunR * cosD(sunLon);
  const ys = sunR * sinD(sunLon);

  const xg = helio.xh + xs;
  const yg = helio.yh + ys;

  return normalizeDegrees(atan2D(yg, xg));
}

export interface TropicalLongitudes {
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
}

/** Tropical (non-ayanamsha-corrected) geocentric ecliptic longitudes, degrees. */
export function getPlanetLongitudes(jd: number): TropicalLongitudes {
  const d = jd - 2451543.5; // days since 1999-12-31 00:00 UT (Schlyter epoch)

  const sun = sunPosition(d);
  const moonLon = moonPosition(d, SUN.M(d), SUN.w(d));

  const mercury = planetGeocentricLongitude(MERCURY, d, sun.lon, sun.r);
  const venus = planetGeocentricLongitude(VENUS, d, sun.lon, sun.r);
  const mars = planetGeocentricLongitude(MARS, d, sun.lon, sun.r);
  const jupiter = planetGeocentricLongitude(JUPITER, d, sun.lon, sun.r);
  const saturn = planetGeocentricLongitude(SATURN, d, sun.lon, sun.r);

  const rahu = normalizeDegrees(MOON.N(d)); // mean lunar node
  const ketu = normalizeDegrees(rahu + 180);

  return {
    Sun: normalizeDegrees(sun.lon),
    Moon: moonLon,
    Mars: mars,
    Mercury: mercury,
    Jupiter: jupiter,
    Venus: venus,
    Saturn: saturn,
    Rahu: rahu,
    Ketu: ketu,
  };
}
