import { describe, it, expect } from "vitest";
import { calculateTotalScore, createDefaultScoring, SCORING_WEIGHTS, Scoring } from "./types";

function makeScoring(overrides: Partial<Record<keyof Scoring, number>> = {}): Scoring {
  const defaults = createDefaultScoring();
  const result = { ...defaults };
  for (const [key, score] of Object.entries(overrides) as [keyof Scoring, number][]) {
    result[key] = { ...defaults[key], score };
  }
  return result;
}

describe("calculateTotalScore", () => {
  it("returns a number for default scoring", () => {
    const result = calculateTotalScore(createDefaultScoring());
    expect(typeof result).toBe("number");
  });

  it("default scoring (all 3s) returns 3.0", () => {
    // All criteria score=3. Risk is inverted: 6-3=3. Weighted avg of 3s = 3.
    expect(calculateTotalScore(createDefaultScoring())).toBe(3.0);
  });

  it("risk score is inverted (higher risk = lower total)", () => {
    const lowRisk = makeScoring({ risk: 1 });
    const highRisk = makeScoring({ risk: 5 });
    expect(calculateTotalScore(lowRisk)).toBeGreaterThan(calculateTotalScore(highRisk));
  });

  it("marketAttractiveness has highest weight and dominates score", () => {
    // marketAttractiveness weight=3, all others=1 or 2. Max that one, minimize rest.
    const highMarket = makeScoring({ marketAttractiveness: 5, strategicFit: 1, feasibility: 1, commercialViability: 1, risk: 5 });
    const lowMarket = makeScoring({ marketAttractiveness: 1, strategicFit: 5, feasibility: 5, commercialViability: 5, risk: 1 });
    expect(calculateTotalScore(highMarket)).toBeGreaterThan(calculateTotalScore(lowMarket));
  });

  it("all scores at maximum (5) with minimum risk (1) gives highest score", () => {
    const best = makeScoring({ marketAttractiveness: 5, strategicFit: 5, feasibility: 5, commercialViability: 5, risk: 1 });
    const result = calculateTotalScore(best);
    // risk inverted: 6-1=5. All weights * 5 / totalWeight = 5.
    expect(result).toBe(5.0);
  });

  it("all scores at minimum (1) with maximum risk (5) gives lowest score", () => {
    const worst = makeScoring({ marketAttractiveness: 1, strategicFit: 1, feasibility: 1, commercialViability: 1, risk: 5 });
    const result = calculateTotalScore(worst);
    // risk inverted: 6-5=1. All weights * 1 / totalWeight = 1.
    expect(result).toBe(1.0);
  });

  it("result is rounded to one decimal place", () => {
    // Construct a scoring that produces a non-integer
    const s = makeScoring({ marketAttractiveness: 4, strategicFit: 3, feasibility: 2, commercialViability: 5, risk: 2 });
    const result = calculateTotalScore(s);
    // Check it's rounded to 1dp
    expect(result).toBe(Math.round(result * 10) / 10);
  });

  it("total weights sum to 9 (3+1+2+2+1)", () => {
    const totalWeight = Object.values(SCORING_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(totalWeight).toBe(9);
  });

  it("result is always between 1 and 5", () => {
    const scorings = [
      createDefaultScoring(),
      makeScoring({ marketAttractiveness: 5, risk: 1 }),
      makeScoring({ marketAttractiveness: 1, risk: 5 }),
      makeScoring({ marketAttractiveness: 3, strategicFit: 4, feasibility: 2, commercialViability: 5, risk: 3 }),
    ];
    for (const s of scorings) {
      const result = calculateTotalScore(s);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});
