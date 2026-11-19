import { AiChatResponse } from "../schemas";
import { DomainContext } from "./types";

/**
 * Domain 5: Scientific Debunking of Potted Plants vs Mechanical Purifiers.
 *
 * @param ctx Normalized DomainContext
 * @returns Evidence-based response referencing Waring et al. (2019)
 */
export function handlePlantsMythDomain(ctx: DomainContext): AiChatResponse {
  const { isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**वैज्ञानिक तथ्य: क्या पौधे एयर प्यूरीफायर की जगह ले सकते हैं?**\n\n**सीधा उत्तर: नहीं, बिल्कुल नहीं।**\nवैज्ञानिक अनुसंधानों (Waring et al. 2019) के अनुसार, घर के गमलों वाले पौधे (जैसे स्नेक प्लांट, मनी प्लांट या एरेका पाम) सर्दियों के सूक्ष्म कणों (**PM2.5**) को नहीं छान सकते। उनका CADR लगभग शून्य होता है।\n\n1989 का प्रसिद्ध नासा (NASA) अध्ययन एक छोटे सीलबंद कांच के डिब्बे में रसायनों (VOCs) पर था, खुले घरों में स्मॉग पर नहीं। कमरे की हवा साफ करने के लिए मैकेनिकल **HEPA फिल्टर** ही एकमात्र प्रमाणित उपाय है। पौधे सुंदरता और नमी के लिए अच्छे हैं, पर स्मॉग से नहीं बचा सकते।`,
      language: "hi",
      keyTakeaway: "पौधे सौंदर्य के लिए अच्छे हैं, लेकिन स्मॉग (PM2.5) से सुरक्षा के लिए HEPA प्यूरीफायर अनिवार्य है।",
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
    reply: `**Scientific Reality: Do Indoor Plants Clean Smog?**\n\n**The Short Answer: No, they do not.**\n\nWhile plants (like Snake Plants, Areca Palms, and Spider Plants) add beauty and modest humidity, comprehensive atmospheric reviews (e.g., Waring et al., *Journal of Exposure Science & Environmental Epidemiology*, 2019) demonstrate that potted plants have a **CADR (Clean Air Delivery Rate) near zero for PM2.5 particulate matter**.\n\nThe often-cited 1989 NASA Clean Air Study was conducted in sealed miniature acrylic chambers testing volatile gaseous chemicals (VOCs), not airborne particulate pollution in real ventilated homes. For particulate smog, **mechanical HEPA filtration is non-negotiable**.\n\nTo clean particulate air, high-volume mechanical airflow through dense physical filter media is essential. Potted plants have no mechanical fan or fibrous filter matrix.`,
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

/**
 * Domain 9: Indoor Combustion & Cleaning Source Control (Jhadu / Agarbatti / Cooking).
 *
 * @param ctx Normalized DomainContext
 * @returns Emission elimination guidance for indoor incense, brooming, and frying
 */
export function handleIndoorCombustionDomain(ctx: DomainContext): AiChatResponse {
  const { isHindi } = ctx;

  if (isHindi) {
    return {
      reply: `**घर के अंदर प्रदूषण नियंत्रण (Source Control):**\n\nजब बाहर स्मॉग हो, तो घर के अंदर धुएं और धूल के स्रोतों को खत्म करना सबसे पहला कदम है:\n\n1. **झाड़ू की जगह गीला पोछा:** सूखी झाड़ू लगाने से जमीन पर बैठी धूल हवा में 2 से 4 घंटे तक तैरती रहती है। केवल नम माइक्रोफाइबर पोछा लगाएं।\n2. **अगरबत्ती और धूप बंद करें:** एक अगरबत्ती 2 से 3 सिगरेट के बराबर सूक्ष्म कण (PM2.5) छोड़ती है। इसके बदले इलेक्ट्रिक डिफ्यूज़र या बिना धुएं वाले विकल्प अपनाएं।\n3. **रसोई में तड़का और फ्राइंग:** खाना बनाते समय किचन का एग्जॉस्ट फैन तुरंत चालू करें और किचन का दरवाजा बंद रखें ताकि तेल का धुआं बेडरूम में न फैले।`,
      language: "hi",
      keyTakeaway: "सूखी झाड़ू के बजाय गीला पोछा लगाएं और अगरबत्ती/धूपबत्ती जलाना पूरी तरह बंद करें।",
      actionCards: [
        {
          title: "जीरो-दहन नीति और नम सफाई",
          action: "झाड़ू लगाना बंद करें; नम पोछा लगाएं और अगरबत्ती/मच्छर क्वाइल की जगह लिक्विड वेपोराइज़र का उपयोग करें।",
          reason: "कमरे में अगरबत्ती जलाने से PM2.5 का स्तर 400 से ऊपर पहुंच सकता है।",
          whoBenefits: "घर के सभी सदस्य।",
          whenToPerform: "दैनिक घरेलू सफाई के समय।",
          expectedImpact: "घर के अंदर सूक्ष्म धूल कणों में 70% तक की तत्काल कमी।",
          confidence: "High",
          category: "indoor",
        },
      ],
      followUpSuggestions: [
        "क्या कपूर या धूपबत्ती हवा शुद्ध करती है?",
        "रसोई के धुएं को बेडरूम में जाने से कैसे रोकें?",
        "कमरे का प्यूरीफायर कब ऑन करना चाहिए?",
      ],
      groundingChecked: true,
      isFallback: true,
    };
  }

  return {
    reply: `**Indoor Source Control & Cleaning Hygiene:**\n\nWhen outdoor air is severe, preventing internal particle generation is critical to keeping indoor air cleaner than the street:\n\n1. **Eliminate Dry Sweeping (Jhadu):** Brooming re-suspends settled coarse and fine particulate dust into human breathing zones for 2–4 hours. Switch exclusively to damp microfiber mopping (pocha).\n2. **Cease All Indoor Combustion:** A single burning agarbatti (incense stick) or dhoop cone emits fine PM2.5 mass comparable to 2–3 burning cigarettes. Extinguish mosquito coils and switch to sealed liquid vaporizers.\n3. **Kitchen Exhaust Isolation:** Cooking oils aerosolize into ultrafine droplet plumes during frying and tadka. Run the kitchen range hood on high and close interior kitchen doors to isolate living areas.`,
    language: "en",
    keyTakeaway: "Cease agarbatti and mosquito coil burning; switch strictly from dry brooming to damp microfiber mopping.",
    actionCards: [
      {
        title: "Zero-Combustion & Damp Mopping Protocol",
        action: "Replace dry brooming with damp mopping; extinguish indoor incense and mosquito coils immediately.",
        reason: "Internal combustion creates ultrafine carbonaceous soot that overloads mechanical HEPA filters.",
        whoBenefits: "All household residents.",
        whenToPerform: "Immediate household policy.",
        expectedImpact: "Prevents indoor particulate spikes of 300-500 µg/m³.",
        confidence: "High",
        category: "indoor",
      },
    ],
    followUpSuggestions: [
      "How do I clean kitchen exhaust air?",
      "Do houseplants clean incense smoke?",
      "How long do air purifier filters last?",
    ],
    groundingChecked: true,
    isFallback: true,
  };
}
