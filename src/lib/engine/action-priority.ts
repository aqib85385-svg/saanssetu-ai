import {
  ActionRecommendation,
  CpcbAqiResult,
  FamilyMember,
  IndoorRoomConfig,
} from "@/types";

/**
 * Calculates the Action Priority Score (APS) [0 - 100].
 *
 * Formula:
 * APS = clamp( (PollutionSeverityScore * HouseholdSensitivityMultiplier * InterventionBenefitWeight) / 100, 0, 100 )
 *
 * This provides an objective, transparent basis to rank daily winter actions.
 */
export function calculateActionPriorityScore(
  aqi: number,
  sensitivityMultiplier: number,
  benefitWeight: number
): number {
  // Pollution severity factor: 0 at AQI 50, scales up to 100 at AQI 450+
  const severityScore = Math.min(Math.max(((aqi - 50) / 400) * 100, 5), 100);
  const rawScore = (severityScore * sensitivityMultiplier * (benefitWeight / 100));
  return Math.min(Math.max(Math.round(rawScore), 5), 100);
}

/**
 * Computes household sensitivity multiplier based on members' vulnerabilities.
 * Base = 1.0. Increases with vulnerable demographics or clinical conditions.
 */
export function getHouseholdSensitivityMultiplier(members: FamilyMember[]): number {
  if (!members || members.length === 0) return 1.0;

  let multiplier = 1.0;

  for (const m of members) {
    if (m.ageGroup === "infant") multiplier += 0.35;
    if (m.ageGroup === "elderly") multiplier += 0.3;
    if (m.ageGroup === "pregnant") multiplier += 0.35;
    if (m.ageGroup === "child") multiplier += 0.2;

    if (m.sensitivities.includes("asthma") || m.sensitivities.includes("copd")) {
      multiplier += 0.4;
    }
    if (m.sensitivities.includes("cardiovascular") || m.sensitivities.includes("hypertension")) {
      multiplier += 0.25;
    }
    if (m.sensitivities.includes("respiratory_allergy") || m.sensitivities.includes("post_viral_recovery")) {
      multiplier += 0.2;
    }
  }

  // Cap sensitivity multiplier at 2.5 to avoid runaway scores
  return Math.min(Number(multiplier.toFixed(2)), 2.5);
}

/**
 * Generates grounded, structured daily action recommendations complying with all constraints:
 * - Specific reasons and timestamps
 * - Beneficiary details
 * - Clear estimates clearly distinguished from measured facts
 * - Never recommending window opening when outdoor air is worse without carbon dioxide justification
 * - Plant filtration myth debunked explicitly
 */
