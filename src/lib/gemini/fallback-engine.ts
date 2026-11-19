import { AiChatResponse, ChatRequest } from "./schemas";
import {
  buildDomainContext,
  isAqiIntent,
  isMaskIntent,
  isVentilationIntent,
  isOutdoorExerciseIntent,
  isPlantsMythIntent,
  isPurifierCadrIntent,
  isCommuteIntent,
  isFamilyHealthIntent,
  isIndoorCombustionIntent,
  isInversionIntent,
} from "./domains/intent-matcher";
import { handleAqiStatusDomain, handleInversionDomain } from "./domains/aqi-domains";
import {
  handleWindowsVentilationDomain,
  handlePurifierCadrDomain,
} from "./domains/indoor-domains";
import {
  handlePlantsMythDomain,
  handleIndoorCombustionDomain,
} from "./domains/indoor-sources-domains";
import {
  handleMasksProtectionDomain,
  handleExerciseOutdoorDomain,
  handleFamilyHealthDomain,
} from "./domains/health-domains";
import {
  handleCommuteDomain,
  handleDefaultGeneralDomain,
} from "./domains/commute-community-domains";
import { DomainContext } from "./domains/types";

export * from "./domains/types";
export * from "./domains/intent-matcher";
export * from "./domains/aqi-domains";
export * from "./domains/indoor-domains";
export * from "./domains/indoor-sources-domains";
export * from "./domains/health-domains";
export * from "./domains/commute-community-domains";

/**
 * Domain router dispatch entries mapping intent predicates to domain handlers.
 */
const DOMAIN_DISPATCHERS: {
  match: (q: string) => boolean;
  handle: (ctx: DomainContext) => AiChatResponse;
}[] = [
  { match: isAqiIntent, handle: handleAqiStatusDomain },
  { match: isMaskIntent, handle: handleMasksProtectionDomain },
  { match: isVentilationIntent, handle: handleWindowsVentilationDomain },
  { match: isOutdoorExerciseIntent, handle: handleExerciseOutdoorDomain },
  { match: isPlantsMythIntent, handle: handlePlantsMythDomain },
  { match: isPurifierCadrIntent, handle: handlePurifierCadrDomain },
  { match: isCommuteIntent, handle: handleCommuteDomain },
  { match: isFamilyHealthIntent, handle: handleFamilyHealthDomain },
  { match: isIndoorCombustionIntent, handle: handleIndoorCombustionDomain },
  { match: isInversionIntent, handle: handleInversionDomain },
];

/**
 * SaansSetu Autonomous Context-Aware Decision & Intelligence Engine.
 *
 * Provides comprehensive, scientifically accurate, zero-cost environmental intelligence
 * without requiring any paid third-party Generative AI API or personal API keys.
 * Answers are strictly grounded in atmospheric physics (CAMS data), Central Pollution
 * Control Board (CPCB) standards, and household demographic profiles.
 *
 * @param req Incoming chat request containing message, language preference, and context
 * @returns Grounded structured response with reply and action cards
 */
export function generateContextAwareResponse(req: ChatRequest): AiChatResponse {
  const ctx = buildDomainContext(req);
  const dispatcher = DOMAIN_DISPATCHERS.find((d) => d.match(ctx.q));
  return dispatcher ? dispatcher.handle(ctx) : handleDefaultGeneralDomain(ctx);
}

/**
 * Backward compatibility alias for generateContextAwareResponse.
 *
 * @param req Incoming chat request
 * @returns Structured AiChatResponse
 */
export function generateFallbackResponse(req: ChatRequest): AiChatResponse {
  return generateContextAwareResponse(req);
}
