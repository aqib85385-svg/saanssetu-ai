"use client";

import React from "react";
import { AlertCircle, Clock, Database, Radio, Sparkles, Activity } from "lucide-react";
import { CpcbAqiResult } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { CPCB_CATEGORY_DETAILS } from "@/lib/aqi/cpcb-standards";

interface AqiOverviewCardProps {
  aqiResult: CpcbAqiResult;
  locationName: string;
  source: string;
  lastUpdated: string;
  isObservation: boolean;
  topPriorityScore?: number;
}

export function AqiOverviewCard({
  aqiResult,
  locationName,
  source,
  lastUpdated,
  isObservation,
  topPriorityScore,
}: AqiOverviewCardProps) {
  const details = CPCB_CATEGORY_DETAILS[aqiResult.category];
  const primaryPollutantObj = aqiResult.pollutants.find(
    (p) => p.code === aqiResult.pollutantCode
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/90 shadow-card p-6 sm:p-8">
      {/* Subtle top severity gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-2 transition-all duration-300"
        style={{ backgroundColor: aqiResult.color }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Main AQI Number and Category */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-600">
              Indian CPCB NAQI
            </span>
            <Badge
              variant={
                aqiResult.aqi > 300
                  ? "hazard"
                  : aqiResult.aqi > 200
                  ? "danger"
                  : aqiResult.aqi > 100
                  ? "warning"
                  : "success"
              }
              className="font-mono text-xs"
            >
              {details.category}
            </Badge>

            {/* Forecast vs Observation Badge */}
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              <Radio className={`w-3 h-3 ${isObservation ? "text-emerald-500" : "text-amber-500 animate-pulse"}`} />
              {isObservation ? "Ground Station Observation" : "Copernicus CAMS Model Forecast"}
            </span>

            {aqiResult.isExtrapolated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                Extrapolated Scale (&gt; 350 µg/m³)
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span
              className="text-6xl sm:text-7xl font-serif font-black tracking-tight"
              style={{ color: aqiResult.color }}
            >
              {aqiResult.aqi}
            </span>
            <div className="space-y-1">
              <p className="text-xs text-stone-600 uppercase font-medium">Primary Pollutant</p>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-800 text-base">
                  {aqiResult.primaryPollutant}
                </span>
                {primaryPollutantObj && (
                  <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono">
                    {primaryPollutantObj.ratioToStandard}x 24h limit
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CPCB Scale Bar */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between text-[10px] text-stone-600 font-medium pb-1">
              <span>0 Good</span>
              <span>100 Mod</span>
              <span>200 Poor</span>
              <span>300 V.Poor</span>
              <span>400 Severe</span>
              <span>500+</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
              <div className="w-[10%] bg-emerald-500" title="Good (0-50)" />
              <div className="w-[10%] bg-lime-500" title="Satisfactory (51-100)" />
              <div className="w-[20%] bg-amber-500" title="Moderately Polluted (101-200)" />
              <div className="w-[20%] bg-orange-500" title="Poor (201-300)" />
              <div className="w-[20%] bg-red-500" title="Very Poor (301-400)" />
              <div className="w-[20%] bg-red-800" title="Severe (401-500)" />
            </div>
          </div>
        </div>

        {/* Right: Health Impact & Action Priority Card */}
        <div className="lg:max-w-md space-y-4 bg-ivory-50/90 rounded-2xl p-5 border border-ivory-200/80">
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-forest-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-forest-700" />
                Health Impact & Advisory
              </span>
              {topPriorityScore && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-forest-900 text-teal-300 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400" />
                  APS: {topPriorityScore}/100
                </span>
              )}
            </div>
            <p className="text-xs text-stone-700 font-medium leading-relaxed">
              {aqiResult.healthStatement}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-200/60">
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1">
              Immediate Recommendation
            </span>
            <p className="text-xs text-forest-950 font-medium leading-relaxed">
              {aqiResult.cautionaryStatement}
            </p>
          </div>

          {/* Attribution & Timestamp Metadata */}
          <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
            <span className="flex items-center gap-1" title={source}>
              <Database className="w-3 h-3 text-stone-500" />
              CAMS Global Data
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500" />
              Updated {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
