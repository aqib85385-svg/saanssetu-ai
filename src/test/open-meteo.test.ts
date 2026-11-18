import { describe, it, expect, vi } from "vitest";
import {
  fetchAirQualityData,
  getRealisticFallbackData,
  searchLocations,
  INDIAN_CITY_PRESETS,
} from "@/lib/api/open-meteo";

describe("Open-Meteo Integration & Fallback Engine", () => {
  it("generates realistic winter smog profile with diurnal curve in offline fallback", () => {
    const data = getRealisticFallbackData(28.61, 77.2, "New Delhi");
    expect(data.location.name).toBe("New Delhi");
    expect(data.current.pm25).toBeGreaterThan(100);
    expect(data.current.pm10).toBeGreaterThan(150);
    expect(data.hourly.length).toBe(24);
    expect(data.daily.length).toBe(7);
    expect(data.current.isObservation).toBe(false);
  });

  it("filters Indian metro presets when query is short or empty", async () => {
    const defaultList = await searchLocations("");
    expect(defaultList).toEqual(INDIAN_CITY_PRESETS);

    const filtered = await searchLocations("delhi");
    expect(filtered.some((p) => p.name.includes("Delhi"))).toBe(true);
  });

  it("handles live network fallback and offline data generation gracefully", async () => {
    const data = getRealisticFallbackData(28.45, 77.02, "Gurugram (Cyber City)");
    expect(data.current.source).toContain("Fallback");
    expect(data.hourly[13].hourFormatted).toBeDefined();
    expect(data.daily[0].dayOfWeek).toBeDefined();
  });

  it("parses valid CAMS Open-Meteo API response correctly", async () => {
    const now = new Date();
    const mockTimes: string[] = [];
    const mockPm25: number[] = [];
    const mockPm10: number[] = [];
    const mockNo2: number[] = [];
    const mockSo2: number[] = [];
    const mockCo: number[] = [];
    const mockO3: number[] = [];

    // 48 hours of mock data
    for (let i = 0; i < 48; i++) {
      const d = new Date(now.getTime() + i * 3600 * 1000);
      mockTimes.push(d.toISOString());
      mockPm25.push(220);
      mockPm10.push(340);
      mockNo2.push(65);
      mockSo2.push(20);
      mockCo.push(1800); // 1.8 mg/m3
      mockO3.push(45);
    }

    const mockResponse = {
      hourly: {
        time: mockTimes,
        pm2_5: mockPm25,
        pm10: mockPm10,
        nitrogen_dioxide: mockNo2,
        sulphur_dioxide: mockSo2,
        carbon_monoxide: mockCo,
        ozone: mockO3,
      },
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response);

    // Use unique coordinates to bypass cache
    const result = await fetchAirQualityData(26.85, 80.95, "Lucknow (Hazratganj)");
    expect(result.location.name).toBe("Lucknow (Hazratganj)");
    expect(result.current.pm25).toBe(220);
    expect(result.current.co).toBe(1.8);
    expect(result.hourly.length).toBeGreaterThan(0);
    expect(result.daily.length).toBeGreaterThan(0);
    expect(result.current.source).toContain("via Open-Meteo");
    expect(result.current.source).toContain("CAMS");

    fetchSpy.mockRestore();
  });
});
