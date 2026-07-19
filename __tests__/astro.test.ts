import { describe, expect, it } from "vitest";
import { computeKundli } from "../lib/astro/kundli";
import { gunaMilan } from "../lib/astro/gunaMilan";

describe("computeKundli", () => {
  // Regression baseline for a fixed birth (New Delhi). These values come
  // from this codebase's own low-precision ephemeris (see lib/astro/ephemeris.ts)
  // — the goal is to catch accidental regressions, not to assert absolute
  // astronomical truth against a third-party panchang.
  it("computes a stable chart for a known birth", () => {
    const chart = computeKundli({
      dob: "1990-01-15",
      tob: "10:30 AM",
      lat: 28.6139,
      lon: 77.209,
    });

    expect(chart.lagna.sign).toBe("Gemini");
    expect(chart.moon.sign).toBe("Leo");
    expect(chart.moon.nakshatra).toBe("Purva Phalguni");
    expect(chart.moon.pada).toBe(3);
    expect(chart.mahadasha?.lord).toBe("Rahu");
  });

  it("places every planet in a valid sign, house, and degree range", () => {
    const chart = computeKundli({
      dob: "2000-06-21",
      tob: "sunrise",
      lat: 12.9716,
      lon: 77.5946,
    });

    for (const placement of Object.values(chart.planets)) {
      expect(placement.degree).toBeGreaterThanOrEqual(0);
      expect(placement.degree).toBeLessThan(30);
      expect(placement.house).toBeGreaterThanOrEqual(1);
      expect(placement.house).toBeLessThanOrEqual(12);
    }
  });
});

describe("gunaMilan", () => {
  const personA = computeKundli({ dob: "1990-01-15", tob: "10:30 AM", lat: 28.6139, lon: 77.209 });
  const personB = computeKundli({ dob: "1992-05-20", tob: "14:15", lat: 19.076, lon: 72.8777 });

  it("is symmetric regardless of argument order", () => {
    const ab = gunaMilan(personA, personB);
    const ba = gunaMilan(personB, personA);
    expect(ab.total).toBe(ba.total);
    expect(ab.breakdown).toEqual(ba.breakdown);
  });

  it("returns a total within 0-36 with a full koota breakdown", () => {
    const result = gunaMilan(personA, personB);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(36);
    expect(result.breakdown).toHaveLength(8);
  });
});
