import { describe, it, expect } from "vitest";
import {
  assessMemberRisk,
  assessHouseholdRisk,
  RESPONSIBLE_MEDICAL_DISCLAIMER,
} from "@/lib/engine/risk-assessment";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";
import { FamilyMember } from "@/types";

describe("Household Risk Assessment Engine", () => {
  const severeAqi = calculateCpcbAqi({ pm25: 350 });
  const moderateAqi = calculateCpcbAqi({ pm25: 75 });
  const poorAqi = calculateCpcbAqi({ pm25: 110 });
  const goodAqi = calculateCpcbAqi({ pm25: 20 });

  it("assigns high vulnerability to infants and asthmatics during severe smog", () => {
    const infant: FamilyMember = {
      id: "mem-1",
      name: "Baby Aarav",
      ageGroup: "infant",
      sensitivities: [],
      outdoorExposureHoursPerDay: 0,
      commuteType: "wfh",
    };

    const asthmaticSenior: FamilyMember = {
      id: "mem-2",
      name: "Grandmother",
      ageGroup: "elderly",
      sensitivities: ["asthma", "hypertension"],
      outdoorExposureHoursPerDay: 1,
      commuteType: "walk",
    };

    const infantScore = assessMemberRisk(infant, severeAqi);
    const seniorScore = assessMemberRisk(asthmaticSenior, severeAqi);

    expect(infantScore.riskLevel).toBe("Critical");
    expect(infantScore.maskRecommendation).toBe("Stay strictly indoors");
    expect(infantScore.individualExplanation).toContain("alveolar");

    expect(seniorScore.riskLevel).toBe("Critical");
    expect(seniorScore.tailoredGuidance.some((g) => g.includes("inhaler"))).toBe(true);
  });

  it("handles pregnant individual, child, and adult with different sensitivities", () => {
    const pregnant: FamilyMember = {
      id: "p1",
      name: "Expectant Mother",
      ageGroup: "pregnant",
      sensitivities: ["cardiovascular"],
      outdoorExposureHoursPerDay: 1,
      commuteType: "metro",
    };

    const child: FamilyMember = {
      id: "c1",
      name: "School Child",
      ageGroup: "child",
      sensitivities: ["respiratory_allergy", "post_viral_recovery"],
      outdoorExposureHoursPerDay: 1.5,
      commuteType: "bus",
    };

    const adultBiker: FamilyMember = {
      id: "a1",
      name: "Bike Commuter",
      ageGroup: "adult",
      sensitivities: ["diabetes"],
      outdoorExposureHoursPerDay: 2,
      commuteType: "bike_two_wheeler",
    };

    const pregScore = assessMemberRisk(pregnant, poorAqi);
    const childScore = assessMemberRisk(child, moderateAqi);
    const bikerScore = assessMemberRisk(adultBiker, goodAqi);

    expect(pregScore.individualExplanation).toContain("placenta");
    expect(childScore.individualExplanation).toContain("allergic");
    expect(bikerScore.maskRecommendation).toBe("None required");
  });

  it("generates household risk summary with medical disclaimer and empty state handling", () => {
    const emptySummary = assessHouseholdRisk([], severeAqi);
    expect(emptySummary.memberScores).toHaveLength(0);
    expect(emptySummary.medicalDisclaimer).toBe(RESPONSIBLE_MEDICAL_DISCLAIMER);

    const members: FamilyMember[] = [
      {
        id: "m1",
        name: "Father",
        ageGroup: "adult",
        sensitivities: [],
        outdoorExposureHoursPerDay: 2,
        commuteType: "metro",
      },
      {
        id: "m2",
        name: "Grandpa",
        ageGroup: "elderly",
        sensitivities: ["copd"],
        outdoorExposureHoursPerDay: 1,
        commuteType: "walk",
      },
    ];

    const summary = assessHouseholdRisk(members, severeAqi);
    expect(summary.highestRiskLevel).toBe("Critical");
    expect(summary.memberScores).toHaveLength(2);
    expect(summary.urgentWarnings.length).toBeGreaterThan(0);
  });
});
