import { describe, it, expect } from "vitest";
import {
  assessMemberRisk,
  assessHouseholdRisk,
} from "@/lib/engine/risk-assessment";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";
import { FamilyMember } from "@/types";

describe("Family Vulnerability & Health Risk Engine", () => {
  const severeAqi = calculateCpcbAqi({ pm25: 220 }); // AQI ~375

  it("assigns high vulnerability score to elderly member with COPD", () => {
    const dadi: FamilyMember = {
      id: "mem-1",
      name: "Dadi",
      ageGroup: "elderly",
      sensitivities: ["copd", "cardiovascular"],
      outdoorExposureHoursPerDay: 1,
      commuteType: "wfh",
    };

    const score = assessMemberRisk(dadi, severeAqi);
    expect(score.vulnerabilityScore).toBeGreaterThanOrEqual(70);
    expect(score.riskLevel).toBe("Critical");
    expect(score.maskRecommendation).toBe("Stay strictly indoors");
    expect(score.individualExplanation).toContain("mucociliary");
  });

  it("calculates elevated risk for child with asthma who walks to school", () => {
    const child: FamilyMember = {
      id: "mem-2",
      name: "Aarav",
      ageGroup: "child",
      sensitivities: ["asthma", "respiratory_allergy"],
      outdoorExposureHoursPerDay: 2,
      commuteType: "walk",
    };

    const score = assessMemberRisk(child, severeAqi);
    expect(score.riskLevel).toBe("Critical");
    expect(score.individualExplanation).toContain("bronchospasm");
    expect(score.maskRecommendation).toBe("Stay strictly indoors");
  });

  it("generates household summary with mandatory medical disclaimer", () => {
    const members: FamilyMember[] = [
      {
        id: "mem-1",
        name: "Dadi",
        ageGroup: "elderly",
        sensitivities: ["cardiovascular"],
        outdoorExposureHoursPerDay: 1,
        commuteType: "wfh",
      },
      {
        id: "mem-3",
        name: "Papa",
        ageGroup: "adult",
        sensitivities: [],
        outdoorExposureHoursPerDay: 2,
        commuteType: "metro",
      },
    ];

    const household = assessHouseholdRisk(members, severeAqi);
    expect(household.memberScores.length).toBe(2);
    expect(household.mostVulnerableMember?.memberName).toBe("Dadi");
    expect(household.medicalDisclaimer).toContain("NOT a medical diagnosis");
    expect(household.urgentWarnings.length).toBeGreaterThan(0);
  });

  it("triggers asthma flare advisory and pediatric infant advisory", () => {
    const members: FamilyMember[] = [
      {
        id: "mem-asthma",
        name: "Rahul",
        ageGroup: "adult",
        sensitivities: ["asthma"],
        outdoorExposureHoursPerDay: 2,
        commuteType: "metro",
      },
      {
        id: "mem-infant",
        name: "Baby Ananya",
        ageGroup: "infant",
        sensitivities: [],
        outdoorExposureHoursPerDay: 0.5,
        commuteType: "wfh",
      },
    ];

    const household = assessHouseholdRisk(members, severeAqi);
    expect(household.urgentWarnings.some((w) => w.includes("Asthma Flare Advisory"))).toBe(true);
    expect(household.urgentWarnings.some((w) => w.includes("Pediatric Advisory"))).toBe(true);
  });

  it("evaluates moderate household risk when ambient AQI is satisfactory", () => {
    const cleanAqi = calculateCpcbAqi({ pm25: 25 }); // AQI ~42 (Good)
    const members: FamilyMember[] = [
      {
        id: "mem-adult",
        name: "Vikram",
        ageGroup: "adult",
        sensitivities: [],
        outdoorExposureHoursPerDay: 1,
        commuteType: "metro",
      },
    ];

    const household = assessHouseholdRisk(members, cleanAqi);
    expect(household.highestRiskLevel).toBe("Low");
    expect(household.urgentWarnings.length).toBe(0);
  });

  it("evaluates High and Moderate household risk levels correctly", () => {
    // High risk: elderly member at AQI 220 without critical comms
    const poorAqi = calculateCpcbAqi({ pm25: 110 }); // AQI ~267
    const highRiskMember: FamilyMember = {
      id: "mem-high",
      name: "Suresh",
      ageGroup: "elderly",
      sensitivities: ["cardiovascular"],
      outdoorExposureHoursPerDay: 1,
      commuteType: "wfh",
    };
    // base = 20 + 30 (elderly) + 25 (cardio) - 10 (wfh) = 65
    // aqi 267 / 150 = 1.78
    // total = round(65 * 1.78 * 0.5) = 58 (>= 55 -> "High")
    const householdHigh = assessHouseholdRisk([highRiskMember], poorAqi);
    expect(householdHigh.highestRiskLevel).toBe("High");

    // Moderate risk: adult with allergy at moderate AQI 180
    const moderateAqi = calculateCpcbAqi({ pm25: 85 }); // AQI ~183
    const modRiskMember: FamilyMember = {
      id: "mem-mod",
      name: "Meera",
      ageGroup: "adult",
      sensitivities: ["respiratory_allergy"],
      outdoorExposureHoursPerDay: 2,
      commuteType: "bike_two_wheeler",
    };
    // base = 20 + 5 + 20 + 15 = 60
    // aqi 183 / 150 = 1.22
    // total = round(60 * 1.22 * 0.5) = 37 (>= 35 and < 55 -> "Moderate")
    const householdMod = assessHouseholdRisk([modRiskMember], moderateAqi);
    expect(householdMod.highestRiskLevel).toBe("Moderate");
  });
});
