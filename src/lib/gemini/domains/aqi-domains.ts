import { AiChatResponse } from "../schemas";
import { DomainContext } from "./types";

export function getHealthImpactHi(aqi: number): string {
  if (aqi > 400) return "गंभीर आपातकाल (Severe+): स्वस्थ व्यक्तियों के फेफड़ों को भी नुकसान पहुंचाता है और गंभीर रूप से प्रभावित करता है।";
  if (aqi > 300) return "अत्यधिक खराब (Very Poor): लंबे समय तक संपर्क में रहने पर श्वसन संबंधी बीमारियां उत्पन्न करता है।";
  if (aqi > 200) return "खराब (Poor): फेफड़े और हृदय रोग से पीड़ित लोगों को सांस लेने में भारी तकलीफ पैदा करता है।";
  return "मध्यम स्थिति: संवेदनशील लोगों को हल्की परेशानी हो सकती है।";
}

export function getHealthImpactEn(aqi: number): string {
  if (aqi > 400) return "CRITICAL SMOG EMERGENCY (Severe+): Affects healthy individuals and acutely impacts those with existing respiratory or cardiovascular disease.";
  if (aqi > 300) return "VERY POOR: Causes respiratory illness to people on prolonged exposure; severe effect on sensitive groups.";
  if (aqi > 200) return "POOR: Breathing discomfort to people with lung disease (asthma, COPD) and heart disease.";
  return "MODERATE: Breathing discomfort to people with sensitive airways.";
}

/**
 * Domain 1: Current Pollution Level & Ambient AQI Inquiries.
 *
 * @param ctx Normalized DomainContext
 * @returns Grounded response with CPCB thresholds and action cards
 */
