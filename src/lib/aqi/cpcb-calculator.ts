import {
  CpcbAqiResult,
  CpcbCategory,
  PollutantReading,
} from "@/types";
import {
  CPCB_BREAKPOINTS,
  CPCB_CATEGORY_DETAILS,
  CPCB_NAAQS_24H_LIMITS,
} from "./cpcb-standards";

export interface RawPollutantInputs {
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null; // in mg/m³
  o3?: number | null;
}

/**
 * Calculates the CPCB Sub-Index for a single pollutant based on official NAQI breakpoints.
 * Linear interpolation formula:
 * Ip = [ (I_high - I_low) / (B_high - B_low) ] * (C - B_low) + I_low
 */
export function calculateSubIndex(
  pollutant: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3",
  concentration: number
): { subIndex: number; category: CpcbCategory; isExtrapolated: boolean } {
  if (concentration < 0 || isNaN(concentration)) {
    return { subIndex: 0, category: "Good", isExtrapolated: false };
  }

  // Official CPCB scale tops out at 500 AQI:
  // PM2.5 > 350, PM10 > 500 are beyond official CPCB 500 AQI ceiling.
  const officialCeilings: Record<string, number> = {
    pm25: 350,
    pm10: 500,
    no2: 400,
    so2: 1600,
    co: 34.0,
    o3: 748,
  };

  const officialMax = officialCeilings[pollutant] || 500;
  const isBeyondOfficialTable = concentration > officialMax;

  if (!isFinite(concentration)) {
    return { subIndex: 999, category: "Severe+ / Hazardous", isExtrapolated: true };
  }

  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints || breakpoints.length === 0) {
    return { subIndex: 0, category: "Good", isExtrapolated: false };
  }

  // Check if within any standard breakpoint range
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const subIndex =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) +
        bp.iLow;
      return {
        subIndex: Math.round(subIndex),
        category: bp.category,
        isExtrapolated: isBeyondOfficialTable,
      };
    }
  }

  // If concentration exceeds highest defined breakpoint:
  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.cHigh) {
    const slope = (lastBp.iHigh - lastBp.iLow) / (lastBp.cHigh - lastBp.cLow);
    const extrapolated = lastBp.iHigh + (concentration - lastBp.cHigh) * slope;
    const bounded = Math.min(Math.round(extrapolated), 999);
    return {
      subIndex: bounded,
      category: "Severe+ / Hazardous",
      isExtrapolated: true,
    };
  }

  return { subIndex: 0, category: "Good", isExtrapolated: false };
}

/**
 * Maps an overall AQI number to its official CPCB category
 */
export function getCategoryFromAqi(aqi: number): CpcbCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderately Polluted";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  if (aqi <= 500) return "Severe";
  return "Severe+ / Hazardous";
}

/**
 * Calculates the official Indian CPCB National Air Quality Index (NAQI).
 * According to CPCB guidelines:
 * 1. Calculate sub-index for each monitored pollutant.
 * 2. Overall AQI is the MAXIMUM of all sub-indices.
 * 3. The pollutant responsible for maximum sub-index is the "Primary Pollutant".
 * 4. Transparently records missing or unavailable pollutants.
 */
export function calculateCpcbAqi(inputs: RawPollutantInputs): CpcbAqiResult {
  const pollutantCodes: ("pm25" | "pm10" | "no2" | "so2" | "co" | "o3")[] = [
    "pm25",
    "pm10",
    "no2",
    "so2",
    "co",
    "o3",
  ];

  const subIndices: Record<string, number> = {};
  const pollutants: PollutantReading[] = [];
  const missingPollutants: string[] = [];
  let maxSubIndex = 0;
  let primaryPollutantCode: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3" = "pm25";
  let hasExtrapolation = false;

  for (const code of pollutantCodes) {
    const rawVal = inputs[code];

    if (rawVal === undefined || rawVal === null || isNaN(rawVal)) {
      missingPollutants.push(code);
      continue;
    }

    const { subIndex, category, isExtrapolated } = calculateSubIndex(code, rawVal);
    subIndices[code] = subIndex;
    if (isExtrapolated) hasExtrapolation = true;

    const stdInfo = CPCB_NAAQS_24H_LIMITS[code];
    const ratioToStandard = Number((rawVal / (stdInfo?.limit || 1)).toFixed(1));

    const formatCodeName = (c: string) => {
      if (c === "pm25") return "PM2.5";
      if (c === "pm10") return "PM10";
      if (c === "no2") return "NO2";
      if (c === "so2") return "SO2";
      if (c === "co") return "CO";
      if (c === "o3") return "O3";
      return c.toUpperCase();
    };

    pollutants.push({
      name: stdInfo?.name || code.toUpperCase(),
      code,
      displayName: formatCodeName(code),
      value: Number(rawVal.toFixed(1)),
      unit: stdInfo?.unit || "µg/m³",
      subIndex,
      category,
      standardLimit24h: stdInfo?.limit || 0,
      ratioToStandard,
    });

    if (subIndex > maxSubIndex) {
      maxSubIndex = subIndex;
      primaryPollutantCode = code;
    }
  }

  // If no pollutants at all were provided, return default minimal result
  if (pollutants.length === 0) {
    const defaultCategory: CpcbCategory = "Good";
    const details = CPCB_CATEGORY_DETAILS[defaultCategory];
    return {
      aqi: 0,
      category: defaultCategory,
      primaryPollutant: "None (No Data)",
      pollutantCode: "pm25",
      subIndices: {},
      pollutants: [],
      healthStatement: "No air quality data available for calculation.",
      cautionaryStatement: "Check connection or search a different station.",
      color: details.colorHex,
      isExtrapolated: false,
      missingPollutants: pollutantCodes,
    };
  }

  const category = getCategoryFromAqi(maxSubIndex);
  const details = CPCB_CATEGORY_DETAILS[category];
  const primaryName = CPCB_NAAQS_24H_LIMITS[primaryPollutantCode]?.name || primaryPollutantCode.toUpperCase();

  return {
    aqi: maxSubIndex,
    category,
    primaryPollutant: primaryName,
    pollutantCode: primaryPollutantCode,
    subIndices,
    pollutants,
    healthStatement: details.healthStatement,
    cautionaryStatement: details.cautionaryStatement,
    color: details.colorHex,
    isExtrapolated: hasExtrapolation,
    missingPollutants,
  };
}
