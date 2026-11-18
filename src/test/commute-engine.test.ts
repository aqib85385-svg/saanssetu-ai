import { describe, it, expect } from "vitest";
import { analyzeCommuteImpact } from "@/lib/engine/commute-engine";

describe("Commute and Carbon Impact Engine", () => {
  it("computes daily, weekly, and yearly distance and CO2 metrics", () => {
    const res = analyzeCommuteImpact({
      distanceKmOneWay: 15,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: "petrol_car",
    });

    // Daily = 15 * 2 = 30 km
    expect(res.dailyDistanceKm).toBe(30);
    // Weekly = 30 * 5 = 150 km
    expect(res.weeklyDistanceKm).toBe(150);
    // Yearly = 150 * 48 = 7200 km
    expect(res.yearlyDistanceKm).toBe(7200);

    // Petrol car: 142 g/km -> 30 km * 142g = 4.26 kg daily
    expect(res.baselineCo2DailyKg).toBe(4.26);
    expect(res.baselineCo2WeeklyKg).toBe(21.3);
    expect(res.baselineCo2YearlyKg).toBe(1022.4);
    expect(res.baselineMode).toContain("Petrol Car");
  });

  it("calculates emissions avoided for metro transit", () => {
    const res = analyzeCommuteImpact({
      distanceKmOneWay: 20,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: "petrol_car",
    });

    const metroMode = res.modes.find((m) => m.mode === "metro");
    expect(metroMode).toBeDefined();
    // Metro is 9.2 g/km vs Petrol car 142 g/km
    expect(metroMode!.co2AvoidedVsPrivateCarKg).toBeGreaterThan(0);
    expect(metroMode!.pm25InhalationLevel).toBe("Very Low (HEPA Cabin)");
  });

  it("highlights health risk tradeoff of active cycling during winter smog", () => {
    const res = analyzeCommuteImpact({
      distanceKmOneWay: 10,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: "petrol_car",
    });

    const cyclingMode = res.modes.find((m) => m.mode === "bicycle");
    expect(cyclingMode).toBeDefined();
    expect(cyclingMode!.totalCo2Kg).toBe(0); // Zero carbon
    // But respiratory inhalation risk is highlighted
    expect(cyclingMode!.pm25InhalationLevel).toBe("Extreme (Exhaust Plume)");
    expect(cyclingMode!.healthRiskTradeoff).toContain("CAUTION");
  });

  it("handles fallback defaults when optional parameters are omitted", () => {
    // Tests tripsPerDay default (2), workingDaysPerWeek default (5), distance clamped to min 1
    const res = analyzeCommuteImpact({
      distanceKmOneWay: 0,
      tripsPerDay: 0,
      workingDaysPerWeek: 0,
      baselineMode: "diesel_car",
    });

    expect(res.oneWayDistanceKm).toBe(1);
    expect(res.dailyDistanceKm).toBe(2);
    expect(res.weeklyDistanceKm).toBe(10);
    expect(res.baselineMode).toContain("Diesel");
    expect(res.baselineCo2DailyKg).toBeGreaterThan(0);
  });

  it("evaluates motorcycle two-wheeler baseline correctly", () => {
    const res = analyzeCommuteImpact({
      distanceKmOneWay: 12,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: "motorcycle_2w",
    });

    expect(res.baselineMode).toContain("Motorcycle");
    const twoWheelerMode = res.modes.find((m) => m.mode === "motorcycle_2w");
    expect(twoWheelerMode?.co2AvoidedVsPrivateCarKg).toBe(0);
    expect(twoWheelerMode?.pm25InhalationLevel).toContain("Extreme");
  });

  it("handles undefined or unknown baseline mode gracefully with fallback", () => {
    // Tests input.baselineMode as undefined and as unknown key
    const resUndefined = analyzeCommuteImpact({
      distanceKmOneWay: 10,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: undefined as unknown as "petrol_car",
    });
    expect(resUndefined.baselineMode).toBe("Private Petrol Car (Solo Driver)");

    const resUnknown = analyzeCommuteImpact({
      distanceKmOneWay: 10,
      tripsPerDay: 2,
      workingDaysPerWeek: 5,
      baselineMode: "unsupported_car" as unknown as "petrol_car",
    });
    expect(resUnknown.baselineMode).toBe("Private Petrol Car");
    expect(resUnknown.baselineCo2DailyKg).toBe(2.84); // 20 km * 142g / 1000
  });
});
