import { ChatRequest } from "../schemas";
import { DomainContext } from "./types";

/**
 * Helper to match if any keyword exists in target query.
 */
function hasAnyKeyword(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k));
}

const HINDI_DETECT_WORDS = ["kya", "kaise", "karo", "hawa", "bacho", "khidki", "pradushan"];

/**
 * Builds normalized domain context from an incoming chat request.
 *
 * @param req User chat request payload
 * @returns Structured DomainContext with fallback defaults
 */
export function buildDomainContext(req: ChatRequest): DomainContext {
  const q = req.message.toLowerCase();
  const lang = req.language;
  const {
    aqi = 280,
    category: cat = "Poor",
    locationName: loc = "Delhi-NCR",
    primaryPollutant = "PM2.5",
    householdMembersCount: householdCount = 3,
    hasSensitiveMembers: hasSensitives = false,
    dataSource: sourceLabel = "Copernicus CAMS via Open-Meteo",
  } = req.context || {};

  const isHindi =
    lang === "hi" ||
    /[\u0900-\u097F]/.test(req.message) ||
    hasAnyKeyword(q, HINDI_DETECT_WORDS);

  return {
    q,
    lang,
    isHindi,
    aqi,
    cat,
    loc,
    primaryPollutant,
    householdCount,
    hasSensitives,
    sourceLabel,
  };
}

/** Intent: 1. Current Pollution Level / AQI Status Inquiries */
export function isAqiIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "current aqi",
    "what is the aqi",
    "pollution level",
    "how bad is the air",
    "is air safe",
    "air quality today",
    "हवा कैसी है",
    "प्रदूषण कितना",
    "aqi kitna",
    "pradushan kaisa",
  ]);
}

/** Intent: 2. Masks & Personal Protection (N95 / FFP2) */
export function isMaskIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "mask",
    "n95",
    "ffp2",
    "surgical mask",
    "cloth mask",
    "मास्क",
    "pehn",
  ]);
}

/** Intent: 3. Windows & Indoor Ventilation */
export function isVentilationIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "open window",
    "open windows",
    "close window",
    "close windows",
    "ventilate",
    "ventilation",
    "fresh air",
    "khidki",
    "khol",
    "खिड़की",
    "वेंटिलेशन",
  ]);
}

/** Intent: 4. Outdoor Activities, Exercise & Morning Walks */
export function isOutdoorExerciseIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "walk",
    "exercise",
    "run",
    "jog",
    "gym",
    "cycling",
    "cardio",
    "workout",
    "sports",
    "play outside",
    "park safety",
    "safe in the park",
    "walk in the park",
    "jog in the park",
    "run in the park",
    "पार्क में टहल",
    "पार्क में सैर",
    "पार्क में कसरत",
    "पार्क में दौड़",
    "सैर",
    "घूमना",
    "कसरत",
    "व्यायाम",
    "टहलने",
    "मॉर्निंग वॉक",
    "दौड़ना",
    "दौड़ने",
  ]);
}

/** Intent: 5. Plants vs Air Purifiers Myth */
export function isPlantsMythIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "plant",
    "snake plant",
    "indoor plant",
    "areca palm",
    "spider plant",
    "money plant",
    "areca",
    "पौध",
    "पौधे",
    "पौधा",
    "प्लांट",
    "गमल",
  ]);
}

/** Intent: 6. Indoor Air Protection, CADR Sizing & Air Purifiers */
export function isPurifierCadrIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "purifier",
    "cadr",
    "hepa",
    "filter",
    "air filter",
    "box fan",
    "corsi",
    "corsi-rosenthal",
    "room size",
    "improve air quality in my office",
    "improve air quality in the office",
    "improve air in my office",
    "office air quality",
    "office air purifier",
    "air purifier for office",
    "clean office air",
    "clean air in office",
    "ऑफिस की हवा",
    "प्यूरीफायर",
    "फिल्टर",
    "कमरे की हवा",
  ]);
}

/** Intent: 7. Commute Alternatives & Travel Choices */
export function isCommuteIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "commute",
    "travel",
    "metro",
    "bike",
    "car",
    "bus",
    "traffic",
    "two wheeler",
    "drive to office",
    "commute to office",
    "office commute",
    "कम्यूट",
    "सफर",
    "यात्रा",
    "मेट्रो",
    "गाड़ी",
  ]);
}

/** Intent: 8. Family Safety, Kids, Asthma, Elderly & Sensitive Conditions */
export function isFamilyHealthIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "child",
    "kid",
    "baby",
    "infant",
    "toddler",
    "asthma",
    "elderly",
    "senior",
    "pregnant",
    "heart",
    "grandparent",
    "dadi",
    "protect my family",
    "protect our family",
    "protect the family",
    "family protection",
    "family safety",
    "safe for family",
    "परिवार की सुरक्षा",
    "परिवार को बचाएं",
    "दादी",
    "परिवार",
    "बच्च",
    "बच्चे",
    "दमा",
    "सांस",
    "बुजुर्ग",
  ]);
}

/** Intent: 9. Indoor Combustion & Cleaning Source Control (Jhadu / Agarbatti / Cooking) */
export function isIndoorCombustionIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "agarbatti",
    "dhoop",
    "incense",
    "jhadu",
    "broom",
    "pocha",
    "mop",
    "tadka",
    "mosquito coil",
    "sweeping",
    "cooking pollution",
    "pollution while cooking",
    "reduce indoor pollution while cooking",
    "reduce pollution while cooking",
    "clean my home during high pollution",
    "clean home during pollution",
    "cleaning during pollution",
    "cleaning during smog",
    "indoor pollution",
    "घर की सफाई",
    "रसोई का धुआं",
    "गीला पोछा",
    "अगरबत्ती",
    "धूप",
    "झाड़ू",
    "पोछा",
  ]);
}

/** Intent: 10. Diurnal Atmospheric Inversion Science */
export function isInversionIntent(q: string): boolean {
  return (
    hasAnyKeyword(q, [
      "inversion",
      "temperature inversion",
      "boundary layer",
      "why morning",
      "why night",
      "smog reason",
      "stubble",
      "why smog worse at night",
      "worse in the morning",
      "morning pollution",
      "morning smog",
      "fog associated with",
      "fog and pollution",
      "fog and air quality",
      "कोहरा और प्रदूषण",
      "इनवर्जन",
      "सुबह खराब",
    ]) ||
    (q.includes("धुंध") && !q.includes("धुंधला"))
  );
}
