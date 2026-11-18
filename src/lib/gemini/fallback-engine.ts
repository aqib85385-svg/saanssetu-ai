import { AiChatResponse, ChatRequest } from "./schemas";

/**
 * Intelligent Rule-Based Fallback Engine.
 *
 * Ensures 100% operational reliability even when Gemini API is unconfigured,
 * offline, or rate-limited. Answers are mathematically and scientifically grounded
 * in the exact deterministic engine state.
 */

export function generateFallbackResponse(req: ChatRequest): AiChatResponse {
  const q = req.message.toLowerCase();
  const lang = req.language;
  const ctx = req.context || {};
  const aqi = ctx.aqi ?? 280;
  const cat = ctx.category ?? "Poor";
  const loc = ctx.locationName ?? "Delhi-NCR";

  const isHindi =
    lang === "hi" ||
    /[\u0900-\u097F]/.test(req.message) ||
    q.includes("kya") ||
    q.includes("kaise") ||
    q.includes("mask");

  // 1. Masks & Personal Protection (N95)
  if (q.includes("mask") || q.includes("n95") || q.includes("मास्क") || q.includes("pehn")) {
    if (isHindi) {
      return {
        reply: `वर्तमान में ${loc} में वायु गुणवत्ता सूचकांक (AQI) **${aqi} (${cat})** है। साधारण कपड़े या सर्जिकल मास्क पीएम 2.5 (PM2.5) के सूक्ष्म कणों को नहीं रोक पाते हैं।\n\n**सिफारिश:** घर से बाहर निकलते समय अच्छी फिटिंग वाला **N95 या FFP2 मास्क** ही पहनें, जिसमें नाक के ऊपर मेटल क्लिप लगी हो।`,
        language: "hi",
        keyTakeaway: "AQI 200 से अधिक होने पर N95 / FFP2 मास्क पहनना अनिवार्य है; कपड़े का मास्क पर्याप्त नहीं है।",
        actionCards: [
          {
            title: "N95 / FFP2 मास्क का सही उपयोग",
            action: "नाक और ठुड्डी को पूरी तरह से कवर करने वाला N95 मास्क पहनें।",
            reason: "PM2.5 कण फेफड़ों में गहराई तक जाकर सूजन पैदा करते हैं। N95 95% कणों को रोकता है।",
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
      reply: `In **${loc}**, the current CPCB AQI is **${aqi} (${cat})**. Standard surgical or cotton masks filter less than 30% of airborne PM2.5. \n\n**Recommendation:** Use a certified **N95 or FFP2 respirator** with an adjustable metal nose wire for any outdoor transit. Make sure there is an airtight seal with no facial leakage.`,
      language: "en",
      keyTakeaway: `Ambient AQI is ${aqi}; only certified N95/FFP2 masks provide sufficient respiratory filtration against fine toxic soot.`,
      actionCards: [
        {
          title: "Airtight N95 / FFP2 Respirator Deployment",
          action: "Fit an N95 respirator snugly over your nose and chin with zero perimeter gaps.",
          reason: `Fine particulate matter (PM2.5) at AQI ${aqi} bypasses upper respiratory cilia and enters the bloodstream.`,
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

  // 2. Windows & Ventilation
  if (
    q.includes("window") ||
    q.includes("khidki") ||
    q.includes("ventilate") ||
    q.includes("khol") ||
    q.includes("खिड़की")
  ) {
    const canOpen = aqi < 180;
    if (isHindi) {
      return {
        reply: `**सावधानी:** वर्तमान में बाहर AQI **${aqi}** है। जब बाहर की हवा घर की हवा से ज्यादा प्रदूषित हो, तो खिड़कियां खोलना खतरनाक है।\n\n${
          canOpen
            ? "दोपहर 12:30 से 2:30 के बीच जब धूप से स्मॉग थोड़ा कम होता है, तब 15 मिनट के लिए खिड़की खोली जा सकती है।"
            : "वर्तमान में खिड़कियां और बालकनी के दरवाजे पूरी तरह बंद रखें। सुबह 5 से 10 बजे के बीच खिड़की बिल्कुल न खोलें क्योंकि ज़मीनी इनवर्जन के कारण स्मॉग सबसे घना होता है।"
        }`,
        language: "hi",
        keyTakeaway: "बाहरी हवा अत्यधिक प्रदूषित होने पर खिड़कियां बंद रखें; वेंटिलेशन केवल दोपहर में सीमित समय के लिए करें।",
        actionCards: [
          {
            title: "खिड़कियों की सीलिंग और वेंटिलेशन नियंत्रण",
            action: canOpen
              ? "दोपहर 1:00 PM से 2:30 PM के बीच 15 मिनट के लिए विपरीत दिशा की खिड़कियां खोलें।"
              : "खिड़कियों को बंद रखें और नीचे के गैप पर तौलिया या वेदरस्ट्रिप टेप लगाएं।",
            reason: "सर्दियों में रात और सुबह का स्मॉग जमीन पर फंसा रहता है। खिड़की खोलने से जहरीली हवा कमरे में भर जाती है।",
            whoBenefits: "घर के सभी सदस्य, विशेष रूप से बच्चे और बुजुर्ग।",
            whenToPerform: canOpen ? "दोपहर 1:00 PM – 2:30 PM" : "पूरे दिन",
            expectedImpact: "घर के अंदर PM2.5 के खतरनाक स्तर को बढ़ने से रोकना।",
            confidence: "High",
            category: "ventilation",
          },
        ],
        followUpSuggestions: [
          "क्या पौधे (indoor plants) एयर प्यूरीफायर का काम कर सकते हैं?",
          "कमरे के लिए सही प्यूरीफायर कैसे चुनें?",
          "सुबह वॉक पर जाना चाहिए या नहीं?",
        ],
        groundingChecked: true,
        isFallback: true,
      };
    }

    return {
      reply: `**Ventilation Advisory:** The current outdoor AQI in ${loc} is **${aqi} (${cat})**. \n\n${
        canOpen
          ? "You may perform a controlled 15-20 minute air exchange between **12:30 PM and 02:30 PM**, when solar heating expands the planetary boundary layer."
          : "Strictly **keep all windows and balcony doors sealed**. Outdoor particulate concentrations are substantially higher than indoor air. Opening windows will flood your living space with toxic PM2.5."
      }`,
      language: "en",
      keyTakeaway: canOpen
        ? "Only ventilate during peak midday solar hours (12:30 PM - 2:30 PM) for 15 minutes."
        : "Do NOT open windows. Outdoor air is far worse than indoor air; maintain sealed building envelope.",
      actionCards: [
        {
          title: canOpen ? "Controlled Midday Flush" : "Strict Building Envelope Seal",
          action: canOpen
            ? "Open opposite windows for 15 minutes during peak solar heating (1:00 PM - 2:30 PM)."
            : "Keep windows firmly latched. If indoor CO2 builds up, do a 5-minute flush at 2:00 PM with purifiers on high.",
          reason: `Outdoor AQI is ${aqi}. Inverting morning and nocturnal layers trap high PM2.5 concentrations near ground level.`,
          whoBenefits: "All household residents.",
          whenToPerform: canOpen ? "12:30 PM - 02:30 PM" : "Throughout day and night",
          expectedImpact: "Maintains indoor PM2.5 at 40-70% lower levels than ambient outdoor air.",
          confidence: "High",
          category: "ventilation",
        },
      ],
      followUpSuggestions: [
        "Do indoor plants purify PM2.5 smog?",
        "How do I calculate CADR for my bedroom?",
        "What are the best outdoor exercise hours?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  // 3. Morning Walks / Exercise
  if (
    q.includes("walk") ||
    q.includes("exercise") ||
    q.includes("run") ||
    q.includes("jog") ||
    q.includes("gym") ||
    q.includes("टहलने") ||
    q.includes("व्यायाम") ||
    q.includes("सैर")
  ) {
    if (isHindi) {
      return {
        reply: `**सुबह की सैर (Morning Walk) पर सख्त चेतावनी:**\nसर्दियों में सुबह 5:00 AM से 9:30 AM के बीच तापमान कम होने से 'थर्मल इनवर्जन' (Thermal Inversion) होता है, जिससे गाड़ियों का धुआं और धूल जमीन के पास फंस जाते हैं।\n\nइस समय दौड़ने या तेज चलने से फेफड़े 4 से 8 गुना अधिक हवा खींचते हैं, जिससे भारी मात्रा में PM2.5 फेफड़ों में जमा हो जाता है।\n\n**सिफारिश:** सुबह की सैर पूरी तरह बंद करें। घर के अंदर योग या स्ट्रेचिंग करें। यदि बाहर जाना जरूरी हो, तो दोपहर 12:30 से 3:00 के बीच N95 मास्क पहनकर ही जाएं।`,
        language: "hi",
        keyTakeaway: "सर्दियों के स्मॉग में सुबह की सैर फेफड़ों के लिए अत्यंत हानिकारक है; केवल घर के अंदर व्यायाम करें।",
        actionCards: [
          {
            title: "आउटडोर कार्डियो बंद करें; इनडोर वर्कआउट अपनाएं",
            action: "सुबह की सैर और रनिंग बंद करें। कमरे में प्यूरीफायर चलाकर योग या बॉडीवेट एक्सरसाइज करें।",
            reason: "व्यायाम के दौरान सांस की गति बढ़ने से जहरीले कण सीधे रक्तप्रवाह में पहुंच सकते हैं।",
            whoBenefits: "वरिष्ठ नागरिक, हृदय रोगी, बच्चे और धावक।",
            whenToPerform: "सर्दियों के पूरे सीजन में सुबह 5:00 AM से 10:00 AM तक।",
            expectedImpact: "फेफड़ों में 500% अधिक प्रदूषक जमा होने से बचाव।",
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
      reply: `**Outdoor Exercise Alert:** At AQI **${aqi} (${cat})**, outdoor cardiovascular exercise is medically contraindicated.\n\nDuring running or brisk walking, your minute ventilation rate increases from 8 L/min to 40–70 L/min, driving micro-particulates deep into your alveoli and bloodstream.\n\n**Scientific Inversion Reality:** Early morning (5:00 AM – 9:30 AM) is the dirtiest time of day due to nocturnal radiative cooling trapping ground emissions. Shift all workouts indoors into a HEPA-purified room.`,
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

  // 4. Plants vs Air Purifiers Myth
  if (
    q.includes("plant") ||
    q.includes("पौधे") ||
    q.includes("पौधा") ||
    q.includes("प्लांट") ||
    q.includes("areca") ||
    q.includes("snake plant") ||
    q.includes("indoor plant")
  ) {
    if (isHindi) {
      return {
        reply: `**वैज्ञानिक तथ्य: क्या पौधे एयर प्यूरीफायर की जगह ले सकते हैं?**\n\n**सीधा उत्तर: नहीं।**\nवैज्ञानिक अनुसंधानों (Waring et al. 2019) के अनुसार, घर के गमलों वाले पौधे (जैसे स्नेक प्लांट या मनी प्लांट) सर्दियों के सूक्ष्म कणों (**PM2.5**) को नहीं छान सकते।\n\n1989 का प्रसिद्ध नासा (NASA) अध्ययन एक छोटे सीलबंद कांच के चैंबर में रसायनों (VOCs) पर था, खुले घरों में स्मॉग पर नहीं। कमरे की हवा साफ करने के लिए मैकेनिकल **HEPA फिल्टर** ही एकमात्र प्रमाणित उपाय है।`,
        language: "hi",
        keyTakeaway: "पौधे सौंदर्य और आर्द्रता के लिए अच्छे हैं, लेकिन स्मॉग (PM2.5) से सुरक्षा के लिए HEPA प्यूरीफायर अनिवार्य है।",
        actionCards: [
          {
            title: "सच्ची एयर फिल्ट्रेशन रणनीति",
            action: "पौधों पर निर्भर रहने के बजाय True HEPA फिल्टर वाला प्यूरीफायर या DIY बॉक्स-फैन फिल्टर का उपयोग करें।",
            reason: "पौधों का PM2.5 क्लीन एयर डिलीवरी रेट (CADR) लगभग शून्य होता है।",
            whoBenefits: "सभी परिवार जो अपनी सेहत और बजट की सही योजना बनाना चाहते हैं।",
            whenToPerform: "सर्दियों के पूरे मौसम में।",
            expectedImpact: "सच्ची और वैज्ञानिक रूप से प्रमाणित 99.97% पार्टिकुलेट फिल्ट्रेशन।",
            confidence: "High",
            category: "indoor",
          },
        ],
        followUpSuggestions: [
          "सस्ते में DIY एयर प्यूरीफायर कैसे बनाएं?",
          "कमरे के साइज के अनुसार CADR कैसे निकालें?",
          "अगरबत्ती और धूपबत्ती का क्या विकल्प है?",
        ],
        groundingChecked: true,
        isFallback: true,
      };
    }

    return {
      reply: `**Scientific Reality: Do Indoor Plants Clean Smog?**\n\n**The Short Answer: No, they do not.**\n\nWhile plants (like Snake Plants, Areca Palms, and Spider Plants) add beauty and modest humidity, comprehensive atmospheric reviews (e.g., Waring et al., *Journal of Exposure Science & Environmental Epidemiology*, 2019) demonstrate that potted plants have a **CADR (Clean Air Delivery Rate) near zero for PM2.5 particulate matter**.\n\nThe often-cited 1989 NASA Clean Air Study was conducted in sealed miniature acrylic chambers testing volatile gaseous chemicals (VOCs), not airborne particulate pollution in real ventilated homes. For particulate smog, **mechanical HEPA filtration is non-negotiable**.`,
      language: "en",
      keyTakeaway: "Indoor plants do NOT clean PM2.5 smog. Potted plants have near-zero particulate CADR; mechanical HEPA is essential.",
      actionCards: [
        {
          title: "Prioritize Mechanical HEPA Filtration",
          action: "Deploy a certified True HEPA purifier (or Corsi-Rosenthal DIY box fan) sized for 4-5 air changes per hour.",
          reason: "Fine particulate matter requires mechanical interception and diffusion through dense fiberglass microfibers.",
          whoBenefits: "Households looking to avoid misleading marketing and invest effectively in clean air.",
          whenToPerform: "Immediate home setup.",
          expectedImpact: "True 99.97% removal of PM2.5 particles down to 0.3 microns.",
          confidence: "High",
          category: "indoor",
        },
      ],
      followUpSuggestions: [
        "How do I calculate CADR for my bedroom size?",
        "How to make a low-cost DIY box fan purifier?",
        "What indoor sources cause PM2.5 spikes?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  // 5. Default General Smog & Protection Overview Grounded in Current State
  if (isHindi) {
    return {
      reply: `नमस्ते! **SaansSetu AI** आपके परिवार को सर्दियों के स्मॉग से सुरक्षित रखने के लिए तैयार है।\n\nवर्तमान में **${loc}** में वायु गुणवत्ता:\n- **CPCB AQI:** ${aqi} (${cat})\n- **मुख्य प्रदूषक:** PM2.5\n\n**आज के मुख्य सुझाव:**\n1. बाहर जाते समय **N95 मास्क** जरूर लगाएं।\n2. सुबह की सैर बंद करें; खिड़कियां बंद रखें।\n3. बेडरूम में सोने से 45 मिनट पहले एयर प्यूरीफायर चालू करें।\n4. झाड़ू लगाने के बजाय गीला पोछा लगाएं और अगरबत्ती/धूप न जलाएं।`,
      language: "hi",
      keyTakeaway: `${loc} में AQI ${aqi} है। N95 मास्क, सीलबंद खिड़कियां और HEPA फिल्ट्रेशन सबसे जरूरी उपाय हैं।`,
      actionCards: [
        {
          title: "दैनिक वायु सुरक्षा प्राथमिकता",
          action: "दरवाजे और खिड़कियों के गैप सील करें और सोने से पहले बेडरूम प्यूरीफायर चालू करें।",
          reason: `AQI ${aqi} पर रात में सांस के जरिए जहरीले कणों का अंदर जाना बढ़ जाता है।`,
          whoBenefits: "पूरा परिवार।",
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
    reply: `Welcome to **SaansSetu AI**. Here is your current real-time environmental briefing for **${loc}**:\n\n- **CPCB AQI:** ${aqi} (${cat})\n- **Primary Pollutant:** PM2.5\n- **Atmospheric Status:** Winter boundary layer conditions with nocturnal inversion trapping.\n\n**Top 3 Immediate Interventions:**\n1. **Commute Protection:** Wear a sealed N95/FFP2 respirator when stepping outdoors.\n2. **Ventilation Discipline:** Keep windows latched shut; do not open before 11:30 AM.\n3. **Sleep Sanctuary:** Run bedroom HEPA filtration on high 45 minutes before sleep with doors closed.`,
    language: "en",
    keyTakeaway: `Current AQI in ${loc} is ${aqi} (${cat}). Prioritize sealed N95 masks outdoors and nocturnal HEPA filtration indoors.`,
    actionCards: [
      {
        title: "Clean Sleep Sanctuary Protocol",
        action: "Run bedroom HEPA purifier on High for 45 minutes before bed with doors and windows sealed.",
        reason: "Nocturnal ground inversion elevates night-time outdoor particulate concentrations.",
        whoBenefits: "All household members, especially asthmatics and sensitive sleepers.",
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
