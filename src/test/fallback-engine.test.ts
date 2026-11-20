import { describe, it, expect } from "vitest";
import {
  generateFallbackResponse,
  getHealthImpactHi,
  getHealthImpactEn,
  handleAqiStatusDomain,
  handleInversionDomain,
  handleCommuteDomain,
  handleFamilyHealthDomain,
  handlePurifierCadrDomain,
  handleIndoorCombustionDomain,
} from "@/lib/gemini/fallback-engine";
import { AiChatResponseSchema } from "@/lib/gemini/schemas";
import { DomainContext } from "@/lib/gemini/domains/types";

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

  it("truthfully debunks houseplant air filtration myth in fallback in English and Hindi", () => {
    const res = generateFallbackResponse({
      message: "Can indoor plants like Areca palm replace air purifiers?",
      language: "en",
    });

    expect(res.reply.toLowerCase()).toContain("no");
    expect(res.reply.toLowerCase()).toContain("cadr");
    expect(res.keyTakeaway.toLowerCase()).toContain("not clean");

    const resHi = generateFallbackResponse({
      message: "क्या स्नेक प्लांट और मनी प्लांट घर की हवा साफ करते हैं?",
      language: "hi",
    });

    expect(resHi.reply).toContain("नहीं");
    expect(resHi.reply).toContain("HEPA");
    expect(resHi.keyTakeaway).toContain("HEPA");
  });

  it("provides general English and Hindi briefing when no specific topic matches", () => {
    const resEn = generateFallbackResponse({
      message: "What is the general advice for today?",
      language: "en",
      context: { aqi: 340, locationName: "Faridabad", category: "Very Poor" },
    });
    expect(resEn.reply).toContain("Faridabad");
    expect(resEn.reply).toContain("340");
    expect(resEn.actionCards.length).toBeGreaterThan(0);

    const resHi = generateFallbackResponse({
      message: "आज का सामान्य सुझाव क्या है?",
      language: "hi",
      context: { aqi: 250, locationName: "वाराणसी", category: "Poor" },
    });
    expect(resHi.reply).toContain("वाराणसी");
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

  describe("Restored Hindi & English Domain Keyword Routing (Phase 1)", () => {
    it("routes 'दादी को बाहर जाना चाहिए?' to family health protection", () => {
      const res = generateFallbackResponse({
        message: "दादी को बाहर जाना चाहिए?",
        language: "hi",
        context: { aqi: 350, category: "Very Poor", locationName: "दिल्ली" },
      });
      expect(res.language).toBe("hi");
      expect(res.reply).toContain("बुजुर्ग");
      expect(res.keyTakeaway).toContain("दमा");
    });

    it("routes 'क्या मुझे पार्क में टहलने जाना चाहिए?' to outdoor exercise guidance", () => {
      const res = generateFallbackResponse({
        message: "क्या मुझे पार्क में टहलने जाना चाहिए?",
        language: "hi",
        context: { aqi: 310, category: "Very Poor" },
      });
      expect(res.reply).toContain("सैर");
      expect(res.actionCards[0].category).toBe("health");
    });

    it("routes 'मॉर्निंग वॉक का सही समय' to exercise guidance avoiding dawn inversion", () => {
      const res = generateFallbackResponse({
        message: "मॉर्निंग वॉक का सही समय क्या है?",
        language: "hi",
        context: { aqi: 290, category: "Poor" },
      });
      expect(res.reply).toContain("सुबह की सैर");
    });

    it("routes 'What air filter do I need for my room size?' to CADR sizing", () => {
      const res = generateFallbackResponse({
        message: "What air filter do I need for my room size?",
        language: "en",
        context: { aqi: 320, category: "Very Poor" },
      });
      expect(res.reply).toContain("CADR (CFM)");
      expect(res.reply).toContain("ACH");
      expect(res.actionCards[0].category).toBe("indoor");
    });

    it("routes 'गाड़ी से जाएं या मेट्रो से?' to commute travel mode guidance", () => {
      const res = generateFallbackResponse({
        message: "गाड़ी से जाएं या मेट्रो से?",
        language: "hi",
        context: { aqi: 360, category: "Very Poor" },
      });
      expect(res.language).toBe("hi");
      expect(res.reply).toContain("मेट्रो");
      expect(res.reply).toContain("कार");
      expect(res.actionCards[0].category).toBe("commute");
    });

    it("routes 'Infant smog precautions' to vulnerable family demographic sanctuary", () => {
      const res = generateFallbackResponse({
        message: "What are infant smog precautions?",
        language: "en",
        context: { aqi: 340, category: "Very Poor" },
      });
      expect(res.reply).toContain("Infants & Young Children");
      expect(res.reply).toContain("2.5x more air per kilogram");
    });

    it("routes 'घर में झाड़ू-पोछा कैसे करें?' to indoor source control and wet mopping", () => {
      const res = generateFallbackResponse({
        message: "घर में झाड़ू-पोछा कैसे करें?",
        language: "hi",
      });
      expect(res.language).toBe("hi");
      expect(res.reply).toContain("गीला पोछा");
      expect(res.reply).toContain("झाड़ू");
      expect(res.actionCards[0].category).toBe("indoor");
    });

    it("routes 'Why is pollution worse in the morning?' to diurnal inversion science", () => {
      const res = generateFallbackResponse({
        message: "Why is pollution worse in the morning?",
        language: "en",
        context: { aqi: 390 },
      });
      expect(res.reply).toContain("Ground Radiation Cooling");
      expect(res.reply).toContain("Inversion");
    });

    it("routes 'How does stubble burning affect Delhi air quality?' to atmospheric inversion and smog dynamics", () => {
      const res = generateFallbackResponse({
        message: "How does stubble burning affect Delhi air quality?",
        language: "en",
        context: { aqi: 410, locationName: "Delhi" },
      });
      expect(res.reply).toContain("Thermal Inversion");
      expect(res.actionCards[0].title).toContain("Inversion");
    });

    it("safely distinguishes legitimate environmental queries from unrelated broad keywords and resolves priority overlaps", () => {
      // 1. Positive Legitimate Environmental Queries (English)
      const parkLegRes = generateFallbackResponse({
        message: "Can I jog in the park during high pollution?",
        language: "en",
      });
      expect(parkLegRes.reply.toLowerCase()).toContain("contraindicated");
      expect(parkLegRes.actionCards[0].category).toBe("health");

      const officeLegRes = generateFallbackResponse({
        message: "How can I improve air quality in my office?",
        language: "en",
      });
      expect(officeLegRes.reply).toContain("CADR (CFM)");
      expect(officeLegRes.actionCards[0].category).toBe("indoor");

      const familyLegRes = generateFallbackResponse({
        message: "How can I protect my family from smog?",
        language: "en",
      });
      expect(familyLegRes.reply).toContain("Infants & Young Children");
      expect(familyLegRes.actionCards[0].category).toBe("health");

      const cleaningLegRes = generateFallbackResponse({
        message: "How should I clean my home during high pollution?",
        language: "en",
      });
      expect(cleaningLegRes.reply).toContain("Indoor Source Control & Cleaning Hygiene");
      expect(cleaningLegRes.actionCards[0].category).toBe("indoor");

      const cookingLegRes = generateFallbackResponse({
        message: "How can I reduce indoor pollution while cooking?",
        language: "en",
      });
      expect(cookingLegRes.reply).toContain("Kitchen Exhaust Isolation");
      expect(cookingLegRes.actionCards[0].category).toBe("indoor");

      const fogLegRes = generateFallbackResponse({
        message: "Why is fog associated with poor air quality?",
        language: "en",
      });
      expect(fogLegRes.reply).toContain("Thermal Inversion");
      expect(fogLegRes.actionCards[0].category).toBe("health");

      // 2. Positive Legitimate Environmental Queries (Hindi)
      const parkHiRes = generateFallbackResponse({
        message: "क्या मैं प्रदूषण में पार्क में टहलने जा सकता हूँ?",
        language: "hi",
      });
      expect(parkHiRes.reply).toContain("सैर");

      const officeHiRes = generateFallbackResponse({
        message: "ऑफिस की हवा को कैसे साफ करें?",
        language: "hi",
      });
      expect(officeHiRes.reply).toContain("CADR");

      const familyHiRes = generateFallbackResponse({
        message: "स्मॉग से अपने परिवार की सुरक्षा कैसे करें?",
        language: "hi",
      });
      expect(familyHiRes.reply).toContain("परिवार");

      const cleaningHiRes = generateFallbackResponse({
        message: "प्रदूषण के समय घर की सफाई कैसे करनी चाहिए?",
        language: "hi",
      });
      expect(cleaningHiRes.reply).toContain("गीला पोछा");

      const cookingHiRes = generateFallbackResponse({
        message: "खाना बनाते समय रसोई का धुआं और प्रदूषण कैसे कम करें?",
        language: "hi",
      });
      expect(cookingHiRes.reply).toContain("किचन");

      const fogHiRes = generateFallbackResponse({
        message: "सर्दियों में कोहरा और प्रदूषण एक साथ क्यों बढ़ जाते हैं?",
        language: "hi",
      });
      expect(fogHiRes.reply).toContain("इनवर्जन");

      // 3. Negative Adversarial Unrelated & Mixed Queries (English) -> Safely fall back to General Briefing
      const englishUnrelated = [
        "Jurassic Park movie screening in open air.",
        "Jurassic Park and pollution mentioned in the same sentence.",
        "Corporate office desktop software update.",
        "Office software and air quality mentioned in the same sentence.",
        "Family board game night recommendations.",
        "Family movie night was great despite winter smog outside the window.",
        "Deep cleaning software for laptop registry.",
        "Cooking recipe for butter chicken.",
        "Cooking recipes that mention smoke point of olive oil.",
        "London fog coat brand fashion review.",
        "Fog lamps and winter pollution.",
        "What is your favorite color?",
        "What is the capital of France?",
      ];

      for (const q of englishUnrelated) {
        const res = generateFallbackResponse({
          message: q,
          language: "en",
          context: { locationName: "Delhi-NCR", aqi: 280, category: "Poor" },
        });
        expect(res.reply).toContain("Welcome to **SaansSetu AI**");
        expect(res.reply).toContain("Top 3 Immediate Protective Interventions");
      }

      // 4. Negative Adversarial Unrelated Queries (Hindi) -> Safely fall back to General Briefing
      const hindiUnrelated = [
        "पार्क स्ट्रीट में नया रेस्टोरेंट खुला है",
        "ऑफिस की फाइल ईमेल कर दीजिए",
        "पारिवारिक फिल्म देखने का प्लान है",
        "कंप्यूटर की हार्ड डिस्क की सफाई कैसे करें",
        "पनीर बटर मसाला बनाने की विधि",
        "कोहरे के कारण चश्मे पर धुंधला दिख रहा है",
      ];

      for (const q of hindiUnrelated) {
        const res = generateFallbackResponse({
          message: q,
          language: "hi",
          context: { locationName: "दिल्ली-NCR", aqi: 280, category: "Poor" },
        });
        expect(res.reply).toContain("SaansSetu AI");
        expect(res.reply).toContain("तत्काल सुरक्षा कदम");
      }

      // 5. Dispatch Priority Overlap Resolution:
      // family + mask -> isMaskIntent (Priority 2) takes precedence over isFamilyHealthIntent (Priority 8)
      const familyMaskRes = generateFallbackResponse({
        message: "What mask should our family buy for smog?",
        language: "en",
      });
      expect(familyMaskRes.reply).toContain("N95");
      expect(familyMaskRes.actionCards[0].category).toBe("health");

      // office + purifier -> isPurifierCadrIntent (Priority 6) takes precedence over isCommuteIntent (Priority 7)
      const officePurifierRes = generateFallbackResponse({
        message: "Can we put a HEPA air purifier in our office?",
        language: "en",
      });
      expect(officePurifierRes.reply).toContain("CADR (CFM)");
      expect(officePurifierRes.actionCards[0].category).toBe("indoor");

      // park + pollution ->
      // When asking 'is air safe' (Priority 1 isAqiIntent), AQI status takes precedence
      const parkAqiRes = generateFallbackResponse({
        message: "Is air safe in the park with current pollution?",
        language: "en",
      });
      expect(parkAqiRes.reply).toContain("CPCB NAQI");

      // When asking about outdoor exercise (Priority 4 isOutdoorExerciseIntent)
      const parkExerciseRes = generateFallbackResponse({
        message: "Can I go jogging in the park when pollution is high?",
        language: "en",
      });
      expect(parkExerciseRes.reply.toLowerCase()).toContain("contraindicated");
    });
  });

  describe("Health Impact Helpers across CPCB Ranges (Phase 2)", () => {
    it("evaluates getHealthImpactHi across all 4 severity thresholds", () => {
      expect(getHealthImpactHi(450)).toContain("गंभीर आपातकाल");
      expect(getHealthImpactHi(350)).toContain("अत्यधिक खराब");
      expect(getHealthImpactHi(250)).toContain("खराब");
      expect(getHealthImpactHi(150)).toContain("मध्यम स्थिति");
    });

    it("evaluates getHealthImpactEn across all 4 severity thresholds", () => {
      expect(getHealthImpactEn(450)).toContain("CRITICAL SMOG EMERGENCY");
      expect(getHealthImpactEn(350)).toContain("VERY POOR");
      expect(getHealthImpactEn(250)).toContain("POOR");
      expect(getHealthImpactEn(150)).toContain("MODERATE");
    });
  });

  describe("Direct Domain Handler Behavior and Boundary Coverage (Phase 2)", () => {
    const baseCtx: DomainContext = {
      q: "test query",
      lang: "en",
      isHindi: false,
      aqi: 350,
      cat: "Very Poor",
      loc: "Delhi-NCR",
      primaryPollutant: "PM2.5",
      householdCount: 4,
      hasSensitives: true,
      sourceLabel: "Copernicus CAMS via Open-Meteo",
    };

    it("handles handleAqiStatusDomain with high AQI in English and Hindi", () => {
      const resEnHigh = handleAqiStatusDomain(baseCtx);
      expect(resEnHigh.reply).toContain("**Indian CPCB NAQI:** **350**");
      expect(resEnHigh.actionCards[0].title).toBe("Mandatory High-Efficiency Respirator Protocol");

      const resEnModerate = handleAqiStatusDomain({ ...baseCtx, aqi: 180, cat: "Moderate", hasSensitives: false });
      expect(resEnModerate.actionCards[0].title).toBe("Prudent Environmental Vigilance");

      const resHiHigh = handleAqiStatusDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHiHigh.reply).toContain("**CPCB AQI:** **350**");
      expect(resHiHigh.actionCards[0].action).toContain("N95 मास्क");

      const resHiModerate = handleAqiStatusDomain({ ...baseCtx, isHindi: true, lang: "hi", aqi: 150, hasSensitives: false });
      expect(resHiModerate.actionCards[0].action).toContain("संवेदनशील सदस्य");
    });

    it("handles handleInversionDomain in English and Hindi", () => {
      const resEn = handleInversionDomain(baseCtx);
      expect(resEn.reply).toContain("Atmospheric Physics");
      expect(resEn.actionCards[0].category).toBe("health");

      const resHi = handleInversionDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHi.reply).toContain("वायुमंडलीय इनवर्जन");
      expect(resHi.keyTakeaway).toContain("ग्राउंड इनवर्जन");
    });

    it("handles handleCommuteDomain in English and Hindi", () => {
      const resEn = handleCommuteDomain(baseCtx);
      expect(resEn.reply).toContain("Internal Recirculation");
      expect(resEn.actionCards[0].category).toBe("commute");

      const resHi = handleCommuteDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHi.reply).toContain("दिल्ली मेट्रो");
      expect(resHi.actionCards[0].action).toContain("रीसर्कुलेशन");
    });

    it("handles handleFamilyHealthDomain in English and Hindi", () => {
      const resEn = handleFamilyHealthDomain(baseCtx);
      expect(resEn.reply).toContain("Infants & Young Children");
      expect(resEn.actionCards[0].title).toBe("Vulnerable Sanctuary Protocol");

      const resHi = handleFamilyHealthDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHi.reply).toContain("छोटे बच्चे");
      expect(resHi.reply).toContain("अस्थमा");
      expect(resHi.keyTakeaway).toContain("दमा");
    });

    it("handles handlePurifierCadrDomain in English and Hindi", () => {
      const resEn = handlePurifierCadrDomain(baseCtx);
      expect(resEn.reply).toContain("Required CADR (CFM)");
      expect(resEn.actionCards[0].title).toBe("Pre-Sleep Bedroom HEPA Purge");

      const resHi = handlePurifierCadrDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHi.reply).toContain("CADR गणना सूत्र");
      expect(resHi.reply).toContain("DIY बॉक्स-फैन");
    });

    it("handles handleIndoorCombustionDomain in English and Hindi", () => {
      const resEn = handleIndoorCombustionDomain(baseCtx);
      expect(resEn.reply).toContain("Eliminate Dry Sweeping");
      expect(resEn.actionCards[0].title).toBe("Zero-Combustion & Damp Mopping Protocol");

      const resHi = handleIndoorCombustionDomain({ ...baseCtx, isHindi: true, lang: "hi" });
      expect(resHi.reply).toContain("झाड़ू की जगह गीला पोछा");
      expect(resHi.reply).toContain("अगरबत्ती और धूप");
    });
  });
});
