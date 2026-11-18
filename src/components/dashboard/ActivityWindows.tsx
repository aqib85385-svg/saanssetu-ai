"use client";

import React from "react";
import { ActivityWindowAssessment } from "@/lib/aqi/inversion-engine";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CheckCircle2, XCircle, Sun, ShieldAlert, Sparkles, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ActivityWindowsProps {
  assessment: ActivityWindowAssessment;
}

export function ActivityWindows({ assessment }: ActivityWindowsProps) {
  const { bestWindow, worstWindow, summaryExplanation } = assessment;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>Diurnal Activity Windows</span>
          </h4>
          <p className="text-xs text-stone-500">{summaryExplanation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Window Card */}
        <div className="rounded-2xl p-5 border border-emerald-300/80 bg-emerald-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-emerald-800 tracking-wider">
                  Safest Outdoor Window
                </span>
                <h5 className="font-serif font-bold text-base text-forest-950">
                  {bestWindow.title}
                </h5>
              </div>
            </div>
            <Badge variant="success" className="text-xs font-mono font-bold">
              {bestWindow.startTime} – {bestWindow.endTime}
            </Badge>
          </div>

          <div className="text-xs text-emerald-950 font-medium">
            Expected AQI: {bestWindow.expectedAqiRange[0]} – {bestWindow.expectedAqiRange[1]}
          </div>

          <p className="text-xs text-stone-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200/60">
            <span className="font-semibold text-forest-900 block mb-0.5">Scientific Mechanics:</span>
            {bestWindow.scientificReason}
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                Permitted / Recommended
              </span>
              <ul className="space-y-1">
                {bestWindow.recommendedActivities.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Worst Window Card */}
        <div className="rounded-2xl p-5 border border-red-300/80 bg-red-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-[11px] font-semibold uppercase text-red-800 tracking-wider">
                  Hazardous Inversion Trap
                </span>
                <h5 className="font-serif font-bold text-base text-forest-950">
                  {worstWindow.title}
                </h5>
              </div>
            </div>
            <Badge variant="danger" className="text-xs font-mono font-bold">
              {worstWindow.startTime} – {worstWindow.endTime}
            </Badge>
          </div>

          <div className="text-xs text-red-950 font-medium">
            Expected AQI: {worstWindow.expectedAqiRange[0]} – {worstWindow.expectedAqiRange[1]}
          </div>

          <p className="text-xs text-stone-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-red-200/60">
            <span className="font-semibold text-red-900 block mb-0.5">Atmospheric Inversion Trap:</span>
            {worstWindow.scientificReason}
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider block mb-1">
                Strictly Prohibited
              </span>
              <ul className="space-y-1">
                {worstWindow.restrictedActivities.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-stone-700">
                    <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
