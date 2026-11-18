import { ActivityWindow, HourlyForecastItem } from "@/types";

/**
 * Atmospheric Boundary Layer & Diurnal Smog Inversion Engine.
 *
 * In northern Indian winters (Nov - Feb), diurnal air quality follows
 * solar radiation and boundary layer height:
 * - 04:00 - 09:00: Deep thermal inversion cap, lowest boundary layer, peak morning rush emissions -> Peak Hazard.
 * - 12:00 - 15:30: Peak solar insolence expands planetary boundary layer, inducing vertical mixing -> Diurnal Valley (Lowest AQI).
 * - 19:00 - 23:00: Evening traffic + biomass burning + cooling ground triggers temperature inversion -> Second Hazard Peak.
 */

export interface ActivityWindowAssessment {
  bestWindow: ActivityWindow;
  worstWindow: ActivityWindow;
  allWindows: ActivityWindow[];
  canDoOutdoorCardio: boolean;
  canKidsPlayOutdoors: boolean;
  summaryExplanation: string;
}

export function computeActivityWindows(
  hourlyData: HourlyForecastItem[]
): ActivityWindowAssessment {
  if (!hourlyData || hourlyData.length === 0) {
    const fallbackWindow: ActivityWindow = {
      startTime: "12:00 PM",
      endTime: "03:00 PM",
      windowType: "acceptable",
      title: "Midday Solar Ventilation Window",
      expectedAqiRange: [200, 280],
      scientificReason:
        "Historical winter inversion dynamics typically allow maximum vertical atmospheric mixing during midday solar heating.",
      recommendedActivities: ["Quick essential errands", "Gentle walking with N95 mask"],
      restrictedActivities: ["Vigorous outdoor cardio", "Long outdoor sports"],
      confidence: "Estimated",
    };
    return {
      bestWindow: fallbackWindow,
      worstWindow: {
        startTime: "05:00 AM",
        endTime: "09:00 AM",
        windowType: "hazardous",
        title: "Early Morning Inversion Trap",
        expectedAqiRange: [350, 480],
        scientificReason:
          "Surface cooling forms a ground-level thermal inversion cap that traps diesel exhaust and particulate matter close to breathing height.",
        recommendedActivities: ["Stay indoors", "Run bedroom HEPA purifier"],
        restrictedActivities: ["Morning runs/jogs", "Outdoor yoga", "Early outdoor sports"],
        confidence: "Estimated",
      },
      allWindows: [fallbackWindow],
      canDoOutdoorCardio: false,
      canKidsPlayOutdoors: false,
      summaryExplanation:
        "Winter smog pattern: Avoid outdoor exercise before 10 AM and after 7 PM.",
    };
  }

  // Find min and max AQI periods across the 24 hours
  // Sort or slice next 24 hours
  const dayHours = hourlyData.slice(0, 24);

  // Group into time segments:
  // Early Morning (5am - 9am)
  // Late Morning / Midday (11am - 4pm)
  // Evening Rush (5pm - 9pm)
  // Night (10pm - 4am)

  let minAqiItem = dayHours[0];
  let maxAqiItem = dayHours[0];

  for (const item of dayHours) {
    if (item.aqi < minAqiItem.aqi) minAqiItem = item;
    if (item.aqi > maxAqiItem.aqi) maxAqiItem = item;
  }

  const isSevere = minAqiItem.aqi > 300;
  const isPoor = minAqiItem.aqi > 200;

  const bestWindow: ActivityWindow = {
    startTime: minAqiItem.hourFormatted || "12:00 PM",
    endTime: "03:30 PM",
    windowType: minAqiItem.aqi <= 100 ? "optimal" : minAqiItem.aqi <= 200 ? "acceptable" : "dangerous",
    title:
      minAqiItem.aqi <= 100
        ? "Clear Breathing Window"
        : minAqiItem.aqi <= 200
        ? "Relative Diurnal Valley Window"
        : "Constrained Outdoor Window (High Risk)",
    expectedAqiRange: [minAqiItem.aqi, Math.round(minAqiItem.aqi * 1.15)],
    scientificReason:
      "Peak diurnal solar heating breaks ground-level thermal inversion, causing vertical convective mixing that disperses surface pollutants.",
    recommendedActivities:
      minAqiItem.aqi <= 100
        ? ["Outdoor walking", "Light jogging", "Errands"]
        : minAqiItem.aqi <= 200
        ? ["Essential errands with mask", "Low-intensity walking"]
        : ["Only urgent outdoor transit with sealed N95 mask"],
    restrictedActivities:
      minAqiItem.aqi > 200
        ? ["Strenuous outdoor running", "Outdoor aerobic sports", "Leaving infants/seniors outside"]
        : ["Unrestricted heavy sprinting in high-traffic zones"],
    confidence: "High",
  };

  const worstWindow: ActivityWindow = {
    startTime: maxAqiItem.hourFormatted || "06:00 AM",
    endTime: "09:30 AM",
    windowType: "hazardous",
    title: "Ground Inversion Peak Hazard",
    expectedAqiRange: [Math.round(maxAqiItem.aqi * 0.9), maxAqiItem.aqi],
    scientificReason:
      "Radiational cooling of the ground forms a stable inversion layer under 150m, trapping concentrated particulate plumes close to the surface with zero dispersion.",
    recommendedActivities: ["Strict indoor confinement", "Run indoor HEPA purifiers", "Keep doors and windows sealed"],
    restrictedActivities: [
      "Morning jogging/cycling (inhalation rate increases 4-8x)",
      "School sports outdoors",
      "Morning balcony sitting",
    ],
    confidence: "High",
  };

  return {
    bestWindow,
    worstWindow,
    allWindows: [bestWindow, worstWindow],
    canDoOutdoorCardio: !isPoor,
    canKidsPlayOutdoors: minAqiItem.aqi <= 150,
    summaryExplanation: isSevere
      ? "CRITICAL SMOG ALERT: Thermal inversion is severe. Outdoor exercise is unsafe at any time today. Shift all workouts indoors."
      : isPoor
      ? "POOR AIR ADVISORY: Significant diurnal variation. Avoid morning exertion before 10:30 AM. Schedule essential outdoor transit between 12:30 PM and 3:30 PM."
      : "AIR QUALITY ACCEPTABLE: Midday remains the cleanest time for outdoor physical activity.",
  };
}