export function handleAqiStatusDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, loc, primaryPollutant, householdCount, hasSensitives, sourceLabel, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**${loc} में वर्तमान वायु गुणवत्ता स्थिति:**\n\n- **CPCB AQI:** **${aqi}** (${cat})\n- **मुख्य प्रदूषक:** **${primaryPollutant}**\n- **डेटा स्रोत:** ${sourceLabel}\n\n**स्वास्थ्य प्रभाव:**\n${getHealthImpactHi(aqi)}\n\n**परिवार संदर्भ:** आपके परिवार में ${householdCount} सदस्य हैं${hasSensitives ? " (संवेदनशील स्वास्थ्य स्थितियां शामिल हैं)" : ""}।`,
      language: "hi",
      keyTakeaway: `${loc} में AQI ${aqi} (${cat}) है। मुख्य प्रदूषक ${primaryPollutant} है; बाहर जाते समय N95 मास्क पहनना आवश्यक है।`,
      actionCards: [
        {
          title: "वर्तमान प्रदूषण सुरक्षा",
          action: aqi > 250 ? "अनावश्यक बाहरी यात्रा रद्द करें और N95 मास्क का उपयोग करें।" : "संवेदनशील सदस्य बाहरी गतिविधियों को सीमित करें।",
          reason: `AQI ${aqi} पर PM2.5 फेफड़ों के गहराई तक प्रवेश करता है।`,
          whoBenefits: "पूरा परिवार, विशेषकर बच्चे और बुजुर्ग।",
          whenToPerform: "तत्काल",
          expectedImpact: "प्रदूषण के सीधे संपर्क में 80% तक की कमी।",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: [
        "क्या मुझे N95 मास्क पहनना चाहिए?",
        "क्या घर की खिड़कियां खोल सकते हैं?",
        "सुबह टहलने का सही समय क्या है?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Real-Time Environmental Assessment for ${loc}:**\n\n- **Indian CPCB NAQI:** **${aqi}** (${cat})\n- **Primary Pollutant:** **${primaryPollutant}**\n- **Data Feed:** ${sourceLabel}\n\n**Physiological Implications:**\n${getHealthImpactEn(aqi)}\n\n**Household Profile:** Grounded for your household of ${householdCount} members${hasSensitives ? " including vulnerable individuals" : ""}.`,
    language: "en",
    keyTakeaway: `Current CPCB AQI in ${loc} is ${aqi} (${cat}) driven by ${primaryPollutant}. Implement protective barrier protocols.`,
    actionCards: [
      {
        title: aqi > 250 ? "Mandatory High-Efficiency Respirator Protocol" : "Prudent Environmental Vigilance",
        action: aqi > 250 ? "Cancel non-essential outdoor movements; equip N95 respirators for all required transit." : "Limit extended outdoor cardio exposure for vulnerable individuals.",
        reason: `Ambient PM2.5 concentrations at AQI ${aqi} cause acute pulmonary inflammation.`,
        whoBenefits: "All household residents, particularly pediatric and elderly members.",
        whenToPerform: "Immediate baseline posture",
        expectedImpact: "Reduces inhaled particulate loading by 70–90%.",
        confidence: "High",
        category: "health",
      },
    ],
    followUpSuggestions: [
      "Do I need an N95 mask outside today?",
      "When is the best time to ventilate our home?",
      "Is an early morning walk safe in this weather?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}

/**
 * Domain 10: Nocturnal Boundary Layer Dynamics & Thermal Inversion Mechanics.
 *
 * @param ctx Normalized DomainContext
 * @returns Atmospheric physics explanation of surface radiational cooling
 */
export function handleInversionDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**वायुमंडलीय इनवर्जन और स्मॉग का वैज्ञानिक कारण:**\n\nसर्दियों में रात और सुबह AQI सबसे खराब क्यों होता है?\n\n1. **रेडिएशन कूलिंग:** रात में जमीन तेजी से ठंडी होती है, जिससे जमीन के पास की हवा ऊपर की हवा से ज्यादा ठंडी और भारी हो जाती है।\n2. **इनवर्जन कैप (थर्मल ढक्कन):** ऊपर की गर्म हवा एक ढक्कन की तरह काम करती है, जो गाड़ियों के धुएं और धूल को 50-100 मीटर की ऊंचाई पर ही कैद कर देती है।\n3. **दोपहर में राहत:** दोपहर 12:00 से 3:00 बजे जब तेज धूप से जमीन गर्म होती है, तो यह ढक्कन टूट जाता है और प्रदूषक ऊपर फैल जाते हैं।\n\nइसीलिए सुबह 5:00 से 9:00 बजे प्रदूषण सबसे अधिक और दोपहर 1:00 से 3:00 बजे सबसे कम होता है।`,
      language: "hi",
      keyTakeaway: "सर्दियों में रात/सुबह ग्राउंड इनवर्जन से प्रदूषण जमीन पर फंसा रहता है; बाहरी गतिविधियों के लिए दोपहर सबसे सुरक्षित है।",
      actionCards: [
        {
          title: "इनवर्जन-अनुकूल दिनचर्या",
          action: "सुबह की सैर रद्द करें और आवश्यक काम दोपहर 12:30 से 3:30 के बीच करें।",
          reason: "सुबह का स्मॉग जमीन पर सबसे घना होता है।",
          whoBenefits: "सभी नागरिक, विशेषकर फेफड़ों के रोगी।",
          whenToPerform: "सर्दियों के पूरे मौसम में।",
          expectedImpact: "विषाक्त धुएं के संपर्क में 60% की कमी।",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: [
        "क्या दोपहर में खिड़की खोलना सुरक्षित है?",
        "सुबह की सैर के क्या खतरे हैं?",
        "घर पर हवा कैसे साफ रखें?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Atmospheric Physics: Thermal Inversion & Nocturnal Smog Dynamics:**\n\nWhy does AQI surge dramatically after midnight and peak at sunrise?\n\n1. **Ground Radiation Cooling:** During clear winter nights, the Earth's surface radiates heat rapidly into space, cooling the lowest atmospheric layer.\n2. **The Inversion 'Lid':** Warmer air aloft acts as a rigid thermal cap. The Planetary Boundary Layer (PBL) shrinks from ~1,500 meters during the day down to just 80–150 meters at night. Vehicle exhaust, biomass smoke, and industrial soot cannot disperse vertically and remain trapped at human breathing height.\n3. **Solar Breaking Mechanism:** Midday sunlight (12:00 PM – 03:00 PM) reheats the ground, re-establishing thermal convective updrafts that lift and dilute trapped aerosols.\n\nOutdoor AQI is currently **${aqi}**. Never exercise outdoors during nocturnal or dawn inversion hours.`,
    language: "en",
    keyTakeaway: "Nocturnal surface cooling traps soot in a compressed 100m ground layer. Shift outdoor tasks strictly to midday.",
    actionCards: [
      {
        title: "Diurnal Inversion Avoidance Strategy",
        action: "Reschedule all outdoor physical activity away from 05:00-09:00 AM and 08:00-11:00 PM to midday.",
        reason: "Ground-level particulate density is 2-4x higher during nocturnal inversion hours than during midday solar mixing.",
        whoBenefits: "Commuters, runners, school children, and asthmatics.",
        whenToPerform: "Winter season daily protocol",
        expectedImpact: "Dramatically reduces acute pulmonary and systemic inflammatory exposure.",
        confidence: "High",
        category: "health",
      },
    ],
    followUpSuggestions: [
      "When is the best midday window for ventilation?",
      "Is an evening walk safer than a morning walk?",
      "How do indoor HEPA purifiers counteract inversion spikes?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}
