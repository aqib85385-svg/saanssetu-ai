import { describe, it, expect } from "vitest";
import {
  calculateSubIndex,
  calculateCpcbAqi,
  getCategoryFromAqi,
} from "@/lib/aqi/cpcb-calculator";

describe("CPCB AQI Sub-Index Calculator", () => {
  it("calculates exact sub-index for PM2.5 boundary breakpoints", () => {
    // PM2.5: 0-30 -> 0-50 (Good)
    expect(calculateSubIndex("pm25", 0).subIndex).toBe(0);
    expect(calculateSubIndex("pm25", 15).subIndex).toBe(25);
    expect(calculateSubIndex("pm25", 30).subIndex).toBe(50);
    expect(calculateSubIndex("pm25", 30).category).toBe("Good");

    // PM2.5: 31-60 -> 51-100 (Satisfactory)
    // 51 + ((100-51)/(60-31)) * (45.5-31) = 51 + 24.5 = 75.5 -> rounds to 76
    expect(calculateSubIndex("pm25", 45.5).subIndex).toBe(76);
    expect(calculateSubIndex("pm25", 60).subIndex).toBe(100);
    expect(calculateSubIndex("pm25", 60).category).toBe("Satisfactory");

    // PM2.5: 61-90 -> 101-200 (Moderately Polluted)
    // 101 + ((200-101)/(90-61)) * (75.5-61) = 101 + 49.5 = 150.5 -> 151
    expect(calculateSubIndex("pm25", 75.5).subIndex).toBe(151);
    expect(calculateSubIndex("pm25", 90).subIndex).toBe(200);
    expect(calculateSubIndex("pm25", 90).category).toBe("Moderately Polluted");

    // PM2.5: 91-120 -> 201-300 (Poor)
    // 201 + ((300-201)/(120-91)) * (105.5-91) = 201 + 49.5 = 250.5 -> 251
    expect(calculateSubIndex("pm25", 105.5).subIndex).toBe(251);
    expect(calculateSubIndex("pm25", 120).subIndex).toBe(300);
    expect(calculateSubIndex("pm25", 120).category).toBe("Poor");

    // PM2.5: 121-250 -> 301-400 (Very Poor)
    expect(calculateSubIndex("pm25", 250).subIndex).toBe(400);
    expect(calculateSubIndex("pm25", 250).category).toBe("Very Poor");

    // PM2.5: 251-350 -> 401-500 (Severe)
    expect(calculateSubIndex("pm25", 350).subIndex).toBe(500);
    expect(calculateSubIndex("pm25", 350).category).toBe("Severe");
  });

  it("handles extreme winter smog extrapolation above 350 ug/m3", () => {
    const result = calculateSubIndex("pm25", 450);
    expect(result.subIndex).toBeGreaterThan(500);
    expect(result.category).toBe("Severe+ / Hazardous");
    expect(result.isExtrapolated).toBe(true);
  });

  it("caps extrapolation mathematically at 999 to avoid runaway values", () => {
    const result = calculateSubIndex("pm25", 2500);
    expect(result.subIndex).toBe(999);
    expect(result.isExtrapolated).toBe(true);
  });

  it("handles negative and NaN concentrations safely", () => {
    expect(calculateSubIndex("pm25", -20).subIndex).toBe(0);
    expect(calculateSubIndex("pm25", NaN).subIndex).toBe(0);
    expect(calculateSubIndex("pm25", Infinity).subIndex).toBe(999);
  });

  it("calculates PM10, NO2, SO2, CO, and O3 sub-indices correctly", () => {
    expect(calculateSubIndex("pm10", 50).subIndex).toBe(50);
    expect(calculateSubIndex("pm10", 100).subIndex).toBe(100);
    expect(calculateSubIndex("pm10", 250).subIndex).toBe(200);

    expect(calculateSubIndex("no2", 40).subIndex).toBe(50);
    expect(calculateSubIndex("so2", 40).subIndex).toBe(50);
    expect(calculateSubIndex("co", 1.0).subIndex).toBe(50);
    expect(calculateSubIndex("o3", 50).subIndex).toBe(50);
  });
});

describe("Overall CPCB NAQI Calculation & Primary Pollutant Determination", () => {
  it("determines overall AQI as the MAXIMUM sub-index and identifies Primary Pollutant", () => {
    const inputs = {
      pm25: 145, // Sub-index in Very Poor (~319)
      pm10: 120, // Sub-index Moderate (~113)
      no2: 45,   // Satisfactory
      so2: 12,   // Good
      co: 1.2,   // Satisfactory
      o3: 35,    // Good
    };

    const res = calculateCpcbAqi(inputs);
    expect(res.category).toBe("Very Poor");
    expect(res.aqi).toBeGreaterThanOrEqual(301);
    expect(res.aqi).toBeLessThanOrEqual(400);
    expect(res.primaryPollutant).toContain("2.5");
    expect(res.pollutantCode).toBe("pm25");
  });

  it("identifies PM10 as primary pollutant when dust storm occurs", () => {
    const inputs = {
      pm25: 25,  // Good (~42)
      pm10: 380, // Very Poor (~338)
    };

    const res = calculateCpcbAqi(inputs);
    expect(res.category).toBe("Very Poor");
    expect(res.primaryPollutant).toContain("10");
    expect(res.pollutantCode).toBe("pm10");
    expect(res.missingPollutants).toContain("no2");
  });

  it("transparently reports missing pollutants without crashing", () => {
    const res = calculateCpcbAqi({ pm25: 85 });
    expect(res.category).toBe("Moderately Polluted");
    expect(res.missingPollutants).toContain("pm10");
    expect(res.missingPollutants).toContain("no2");
    expect(res.missingPollutants).toContain("so2");
    expect(res.missingPollutants).toContain("co");
    expect(res.missingPollutants).toContain("o3");
  });

  it("handles completely empty inputs gracefully", () => {
    const res = calculateCpcbAqi({});
    expect(res.aqi).toBe(0);
    expect(res.category).toBe("Good");
    expect(res.pollutants).toHaveLength(0);
    expect(res.missingPollutants).toHaveLength(6);
  });
});

describe("CPCB Category mapping", () => {
  it("maps numeric ranges to official CPCB categories", () => {
    expect(getCategoryFromAqi(25)).toBe("Good");
    expect(getCategoryFromAqi(50)).toBe("Good");
    expect(getCategoryFromAqi(75)).toBe("Satisfactory");
    expect(getCategoryFromAqi(100)).toBe("Satisfactory");
    expect(getCategoryFromAqi(150)).toBe("Moderately Polluted");
    expect(getCategoryFromAqi(200)).toBe("Moderately Polluted");
    expect(getCategoryFromAqi(250)).toBe("Poor");
    expect(getCategoryFromAqi(300)).toBe("Poor");
    expect(getCategoryFromAqi(350)).toBe("Very Poor");
    expect(getCategoryFromAqi(400)).toBe("Very Poor");
    expect(getCategoryFromAqi(450)).toBe("Severe");
    expect(getCategoryFromAqi(500)).toBe("Severe");
    expect(getCategoryFromAqi(550)).toBe("Severe+ / Hazardous");
  });
});
