import { describe, it, expect } from "vitest";
import {
  calculateActionPriorityScore,
  getHouseholdSensitivityMultiplier,
  generateDailyActions,
} from "@/lib/engine/action-priority";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";
import { FamilyMember, IndoorRoomConfig } from "@/types";

describe("Action Priority Score (APS) Engine", () => {
  it("calculates priority scores within [0, 100]", () => {
    const scoreLow = calculateActionPriorityScore(60, 1.0, 50);
    const scoreMed = calculateActionPriorityScore(220, 1.3, 80);
    const scoreHigh = calculateActionPriorityScore(450, 2.0, 95);

    expect(scoreLow).toBeGreaterThanOrEqual(5);
    expect(scoreLow).toBeLessThan(scoreMed);
    expect(scoreMed).toBeLessThan(scoreHigh);
    expect(scoreHigh).toBeLessThanOrEqual(100);
  });

  it("increases sensitivity multiplier for infants, asthmatics, and elderly", () => {
    const baseMembers: FamilyMember[] = [
      {
        id: "1",
        name: "Adult",
        ageGroup: "adult",
        sensitivities: [],
        outdoorExposureHoursPerDay: 1,
        commuteType: "metro",
      },
    ];

    const vulnerableMembers: FamilyMember[] = [
      {
        id: "1",
        name: "Infant",
        ageGroup: "infant",
        sensitivities: [],
        outdoorExposureHoursPerDay: 0,
        commuteType: "wfh",
      },
      {
        id: "2",
        name: "Grandparent",
        ageGroup: "elderly",
        sensitivities: ["asthma", "cardiovascular"],
        outdoorExposureHoursPerDay: 1,
        commuteType: "walk",
      },
    ];

    const baseMult = getHouseholdSensitivityMultiplier(baseMembers);
    const vulnMult = getHouseholdSensitivityMultiplier(vulnerableMembers);

    expect(baseMult).toBe(1.0);
    expect(vulnMult).toBeGreaterThan(baseMult);
    expect(vulnMult).toBeLessThanOrEqual(2.5); // Capped at 2.5
  });

  it("generates recommendations with ALL required metadata fields", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 220 });
    const members: FamilyMember[] = [
      {
        id: "1",
        name: "Child with Asthma",
        ageGroup: "child",
        sensitivities: ["asthma"],
        outdoorExposureHoursPerDay: 1,
        commuteType: "bus",
      },
    ];
    const rooms: IndoorRoomConfig[] = [
      {
        id: "r1",
        roomName: "Bedroom",
        areaSqFt: 150,
        ceilingHeightFt: 10,
        sealingQuality: "poor_drafty",
        hasAirConditioner: true,
        hasPurifier: true,
        purifierCadrCfm: 180,
        indoorSources: ["none"],
      },
    ];

    const actions = generateDailyActions(aqiResult, members, rooms);
    expect(actions.length).toBeGreaterThan(0);

    for (const action of actions) {
      expect(action).toHaveProperty("id");
      expect(action).toHaveProperty("title");
      expect(action).toHaveProperty("action");
      expect(action).toHaveProperty("reason");
      expect(action).toHaveProperty("whoBenefits");
      expect(action).toHaveProperty("whenToPerform");
      expect(action).toHaveProperty("expectedImpact");
      expect(action).toHaveProperty("confidence");
      expect(action).toHaveProperty("assumptions");
      expect(action).toHaveProperty("actionPriorityScore");
      expect(action.actionPriorityScore).toBeGreaterThanOrEqual(5);
      expect(action.actionPriorityScore).toBeLessThanOrEqual(100);
      expect(action.action.length).toBeGreaterThan(10);
      expect(action.reason.length).toBeGreaterThan(10);
    }
  });

  it("NEVER recommends opening windows during severe smog without justification", () => {
    const severeAqi = calculateCpcbAqi({ pm25: 350 });
    const actions = generateDailyActions(severeAqi, []);

    const ventAction = actions.find((a) => a.category === "ventilation");
    expect(ventAction).toBeDefined();
    expect(ventAction?.action.toLowerCase()).toContain("sealed");
  });

  it("explicitly includes scientific clarification debunking plant air purification", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 250 });
    const actions = generateDailyActions(aqiResult, []);

    const plantAction = actions.find((a) => a.id === "plant-filtration-fact");
    expect(plantAction).toBeDefined();
    expect(plantAction?.action.toLowerCase()).toContain("do not rely on potted indoor plants");
    expect(plantAction?.reason.toLowerCase()).toContain("near zero");
  });
});
