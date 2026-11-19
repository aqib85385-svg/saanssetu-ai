import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiChatResponse, AiChatResponseSchema, ChatRequest } from "./schemas";
import { generateFallbackResponse } from "./fallback-engine";

function buildSystemPrompt(req: ChatRequest): string {
  const {
    locationName = "Delhi-NCR",
    aqi = 280,
    category = "Poor",
    primaryPollutant = "PM2.5",
    householdMembersCount = 3,
    hasSensitiveMembers = false,
  } = req.context || {};

  const sensitiveStr = hasSensitiveMembers
    ? "Yes (Asthma / Child / Elderly)"
    : "No reported conditions";

  return `You are SaansSetu AI (साँस सेतु), an elite, scientifically rigorous urban air pollution and winter smog intelligence assistant for Indian families.

DETERMINISTIC ENVIRONMENTAL GROUNDING FACTS (DO NOT ALTER OR HALLUCINATE):
- Current Location: ${locationName}
- Measured CPCB AQI: ${aqi}
- CPCB Category: ${category}
- Primary Monitored Pollutant: ${primaryPollutant}
- Household Members: ${householdMembersCount} members
- Sensitive Conditions Present: ${sensitiveStr}

SCIENTIFIC & MEDICAL CONSTRAINTS:
1. Grounding: Ground all numbers strictly on the facts above. Never invent new AQI values.
2. Scientific Honesty: Never present model estimates as measured sensor results.
3. Ventilation Rule: NEVER recommend opening windows when outdoor AQI is worse than indoor air without explicit justification (e.g. brief 5-min CO2 flush at peak midday solar hours 1-2 PM).
4. Plants Myth: DO NOT claim indoor plants meaningfully replace mechanical HEPA filtration for PM2.5. Potted plants have near-zero particulate CADR.
5. Mask Rule: Cloth and surgical masks do not filter fine PM2.5. Only airtight N95/FFP2 respirators provide adequate protection.
6. Language: If language is "hi", reply in fluent, respectful, natural Hindi (Devanagari script), using clear Indian environmental terms. If "en", reply in polished English.

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
}

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const systemPrompt = buildSystemPrompt(req);
    const userPrompt = `User Query: """${req.message}"""`;
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error("Gemini API request timed out after 9 seconds"));
      }, 9000);
    });

    const result = await Promise.race([
      model.generateContent(
        {
          contents: [
            { role: "user", parts: [{ text: systemPrompt }, { text: userPrompt }] },
          ],
        },
        { timeout: 9000, signal: controller.signal }
      ),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);

    const text = result.response.text();
    const parsedJson = JSON.parse(text);
    return AiChatResponseSchema.parse(parsedJson);
  } catch {
    return generateFallbackResponse(req);
  }
}
