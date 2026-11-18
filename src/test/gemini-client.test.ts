import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { askSaansSetuAssistant } from "@/lib/gemini/client";

// Mock @google/generative-ai
const mockGenerateContent = vi.fn();
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

describe("Gemini Assistant & Grounded Fallback", () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.GEMINI_API_KEY = originalEnv;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("uses deterministic fallback when GEMINI_API_KEY is not set", async () => {
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

  it("uses deterministic fallback when GEMINI_API_KEY is only whitespace", async () => {
    process.env.GEMINI_API_KEY = "   ";

    const res = await askSaansSetuAssistant({
      message: "Should I wear an N95 mask outside?",
      language: "en",
    });

    expect(res.isFallback).toBe(true);
    expect(res.reply).toContain("N95");
  });

  it("returns validated structured AI response when Gemini API succeeds", async () => {
    process.env.GEMINI_API_KEY = "mock_test_key_ai_success";

    const mockAiPayload = {
      reply: "### Delhi Smog Briefing\nStay indoors as AQI is 340.",
      language: "en",
      keyTakeaway: "AQI is 340 (Very Poor); keep windows sealed and use N95 outdoors.",
      actionCards: [
        {
          title: "Seal Windows",
          action: "Close windows firmly",
          reason: "Particulate intrusion",
          whoBenefits: "Family members",
          whenToPerform: "All day",
          expectedImpact: "70% indoor PM2.5 reduction",
          confidence: "High",
          category: "ventilation",
        },
      ],
      followUpSuggestions: ["What mask to buy?", "How to clean air indoors?", "Is morning walk safe?"],
      groundingChecked: true,
      isFallback: false,
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockAiPayload),
      },
    });

    const res = await askSaansSetuAssistant({
      message: "What should my family do today?",
      language: "en",
      context: {
        locationName: "Delhi",
        aqi: 340,
        category: "Very Poor",
        hasSensitiveMembers: true,
        householdMembersCount: 4,
      },
    });

    expect(res.isFallback).toBe(false);
    expect(res.keyTakeaway).toContain("340");
    expect(res.actionCards.length).toBe(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("handles Hindi language context and prompt generation in live Gemini API", async () => {
    process.env.GEMINI_API_KEY = "mock_test_key_hindi";

    const mockHindiPayload = {
      reply: "### वायु गुणवत्ता सलाह\nआज दिल्ली में AQI 310 है।",
      language: "hi",
      keyTakeaway: "बाहर जाते समय N95 मास्क अवश्य पहनें।",
      actionCards: [
        {
          title: "N95 मास्क अनिवार्य",
          action: "सीलबंद N95 मास्क पहनें",
          reason: "सर्दियों का स्मॉग फेफड़ों में जाता है",
          whoBenefits: "सभी सदस्य",
          whenToPerform: "बाहर जाते समय",
          expectedImpact: "95% सूक्ष्म कणों से बचाव",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: ["क्या खिड़की खोलें?", "सैर पर जाएं?", "HEPA फिल्टर कैसे चुनें?"],
      groundingChecked: true,
      isFallback: false,
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockHindiPayload),
      },
    });

    const res = await askSaansSetuAssistant({
      message: "क्या मुझे बाहर जाना चाहिए?",
      language: "hi",
      context: {
        locationName: "दिल्ली",
        aqi: 310,
        category: "Very Poor",
      },
    });

    expect(res.language).toBe("hi");
    expect(res.isFallback).toBe(false);
  });

  it("falls back gracefully when Gemini API throws a network or quota error", async () => {
    process.env.GEMINI_API_KEY = "mock_test_key_api_error";

    mockGenerateContent.mockRejectedValueOnce(new Error("503 Service Unavailable / Quota Exceeded"));

    const res = await askSaansSetuAssistant({
      message: "Should I wear an N95 mask outside today?",
      language: "en",
      context: { aqi: 360, locationName: "Noida" },
    });

    // Expect graceful fallback instead of an unhandled exception
    expect(res.isFallback).toBe(true);
    expect(res.reply).toContain("N95");
  });

  it("falls back gracefully when Gemini API returns malformed JSON", async () => {
    process.env.GEMINI_API_KEY = "mock_test_key_malformed_json";

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "I am an AI assistant and here is your advice: {malformed json",
      },
    });

    const res = await askSaansSetuAssistant({
      message: "When should we open windows?",
      language: "en",
      context: { aqi: 280 },
    });

    expect(res.isFallback).toBe(true);
    expect(res.reply.toLowerCase()).toContain("sealed");
  });

  it("falls back gracefully when Gemini API returns JSON violating required schema", async () => {
    process.env.GEMINI_API_KEY = "mock_test_key_invalid_schema";

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({ wrongField: 123 }), // Missing reply, keyTakeaway, actionCards
      },
    });

    const res = await askSaansSetuAssistant({
      message: "Can I jog today?",
      language: "en",
      context: { aqi: 250 },
    });

    expect(res.isFallback).toBe(true);
    expect(res.reply.toLowerCase()).toContain("contraindicated");
  });
});
