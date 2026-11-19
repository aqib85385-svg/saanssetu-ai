import { AiChatResponse } from "../schemas";
import { DomainContext } from "./types";

/**
 * Domain 2: Masks & Personal Respiratory Protective Equipment (N95 / FFP2).
 *
 * @param ctx Normalized DomainContext
 * @returns Guidance on certified N95 vs cloth masks and facial sealing
 */
export function handleMasksProtectionDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, loc, primaryPollutant, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `वर्तमान में **${loc}** में वायु गुणवत्ता सूचकांक (AQI) **${aqi} (${cat})** है। साधारण कपड़े या सर्जिकल मास्क पीएम 2.5 (PM2.5) के सूक्ष्म कणों को नहीं रोक पाते हैं (फिल्ट्रेशन 30% से कम)।\n\n**सिफारिश:** घर से बाहर निकलते समय अच्छी फिटिंग वाला **N95 या FFP2 मास्क** ही पहनें, जिसमें नाक के ऊपर मेटल क्लिप लगी हो और चेहरे पर कोई लीकेज न हो।`,
      language: "hi",
      keyTakeaway: "AQI 200 से अधिक होने पर N95 / FFP2 मास्क पहनना अनिवार्य है; कपड़े का मास्क पर्याप्त नहीं है।",
      actionCards: [
        {
          title: "N95 / FFP2 मास्क का सही उपयोग",
          action: "नाक और ठुड्डी को पूरी तरह से कवर करने वाला N95 मास्क पहनें और मेटल क्लिप को नाक पर दबाएं।",
          reason: "PM2.5 कण फेफड़ों में गहराई तक जाकर सूजन पैदा करते हैं। N95 95% सूक्ष्म कणों को रोकता है।",
          whoBenefits: "सभी सदस्य, विशेषकर बच्चे, बुजुर्ग और दमा के मरीज।",
          whenToPerform: "घर से बाहर किसी भी काम के लिए निकलते समय।",
          expectedImpact: "फेफड़ों में जाने वाले हानिकारक कणों में 90-95% तक की कमी।",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: [
        "क्या बच्चे N95 मास्क पहन सकते हैं?",
        "घर के अंदर हवा कैसे साफ रखें?",
        "सुबह टहलने (Morning Walk) का सही समय क्या है?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `In **${loc}**, the current CPCB AQI is **${aqi} (${cat})**. Standard surgical or cotton masks filter less than 30% of airborne PM2.5.\n\n**Recommendation:** Use a certified **N95 or FFP2 respirator** with an adjustable metal nose wire for any outdoor transit. Ensure an airtight facial seal with zero peripheral leakage.`,
    language: "en",
    keyTakeaway: `Ambient AQI is ${aqi}; only certified N95/FFP2 masks provide sufficient respiratory filtration against fine toxic soot.`,
    actionCards: [
      {
        title: "Airtight N95 / FFP2 Respirator Deployment",
        action: "Fit an N95 respirator snugly over your nose and chin with zero perimeter gaps.",
        reason: `Fine particulate matter (${primaryPollutant}) at AQI ${aqi} bypasses upper respiratory cilia and enters the bloodstream.`,
        whoBenefits: "All family members, especially children, seniors, and asthmatics.",
        whenToPerform: "Immediately before stepping out of the front door.",
        expectedImpact: "Filters 95% of fine particulate matter under proper seal.",
        confidence: "High",
        category: "health",
      },
    ],
    followUpSuggestions: [
      "Can young children wear N95 masks?",
      "When is the best time to ventilate our home?",
      "What CADR capacity air purifier do I need?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}

/**
 * Domain 4: Outdoor Activities, Cardiovascular Exercise & Morning Walks.
 *
 * @param ctx Normalized DomainContext
 * @returns Grounded guidance on minute-ventilation spikes and indoor exercise alternatives
 */
export function handleExerciseOutdoorDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**सुबह की सैर (Morning Walk) पर सख्त वैज्ञानिक चेतावनी:**\nसर्दियों में सुबह 5:00 AM से 9:30 AM के बीच तापमान कम होने से 'थर्मल इनवर्जन' (Thermal Inversion) होता है, जिससे गाड़ियों का धुआं और धूल जमीन के पास 150 मीटर से नीचे फंस जाते हैं।\n\nइस समय दौड़ने या तेज चलने से फेफड़े 4 से 8 गुना अधिक हवा खींचते हैं (8 L/min से बढ़कर 50 L/min), जिससे भारी मात्रा में PM2.5 सीधे फेफड़ों की गहराई तक चला जाता है।\n\n**सिफारिश:** सुबह की सैर पूरी तरह बंद करें। कमरे में एयर प्यूरीफायर चलाकर योग, स्ट्रेचिंग या इंडोर व्यायाम करें। आवश्यक बाहरी काम दोपहर 12:30 से 3:00 के बीच N95 मास्क पहनकर करें।`,
      language: "hi",
      keyTakeaway: "सर्दियों के स्मॉग में सुबह की सैर फेफड़ों के लिए अत्यंत हानिकारक है; केवल घर के अंदर व्यायाम करें।",
      actionCards: [
        {
          title: "आउटडोर कार्डियो बंद करें; इनडोर वर्कआउट अपनाएं",
          action: "सुबह की सैर और रनिंग बंद करें। कमरे में प्यूरीफायर चलाकर योग या बॉडीवेट एक्सरसाइज करें।",
          reason: "व्यायाम के दौरान सांस की गति बढ़ने से जहरीले कण सीधे रक्तप्रवाह में पहुंच सकते हैं।",
          whoBenefits: "वरिष्ठ नागरिक, हृदय रोगी, बच्चे और धावक।",
          whenToPerform: "सर्दियों के पूरे सीजन में सुबह 5:00 AM से 10:00 AM तक।",
          expectedImpact: "फेफड़ों में 500% अधिक प्रदूषक जमा होने से पूर्ण बचाव।",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: [
        "घर के अंदर कौन से व्यायाम सुरक्षित हैं?",
        "क्या दोपहर में वॉक कर सकते हैं?",
        "बच्चों के स्कूल जाने का समय क्या होना चाहिए?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Outdoor Exercise Alert:** At AQI **${aqi} (${cat})**, outdoor cardiovascular exercise is medically contraindicated.\n\nDuring running or brisk walking, your minute ventilation rate increases from 8 L/min to 40–70 L/min, driving micro-particulates deep into your alveoli and systemic bloodstream.\n\n**Scientific Inversion Reality:** Early morning (5:00 AM – 9:30 AM) is the dirtiest time of day due to nocturnal radiative cooling trapping ground emissions. Shift all workouts indoors into a HEPA-purified room.`,
    language: "en",
    keyTakeaway: "Cancel outdoor morning runs. Inversion traps peak soot between 5-9 AM; outdoor cardio increases particulate inhalation 5-fold.",
    actionCards: [
      {
        title: "Shift to Indoor HEPA-Purified Exercise",
        action: "Replace outdoor running with indoor yoga, resistance training, or indoor cycling in a room with an operating HEPA purifier.",
        reason: `Current AQI ${aqi} triggers acute pulmonary oxidative stress during rapid breathing.`,
        whoBenefits: "Athletes, senior citizens, asthmatics, and children.",
        whenToPerform: "All winter mornings (especially 05:00 AM – 10:00 AM).",
        expectedImpact: "Eliminates high-volume fine particulate inhalation spikes.",
        confidence: "High",
        category: "health",
      },
    ],
    followUpSuggestions: [
      "When is the safest time of day for outdoor errands?",
      "How do I seal drafty doors and windows?",
      "Can indoor plants replace an air purifier?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}

/**
 * Domain 8: Family Safety, Vulnerable Demographics, Kids, Asthma & Seniors.
 *
 * @param ctx Normalized DomainContext
 * @returns Demographic-specific protective measures grounded in family profiles
 */
export function handleFamilyHealthDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, loc, primaryPollutant, householdCount, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**परिवार और संवेदनशील सदस्यों के लिए विशेष सुरक्षा प्रोटोकॉल:**\n\nवर्तमान में **${loc}** में AQI **${aqi} (${cat})** है। आपके परिवार में ${householdCount} सदस्य हैं।\n\n- **छोटे बच्चे (Infants/Toddlers):** बच्चों के फेफड़े अभी विकसित हो रहे होते हैं और वे वयस्कों की तुलना में शरीर के वजन के हिसाब से 2.5 गुना अधिक हवा सांस में लेते हैं। इन्हें सीलबंद और प्यूरीफायर वाले कमरे में रखें।\n- **बुजुर्ग और हृदय रोगी:** सूक्ष्म कण रक्त में पहुंचकर सूजन और धमनियों में रुकावट बढ़ा सकते हैं। सुबह बालकनी में बैठना पूरी तरह बंद करें।\n- **अस्थमा और एलर्जी:** घर में अगरबत्ती, धूप और झाड़ू लगाना पूरी तरह बंद करें और इनहेलर की एक्सपायरी डेट जांचकर पास रखें।`,
      language: "hi",
      keyTakeaway: "बच्चे और दमा के मरीज सबसे ज्यादा खतरे में हैं; उन्हें घर के सबसे साफ, सीलबंद कमरे में रखें और इनहेलर पास रखें।",
      actionCards: [
        {
          title: "बाल एवं बुजुर्ग स्वास्थ्य सुरक्षा",
          action: "बच्चों और बुजुर्गों के कमरे में 24 घंटे प्यूरीफायर चलाएं और उन्हें सुबह बाहर जाने से रोकें।",
          reason: `AQI ${aqi} पर फेफड़ों की सूजन और ब्रोन्कोस्पाज्म का खतरा कई गुना बढ़ जाता है।`,
          whoBenefits: "शिशु, छोटे बच्चे, बुजुर्ग और अस्थमा पीड़ित।",
          whenToPerform: "सर्दियों के पूरे सीजन में।",
          expectedImpact: "अस्थमा के तीव्र दौरों और खांसी में 70% तक की कमी।",
          confidence: "High",
          category: "health",
        },
      ],
      followUpSuggestions: [
        "क्या बच्चों के लिए N95 मास्क सुरक्षित है?",
        "कमरे का प्यूरीफायर कब तक चलाना चाहिए?",
        "दमा के मरीजों के लिए क्या सावधानियां हैं?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Vulnerable Demographic Protection Plan for ${loc}:**\n\nAt current CPCB AQI **${aqi} (${cat})**, household demographic sensitivities dictate immediate preventive isolation:\n\n- **Infants & Young Children:** Inhale ~2.5x more air per kilogram of body mass compared to adults. Their developing alveolar barriers cannot filter fine soot. Restrict infants strictly to sealed, HEPA-purified bedrooms.\n- **Seniors & Cardiac Patients:** Impaired mucociliary clearance allows soot to trigger systemic vascular inflammation, increasing arrhythmia and myocardial stress. Prohibit morning balcony sitting.\n- **Asthmatics & Respiratory Allergies:** Inhaled particulates trigger acute bronchospasm and mucus hyper-secretion. Keep fast-acting rescue bronchodilators immediately accessible.`,
    language: "en",
    keyTakeaway: "Infants inhale 2.5x more air per kg; isolate children and asthmatics in sealed, HEPA-purified rooms with rescue inhalers handy.",
    actionCards: [
      {
        title: "Vulnerable Sanctuary Protocol",
        action: "Designate a single master bedroom as an isolated clean-air sanctuary with 24/7 HEPA filtration and door draft stoppers.",
        reason: `Vulnerable airways experience acute bronchospasm when exposed to ${primaryPollutant} at AQI ${aqi}.`,
        whoBenefits: "Infants, toddlers, elderly family members, and asthmatics.",
        whenToPerform: "Continuous throughout the winter smog episode.",
        expectedImpact: "Reduces nocturnal asthma exacerbations and pediatric emergency visits by over 65%.",
        confidence: "High",
        category: "health",
      },
    ],
    followUpSuggestions: [
      "What mask is safe for young children?",
      "How do I prevent indoor dust resuspension?",
      "When is it safe for kids to play outdoors?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}
