import { CpcbCategory } from "@/types";

export interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
  category: CpcbCategory;
}

export const CPCB_BREAKPOINTS: Record<string, BreakpointRange[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 251, cHigh: 350, iLow: 401, iHigh: 500, category: "Severe" },
    { cLow: 351, cHigh: 800, iLow: 501, iHigh: 900, category: "Severe+ / Hazardous" },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 431, cHigh: 500, iLow: 401, iHigh: 500, category: "Severe" },
    { cLow: 501, cHigh: 1000, iLow: 501, iHigh: 900, category: "Severe+ / Hazardous" },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 401, cHigh: 1000, iLow: 401, iHigh: 500, category: "Severe" },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500, category: "Severe" },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500, category: "Severe" },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50, category: "Good" },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100, category: "Satisfactory" },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200, category: "Moderately Polluted" },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300, category: "Poor" },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400, category: "Very Poor" },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500, category: "Severe" },
  ],
};

export const CPCB_NAAQS_24H_LIMITS: Record<string, { limit: number; unit: string; name: string }> = {
  pm25: { limit: 60, unit: "µg/m³", name: "Particulate Matter 2.5" },
  pm10: { limit: 100, unit: "µg/m³", name: "Particulate Matter 10" },
  no2: { limit: 80, unit: "µg/m³", name: "Nitrogen Dioxide" },
  so2: { limit: 80, unit: "µg/m³", name: "Sulphur Dioxide" },
  co: { limit: 2.0, unit: "mg/m³", name: "Carbon Monoxide" },
  o3: { limit: 100, unit: "µg/m³", name: "Ozone (8-hr)" },
};

export interface CpcbCategoryDetails {
  category: CpcbCategory;
  rangeText: string;
  colorHex: string;
  bgHex: string;
  badgeClass: string;
  healthStatement: string;
  cautionaryStatement: string;
  grapStage?: "Stage I (Poor)" | "Stage II (Very Poor)" | "Stage III (Severe)" | "Stage IV (Severe+)";
}

export const CPCB_CATEGORY_DETAILS: Record<CpcbCategory, CpcbCategoryDetails> = {
  Good: {
    category: "Good",
    rangeText: "0 – 50",
    colorHex: "#15803d",
    bgHex: "#dcfce7",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    healthStatement: "Minimal impact. Air quality is considered satisfactory, and air pollution poses little or no risk.",
    cautionaryStatement: "Enjoy outdoor activities without restrictions.",
  },
  Satisfactory: {
    category: "Satisfactory",
    rangeText: "51 – 100",
    colorHex: "#65a30d",
    bgHex: "#f7fee7",
    badgeClass: "bg-lime-100 text-lime-800 border-lime-300",
    healthStatement: "Minor breathing discomfort to sensitive people (asthmatics, young children, elderly).",
    cautionaryStatement: "Sensitive individuals should consider reducing prolonged outdoor heavy exertion.",
  },
  "Moderately Polluted": {
    category: "Moderately Polluted",
    rangeText: "101 – 200",
    colorHex: "#d97706",
    bgHex: "#fef3c7",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    healthStatement: "Breathing discomfort to people with lung disease, asthma, and heart conditions.",
    cautionaryStatement: "Children and elderly should limit prolonged heavy outdoor exertion.",
  },
  Poor: {
    category: "Poor",
    rangeText: "201 – 300",
    colorHex: "#ea580c",
    bgHex: "#ffedd5",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    healthStatement: "Breathing discomfort to most people on prolonged exposure; significant distress to sensitive groups.",
    cautionaryStatement: "Avoid prolonged outdoor exertion. Sensitive individuals should wear N95 masks when outside.",
    grapStage: "Stage I (Poor)",
  },
  "Very Poor": {
    category: "Very Poor",
    rangeText: "301 – 400",
    colorHex: "#dc2626",
    bgHex: "#fee2e2",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    healthStatement: "Respiratory illness on prolonged exposure. Pronounced effect on people with lung and heart diseases.",
    cautionaryStatement: "Everyone should avoid outdoor physical exertion. Keep windows sealed; run HEPA air purifiers.",
    grapStage: "Stage II (Very Poor)",
  },
  Severe: {
    category: "Severe",
    rangeText: "401 – 500",
    colorHex: "#991b1b",
    bgHex: "#fef2f2",
    badgeClass: "bg-red-900 text-red-100 border-red-700",
    healthStatement: "Affects healthy people and seriously impacts those with existing respiratory or cardiovascular diseases.",
    cautionaryStatement: "Health emergency warning: Avoid all outdoor activities. Mandatory N95 masks if outside is essential.",
    grapStage: "Stage III (Severe)",
  },
  "Severe+ / Hazardous": {
    category: "Severe+ / Hazardous",
    rangeText: "> 500",
    colorHex: "#450a0a",
    bgHex: "#450a0a",
    badgeClass: "bg-stone-900 text-red-400 border-red-600 animate-pulse",
    healthStatement: "Severe public health emergency. Hazardous air causing acute toxicity and systemic inflammation.",
    cautionaryStatement: "Total outdoor restriction. Schools/colleges should move online. Continuous HEPA filtration required.",
    grapStage: "Stage IV (Severe+)",
  },
};
