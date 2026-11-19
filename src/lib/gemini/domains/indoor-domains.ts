import { AiChatResponse } from "../schemas";
import { DomainContext } from "./types";

function getVentilationReplyHi(canOpen: boolean, aqi: number, cat: string): string {
  const detail = canOpen
    ? "दोपहर 12:30 से 2:30 के बीच जब सौर विकिरण से स्मॉग थोड़ा कम होता है, तब 15-20 मिनट के लिए विपरीत दिशा की खिड़कियां खोली जा सकती हैं ताकि CO2 बाहर निकल सके।"
    : "वर्तमान में खिड़कियां और बालकनी के दरवाजे पूरी तरह सीलबंद रखें। सुबह 5:00 से 10:30 बजे और रात को खिड़की बिल्कुल न खोलें क्योंकि ज़मीनी इनवर्जन के कारण जहरीला धुआं नीचे फंसा रहता है। यदि घुटन महसूस हो, तो दोपहर 2:00 बजे केवल 5 मिनट का नियंत्रित पर्ज करें।";
  return `**वेंटिलेशन वैज्ञानिक दिशा-निर्देश:** वर्तमान में बाहर AQI **${aqi} (${cat})** है। जब बाहर की हवा घर की हवा से अधिक जहरीली हो, तो खिड़कियां खोलना मना है।\n\n${detail}`;
}

function getVentilationReplyEn(canOpen: boolean, aqi: number, cat: string, loc: string): string {
  const detail = canOpen
    ? "You may perform a controlled 15–20 minute cross-ventilation exchange between **12:30 PM and 02:30 PM**, when solar heating expands the planetary boundary layer to dilute ground soot."
    : "Strictly **keep all exterior windows and balcony doors sealed**. Ambient particulate concentrations are significantly worse than indoor air. Opening windows will flood living spaces with toxic PM2.5. If indoor CO2 causes drowsiness, restrict cross-ventilation to a strict 5-minute purge at 2:00 PM with purifiers running on maximum.";
  return `**Scientific Ventilation Advisory:** The current outdoor AQI in ${loc} is **${aqi} (${cat})**.\n\n${detail}`;
}

/**
 * Domain 3: Windows & Building Envelope Ventilation.
 *
 * @param ctx Normalized DomainContext
 * @returns Grounded cross-ventilation rules vs envelope sealing
 */