export function generateDailyActions(
  aqiResult: CpcbAqiResult,
  members: FamilyMember[],
  rooms: IndoorRoomConfig[] = []
): ActionRecommendation[] {
  const aqi = aqiResult.aqi;
  const sensMultiplier = getHouseholdSensitivityMultiplier(members);
  const actions: ActionRecommendation[] = [];

  const hasAsthmaOrCopd = members.some(
    (m) => m.sensitivities.includes("asthma") || m.sensitivities.includes("copd")
  );
  const hasVulnerableAge = members.some(
    (m) => m.ageGroup === "infant" || m.ageGroup === "elderly" || m.ageGroup === "pregnant"
  );
  const hasPurifier = rooms.some((r) => r.hasPurifier);
  const hasDraftyRooms = rooms.some((r) => r.sealingQuality === "poor_drafty");

  // 1. Commute Masking & Route Timing
  if (aqi >= 150) {
    const maskType = aqi > 300 ? "N95 / FFP2 mask with airtight nasal clip" : "Well-fitted N95 mask";
    const aps = calculateActionPriorityScore(aqi, sensMultiplier, 92);
    actions.push({
      id: "commute-n95",
      title: "Mandatory N95/FFP2 Commute Protection",
      action: `Equip all commuting household members with an ${maskType}. Cloth and surgical masks filter under 30% of PM2.5.`,
      reason: `Ambient outdoor AQI is ${aqi} (${aqiResult.category}). Deep lung deposition of PM2.5 causes acute airway inflammation.`,
      whoBenefits: hasAsthmaOrCopd
        ? "Asthmatic and sensitive members benefit critically; all commuters benefit significantly."
        : "All commuting household members.",
      whenToPerform: "Before stepping out of the front door for morning and evening commutes.",
      expectedImpact: "Estimated 90-95% reduction in inhaled fine particulate mass during transit when sealed properly.",
      confidence: "High",
      assumptions: "Assumes proper mask seal around nose and chin with zero facial hair leakage.",
      actionPriorityScore: aps,
      urgency: aqi > 300 ? "Immediate" : "Planned",
      category: "commute",
    });
  }

  // 2. Bedroom Purifier Night Protocol
  if (aqi >= 100) {
    const aps = calculateActionPriorityScore(aqi, sensMultiplier, 95);
    actions.push({
      id: "bedroom-hepa-night",
      title: "Pre-Bedtime Bedroom Air Purifier Cycle",
      action: hasPurifier
        ? "Power on bedroom HEPA air purifier on High setting 45 minutes before sleep with door and windows firmly shut, then set to Sleep/Low mode for overnight operation."
        : "Create an isolated clean-air sleep sanctuary: Keep bedroom doors/windows shut, block door gaps with a rolled towel or draft snake, and consider a budget DIY box-fan with MERV-13 filter.",
      reason: `Humans spend 7-9 hours sleeping in one enclosed room. Nocturnal outdoor thermal inversion keeps outdoor AQI elevated above ${Math.round(aqi * 1.1)}.`,
      whoBenefits: hasVulnerableAge
        ? "Infants, elderly members, and sensitive sleepers at highest risk of nocturnal asthma flare-ups."
        : "Entire household restful recovery and cardiovascular health.",
      whenToPerform: "Night: 08:30 PM - 09:30 PM (before entering bedroom for sleep).",
      expectedImpact: hasPurifier
        ? "Estimated 70-85% reduction in indoor PM2.5 concentration within 60 minutes."
        : "Estimated 25-40% reduction in nocturnal particle infiltration by blocking draft gaps.",
      confidence: "High",
      assumptions: "Room door and windows remain closed; room volume matches CADR capacity.",
      actionPriorityScore: aps,
      urgency: "Immediate",
      category: "indoor",
    });
  }

  // 3. Ventilation Window Control (Strict Scientific Rule)
  const apsVentilation = calculateActionPriorityScore(aqi, sensMultiplier, 85);
  if (aqi >= 200) {
    actions.push({
      id: "ventilation-seal",
      title: "Maintain Strict Building Envelope Sealing",
      action: "Keep all exterior windows and balcony doors strictly sealed. If indoor CO2 builds up (stuffy air), perform a brief 5-10 minute controlled cross-purge only between 1:00 PM and 3:00 PM.",
      reason: `Outdoor air (AQI ${aqi}) contains hazardous fine particulates far worse than typical enclosed indoor air. Opening windows during morning or night inversions contaminates living areas.`,
      whoBenefits: "All household members, preventing outdoor smog infiltration.",
      whenToPerform: "Throughout the day and night; avoid opening windows between 05:00 AM - 11:00 AM.",
      expectedImpact: "Prevents indoor PM2.5 levels from equalizing with the toxic outdoor ambient air.",
      confidence: "High",
      assumptions: "Weatherstripping or towel seals are intact around major window/door gaps.",
      actionPriorityScore: apsVentilation,
      urgency: "Immediate",
      category: "ventilation",
    });
  } else {
    actions.push({
      id: "ventilation-moderate",
      title: "Controlled Midday Air Exchange",
      action: "Open opposite-facing windows for 15-20 minutes between 12:30 PM and 02:30 PM to flush accumulated indoor CO2, VOCs, and moisture.",
      reason: `Midday solar heating elevates the planetary boundary layer, providing the day's lowest outdoor particulate concentration (AQI ${aqi}).`,
      whoBenefits: "All family members, relieving drowsiness and indoor stuffiness.",
      whenToPerform: "Midday: 12:30 PM – 02:30 PM.",
      expectedImpact: "Reduces indoor CO2 below 800 ppm while minimizing particulate infiltration.",
      confidence: "High",
      assumptions: "Outdoor AQI remains below 180 during the ventilation window.",
      actionPriorityScore: apsVentilation,
      urgency: "Planned",
      category: "ventilation",
    });
  }

  // 4. Source Control: Wet Mopping & Incense Elimination
  const apsCleaning = calculateActionPriorityScore(aqi, sensMultiplier, 78);
  actions.push({
    id: "indoor-source-control",
    title: "Zero-Combustion Policy & Wet Mopping",
    action: "Switch strictly from dry brooming (jhadu) to damp microfiber mopping (pocha). Stop lighting agarbatti (incense sticks), dhoop, and mosquito coils inside living areas.",
    reason: "Dry sweeping re-suspends settled coarse and fine dust into breathing zones for 2-4 hours. A single incense stick releases PM2.5 equivalent to 2-3 cigarettes in an unventilated room.",
    whoBenefits: hasAsthmaOrCopd ? "Asthmatic members sensitive to smoke and fragrance VOCs." : "All residents.",
    whenToPerform: "Morning routine: 08:00 AM – 10:00 AM.",
    expectedImpact: "Eliminates indoor combustion spikes; prevents 60-80% of settled particulate re-suspension.",
    confidence: "High",
    assumptions: "Microfiber or damp cloth captures particulates without aerosolizing them.",
    actionPriorityScore: apsCleaning,
    urgency: "Planned",
    category: "indoor",
  });

  // 5. Cooking Ventilation Protocol
  const apsCooking = calculateActionPriorityScore(aqi, sensMultiplier, 82);
  actions.push({
    id: "cooking-exhaust-protocol",
    title: "Kitchen Chimney & Exhaust Isolation",
    action: "Turn on kitchen exhaust fan or chimney 2 minutes before starting stove, keep kitchen doors shut to isolate the living room, and use lids while tadka/frying.",
    reason: "Indian tempering (tadka) and high-heat oil frying generate ultrafine particulate spikes exceeding 500 µg/m³ within minutes, which migrate rapidly into bedrooms.",
    whoBenefits: "Cooks, young children, and elderly residents resting nearby.",
    whenToPerform: "Lunch (12:00 PM - 01:30 PM) and Dinner preparation (07:00 PM - 08:30 PM).",
    expectedImpact: "Vents 80% of ultrafine oil droplet aerosols at source before they disperse through the home.",
    confidence: "High",
    assumptions: "Exhaust fan vents to exterior building facade, not recirculating unpurified.",
    actionPriorityScore: apsCooking,
    urgency: "Preventive",
    category: "routine",
  });

  // 6. Scientific Truth on Indoor Plants
  actions.push({
    id: "plant-filtration-fact",
    title: "Scientific Filtration Reality: Plants vs HEPA",
    action: "Do not rely on potted indoor plants (e.g. snake plants, areca palms) for air purification during winter smog. Keep plants for humidity and aesthetics, but use genuine mechanical HEPA filters for PM2.5.",
    reason: "Peer-reviewed aerosol science shows potted plants have a Clean Air Delivery Rate (CADR) near zero for airborne particulate matter (PM2.5). The often-cited 1989 NASA study evaluated VOCs in sealed small chambers, not ambient smog.",
    whoBenefits: "Families deciding where to allocate budget for effective respiratory protection.",
    whenToPerform: "Ongoing seasonal awareness and purchasing decisions.",
    expectedImpact: "Prevents false sense of security and redirects resources to proven particulate barriers (HEPA, door seals).",
    confidence: "High",
    assumptions: "Based on atmospheric chemistry studies by Waring et al. (2019) and EPA guidelines.",
    actionPriorityScore: 50,
    urgency: "Preventive",
    category: "health",
  });

  // 7. Sealing Recommendation if drafty
  if (hasDraftyRooms || aqi > 250) {
    const apsSealing = calculateActionPriorityScore(aqi, sensMultiplier, 84);
    actions.push({
      id: "draft-proofing",
      title: "Window & Main Door Draft Proofing",
      action: "Install self-adhesive foam/rubber weatherstripping tape around sliding window frames and place a twin draft stopper or rolled damp towel under the main entrance door.",
      reason: "Gaps around standard Indian sliding aluminium windows and door bottoms allow 30-50% of outdoor smog to infiltrate within 90 minutes even with windows shut.",
      whoBenefits: "All household members, dramatically improving air purifier efficiency.",
      whenToPerform: "Weekend or immediate afternoon maintenance.",
      expectedImpact: "Cuts natural infiltration air changes from 1.5 ACH to below 0.5 ACH, doubling purifier efficiency.",
      confidence: "High",
      assumptions: "Door and window frames have typical 3-6mm perimeter clearances.",
      actionPriorityScore: apsSealing,
      urgency: aqi > 300 ? "Immediate" : "Planned",
      category: "indoor",
    });
  }

  // Sort descending by Action Priority Score
  return actions.sort((a, b) => b.actionPriorityScore - a.actionPriorityScore);
}
