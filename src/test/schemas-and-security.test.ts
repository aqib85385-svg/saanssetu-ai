import { describe, it, expect } from "vitest";
import { ChatRequestSchema } from "@/lib/gemini/schemas";
import { checkRateLimit } from "@/lib/api/rate-limiter";
import { computeActivityWindows } from "@/lib/aqi/inversion-engine";
import { planDailyRoutine } from "@/lib/engine/routine-planner";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";

describe("Security, Input Validation & Rate Limiting", () => {
  it("rejects empty messages and oversized payloads", () => {
    const emptyResult = ChatRequestSchema.safeParse({ message: "" });
    expect(emptyResult.success).toBe(false);

    const oversizedStr = "A".repeat(1050);
    const oversizedResult = ChatRequestSchema.safeParse({ message: oversizedStr });
    expect(oversizedResult.success).toBe(false);

    const validResult = ChatRequestSchema.safeParse({
      message: "How to protect kids from smog?",
      language: "en",
    });
    expect(validResult.success).toBe(true);
  });

  it("enforces rate limits on repeated requests", () => {
    const testId = `test_client_${Date.now()}`;
    const config = { maxRequests: 3, windowMs: 10000 };

    expect(checkRateLimit(testId, config).allowed).toBe(true);
    expect(checkRateLimit(testId, config).allowed).toBe(true);
    expect(checkRateLimit(testId, config).allowed).toBe(true);
    const blocked = checkRateLimit(testId, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe("Inversion & Routine Planner Logic", () => {
  it("generates 4-phase daily routine plan for severe smog (AQI 380)", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 240 }); // AQI ~390
    const assessment = computeActivityWindows([]);
    const plan = planDailyRoutine(aqiResult, [], assessment);

    expect(plan.commuteGuidance.recommendedWindow).toContain("10:30 AM");
    expect(plan.commuteGuidance.protectiveEquipment).toContain("Mandatory airtight N95");
    expect(plan.commuteGuidance.routeAdvice).toContain("Recirculation");
    expect(plan.exerciseGuidance.canExerciseOutdoors).toBe(false);
    expect(plan.exerciseGuidance.indoorAlternative).toContain("indoor");
    expect(plan.ventilationPlan.canOpenWindows).toBe(false);
  });

  it("generates 4-phase daily routine plan for clean/satisfactory air (AQI 80)", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 25 }); // AQI ~42 (Good)
    const assessment = computeActivityWindows([]);
    const plan = planDailyRoutine(aqiResult, [], assessment);

    expect(plan.commuteGuidance.recommendedWindow).toContain("Standard transit hours");
    expect(plan.commuteGuidance.protectiveEquipment).toContain("Standard comfort gear");
    expect(plan.exerciseGuidance.canExerciseOutdoors).toBe(true);
    expect(plan.exerciseGuidance.indoorAlternative).toContain("Light outdoor jogging");
    expect(plan.exerciseGuidance.bestWindow).toBeDefined();
    expect(plan.ventilationPlan.canOpenWindows).toBe(true);
    expect(plan.ventilationPlan.durationMinutes).toBe(20);
  });

  it("generates 4-phase daily routine plan for moderate air (AQI 160)", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 75 }); // AQI ~150
    const assessment = computeActivityWindows([]);
    const plan = planDailyRoutine(aqiResult, [], assessment);

    expect(plan.commuteGuidance.protectiveEquipment).toContain("N95 mask recommended");
    expect(plan.exerciseGuidance.canExerciseOutdoors).toBe(true); // <= 150
    expect(plan.ventilationPlan.canOpenWindows).toBe(true); // < 180
  });

  it("generates 4-phase daily routine plan for poor air (AQI 220)", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 110 }); // AQI ~267
    const assessment = computeActivityWindows([]);
    const plan = planDailyRoutine(aqiResult, [], assessment);

    expect(plan.commuteGuidance.recommendedWindow).toContain("Standard transit hours"); // <= 300
    expect(plan.commuteGuidance.protectiveEquipment).toContain("N95");
    expect(plan.exerciseGuidance.canExerciseOutdoors).toBe(false); // > 150
    expect(plan.ventilationPlan.canOpenWindows).toBe(false); // >= 180
  });
});
