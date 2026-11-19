import {
  HourlyForecastItem,
  DailyForecastItem,
} from "@/types";
import { calculateSubIndex, getCategoryFromAqi } from "../aqi/cpcb-calculator";
import { getRealisticFallbackData } from "./fallback-data";
import { AirQualityApiResponse } from "./types";

export * from "./types";
export * from "./city-presets";
export * from "./fallback-data";
export * from "./geocoding";

/**
 * In-memory cache for API calls to avoid duplicate hits and satisfy rate limit rules.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches Copernicus CAMS global atmospheric model data via Open-Meteo API.
 * Includes automatic caching and fallback to realistic diurnal curves if offline.
 *
 * @param lat Latitude in decimal degrees
 * @param lon Longitude in decimal degrees
 * @param locationName Location display name
 * @returns Unified AirQualityApiResponse
 */
export async function fetchAirQualityData(
  lat: number,
  lon: number,
  locationName: string = "Selected Location"
): Promise<AirQualityApiResponse> {
  const cacheKey = `aq_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey) as CacheEntry<AirQualityApiResponse> | undefined;

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&timezone=Asia%2FKolkata&domains=cams_global`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const json = await res.json();
    const parsed = parseOpenMeteoResponse(json, lat, lon, locationName);
    cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch {
    // Return structured, realistic winter smog fallback if API network fails or rate limited
    return getRealisticFallbackData(lat, lon, locationName);
  }
}

function parseOpenMeteoResponse(
  json: {
    hourly?: {
      time: string[];
      pm2_5?: (number | null)[];
      pm10?: (number | null)[];
      nitrogen_dioxide?: (number | null)[];
      sulphur_dioxide?: (number | null)[];
      carbon_monoxide?: (number | null)[];
      ozone?: (number | null)[];
    };
  },
  lat: number,
  lon: number,
  locationName: string
): AirQualityApiResponse {
  const times = json.hourly?.time || [];
  const pm25Arr = json.hourly?.pm2_5 || [];
  const pm10Arr = json.hourly?.pm10 || [];
  const no2Arr = json.hourly?.nitrogen_dioxide || [];
  const so2Arr = json.hourly?.sulphur_dioxide || [];
  const coArr = json.hourly?.carbon_monoxide || [];
  const o3Arr = json.hourly?.ozone || [];

  const now = new Date();
  const currentIsoHour = now.toISOString().slice(0, 13); // match YYYY-MM-DDTHH

  let currentIndex = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i].startsWith(currentIsoHour)) {
      currentIndex = i;
      break;
    }
  }

  const curPm25 = pm25Arr[currentIndex] ?? 185;
  const curPm10 = pm10Arr[currentIndex] ?? 290;
  const curNo2 = no2Arr[currentIndex] ?? 65;
  const curSo2 = so2Arr[currentIndex] ?? 18;
  const curCoRaw = coArr[currentIndex] ?? 1200; // ug/m3 -> convert to mg/m3
  const curCo = Number((curCoRaw / 1000).toFixed(2));
  const curO3 = o3Arr[currentIndex] ?? 42;

  const hourly: HourlyForecastItem[] = [];
  // Next 24 hours
  for (let i = currentIndex; i < Math.min(currentIndex + 24, times.length); i++) {
    const timeStr = times[i];
    const hourDate = new Date(timeStr);
    const hourFormatted = hourDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    const p25 = Math.max(pm25Arr[i] ?? 150, 5);
    const p10 = Math.max(pm10Arr[i] ?? 220, 10);
    const subIdx = calculateSubIndex("pm25", p25).subIndex;
    const cat = getCategoryFromAqi(subIdx);

    hourly.push({
      time: timeStr,
      hourFormatted,
      pm25: Math.round(p25),
      pm10: Math.round(p10),
      aqi: subIdx,
      category: cat,
      isObservation: i <= currentIndex,
    });
  }

  // Aggregate into 7 days daily forecast
  const daily: DailyForecastItem[] = [];
  const daysMap = new Map<string, number[]>();

  for (let i = 0; i < times.length; i++) {
    const dayStr = times[i].slice(0, 10);
    const val = pm25Arr[i] ?? 150;
    if (!daysMap.has(dayStr)) {
      daysMap.set(dayStr, []);
    }
    daysMap.get(dayStr)!.push(val);
  }

  const dayKeys = Array.from(daysMap.keys()).slice(0, 7);
  for (const dayKey of dayKeys) {
    const values = daysMap.get(dayKey)!;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    const aqi = calculateSubIndex("pm25", avgVal).subIndex;
    const category = getCategoryFromAqi(aqi);

    const dateObj = new Date(dayKey);
    const dayOfWeek = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    });

    daily.push({
      date: dayKey,
      dayOfWeek,
      pm25Min: Math.round(minVal),
      pm25Max: Math.round(maxVal),
      pm25Avg: avgVal,
      aqi,
      category,
      summary:
        category === "Severe" || category === "Severe+ / Hazardous"
          ? "Heavy nocturnal inversion and calm surface winds will keep smog trapped."
          : category === "Very Poor"
          ? "Persistent winter haze with brief midday ventilation."
          : "Moderate dispersion under daytime solar heating.",
    });
  }

  return {
    location: {
      name: locationName,
      country: "India",
      latitude: lat,
      longitude: lon,
      timezone: "Asia/Kolkata",
    },
    current: {
      time: times[currentIndex] || now.toISOString(),
      pm25: Math.round(curPm25),
      pm10: Math.round(curPm10),
      no2: Math.round(curNo2),
      so2: Math.round(curSo2),
      co: curCo,
      o3: Math.round(curO3),
      source: "Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo",
      lastUpdated: new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      }),
      isObservation: false, // Model analysis / assimilation
    },
    hourly,
    daily,
  };
}
