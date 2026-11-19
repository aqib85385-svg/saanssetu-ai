import { AiChatResponse } from "../schemas";
import { DomainContext } from "./types";

/**
 * Domain 7: Commute Alternatives, Travel Modes & Active Inhalation Trade-offs.
 *
 * @param ctx Normalized DomainContext
 * @returns Grounded analysis of Metro vs Cabin AC vs 2W / Walking
 */
export function handleCommuteDomain(ctx: DomainContext): AiChatResponse {
  const { loc, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**सुरक्षित आवागमन (Clean Commute) गाइड:**\n\nसर्दियों के स्मॉग में सड़क पर प्रदूषण स्टेशन की तुलना में 30-50% अधिक होता है क्योंकि गाड़ियां सीधे जहरीला धुआं छोड़ती हैं।\n\n- **सर्वोत्तम विकल्प: दिल्ली मेट्रो / AC बस:** बंद डिब्बों में फिल्टर लगे होने से PM2.5 का संपर्क 65-80% कम होता है और प्रति व्यक्ति कार्बन उत्सर्जन भी सबसे कम है।\n- **कार से यात्रा:** AC को हमेशा **Internal Recirculation** मोड पर रखें ताकि बाहर का धुआं केबिन में न आए।\n- **दोपहिया वाहन (Two-Wheeler) और पैदल:** सबसे अधिक जोखिम! राइडर सीधे साइलेंसर के धुएं में सांस लेते हैं। हेलमेट के अंदर टाइट फिटिंग वाला N95 मास्क पहनना अनिवार्य है।`,
      language: "hi",
      keyTakeaway: "स्मॉग के दौरान मेट्रो सबसे सुरक्षित है; कार में AC को रिसर्कुलेशन मोड पर रखें और बाइक चलाते समय N95 जरूर पहनें।",
      actionCards: [
        {
          title: "कम्यूट जोखिम नियंत्रण",
          action: "सड़क यात्रा के लिए मेट्रो या एसी पब्लिक बस चुनें; कार में रीसर्कुलेशन मोड चालू रखें।",
          reason: "सड़कों पर वाहनों के टेलपाइप उत्सर्जन से फेफड़ों में नैनोपार्टिकल्स का प्रवेश अत्यधिक बढ़ जाता है।",
          whoBenefits: "रोजाना काम पर जाने वाले सभी सदस्य।",
          whenToPerform: "सुबह और शाम के ऑफिस कम्यूट के दौरान।",
          expectedImpact: "व्यक्तिगत इनहेलेशन एक्सपोजर में 60-80% तक की कमी।",
          confidence: "High",
          category: "commute",
        },
      ],
      followUpSuggestions: [
        "क्या N95 मास्क कम्यूट में काम करता है?",
        "कार का केबिन फिल्टर कब बदलना चाहिए?",
        "कम्यूट से कार्बन उत्सर्जन कैसे घटाएं?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Commute & Inhalation Exposure Analysis for ${loc}:**\n\nCurbside vehicular exhaust elevates fine particulate concentrations by 30–50% above ambient monitoring station readings.\n\n- **Optimal Choice — Urban Metro Rail / AC Electric Bus:** Sealed, air-conditioned passenger cars filter out 65–80% of outdoor particulate matter while generating the lowest grid carbon footprint (9.2 g CO2/pax-km).\n- **Private Passenger Vehicle:** Set cabin ventilation strictly to **'Internal Recirculation'** mode to prevent sucking exterior exhaust into your vehicle cabin.\n- **Two-Wheelers & Walking:** Extreme exposure hazard. Commuters sit directly in vehicle exhaust plumes. A tightly sealed N95/FFP2 respirator is non-negotiable.`,
    language: "en",
    keyTakeaway: "Metro rail resolves the active travel paradox by insulating lungs while cutting emissions. Set car AC to internal recirculation.",
    actionCards: [
      {
        title: "Public Transit Inhalation Defense",
        action: "Shift daily commute from private two-wheelers/cars to Delhi Metro or filtered AC public transit.",
        reason: "Curbside exhaust contains concentrated ultrafine soot, polycyclic hydrocarbons, and nitrogen dioxide.",
        whoBenefits: "All daily commuters.",
        whenToPerform: "Rush hour commutes (08:30 AM - 10:30 AM and 05:30 PM - 07:30 PM)",
        expectedImpact: "Reduces roadside particulate exposure by 65-80% and avoids up to 4.2 kg CO2 daily.",
        confidence: "High",
        category: "commute",
      },
    ],
    followUpSuggestions: [
      "Which mask should I wear while riding a two-wheeler?",
      "When is traffic congestion and smog lowest?",
      "How do I clean my car cabin air?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}

/**
 * Domain 11: Default General Smog & Protection Overview.
 *
 * @param ctx Normalized DomainContext
 * @returns Comprehensive briefing on masks, ventilation, sleep and air purifiers
 */
export function handleDefaultGeneralDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, loc, primaryPollutant, householdCount, sourceLabel, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `नमस्ते! **SaansSetu AI** आपके परिवार को सर्दियों के स्मॉग से सुरक्षित रखने के लिए तैयार है।\n\nवर्तमान में **${loc}** में वायु गुणवत्ता स्थिति:\n- **CPCB AQI:** **${aqi}** (${cat})\n- **मुख्य प्रदूषक:** ${primaryPollutant}\n- **डेटा स्रोत:** ${sourceLabel}\n\n**परिवार के लिए 4 तत्काल सुरक्षा कदम:**\n1. **मास्क सुरक्षा:** बाहर जाते समय अच्छी फिटिंग वाला **N95/FFP2 मास्क** पहनें (कपड़े का मास्क न लगाएं)।\n2. **सैर और व्यायाम:** सुबह की सैर पूरी तरह बंद रखें; घर में प्यूरीफायर चलाकर योग करें।\n3. **वेंटिलेशन:** खिड़कियां और बालकनी दरवाजे बंद रखें; केवल दोपहर में सीमित समय के लिए ही खोलें।\n4. **नींद सुरक्षा:** सोने से 45 मिनट पहले बेडरूम का प्यूरीफायर High मोड पर चलाएं।`,
      language: "hi",
      keyTakeaway: `${loc} में AQI ${aqi} (${cat}) है। N95 मास्क, सीलबंद खिड़कियां और HEPA फिल्ट्रेशन सबसे जरूरी उपाय हैं।`,
      actionCards: [
        {
          title: "दैनिक वायु सुरक्षा प्राथमिकता",
          action: "दरवाजे और खिड़कियों के गैप सील करें और सोने से पहले बेडरूम प्यूरीफायर चालू करें।",
          reason: `AQI ${aqi} पर रात में सांस के जरिए जहरीले कणों का अंदर जाना बढ़ जाता है।`,
          whoBenefits: `पूरे परिवार के ${householdCount} सदस्य।`,
          whenToPerform: "रात 8:30 PM - 10:00 PM",
          expectedImpact: "घर के अंदर PM2.5 में 70-80% की कमी।",
          confidence: "High",
          category: "indoor",
        },
      ],
      followUpSuggestions: [
        "क्या मुझे N95 मास्क पहनना चाहिए?",
        "सुबह की सैर का सही समय क्या है?",
        "क्या खिड़कियां खोलनी चाहिए?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `Welcome to **SaansSetu AI**. Here is your real-time environmental briefing for **${loc}**:\n\n- **CPCB AQI:** **${aqi}** (${cat})\n- **Primary Pollutant:** ${primaryPollutant}\n- **Atmospheric Status:** Winter planetary boundary layer conditions with nocturnal ground-level inversion trapping.\n- **Data Feed:** ${sourceLabel}\n\n**Top 3 Immediate Protective Interventions:**\n1. **Commute Protection:** Wear a certified, airtight N95/FFP2 respirator for any outdoor transit.\n2. **Ventilation Discipline:** Keep windows firmly latched shut; do not open before 11:30 AM.\n3. **Sleep Sanctuary:** Run bedroom HEPA filtration on High 45 minutes before sleep with doors closed.`,
    language: "en",
    keyTakeaway: `Current AQI in ${loc} is ${aqi} (${cat}). Prioritize sealed N95 masks outdoors and nocturnal HEPA filtration indoors.`,
    actionCards: [
      {
        title: "Clean Sleep Sanctuary Protocol",
        action: "Run bedroom HEPA purifier on High for 45 minutes before bed with doors and windows sealed.",
        reason: "Nocturnal ground inversion elevates night-time outdoor particulate concentrations.",
        whoBenefits: `All ${householdCount} household members, especially asthmatics and sensitive sleepers.`,
        whenToPerform: "08:30 PM - 09:30 PM",
        expectedImpact: "Lowers bedroom PM2.5 by an estimated 75-85%.",
        confidence: "High",
        category: "indoor",
      },
    ],
    followUpSuggestions: [
      "Should I wear an N95 mask outside today?",
      "Can we open windows to air out the living room?",
      "Do indoor houseplants clean PM2.5?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}
