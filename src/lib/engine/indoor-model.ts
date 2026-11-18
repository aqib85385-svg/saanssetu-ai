import { IndoorRoomConfig } from "@/types";

export interface IndoorPollutionEstimate {
  roomId: string;
  roomName: string;
  outdoorAqi: number;
  infiltrationFactor: number;
  sourceContributionPm25: number;
  estimatedIndoorPm25: number;
  estimatedIndoorAqi: number;
  ratioIndoorToOutdoor: number; // e.g. 0.42 = indoor is 42% of outdoor
  hepaEffectivenessPercent: number;
  primaryIndoorRisk: string;
  keyMitigations: string[];
  scientificAssumptions: string[];
}

export function estimateIndoorAirQuality(
  room: IndoorRoomConfig,
  outdoorAqi: number,
  outdoorPm25: number
): IndoorPollutionEstimate {
  // Infiltration factor determined by building envelope sealing quality
  let infiltrationFactor = 0.55;
  if (room.sealingQuality === "poor_drafty") infiltrationFactor = 0.78;
  if (room.sealingQuality === "well_sealed_weatherstripped") infiltrationFactor = 0.32;

  // Infiltration PM2.5
  const infiltratedPm25 = outdoorPm25 * infiltrationFactor;

  // Indoor source contributions in closed spaces (ug/m3)
  let sourceContribution = 0;
  const sourcesIdentified: string[] = [];

  for (const src of room.indoorSources) {
    switch (src) {
      case "agarbatti":
        sourceContribution += 120;
        sourcesIdentified.push("Agarbatti (Incense sticks: releases fine carbonaceous soot & aldehydes)");
        break;
      case "dhoop":
        sourceContribution += 240;
        sourcesIdentified.push("Dhoop (Dense resin combustion: releases high-density PM2.5 & benzene)");
        break;
      case "mosquito_coil":
        sourceContribution += 180;
        sourcesIdentified.push("Mosquito coil (Pyrethroid smoke: produces particulate mass equal to dozens of cigarettes)");
        break;
      case "frying":
        sourceContribution += 150;
        sourcesIdentified.push("Unvented oil frying / Tadka (Ultrafine oil droplet aerosols & acrolein)");
        break;
      case "smoking":
        sourceContribution += 350;
        sourcesIdentified.push("Indoor tobacco smoking (High-concentration particulate & nicotine residues)");
        break;
      case "none":
        break;
    }
  }

  // Combined raw indoor concentration before purification
  const rawIndoorPm25 = infiltratedPm25 + sourceContribution;

  // Purifier effect based on CADR and room volume
  let hepaEffectivenessPercent = 0;
  if (room.hasPurifier && (room.purifierCadrCfm || 0) > 0) {
    const cadrCfm = room.purifierCadrCfm || 150;
    const roomVolumeCuFt = Math.max(room.areaSqFt * (room.ceilingHeightFt || 9.5), 200);
    const ach = (cadrCfm * 60) / roomVolumeCuFt;

    // Purifier removal efficiency modeled on steady-state single-zone mass balance:
    // C_ss = (S + ACH_inf * C_out) / (ACH_inf + ACH_purifier)
    hepaEffectivenessPercent = Math.min(Math.round((ach / (ach + infiltrationFactor * 1.5)) * 100), 92);
  }

  const effectiveIndoorPm25 = Math.max(
    Math.round(rawIndoorPm25 * (1 - hepaEffectivenessPercent / 100)),
    12
  );

  // Approximate indoor AQI based on PM2.5
  // using CPCB PM2.5 scale
  let estimatedIndoorAqi = Math.round(effectiveIndoorPm25 * 1.3);
  if (effectiveIndoorPm25 <= 30) {
    estimatedIndoorAqi = Math.round((effectiveIndoorPm25 / 30) * 50);
  } else if (effectiveIndoorPm25 <= 60) {
    estimatedIndoorAqi = Math.round(50 + ((effectiveIndoorPm25 - 30) / 30) * 50);
  } else if (effectiveIndoorPm25 <= 90) {
    estimatedIndoorAqi = Math.round(100 + ((effectiveIndoorPm25 - 60) / 30) * 100);
  } else if (effectiveIndoorPm25 <= 120) {
    estimatedIndoorAqi = Math.round(200 + ((effectiveIndoorPm25 - 90) / 30) * 100);
  } else if (effectiveIndoorPm25 <= 250) {
    estimatedIndoorAqi = Math.round(300 + ((effectiveIndoorPm25 - 120) / 130) * 100);
  } else {
    estimatedIndoorAqi = Math.min(Math.round(400 + ((effectiveIndoorPm25 - 250) / 100) * 100), 600);
  }

  const ratio = outdoorPm25 > 0 ? Number((effectiveIndoorPm25 / outdoorPm25).toFixed(2)) : 0.5;

  const mitigations: string[] = [];
  if (sourcesIdentified.length > 0) {
    mitigations.push("Cease all indoor combustion (dhoop/agarbatti/mosquito coils); switch to liquid vaporizers or sealed electric diffusers.");
  }
  if (room.sealingQuality === "poor_drafty") {
    mitigations.push("Apply silicone weatherstripping tape along window perimeter sashes to halt draft infiltration.");
  }
  if (!room.hasPurifier) {
    mitigations.push("Install a True HEPA purifier sized for at least 4 ACH, or assemble a low-cost DIY box fan filter.");
  } else if (hepaEffectivenessPercent < 60) {
    mitigations.push("Purifier capacity is undersized for this room volume; increase fan speed or relocate purifier closer to breathing zone.");
  }
  mitigations.push("Switch to wet mopping with microfiber cloth; never dry-sweep.");

  const primaryRisk =
    sourcesIdentified.length > 0
      ? `Indoor combustion sources (${sourcesIdentified[0]}) are producing acute particulate peaks indoors.`
      : room.sealingQuality === "poor_drafty"
      ? "Drafty window sashes allow rapid outdoor ambient smog infiltration."
      : "Infiltration of ambient outdoor particulate matter.";

  return {
    roomId: room.id,
    roomName: room.roomName,
    outdoorAqi,
    infiltrationFactor,
    sourceContributionPm25: sourceContribution,
    estimatedIndoorPm25: effectiveIndoorPm25,
    estimatedIndoorAqi,
    ratioIndoorToOutdoor: ratio,
    hepaEffectivenessPercent,
    primaryIndoorRisk: primaryRisk,
    keyMitigations: mitigations,
    scientificAssumptions: [
      "DISCLAIMER: These are mathematical model estimates based on steady-state mass-balance aerosol physics, NOT direct real-time indoor sensor measurements.",
      "Assumes typical 9.5-foot ceiling height and standard room air mixing.",
      "Indoor plants have near-zero CADR for PM2.5 and cannot replace mechanical HEPA filtration.",
    ],
  };
}
