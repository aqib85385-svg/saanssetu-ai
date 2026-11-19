import { LocationData } from "@/types";
import { INDIAN_CITY_PRESETS } from "./city-presets";

/**
 * Geocoding query engine combining pre-cached Indian smog hotspot presets
 * with Open-Meteo's geocoding API.
 *
 * @param query Search query text (e.g., "Delhi", "Patna", "Mumbai")
 * @returns Array of matched location descriptors
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) {
    return INDIAN_CITY_PRESETS;
  }

  const cleanQuery = query.trim().toLowerCase();
  // Filter presets first
  const matchedPresets = INDIAN_CITY_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(cleanQuery) ||
      (p.admin1 && p.admin1.toLowerCase().includes(cleanQuery))
  );

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=6&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) return matchedPresets;

    const data = await res.json();
    const results: LocationData[] = (data.results || []).map((r: {
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }) => ({
      name: r.name,
      admin1: r.admin1,
      country: r.country || "India",
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || "Asia/Kolkata",
    }));

    return [...matchedPresets, ...results].slice(0, 8);
  } catch {
    return matchedPresets;
  }
}
