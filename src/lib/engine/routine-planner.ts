import {
  ActionRecommendation,
  ActivityWindow,
  CpcbAqiResult,
  DailyRoutinePlan,
  FamilyMember,
  IndoorRoomConfig,
} from "@/types";
import { generateDailyActions } from "./action-priority";

export function planDailyRoutine(
  aqiResult: CpcbAqiResult,
  members: FamilyMember[],
  activityAssessment: { bestWindow: ActivityWindow; worstWindow: ActivityWindow },
  rooms: IndoorRoomConfig[] = []
): DailyRoutinePlan {
  const allActions = generateDailyActions(aqiResult, members, rooms);
  const aqi = aqiResult.aqi;

  // Group actions by time of day
  const morning: ActionRecommendation[] = allActions.filter(
    (a) =>
      a.whenToPerform.toLowerCase().includes("morning") ||
      a.category === "commute" ||
      a.id.includes("indoor-source-control")
  );

  const afternoon: ActionRecommendation[] = allActions.filter(
    (a) =>
      a.whenToPerform.toLowerCase().includes("midday") ||
      a.whenToPerform.toLowerCase().includes("afternoon") ||
      a.whenToPerform.toLowerCase().includes("lunch") ||
      a.category === "ventilation"
  );

  const evening: ActionRecommendation[] = allActions.filter(
    (a) =>
      a.whenToPerform.toLowerCase().includes("evening") ||
      a.whenToPerform.toLowerCase().includes("dinner") ||
      a.id.includes("draft-proofing")
  );

  const night: ActionRecommendation[] = allActions.filter(
    (a) =>
      a.whenToPerform.toLowerCase().includes("night") ||
      a.id.includes("bedroom-hepa") ||
      a.category === "indoor"
  );

  // Commute guidance
  const commuteGuidance = {
    recommendedWindow:
      aqi > 300
        ? "Shift commute to 10:30 AM - 11:30 AM if possible; avoid early 07:30 AM - 09:00 AM inversion peak."
        : "Standard transit hours; travel outside peak congestion windows if possible.",
    protectiveEquipment:
      aqi > 250
        ? "Mandatory airtight N95 / FFP2 mask with malleable metal nose clip; cloth/surgical masks fail against fine PM2.5."
        : aqi > 100
        ? "N95 mask recommended for sensitive individuals, young children, and two-wheeler riders."
        : "Standard comfort gear.",
    routeAdvice:
      aqi > 200
        ? "Prefer Delhi Metro / AC Rail transit. If traveling by car, set AC strictly to 'Internal Recirculation' mode."
        : "Public transit preferred to minimize personal emission footprint.",
  };

  // Exercise guidance
  const canExerciseOutdoors = aqi <= 150;
  const exerciseGuidance = {
    canExerciseOutdoors,
    indoorAlternative:
      canExerciseOutdoors
        ? "Light outdoor jogging acceptable during optimal midday window."
        : "Shift strictly to indoor yoga, pilates, resistance bands, or treadmill workouts in a room with an operating HEPA purifier.",
    bestWindow: canExerciseOutdoors
      ? `${activityAssessment.bestWindow.startTime} – ${activityAssessment.bestWindow.endTime}`
      : undefined,
  };

  // Strict Ventilation guidance adhering to requirement:
  // "Never recommend opening windows when outdoor air is worse than indoor air without an appropriate justification."
  const canOpenWindows = aqi < 180;
  const ventilationPlan = {
    canOpenWindows,
    durationMinutes: canOpenWindows ? 20 : 10,
    recommendedTimeWindow: `${activityAssessment.bestWindow.startTime} – ${activityAssessment.bestWindow.endTime}`,
    scientificJustification: canOpenWindows
      ? "Midday planetary boundary layer expansion disperses ground-level smog, allowing brief exchange to flush indoor CO2 without catastrophic particle ingress."
      : "OUTDOOR AIR EXCEEDS SAFE THRESHOLDS. Opening windows will flood living spaces with fine particles (PM2.5). Keep windows sealed. If indoor CO2 causes drowsiness, limit cross-ventilation to a strict 5-minute purge at 2:00 PM with purifiers on maximum.",
  };

  return {
    morning,
    afternoon,
    evening,
    night,
    commuteGuidance,
    exerciseGuidance,
    ventilationPlan,
  };
}
