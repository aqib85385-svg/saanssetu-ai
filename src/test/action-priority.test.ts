import { describe, it, expect } from "vitest";
import {
  calculateActionPriorityScore,
  generateDailyActions,
} from "@/lib/engine/action-priority";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";
import { FamilyMember } from "@/types";

describe("Action Priority Score (APS) and Recommendation Engine", () => {
  it("computes bounded APS between 5 and 100 based on pollution and sensitivity", () => {
    // Extreme pollution (AQI 450), highly vulnerable household (multiplier 2.2), critical action (weight 95)
    const severeAps = calculateActionPriorityScore(450, 2.2, 95);
    expect(severeAps).toBeLessThanOrEqual(100);
    expect(severeAps).toBeGreaterThan(80);

    // Clean air (AQI 30), young healthy adults (multiplier 1.0), low weight action (10)
    const lowAps = calculateActionPriorityScore(30, 1.0, 10);
    expect(lowAps).toBeGreaterThanOrEqual(5);
    expect(lowAps).toBeLessThan(15);
  });

  it("prioritizes nocturnal bedroom HEPA purifier for sensitive members during severe smog", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 280, pm10: 410 });
    const members: FamilyMember[] = [
      {
        id: "m1",
        name: "Grandmother",
        ageGroup: "elderly",
        sensitivities: ["copd"],
        outdoorExposureHoursPerDay: 0.5,
        commuteType: "wfh",
      },
    ];

    const actions = generateDailyActions(aqiResult, members, []);
    expect(actions.length).toBeGreaterThan(0);

    // Bedtime purifier action should be top ranked or have very high APS
    const bedroomAction = actions.find((a) => a.id === "bedroom-hepa-night");
    expect(bedroomAction).toBeDefined();
    expect(bedroomAction?.urgency).toBe("Immediate");
    expect(bedroomAction?.whoBenefits).toContain("Infants, elderly");
  });

  it("strictly prohibits dry sweeping (jhadu) and incense burning in actions", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 190 });
    const actions = generateDailyActions(aqiResult, [], []);

    const sourceControl = actions.find((a) => a.id === "indoor-source-control");
    expect(sourceControl).toBeDefined();
    expect(sourceControl?.action.toLowerCase()).toContain("damp");
    expect(sourceControl?.action.toLowerCase()).toContain("agarbatti");
  });

  it("includes scientific plant myth debunking within action priority recommendations", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 220 });
    const actions = generateDailyActions(aqiResult, [], []);

    const plantMythAction = actions.find((a) => a.id === "plant-filtration-fact");
    expect(plantMythAction).toBeDefined();
    expect(plantMythAction?.reason.toLowerCase()).toContain("cadr");
    expect(plantMythAction?.action.toLowerCase()).toContain("hepa");
  });

  it("generates controlled midday air exchange when AQI is moderate (< 200)", () => {
    const moderateAqi = calculateCpcbAqi({ pm25: 65 }); // AQI ~117 (Moderately Polluted)
    const members: FamilyMember[] = [
      {
        id: "m-adult",
        name: "Adult",
        ageGroup: "adult",
        sensitivities: [],
        outdoorExposureHoursPerDay: 2,
        commuteType: "metro",
      },
    ];

    const actions = generateDailyActions(moderateAqi, members, []);
    const ventilationAction = actions.find((a) => a.id === "ventilation-moderate");
    expect(ventilationAction).toBeDefined();
    expect(ventilationAction?.title).toContain("Controlled Midday Air Exchange");
    expect(ventilationAction?.whenToPerform).toContain("12:30 PM");

    const bedroomAction = actions.find((a) => a.id === "bedroom-hepa-night");
    expect(bedroomAction?.whoBenefits).toContain("Entire household");
  });
});
