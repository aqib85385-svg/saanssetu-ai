import { describe, it, expect } from "vitest";
import { generateFallbackResponse } from "@/lib/gemini/fallback-engine";
import { AiChatResponseSchema } from "@/lib/gemini/schemas";

describe("Rule-Based Deterministic Fallback Engine", () => {
  it("generates validated, grounded response for mask queries in English", () => {
    const res = generateFallbackResponse({
      message: "Should I wear an N95 mask outside today?",
      language: "en",
      context: {
        locationName: "New Delhi",
        aqi: 380,
        category: "Very Poor",
        primaryPollutant: "PM2.5",
      },
    });

    const validated = AiChatResponseSchema.safeParse(res);
    expect(validated.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.reply).toContain("N95");
    expect(res.actionCards.length).toBeGreaterThan(0);
    expect(res.actionCards[0]).toHaveProperty("action");
    expect(res.actionCards[0]).toHaveProperty("reason");
    expect(res.actionCards[0]).toHaveProperty("whoBenefits");
    expect(res.actionCards[0]).toHaveProperty("expectedImpact");
  });

  it("handles Hindi query for morning walks correctly", () => {
    const res = generateFallbackResponse({
      message: "क्या मुझे सुबह की सैर पर जाना चाहिए?",
      language: "hi",
      context: {
        locationName: "नोएडा",
        aqi: 410,
        category: "Severe",
      },
    });

    const validated = AiChatResponseSchema.safeParse(res);
    expect(validated.success).toBe(true);
    expect(res.language).toBe("hi");
    expect(res.reply).toContain("सुबह की सैर");
    expect(res.reply).toContain("इनवर्जन");
  });

  it("truthfully debunks houseplant air filtration myth in fallback", () => {
    const res = generateFallbackResponse({
      message: "Can indoor plants like Areca palm replace air purifiers?",
      language: "en",
    });

    expect(res.reply.toLowerCase()).toContain("no");
    expect(res.reply.toLowerCase()).toContain("cadr");
    expect(res.keyTakeaway.toLowerCase()).toContain("not clean");
  });

  it("handles window and ventilation queries in English and Hindi", () => {
    const resEn = generateFallbackResponse({
      message: "When should we open windows?",
      language: "en",
      context: { aqi: 350, locationName: "Delhi" },
    });
    expect(resEn.reply.toLowerCase()).toContain("sealed");

    const resHi = generateFallbackResponse({
      message: "क्या घर की खिड़की खोल सकते हैं?",
      language: "hi",
      context: { aqi: 150, locationName: "दिल्ली" },
    });
    expect(resHi.reply).toContain("खिड़कियां");
  });

  it("handles exercise queries in English and general queries in Hindi", () => {
    const resEn = generateFallbackResponse({
      message: "Can I go jogging in the park?",
      language: "en",
      context: { aqi: 280 },
    });
    expect(resEn.reply.toLowerCase()).toContain("contraindicated");

    const resHiGeneral = generateFallbackResponse({
      message: "नमस्ते, क्या सुझाव हैं?",
      language: "hi",
      context: { aqi: 320, locationName: "लखनऊ" },
    });
    expect(resHiGeneral.reply).toContain("SaansSetu AI");
  });
});
