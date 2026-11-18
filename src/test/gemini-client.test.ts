import { describe, it, expect } from "vitest";
import { askSaansSetuAssistant } from "@/lib/gemini/client";

describe("Gemini Assistant & Grounded Fallback", () => {
  it("uses deterministic fallback when GEMINI_API_KEY is not set", async () => {
    // Ensure no key is set in test env
    delete process.env.GEMINI_API_KEY;

    const res = await askSaansSetuAssistant({
      message: "Can indoor plants like Areca palms replace my air purifier?",
      language: "en",
      context: {
        locationName: "New Delhi",
        aqi: 320,
        category: "Very Poor",
      },
    });

    expect(res.isFallback).toBe(true);
    expect(res.groundingChecked).toBe(true);
    expect(res.reply.toLowerCase()).toContain("no");
    expect(res.actionCards.length).toBeGreaterThan(0);
    expect(res.followUpSuggestions.length).toBeGreaterThanOrEqual(1);
  });
});
