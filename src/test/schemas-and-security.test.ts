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
  it("generates 4-phase daily routine plan with commute and ventilation guidance", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 240 });
    const hourlyMock = [
      {
        time: "2026-11-19T06:00:00Z",
        hourFormatted: "6 AM",
        pm25: 310,
        pm10: 420,
        aqi: 380,
        category: "Very Poor" as const,
        isObservation: true,
      },
      {
        time: "2026-11-19T13:00:00Z",
        hourFormatted: "1 PM",
        pm25: 160,
        pm10: 240,
        aqi: 220,
        category: "Poor" as const,
        isObservation: false,
      },
    ];

    const assessment = computeActivityWindows(hourlyMock);
    const plan = planDailyRoutine(aqiResult, [], assessment);

    expect(plan.commuteGuidance.protectiveEquipment).toContain("N95");
    expect(plan.exerciseGuidance.canExerciseOutdoors).toBe(false);
    expect(plan.exerciseGuidance.indoorAlternative).toContain("indoor");
    expect(plan.ventilationPlan.canOpenWindows).toBe(false);
  });
});
