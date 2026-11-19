"use client";

import React from "react";
import { FamilyMember, MemberRiskScore } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trash2 } from "lucide-react";

/**
 * Props for the MemberRiskCard component.
 */
export interface MemberRiskCardProps {
  /** Vulnerability assessment output for this specific member */
  score: MemberRiskScore;
  /** Raw profile attributes including age group and commute type */
  rawMember?: FamilyMember;
  /** Handler invoked when removing this profile from household */
  onRemove: (id: string) => void;
}

/**
 * Card displaying an individual family member's smog vulnerability score,
 * biological impact assessment, recommended protective mask, and targeted advice.
 */
export function MemberRiskCard({ score, rawMember, onRemove }: MemberRiskCardProps) {
  const isCritical = score.riskLevel === "Critical";
  const isHigh = score.riskLevel === "High";

  return (
    <Card
      className={`p-5 transition-all flex flex-col justify-between ${
        isCritical
          ? "border-red-300 bg-red-50/20"
          : isHigh
          ? "border-amber-300 bg-amber-50/20"
          : "border-stone-200"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-serif font-bold text-base text-forest-950">
              {score.memberName}
            </h4>
            <span className="text-xs text-stone-500 capitalize">
              {rawMember?.ageGroup} • {rawMember?.commuteType.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={() => onRemove(score.memberId)}
            className="text-stone-500 hover:text-red-600 p-1 rounded hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            title="Remove member"
            aria-label={`Remove member ${score.memberName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vulnerability Meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Smog Vulnerability:</span>
            <Badge
              variant={isCritical ? "danger" : isHigh ? "warning" : "teal"}
              className="text-[11px] font-mono"
            >
              {score.riskLevel} ({score.vulnerabilityScore}/100)
            </Badge>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCritical
                  ? "bg-red-600"
                  : isHigh
                  ? "bg-amber-500"
                  : "bg-teal-600"
              }`}
              style={{ width: `${score.vulnerabilityScore}%` }}
            />
          </div>
        </div>

        {/* Physiological Explanation */}
        <div className="bg-white/80 p-3 rounded-xl border border-stone-200/60 text-xs text-stone-700 leading-relaxed">
          <span className="font-semibold text-stone-900 block mb-0.5">
            Biological Impact:
          </span>
          {score.individualExplanation}
        </div>

        {/* Mask & Transit Recommendation */}
        <div className="text-xs font-medium text-forest-900 bg-forest-50 p-2.5 rounded-xl border border-forest-100">
          <span className="text-stone-500 block text-[10px] uppercase tracking-wider">
            Protective Gear
          </span>
          <span className="font-semibold">{score.maskRecommendation}</span>
        </div>

        {/* Specific Action Guidance */}
        <div className="space-y-1.5 text-xs text-stone-600 pt-1">
          {score.tailoredGuidance.map((g, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-teal-600 font-bold">•</span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
