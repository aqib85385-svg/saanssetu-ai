export type CpcbCategory =
  | "Good"
  | "Satisfactory"
  | "Moderately Polluted"
  | "Poor"
  | "Very Poor"
  | "Severe"
  | "Severe+ / Hazardous";

export interface PollutantReading {
  name: string;
  code: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  displayName: string;
  value: number; // in ug/m3, except CO in mg/m3
  unit: string;
  subIndex: number;
  category: CpcbCategory;
  standardLimit24h: number; // CPCB 24-hr safe limit
  ratioToStandard: number; // e.g., 5.4x safe limit
}

export interface CpcbAqiResult {
  aqi: number;
  category: CpcbCategory;
  primaryPollutant: string;
  pollutantCode: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  subIndices: Record<string, number>;
  pollutants: PollutantReading[];
  healthStatement: string;
  cautionaryStatement: string;
  color: string;
  isExtrapolated: boolean;
  missingPollutants: string[];
}

export interface HourlyForecastItem {
  time: string; // ISO string
  hourFormatted: string; // "9 AM"
  pm25: number;
  pm10: number;
  aqi: number;
  category: CpcbCategory;
  isObservation: boolean; // true if measured/past, false if model forecast
  boundaryLayerHeight?: number; // meters (winter inversion indicator)
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  pm25Min: number;
  pm25Max: number;
  pm25Avg: number;
  aqi: number;
  category: CpcbCategory;
  summary: string;
}

export interface ActivityWindow {
  startTime: string; // "12:00 PM"
  endTime: string; // "03:30 PM"
  windowType: "optimal" | "acceptable" | "dangerous" | "hazardous";
  title: string;
  expectedAqiRange: [number, number];
  scientificReason: string; // e.g. "Peak diurnal solar heating breaks ground-level thermal inversion"
  recommendedActivities: string[];
  restrictedActivities: string[];
  confidence: "High" | "Medium" | "Low" | "Estimated";
}

export interface LocationData {
  name: string;
  admin1?: string; // State (e.g. "Delhi", "Maharashtra")
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
}

export type HealthSensitivity =
  | "asthma"
  | "copd"
  | "cardiovascular"
  | "respiratory_allergy"
  | "diabetes"
  | "post_viral_recovery"
  | "hypertension";

export type AgeGroup =
  | "infant" // 0-4
  | "child" // 5-17
  | "adult" // 18-59
  | "elderly" // 60+
  | "pregnant";

export interface FamilyMember {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  sensitivities: HealthSensitivity[];
  outdoorExposureHoursPerDay: number;
  commuteType: "metro" | "bus" | "car_closed" | "bike_two_wheeler" | "walk" | "wfh";
  notes?: string;
}

export interface MemberRiskScore {
  memberId: string;
  memberName: string;
  vulnerabilityScore: number; // 0 - 100
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  individualExplanation: string;
  tailoredGuidance: string[];
  maskRecommendation: "None required" | "Cloth/Surgical ok" | "N95 / FFP2 mandatory" | "Stay strictly indoors";
}

export interface ActionRecommendation {
  id: string;
  title: string;
  action: string;
  reason: string;
  whoBenefits: string;
  whenToPerform: string;
  expectedImpact: string;
  confidence: "High" | "Medium" | "Estimated";
  assumptions: string;
  actionPriorityScore: number; // 0 - 100
  urgency: "Immediate" | "Planned" | "Preventive";
  category: "ventilation" | "commute" | "indoor" | "health" | "routine" | "community";
}

export interface DailyRoutinePlan {
  morning: ActionRecommendation[];
  afternoon: ActionRecommendation[];
  evening: ActionRecommendation[];
  night: ActionRecommendation[];
  commuteGuidance: {
    recommendedWindow: string;
    protectiveEquipment: string;
    routeAdvice: string;
  };
  exerciseGuidance: {
    canExerciseOutdoors: boolean;
    indoorAlternative: string;
    bestWindow?: string;
  };
  ventilationPlan: {
    canOpenWindows: boolean;
    durationMinutes: number;
    recommendedTimeWindow: string;
    scientificJustification: string;
  };
}

export interface IndoorRoomConfig {
  id: string;
  roomName: string; // "Master Bedroom", "Living Room"
  areaSqFt: number;
  ceilingHeightFt: number; // standard 9.5-10ft
  sealingQuality: "poor_drafty" | "average" | "well_sealed_weatherstripped";
  hasAirConditioner: boolean;
  hasPurifier: boolean;
  purifierCadrCfm?: number; // CADR in CFM (Cubic Feet per Minute)
  indoorSources: ("agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking" | "none")[];
}

export interface CadrCalculationResult {
  roomVolumeM3: number;
  roomVolumeCuFt: number;
  requiredCadrCfm: number; // for 4 ACH
  requiredCadrM3h: number; // CADR in m³/h
  currentAchWithPurifier: number;
  status: "insufficient" | "adequate" | "optimal" | "no_purifier";
  estimatedIndoorAqiWithoutPurifier: number;
  estimatedIndoorAqiWithPurifier: number;
  recommendations: string[];
  budgetOptions: {
    name: string;
    approxCostInr: string;
    estimatedCadrCfm: number;
    pros: string;
    cons: string;
  }[];
}

export interface CommuteModeComparison {
  mode: "walk" | "bicycle" | "metro" | "electric_bus" | "cng_bus" | "shared_cab" | "petrol_car" | "diesel_car" | "motorcycle_2w";
  modeName: string;
  co2GramsPerKm: number;
  totalCo2Kg: number;
  co2AvoidedVsPrivateCarKg: number;
  pm25InhalationLevel: "Very Low (HEPA Cabin)" | "Low (Air Conditioned)" | "High (Direct Street Smog)" | "Extreme (Exhaust Plume)";
  healthRiskTradeoff: string;
}

export interface CommunityAdvisory {
  target: "Schools" | "Housing Societies (RWAs)" | "Workplaces" | "Family WhatsApp";
  triggerCondition: string; // e.g. "AQI > 300 (GRAP Stage III)"
  headline: string;
  actionItems: string[];
  whatsappShareText: string;
}
