import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiChatResponse, AiChatResponseSchema, ChatRequest } from "./schemas";
import { generateFallbackResponse } from "./fallback-engine";

export async function askSaansSetuAssistant(
  req: ChatRequest
): Promise<AiChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key configured, use deterministic grounded fallback
  if (!apiKey) {
    return generateFallbackResponse(req);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash for fast, high quality structured reasoning
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for high factual precision
      },
    });

    const ctx = req.context || {};
    const lang = req.language || "en";

    const systemPrompt = `You are SaansSetu AI (साँस सेतु), an elite, scientifically rigorous urban air pollution and winter smog intelligence assistant for Indian families.

DETERMINISTIC ENVIRONMENTAL GROUNDING FACTS (DO NOT ALTER OR HALLUCINATE):
- Current Location: ${ctx.locationName || "Delhi-NCR"}
- Measured CPCB AQI: ${ctx.aqi ?? 280}
- CPCB Category: ${ctx.category || "Poor"}
- Primary Monitored Pollutant: ${ctx.primaryPollutant || "PM2.5"}
- Household Members: ${ctx.householdMembersCount ?? 3} members
- Sensitive Conditions Present: ${ctx.hasSensitiveMembers ? "Yes (Asthma / Child / Elderly)" : "No reported conditions"}

SCIENTIFIC & MEDICAL CONSTRAINTS:
1. Grounding: Ground all numbers strictly on the facts above. Never invent new AQI values.
2. Scientific Honesty: Never present model estimates as measured sensor results.
3. Ventilation Rule: NEVER recommend opening windows when outdoor AQI is worse than indoor air without explicit justification (e.g. brief 5-min CO2 flush at peak midday solar hours 1-2 PM).
4. Plants Myth: DO NOT claim indoor plants meaningfully replace mechanical HEPA filtration for PM2.5. Potted plants have near-zero particulate CADR.
5. Mask Rule: Cloth and surgical masks do not filter fine PM2.5. Only airtight N95/FFP2 respirators provide adequate protection.
6. Language: If language is "hi", reply in fluent, respectful, natural Hindi (Devanagari script), using clear Indian environmental terms (जैसे वायु गुणवत्ता सूचकांक, एन-95 मास्क, सीलबंद खिड़कियां). If "en", reply in polished English.

OUTPUT SCHEMA REQUIREMENT:
Respond with a JSON object matching this schema:
{
  "reply": "string (Markdown formatted answer with clear headings, bullet points, and scientific explanation)",
  "language": "en" | "hi",
  "keyTakeaway": "string (One punchy, memorable sentence summarizing the core advice)",
  "actionCards": [
    {
      "title": "string",
      "action": "string (Clear, specific action)",
      "reason": "string (Scientific reason why it works)",
      "whoBenefits": "string (Specific family members who benefit)",
      "whenToPerform": "string (Exact time or window)",
      "expectedImpact": "string (Expected particulate or health risk reduction)",
      "confidence": "High" | "Medium" | "Estimated",
      "category": "health" | "indoor" | "commute" | "ventilation" | "community"
    }
  ],
  "followUpSuggestions": ["3 relevant, insightful follow-up questions"],
  "groundingChecked": true,
  "isFallback": false
}`;

    const userPrompt = `User Query: """${req.message}"""`;

    // 9 second timeout to prevent hanging user experience
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }, { text: userPrompt }] },
      ],
    });
    clearTimeout(timeoutId);

    const text = result.response.text();
    const parsedJson = JSON.parse(text);
    const validated = AiChatResponseSchema.parse(parsedJson);
    return validated;
  } catch (err) {
    // Graceful fallback to deterministic engine on any API error, quota exhaustion, or schema failure
    return generateFallbackResponse(req);
  }
}
