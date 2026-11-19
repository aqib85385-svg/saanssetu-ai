"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { DollarSign } from "lucide-react";
import { CadrCalculationResult } from "@/types";

/**
 * Props for BudgetPurifierGuide.
 */
export interface BudgetPurifierGuideProps {
  /** Room square footage */
  areaSqFt: number;
  /** CADR calculation result containing budget tier options */
  cadrResult: CadrCalculationResult;
}

/**
 * Budget-sensitive purifier sizing guide with commercial HEPA and DIY box fan alternatives.
 */
export function BudgetPurifierGuide({
  areaSqFt,
  cadrResult,
}: BudgetPurifierGuideProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-serif font-semibold text-sm text-forest-950 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-700" />
          <span>Budget-Sensitive Purifier Sizing Options</span>
        </h4>
        <span className="text-xs text-stone-600 font-medium">
          For {areaSqFt} sq ft space
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cadrResult.budgetOptions.map((opt, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-stone-200 bg-ivory-50/60 flex flex-col justify-between space-y-2 text-xs"
          >
            <div>
              <h5 className="font-semibold text-stone-900">{opt.name}</h5>
              <span className="font-mono font-bold text-teal-800 text-sm block mt-1">
                {opt.approxCostInr}
              </span>
              <span className="text-[11px] text-stone-500">
                Capacity: ~{opt.estimatedCadrCfm} CFM
              </span>
            </div>

            <div className="space-y-1 text-[11px] border-t border-stone-200/60 pt-2">
              <p className="text-emerald-800">
                <span className="font-semibold">Pros:</span> {opt.pros}
              </p>
              <p className="text-stone-500">
                <span className="font-semibold">Cons:</span> {opt.cons}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
