"use client";

import React, { useState } from "react";
import {
  DailyRoutinePlan,
  ActionRecommendation,
  CpcbAqiResult,
} from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  Navigation,
  Dumbbell,
  Wind,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface DailyRoutinePlannerProps {
  plan: DailyRoutinePlan;
  aqiResult: CpcbAqiResult;
}

export function DailyRoutinePlanner({
  plan,
  aqiResult,
}: DailyRoutinePlannerProps) {
  const [activeTab, setActiveTab] = useState<"morning" | "afternoon" | "evening" | "night">("morning");

  const currentActions: ActionRecommendation[] = plan[activeTab] || [];

  const timeTabs = [
    { id: "morning", label: "Morning (6 AM - 12 PM)", icon: Sun, count: plan.morning.length },
    { id: "afternoon", label: "Afternoon (12 PM - 5 PM)", icon: Sun, count: plan.afternoon.length },
    { id: "evening", label: "Evening (5 PM - 9 PM)", icon: Sunset, count: plan.evening.length },
    { id: "night", label: "Bedtime (9 PM - 6 AM)", icon: Moon, count: plan.night.length },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
          <Clock className="w-6 h-6 text-forest-700" />
          <span>AI Daily Smog Defense Routine</span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Synchronized to northern Indian diurnal smog dynamics, boundary layer inversions, and your family's profile
        </p>
      </div>

      {/* 3 Strategic Key Pillar Cards: Commute, Exercise, Ventilation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commute Guidance */}
        <Card className="p-4 border-teal-200/80 bg-teal-50/30 space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-semibold text-xs">
            <Navigation className="w-4 h-4 text-teal-700" />
            <span>Commute Timing & Gear</span>
          </div>
          <p className="text-xs text-stone-800 font-medium">
            {plan.commuteGuidance.recommendedWindow}
          </p>
          <div className="text-[11px] text-stone-600 bg-white/80 p-2 rounded-lg border border-teal-100">
            <span className="font-semibold block text-teal-950 mb-0.5">Required Mask:</span>
            {plan.commuteGuidance.protectiveEquipment}
          </div>
        </Card>

        {/* Outdoor Exercise Advisor */}
        <Card className="p-4 border-amber-200/80 bg-amber-50/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
            <Dumbbell className="w-4 h-4 text-amber-700" />
            <span>Workout & Cardio Guidance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={plan.exerciseGuidance.canExerciseOutdoors ? "success" : "danger"}>
              {plan.exerciseGuidance.canExerciseOutdoors ? "Outdoor Permitted" : "Strictly Indoors"}
            </Badge>
            {plan.exerciseGuidance.bestWindow && (
              <span className="text-[11px] text-stone-500 font-mono">
                {plan.exerciseGuidance.bestWindow}
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed bg-white/80 p-2 rounded-lg border border-amber-100">
            {plan.exerciseGuidance.indoorAlternative}
          </p>
        </Card>

        {/* Indoor Ventilation Advisor (Constraint Adherence) */}
        <Card className="p-4 border-stone-200 bg-ivory-100/60 space-y-2">
          <div className="flex items-center gap-2 text-forest-900 font-semibold text-xs">
            <Wind className="w-4 h-4 text-forest-700" />
            <span>Ventilation Windows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={plan.ventilationPlan.canOpenWindows ? "teal" : "hazard"}>
              {plan.ventilationPlan.canOpenWindows ? "Brief Flush Allowed" : "Windows Sealed"}
            </Badge>
            <span className="text-[11px] text-stone-500">
              {plan.ventilationPlan.durationMinutes} mins max
            </span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed bg-white/80 p-2 rounded-lg border border-stone-200/60">
            {plan.ventilationPlan.scientificJustification}
          </p>
        </Card>
      </div>

      {/* Time of Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        {timeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-forest-900 text-forest-950 bg-white"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Routine Action Cards List */}
      <div className="space-y-4">
        {currentActions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-50 text-stone-400 text-xs">
            No specific actions scheduled for this time block. Standard precautions apply.
          </div>
        ) : (
          currentActions.map((action) => (
            <Card
              key={action.id}
              className="p-5 border-stone-200 hover:border-forest-400 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest-600" />
                  <h4 className="font-serif font-bold text-base text-forest-950">
                    {action.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="teal" className="text-[11px] font-mono">
                    Priority Score: {action.actionPriorityScore}/100
                  </Badge>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {action.whenToPerform}
                  </span>
                </div>
              </div>

              {/* Action Description */}
              <p className="text-sm font-medium text-stone-900 leading-relaxed bg-forest-50/40 p-3 rounded-xl border border-forest-100/80">
                {action.action}
              </p>

              {/* Scientific Reason & Impact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-ivory-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">
                    Why It Matters
                  </span>
                  <p className="text-stone-700 leading-snug">{action.reason}</p>
                </div>

                <div className="bg-ivory-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">
                    Who Benefits
                  </span>
                  <p className="text-stone-700 leading-snug">{action.whoBenefits}</p>
                </div>

                <div className="bg-ivory-50 p-2.5 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">
                    Expected Reduction
                  </span>
                  <p className="text-emerald-800 font-medium leading-snug">
                    {action.expectedImpact}
                  </p>
                </div>
              </div>

              {/* Assumptions & Confidence */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                <span>Assumptions: {action.assumptions}</span>
                <span className="font-mono">Confidence: {action.confidence}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
