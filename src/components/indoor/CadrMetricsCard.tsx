"use client";

import React from "react";
import { IndoorRoomConfig, CadrCalculationResult } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import { IndoorPollutionEstimate } from "@/lib/engine/indoor-model";

/**
 * Props for CadrMetricsCard.
 */
export interface CadrMetricsCardProps {
  /** Room configuration being analyzed */
  selectedRoom: IndoorRoomConfig;
  /** CADR engineering analysis outcome */
  cadrResult: CadrCalculationResult;
  /** Indoor single-zone mass balance model estimate */
  indoorEstimate: IndoorPollutionEstimate;
  /** Live or simulated ambient outdoor PM2.5 */
  outdoorPm25: number;
}

/**
 * Renders CADR performance summary, volume, ACH delivery, and protection recommendations.
 */
export function CadrMetricsCard({
  selectedRoom,
  cadrResult,
  indoorEstimate,
  outdoorPm25,
}: CadrMetricsCardProps) {
  return (
    <>
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-600">
              Engineering CADR Assessment
            </span>
            <h4 className="font-serif font-bold text-base text-forest-950">
              {selectedRoom.roomName} — Air Purification Assessment
            </h4>
            <span className="text-xs text-stone-600">
              Room Volume: {cadrResult.roomVolumeCuFt.toLocaleString()} cu ft ({cadrResult.roomVolumeM3} m³)
            </span>
          </div>

          <Badge
            variant={
              cadrResult.status === "optimal"
                ? "teal"
                : cadrResult.status === "adequate"
                ? "warning"
                : "danger"
            }
          >
            {cadrResult.status === "optimal"
              ? "Optimal HEPA Sizing"
              : cadrResult.status === "adequate"
              ? "Moderate Filtration"
              : "Under-Filtered / Missing CADR"}
          </Badge>
        </div>

        {/* Numerical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Target CADR (ACH 4.5)
            </span>
            <span className="text-xl font-serif font-bold text-forest-950">
              {cadrResult.requiredCadrCfm}
            </span>
            <span className="text-[10px] text-stone-600 font-medium block">
              CFM ({cadrResult.requiredCadrM3h} m³/h)
            </span>
          </div>

          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Current ACH Delivery
            </span>
            <span className="text-xl font-serif font-bold text-forest-900">
              {cadrResult.currentAchWithPurifier} ACH
            </span>
            <span className="text-[10px] text-stone-600 font-medium block">
              Target: 4.5+ ACH
            </span>
          </div>

          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Est. Indoor PM2.5
            </span>
            <span className="text-xl font-serif font-bold text-emerald-800">
              {indoorEstimate.estimatedIndoorPm25} µg/m³
            </span>
            <span className="text-[10px] text-stone-600 font-medium block">
              vs {outdoorPm25} µg outdoor
            </span>
          </div>

          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              HEPA Cleaning Ratio
            </span>
            <span className="text-xl font-serif font-bold text-teal-800">
              {indoorEstimate.hepaEffectivenessPercent}%
            </span>
            <span className="text-[10px] text-stone-600 font-medium block">
              Particulate scrub rate
            </span>
          </div>
        </div>

        {/* Infiltration vs Purification Explanations */}
        <div className="space-y-2 pt-2 text-xs">
          {cadrResult.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200"
            >
              <Check className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Transparent Model Assumptions Disclosure */}
      <div className="text-[11px] text-stone-500 p-3 bg-ivory-100/50 rounded-xl border border-stone-200 space-y-1">
        <span className="font-semibold text-forest-950 block">
          Transparent Calculation Methodology & Physics Assumptions:
        </span>
        {indoorEstimate.scientificAssumptions.map((assump, idx) => (
          <p key={idx}>• {assump}</p>
        ))}
      </div>
    </>
  );
}
