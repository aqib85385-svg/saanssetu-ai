import {
  CpcbAqiResult,
  FamilyMember,
  HealthSensitivity,
  MemberRiskScore,
} from "@/types";

export interface HouseholdRiskSummary {
  highestRiskLevel: "Low" | "Moderate" | "High" | "Critical";
  averageVulnerabilityScore: number;
  memberScores: MemberRiskScore[];
  mostVulnerableMember?: MemberRiskScore;
  urgentWarnings: string[];
  medicalDisclaimer: string;
}

export function assessMemberRisk(
  member: FamilyMember,
  aqiResult: CpcbAqiResult
): MemberRiskScore {
  const aqi = aqiResult.aqi;
  let baseScore = 20;

  // Age group factor
  switch (member.ageGroup) {
    case "infant":
      // Infants breathe 40-60 breaths/min vs adult 12-16; inhale ~2.5x more air per kg body mass
      baseScore += 35;
      break;
    case "elderly":
      baseScore += 30;
      break;
    case "pregnant":
      baseScore += 30;
      break;
    case "child":
      baseScore += 20;
      break;
    case "adult":
      baseScore += 5;
      break;
  }

  // Health sensitivities
  for (const sens of member.sensitivities) {
    switch (sens) {
      case "asthma":
      case "copd":
        baseScore += 35;
        break;
      case "cardiovascular":
      case "hypertension":
        baseScore += 25;
        break;
      case "diabetes":
        baseScore += 15;
        break;
      case "respiratory_allergy":
      case "post_viral_recovery":
        baseScore += 20;
        break;
    }
  }

  // Commute exposure factor
  if (member.commuteType === "bike_two_wheeler" || member.commuteType === "walk") {
    baseScore += 15;
  } else if (member.commuteType === "bus") {
    baseScore += 10;
  } else if (member.commuteType === "wfh") {
    baseScore -= 10;
  }

  // Scale vulnerability by current AQI
  const aqiMultiplier = Math.min(Math.max(aqi / 150, 0.5), 2.2);
  const totalScore = Math.min(Math.max(Math.round(baseScore * aqiMultiplier * 0.5), 10), 100);

  let riskLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (totalScore >= 75 || (aqi > 300 && (member.sensitivities.length > 0 || member.ageGroup === "infant" || member.ageGroup === "elderly"))) {
    riskLevel = "Critical";
  } else if (totalScore >= 50 || aqi > 250) {
    riskLevel = "High";
  } else if (totalScore >= 30 || aqi > 100) {
    riskLevel = "Moderate";
  }

  // Individual risk explanation
  const reasons: string[] = [];
  if (member.ageGroup === "infant") {
    reasons.push("Immature lung alveolar development and higher respiratory volume per body weight.");
  }
  if (member.ageGroup === "elderly") {
    reasons.push("Decreased mucociliary clearance and heightened vulnerability to particle-induced systemic vascular inflammation.");
  }
  if (member.ageGroup === "pregnant") {
    reasons.push("PM2.5 translocates across placenta, linked to intrauterine growth restriction and maternal hypertension.");
  }
  if (member.sensitivities.includes("asthma") || member.sensitivities.includes("copd")) {
    reasons.push("Airways exhibit hyper-reactivity; micro-particles trigger bronchospasm, mucus plugging, and acute exacerbation.");
  }
  if (member.sensitivities.includes("cardiovascular") || member.sensitivities.includes("hypertension")) {
    reasons.push("Inhaled ultrafine particles enter bloodstream, raising arterial stiffness and myocardial infarction risk.");
  }
  if (member.sensitivities.includes("respiratory_allergy") || member.sensitivities.includes("post_viral_recovery")) {
    reasons.push("Mucosal membrane inflammation and allergic hyper-responsiveness exacerbate particle irritation.");
  }
  if (reasons.length === 0) {
    reasons.push("Healthy adult physiology; prolonged cumulative exposure still elevates oxidative stress.");
  }

  // Tailored guidance
  const guidance: string[] = [];
  let maskRecommendation: MemberRiskScore["maskRecommendation"] = "Cloth/Surgical ok";

  if (aqi > 300) {
    if (member.sensitivities.length > 0 || member.ageGroup === "infant" || member.ageGroup === "elderly") {
      maskRecommendation = "Stay strictly indoors";
      guidance.push("Strictly avoid all outdoor exposure. Do not step out onto balconies or terraces.");
      guidance.push("Ensure bedroom HEPA purifier runs continuously.");
      if (member.sensitivities.includes("asthma")) {
        guidance.push("Keep rescue bronchodilator inhalers immediately accessible and check expiration dates.");
      }
    } else {
      maskRecommendation = "N95 / FFP2 mandatory";
      guidance.push("Mandatory sealed N95/FFP2 mask for any outdoor transit.");
      guidance.push("Avoid all outdoor physical exertion.");
    }
  } else if (aqi > 200) {
    maskRecommendation = "N95 / FFP2 mandatory";
    guidance.push("Wear an airtight N95 mask for all commutes.");
    guidance.push("Substitute outdoor sports/workouts with indoor stretching or bodyweight routines.");
  } else if (aqi > 100) {
    if (member.sensitivities.length > 0) {
      maskRecommendation = "N95 / FFP2 mandatory";
      guidance.push("Sensitive airways: Wear N95 during morning rush hours (7 AM - 10 AM).");
    } else {
      maskRecommendation = "Cloth/Surgical ok";
      guidance.push("Moderate smog: Sensitive activities should be limited.");
    }
  } else {
    maskRecommendation = "None required";
    guidance.push("Clean air: Outdoor activities and exercise are safe.");
  }

  return {
    memberId: member.id,
    memberName: member.name,
    vulnerabilityScore: totalScore,
    riskLevel,
    individualExplanation: reasons.join(" "),
    tailoredGuidance: guidance,
    maskRecommendation,
  };
}

