import {
  HourlyForecastItem,
  DailyForecastItem,
  LocationData,
} from "@/types";

/**
 * Standard API response structure encapsulating location metadata,
 * current atmospheric observations, and hourly/daily forecast series.
 */
export interface AirQualityApiResponse {
  location: LocationData;
  current: {
    time: string;
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number; // in mg/m³
    o3: number;
    source: string;
    lastUpdated: string;
    isObservation: boolean;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}
