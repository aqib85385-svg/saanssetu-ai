import { CadrCalculationResult, IndoorRoomConfig } from "@/types";

/**
 * Scientific CADR (Clean Air Delivery Rate) and Air Purifier Sizing Engine.
 *
 * Physics & Standards:
 * - AHAM (Association of Home Appliance Manufacturers) / EPA standards.
 * - Standard ACH (Air Changes per Hour) recommendation for severe ambient particulate pollution: 4.5 - 5.0 ACH.
 * - Room Volume (cu ft) = Area (sq ft) * Height (ft)
 * - Required CADR (CFM) = (Room Volume in cu ft * Target ACH) / 60
 * - Metric: 1 CFM ≈ 1.69901 m³/h
 */

export function calculateRoomCadr(
  room: IndoorRoomConfig,
  targetAch: number = 4.5
): CadrCalculationResult {
  const areaSqFt = Math.max(room.areaSqFt, 30);
  const ceilingHeightFt = Math.max(room.ceilingHeightFt || 9.5, 7);
  const roomVolumeCuFt = areaSqFt * ceilingHeightFt;
  const roomVolumeM3 = Number((roomVolumeCuFt * 0.0283168).toFixed(1));

  // Required CADR in CFM for target ACH
  const requiredCadrCfm = Math.round((roomVolumeCuFt * targetAch) / 60);
  // Required CADR in m³/h
  const requiredCadrM3h = Math.round(requiredCadrCfm * 1.69901);

  // Current Purifier Performance
  const currentCadrCfm = room.hasPurifier ? room.purifierCadrCfm || 0 : 0;
  const currentAchWithPurifier =
    roomVolumeCuFt > 0 ? Number(((currentCadrCfm * 60) / roomVolumeCuFt).toFixed(1)) : 0;

  let status: "insufficient" | "adequate" | "optimal" | "no_purifier" = "no_purifier";
  if (!room.hasPurifier) {
    status = "no_purifier";
  } else if (currentAchWithPurifier >= targetAch) {
    status = "optimal";
  } else if (currentAchWithPurifier >= 2.5) {
    status = "adequate";
  } else {
    status = "insufficient";
  }

  // Model-estimated indoor PM2.5 baseline (assuming typical 200 ug/m3 ambient winter outdoor)
  // Infiltration factor depending on sealing
  let infiltrationFactor = 0.55; // average Indian apartment
  if (room.sealingQuality === "poor_drafty") infiltrationFactor = 0.75;
  if (room.sealingQuality === "well_sealed_weatherstripped") infiltrationFactor = 0.35;

  const baselineOutdoorPm25 = 220; // illustrative typical severe winter baseline
  const estimatedIndoorAqiWithoutPurifier = Math.round(baselineOutdoorPm25 * infiltrationFactor * 1.2);

  // With purifier, concentration drops proportionally to ACH / (Infiltration + Removal)
  let cleanAirFraction = 0;
  if (room.hasPurifier && currentAchWithPurifier > 0) {
    cleanAirFraction = Math.min(currentAchWithPurifier / (currentAchWithPurifier + infiltrationFactor * 1.5), 0.90);
  }
  const estimatedIndoorAqiWithPurifier = room.hasPurifier
    ? Math.max(Math.round(estimatedIndoorAqiWithoutPurifier * (1 - cleanAirFraction)), 15)
    : estimatedIndoorAqiWithoutPurifier;

  const recommendations: string[] = [];

  if (!room.hasPurifier) {
    recommendations.push(
      `For a ${areaSqFt} sq ft room, deploy a purifier delivering at least ${requiredCadrCfm} CFM (${requiredCadrM3h} m³/h) CADR to achieve 4.5 air changes per hour.`
    );
  } else if (status === "insufficient") {
    recommendations.push(
      `Your current purifier delivers ~${currentAchWithPurifier} ACH, which is below the recommended 4.5 ACH for winter smog. Supplement with a secondary compact purifier or seal window gaps to reduce infiltration.`
    );
  } else {
    recommendations.push(
      `Current setup achieves ${currentAchWithPurifier} ACH, providing robust filtration against winter smog.`
    );
  }

  if (room.sealingQuality === "poor_drafty") {
    recommendations.push(
      "Sealing window drafts with foam weatherstrip tape can reduce needed purifier fan speed by 35% while extending HEPA filter lifespan."
    );
  }

  if (room.indoorSources.includes("agarbatti") || room.indoorSources.includes("dhoop")) {
    recommendations.push(
      "Eliminating incense/dhoop burning will prevent overwhelming the HEPA filter with carbonaceous ultrafine particulates."
    );
  }

  const budgetOptions = [
    {
      name: "DIY Box-Fan + MERV-13 / True HEPA Filter",
      approxCostInr: "₹2,500 – ₹3,500",
      estimatedCadrCfm: Math.min(requiredCadrCfm, 200),
      pros: "Ultra-affordable, high airflow volume, low replacement filter cost.",
      cons: "Slightly louder, manual switch, basic aesthetic.",
    },
    {
      name: "Standard Indian Home HEPA (Coway / Xiaomi / Philips / Eureka)",
      approxCostInr: "₹8,500 – ₹13,000",
      estimatedCadrCfm: Math.max(requiredCadrCfm, 220),
      pros: "Quiet sleep mode, PM2.5 real-time laser sensor, auto-fan modulation.",
      cons: "Annual replacement filter costs (₹2,000 - ₹3,500).",
    },
    {
      name: "High-Volume Living Room Purifier (Dual-Fan / 500+ m³/h)",
      approxCostInr: "₹18,000 – ₹28,000",
      estimatedCadrCfm: Math.max(requiredCadrCfm, 350),
      pros: "Covers large living/dining spaces up to 550 sq ft, high carbon VOC filter.",
      cons: "Higher upfront investment and larger physical footprint.",
    },
  ];

  return {
    roomVolumeM3,
    roomVolumeCuFt,
    requiredCadrCfm,
    requiredCadrM3h,
    currentAchWithPurifier,
    status,
    estimatedIndoorAqiWithoutPurifier,
    estimatedIndoorAqiWithPurifier,
    recommendations,
    budgetOptions,
  };
}
