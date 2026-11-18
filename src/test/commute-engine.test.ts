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
});
