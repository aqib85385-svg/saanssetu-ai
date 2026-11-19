"use client";

import React from "react";
import { ActionCard } from "@/lib/gemini/schemas";
import { Badge } from "@/components/ui/Badge";

/**
 * Props for ActionCardItem.
 */
export interface ActionCardItemProps {
  /** Structured action recommendation from Gemini response */
  card: ActionCard;
}

/**
 * Renders an individual action card returned in assistant structured responses.
 */
export function ActionCardItem({ card }: ActionCardItemProps) {
  return (
    <div className="p-3 rounded-xl bg-ivory-50/90 border border-stone-200 space-y-1.5 text-xs text-stone-800">
      <div className="flex items-center justify-between">
        <span className="font-serif font-bold text-forest-950">
          {card.title}
        </span>
        <Badge variant="teal" className="text-[10px]">
          {card.whenToPerform}
        </Badge>
      </div>
      <p className="font-medium text-stone-900">{card.action}</p>
      <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
        <span className="font-semibold text-stone-700">Reason:</span>{" "}
        {card.reason}
      </div>
      <div className="text-[11px] text-emerald-800">
        <span className="font-semibold">Expected Impact:</span>{" "}
        {card.expectedImpact}
      </div>
    </div>
  );
}
