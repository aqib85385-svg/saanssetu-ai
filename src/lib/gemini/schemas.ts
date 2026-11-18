import { z } from "zod";

export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters")
    .transform((str) => str.trim()),
  language: z.enum(["en", "hi"]).default("en"),
  context: z
    .object({
      locationName: z.string().optional(),
      aqi: z.number().int().min(0).max(999).optional(),
      category: z.string().optional(),
      primaryPollutant: z.string().optional(),
      householdVulnerability: z.string().optional(),
      householdMembersCount: z.number().int().min(0).max(20).optional(),
      hasSensitiveMembers: z.boolean().optional(),
      dataSource: z.string().optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ActionCardSchema = z.object({
  title: z.string(),
  action: z.string(),
  reason: z.string(),
  whoBenefits: z.string(),
  whenToPerform: z.string(),
  expectedImpact: z.string(),
  confidence: z.enum(["High", "Medium", "Estimated"]).default("High"),
  category: z.enum(["health", "indoor", "commute", "ventilation", "community"]).default("health"),
});

export type ActionCard = z.infer<typeof ActionCardSchema>;

export const AiChatResponseSchema = z.object({
  reply: z.string().min(1),
  language: z.enum(["en", "hi"]).default("en"),
  keyTakeaway: z.string().min(1),
  actionCards: z.array(ActionCardSchema).default([]),
  followUpSuggestions: z.array(z.string()).min(1).max(5),
  groundingChecked: z.boolean().default(true),
  isFallback: z.boolean().default(false),
});

export type AiChatResponse = z.infer<typeof AiChatResponseSchema>;