export function assessHouseholdRisk(
  members: FamilyMember[],
  aqiResult: CpcbAqiResult
): HouseholdRiskSummary {
  if (!members || members.length === 0) {
    return {
      highestRiskLevel: aqiResult.aqi > 300 ? "High" : aqiResult.aqi > 150 ? "Moderate" : "Low",
      averageVulnerabilityScore: Math.min(Math.round(aqiResult.aqi * 0.15), 50),
      memberScores: [],
      urgentWarnings: aqiResult.aqi > 300 ? ["Severe outdoor smog. Protect household air."] : [],
      medicalDisclaimer: RESPONSIBLE_MEDICAL_DISCLAIMER,
    };
  }

  const scores = members.map((m) => assessMemberRisk(m, aqiResult));
  scores.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);

  const avgScore = Math.round(
    scores.reduce((sum, s) => sum + s.vulnerabilityScore, 0) / scores.length
  );

  let highestRiskLevel: HouseholdRiskSummary["highestRiskLevel"] = "Low";
  if (scores.some((s) => s.riskLevel === "Critical")) {
    highestRiskLevel = "Critical";
  } else if (scores.some((s) => s.riskLevel === "High")) {
    highestRiskLevel = "High";
  } else if (scores.some((s) => s.riskLevel === "Moderate")) {
    highestRiskLevel = "Moderate";
  }

  const urgentWarnings: string[] = [];
  if (highestRiskLevel === "Critical") {
    urgentWarnings.push("CRITICAL HEALTH ALERT: One or more household members face acute medical vulnerability from ambient smog.");
  }
  if (members.some((m) => m.sensitivities.includes("asthma") && aqiResult.aqi > 250)) {
    urgentWarnings.push("Asthma Flare Advisory: Keep preventive inhalers handy; avoid sweeping dust or frying without exhaust.");
  }
  if (members.some((m) => m.ageGroup === "infant" && aqiResult.aqi > 200)) {
    urgentWarnings.push("Pediatric Advisory: Young infants must stay inside sealed, purified bedrooms.");
  }

  return {
    highestRiskLevel,
    averageVulnerabilityScore: avgScore,
    memberScores: scores,
    mostVulnerableMember: scores[0],
    urgentWarnings,
    medicalDisclaimer: RESPONSIBLE_MEDICAL_DISCLAIMER,
  };
}

export const RESPONSIBLE_MEDICAL_DISCLAIMER =
  "RESPONSIBLE HEALTH DISCLAIMER: SaansSetu AI provides preventive environmental exposure guidance based on published epidemiological studies and CPCB standards. It is NOT a medical diagnosis, clinical treatment device, or emergency healthcare service. If you or any family member experience acute breathlessness, chest tightness, severe coughing, or dizziness, seek immediate medical attention from a qualified physician or hospital emergency room.";