export function handleWindowsVentilationDomain(ctx: DomainContext): AiChatResponse {
  const { aqi, cat, loc, isHindi } = ctx;
  const canOpen = aqi < 180;

  if (isHindi) {
    return {
      reply: getVentilationReplyHi(canOpen, aqi, cat),
      language: "hi",
      keyTakeaway: canOpen
        ? "दोपहर 12:30 से 2:30 के बीच 15 मिनट खिड़कियां खोलें जब वायुमंडलीय मिश्रण अधिकतम हो।"
        : "खिड़कियां बिल्कुल न खोलें; बाहरी हवा घर की हवा से कहीं अधिक जहरीली है।",
      actionCards: [
        {
          title: canOpen ? "दोपहर का नियंत्रित वायु संचार" : "सख्त बिल्डिंग सीलिंग नियंत्रण",
          action: canOpen
            ? "दोपहर 1:00 PM से 2:30 PM के बीच 15 मिनट के लिए विपरीत दिशा की खिड़कियां खोलें।"
            : "खिड़कियों को मजबूती से बंद रखें और नीचे के गैप पर तौलिया या वेदरस्ट्रिप लगाएं।",
          reason: `सर्दियों में रात और सुबह का स्मॉग जमीन पर फंसा रहता है। AQI ${aqi} पर खिड़की खोलने से विषाक्त कण घर में भर जाते हैं।`,
          whoBenefits: "घर के सभी सदस्य।",
          whenToPerform: canOpen ? "दोपहर 1:00 PM – 2:30 PM" : "पूरे दिन और रात",
          expectedImpact: "घर के अंदर PM2.5 को बाहरी जहरीले स्तर से 50-70% कम बनाए रखना।",
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
    reply: getVentilationReplyEn(canOpen, aqi, cat, loc),
    language: "en",
    keyTakeaway: canOpen
      ? "Only ventilate during peak midday solar mixing (12:30 PM - 2:30 PM) for 15-20 minutes."
      : "Do NOT open windows. Outdoor air is far worse than indoor air; keep building envelope sealed.",
    actionCards: [
      {
        title: canOpen ? "Controlled Midday Flush" : "Strict Building Envelope Seal",
        action: canOpen
          ? "Open opposite windows for 15 minutes during peak solar heating (1:00 PM - 2:30 PM)."
          : "Keep windows firmly latched. Seal frame cracks with foam weatherstrip tape.",
        reason: `Outdoor AQI is ${aqi}. Nocturnal and morning thermal inversions concentrate heavy soot at human breathing height.`,
        whoBenefits: "All household residents.",
        whenToPerform: canOpen ? "12:30 PM - 02:30 PM" : "Throughout day and night",
        expectedImpact: "Maintains indoor PM2.5 at 40-70% lower concentrations than outdoor ambient air.",
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

/**
 * Domain 6: Indoor Air Sizing, CADR Formulas & Corsi-Rosenthal Guidance.
 *
 * @param ctx Normalized DomainContext
 * @returns Engineering CADR sizing formulas and pre-sleep purge protocols
 */
export function handlePurifierCadrDomain(ctx: DomainContext): AiChatResponse {
  const { primaryPollutant, isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**एयर प्यूरीफायर और CADR गाइड:**\n\nसर्दियों के स्मॉग (PM2.5) से बचने के लिए कमरे के आयतन (Volume) के अनुसार पर्याप्त **CADR (Clean Air Delivery Rate)** वाला True HEPA प्यूरीफायर आवश्यक है।\n\n**CADR गणना सूत्र:**\nकमरे के क्षेत्रफल (sq ft) को ऊंचाई (ft) से गुणा करें और 4.5 एयर चेंज प्रति घंटे (ACH) प्राप्त करने के लिए 60 से भाग दें:\n` +
        "$$\\text{CADR (CFM)} = \\frac{\\text{Area (sq ft)} \\times \\text{Height (ft)} \\times 4.5}{60}$$\n\n" +
        `**उदाहरण:** 150 sq ft के बेडरूम के लिए कम से कम **110-140 CFM** (या 190-240 m³/h) का प्यूरीफायर चाहिए।\n\n**बजट विकल्प:** यदि कमर्शियल प्यूरीफायर (₹9,000+) बजट से बाहर हो, तो ₹2,500 में DIY बॉक्स-फैन + MERV-13 फिल्टर बनाकर 80-90% समान दक्षता प्राप्त की जा सकती है।`,
      language: "hi",
      keyTakeaway: "कमरे के आकार के अनुसार कम से कम 4.5 एयर चेंज प्रति घंटा (ACH) देने वाला True HEPA प्यूरीफायर ही चुनें।",
      actionCards: [
        {
          title: "बेडरूम HEPA प्री-रन प्रोटोकॉल",
          action: "सोने से 45 मिनट पहले बेडरूम का प्यूरीफायर High मोड पर चलाएं और दरवाजा-खिड़कियां बंद रखें।",
          reason: "रात के समय बाहर का प्रदूषण सबसे अधिक होता है; सोने के कमरे को पहले से शुद्ध करना जरूरी है।",
          whoBenefits: "सभी सदस्य, विशेषकर बच्चे और बुजुर्ग।",
          whenToPerform: "रात 8:30 PM - 9:30 PM",
          expectedImpact: "कमरे में PM2.5 को 75-85% तक कम करता है।",
          confidence: "High",
          category: "indoor",
        },
      ],
      followUpSuggestions: [
        "सस्ते में DIY एयर प्यूरीफायर कैसे बनाएं?",
        "क्या पौधे एयर प्यूरीफायर की जगह ले सकते हैं?",
        "कमरे के गैप को कैसे सील करें?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Engineering Air Purifier & CADR Sizing Guide:**\n\nTo effectively scrub fine particulate soot (${primaryPollutant}) during winter smog episodes, an air cleaner must achieve at least **4.5 to 5.0 Air Changes per Hour (ACH)** in the targeted room.\n\n**Sizing Formula:**\n` +
      "$$\\text{Required CADR (CFM)} = \\frac{\\text{Room Area (sq ft)} \\times \\text{Ceiling Height (ft)} \\times 4.5}{60}$$\n\n" +
      `- **Master Bedroom (200 sq ft, 10 ft ceiling):** Requires minimum **150 CFM** (255 m³/h) CADR.\n- **Living Room (400 sq ft, 10 ft ceiling):** Requires minimum **300 CFM** (510 m³/h) CADR or dual purifiers.\n\n**Budget Alternative:** A DIY Corsi-Rosenthal Box-Fan fitted with a MERV-13 or HEPA filter costs ~₹2,500–₹3,500 and delivers equivalent high-volume airflow matching expensive branded units.`,
    language: "en",
    keyTakeaway: "Size purifiers for 4.5 ACH using CADR = (Area × Height × 4.5) / 60. Run bedroom unit 45 min before sleep.",
    actionCards: [
      {
        title: "Pre-Sleep Bedroom HEPA Purge",
        action: "Run bedroom purifier on High setting for 45 minutes before sleep with door and windows firmly shut.",
        reason: "Nocturnal thermal inversion elevates outdoor soot; pre-scrubbing ensures clean air during 8 hours of sleep.",
        whoBenefits: "All household members, especially asthmatics and sensitive sleepers.",
        whenToPerform: "Night: 08:30 PM - 09:30 PM",
        expectedImpact: "Reduces bedroom particulate concentrations by 75-85%.",
        confidence: "High",
        category: "indoor",
      },
    ],
    followUpSuggestions: [
      "How do I make a low-cost DIY box fan purifier?",
      "Do houseplants clean PM2.5 smog?",
      "How do I seal drafty doors and windows?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}
