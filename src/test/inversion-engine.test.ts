import { describe, it, expect } from "vitest";
import { computeActivityWindows } from "@/lib/aqi/inversion-engine";
import { HourlyForecastItem } from "@/types";

describe("Diurnal Inversion and Activity Window Assessment", () => {
  it("computes realistic windows when hourly data is empty", () => {
    const res = computeActivityWindows([]);
    expect(res.bestWindow).toBeDefined();
    expect(res.worstWindow).toBeDefined();
    expect(res.canDoOutdoorCardio).toBe(false);
    expect(res.summaryExplanation).toContain("Winter smog pattern");
  });

  it("identifies midday valley as best window during severe smog episode", () => {
    const mockHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
      // 0 to 8 AM: Peak inversion (360)
      // 12 to 3 PM: Solar mixing (210)
      const isMidday = i >= 12 && i <= 15;
      const aqi = isMidday ? 210 : 360;
      return {
        time: `2026-11-19T${i.toString().padStart(2, "0")}:00:00Z`,
        hourFormatted: `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`,
        pm25: Math.round(aqi * 0.75),
        pm10: Math.round(aqi * 1.1),
        aqi,
        category: aqi > 300 ? "Severe" : "Poor",
        isObservation: i === 0,
      };
    });

    const res = computeActivityWindows(mockHourly);
    expect(res.bestWindow.expectedAqiRange[0]).toBe(210);
    expect(res.worstWindow.expectedAqiRange[1]).toBe(360);
    expect(res.canDoOutdoorCardio).toBe(false);
    expect(res.summaryExplanation).toContain("POOR AIR ADVISORY");
  });

  it("allows outdoor cardio when AQI is satisfactory", () => {
    const mockCleanHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => ({
      time: `2026-11-19T${i.toString().padStart(2, "0")}:00:00Z`,
      hourFormatted: `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`,
      pm25: 25,
      pm10: 45,
      aqi: 45,
      category: "Good",
      isObservation: i === 0,
    }));

    const res = computeActivityWindows(mockCleanHourly);
    expect(res.bestWindow.windowType).toBe("optimal");
    expect(res.canDoOutdoorCardio).toBe(true);
    expect(res.canKidsPlayOutdoors).toBe(true);
    expect(res.summaryExplanation).toContain("AIR QUALITY ACCEPTABLE");
  });

  it("triggers Critical Smog Alert when minimum diurnal AQI exceeds 300", () => {
    const mockSevereHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
      const isMidday = i >= 12 && i <= 15;
      const aqi = isMidday ? 320 : 450;
      return {
        time: `2026-11-19T${i.toString().padStart(2, "0")}:00:00Z`,
        hourFormatted: `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`,
        pm25: Math.round(aqi * 0.75),
        pm10: Math.round(aqi * 1.1),
        aqi,
        category: "Severe",
        isObservation: i === 0,
      };
    });

    const res = computeActivityWindows(mockSevereHourly);
    expect(res.summaryExplanation).toContain("CRITICAL SMOG ALERT");
    expect(res.bestWindow.windowType).toBe("dangerous");
  });

  it("identifies acceptable relative valley window when midday AQI is moderate (101-200)", () => {
    const mockModerateHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
      const isMidday = i >= 12 && i <= 15;
      const aqi = isMidday ? 160 : 250;
      return {
        time: `2026-11-19T${i.toString().padStart(2, "0")}:00:00Z`,
        hourFormatted: `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`,
        pm25: 80,
        pm10: 120,
        aqi,
        category: isMidday ? "Moderately Polluted" : "Poor",
        isObservation: i === 0,
      };
    });

    const res = computeActivityWindows(mockModerateHourly);
    expect(res.bestWindow.windowType).toBe("acceptable");
    expect(res.bestWindow.title).toContain("Relative Diurnal Valley Window");
    expect(res.canKidsPlayOutdoors).toBe(false); // min AQI 160 > 150
  });
});
