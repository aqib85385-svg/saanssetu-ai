import { AiChatResponse, ChatRequest } from "../schemas";

/**
 * Normalised environmental and demographic context for conversational handlers.
 */
export interface DomainContext {
  /** Lowercased incoming query message */
  q: string;
  /** Requested language code ('en' | 'hi') */
  lang: string;
  /** Whether the query was detected as Hindi or Hinglish */
  isHindi: boolean;
  /** Live or simulated CPCB AQI value */
  aqi: number;
  /** CPCB Category (e.g. 'Poor', 'Very Poor', 'Severe') */
  cat: string;
  /** Geographical location name (e.g. 'Delhi-NCR') */
  loc: string;
  /** Primary driving pollutant code (e.g. 'PM2.5') */
  primaryPollutant: string;
  /** Total count of household members */
  householdCount: number;
  /** Whether vulnerable or sensitive demographic members exist */
  hasSensitives: boolean;
  /** Atmospheric data source provenance string */
  sourceLabel: string;
}

/**
 * Functional handler contract for specialized domain responders.
 */
export type DomainHandler = (ctx: DomainContext) => AiChatResponse;
