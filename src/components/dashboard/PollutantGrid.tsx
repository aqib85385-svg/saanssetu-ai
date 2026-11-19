"use client";

import React from "react";
import { PollutantReading } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { getAqiCategoryColor } from "@/lib/utils/formatters";
import { Info, AlertCircle } from "lucide-react";

interface PollutantGridProps {
  pollutants: PollutantReading[];
  missingPollutants?: string[];
}

export function PollutantGrid({
  pollutants,
  missingPollutants = [],
}: PollutantGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
          <span>Multipollutant Sub-Indices</span>
          <span className="text-xs font-sans font-normal text-stone-500">
            (CPCB 24-hr Concentration Standard)
          </span>
        </h2>
        <span className="text-xs text-stone-600 font-medium">
          Showing {pollutants.length} monitored pollutants
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((item) => {
          const colors = getAqiCategoryColor(item.category);
          const isHigh = item.subIndex > 200;

          return (
            <Card
              key={item.code}
              className={`p-3.5 transition-all duration-150 hover:shadow-card-hover ${isHigh ? "border-amber-300/80 bg-amber-50/20" : ""
                }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-xs text-forest-950 uppercase tracking-wider">
                  {item.displayName}
                </span>
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-serif font-bold text-stone-900">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-stone-500">{item.unit}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                  <span className="text-[11px] text-stone-600 font-medium">Sub-Index:</span>
                  <span className={`font-mono font-semibold ${colors.text}`}>
                    {item.subIndex}
                  </span>
                </div>

                <div className="text-[10px] text-stone-500 truncate pt-0.5">
                  Limit: {item.standardLimit24h} {item.unit}
                </div>

                {item.ratioToStandard > 1.0 && (
                  <div className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-center">
                    {item.ratioToStandard}x Safe Limit
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {/* Missing pollutants transparent disclosure */}
        {missingPollutants.map((code) => (
          <Card key={code} className="p-3.5 bg-stone-50/80 border-dashed border-stone-300">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs text-stone-600 uppercase tracking-wider">
                {code}
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div className="mt-3 space-y-1 text-center">
              <span className="text-xs text-stone-600 font-medium block">
                Not Monitored
              </span>
              <p className="text-[10px] text-stone-600 font-medium">
                Station lacks sensor
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
