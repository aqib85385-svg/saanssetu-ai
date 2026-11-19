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
    "window",
    "khidki",
    "ventilate",
    "ventilation",
    "fresh air",
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
    "सैर",
    "घूमना",
    "कसरत",
    "व्यायाम",
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
    "box fan",
    "corsi-rosenthal",
    "प्यूरीफायर",
    "फिल्टर",
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
    "सफर",
    "यात्रा",
    "मेट्रो",
  ]);
}

/** Intent: 8. Family Safety, Kids, Asthma, Elderly & Sensitive Conditions */
export function isFamilyHealthIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "child",
    "kid",
    "baby",
    "toddler",
    "asthma",
    "elderly",
    "pregnant",
    "heart",
    "grandparent",
    "परिवार",
    "बच्च",
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
    "fry",
    "tadka",
    "mosquito coil",
    "अगरबत्ती",
    "धूप",
    "झाड़ू",
  ]);
}

/** Intent: 10. Diurnal Atmospheric Inversion Science */
export function isInversionIntent(q: string): boolean {
  return hasAnyKeyword(q, [
    "inversion",
    "temperature inversion",
    "boundary layer",
    "why smog worse at night",
    "morning smog",
    "इनवर्जन",
  ]);
}
