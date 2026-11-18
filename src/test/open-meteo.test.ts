import { describe, it, expect } from "vitest";
import {
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
});
