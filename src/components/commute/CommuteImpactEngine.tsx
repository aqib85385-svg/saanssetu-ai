"use client";

import React, { useState } from "react";
import { analyzeCommuteImpact } from "@/lib/engine/commute-engine";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Navigation,
  Train,
  Bus,
  Car,
  Bike,
  Footprints,
  Leaf,
  Activity,
  Info,
  ArrowRight,
} from "lucide-react";

export function CommuteImpactEngine() {
  const [distanceKm, setDistanceKm] = useState(14);
  const [workingDays, setWorkingDays] = useState(5);
  const [baselineMode, setBaselineMode] = useState<"petrol_car" | "diesel_car" | "motorcycle_2w">(
    "petrol_car"
  );

  const analysis = analyzeCommuteImpact({
    distanceKmOneWay: distanceKm,
    tripsPerDay: 2,
    workingDaysPerWeek: workingDays,
    baselineMode,
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-forest-700" />
          <span>Sustainable Commute & Inhalation Exposure Engine</span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Indian transport grid emissions (CEA/BEE) balanced against personal fine particulate inhalation rates
        </p>
      </div>

      {/* Critical Climate vs Respiratory Exposure Alert */}
      <Alert variant="warning" title="The Active Travel Winter Paradox">
        While cycling and walking generate 0 g CO2, active breathing during winter smog episodes (AQI &gt; 200) increases minute ventilation rate by 400%, depositing extreme particulate soot into alveoli. Air-conditioned <strong>Delhi Metro</strong> and <strong>Electric AC Buses</strong> resolve this paradox by achieving lowest emissions <em>plus</em> sealed HEPA particulate protection.
      </Alert>

      {/* Interactive Sliders & Controls */}
      <Card className="p-6 space-y-5">
        <h4 className="font-serif font-semibold text-sm text-forest-950">
          Commute Parameters & Baseline Footprint
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Distance Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>One-Way Distance</span>
              <span className="font-mono font-bold">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseInt(e.target.value) || 10)}
              className="w-full accent-forest-900"
            />
            <div className="flex justify-between text-[10px] text-stone-600 font-medium pt-0.5">
              <span>2 km (Local)</span>
              <span>25 km (Suburban)</span>
              <span>50 km (NCR Cross)</span>
            </div>
          </div>

          {/* Working Days */}
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Working Days / Week</span>
              <span className="font-mono font-bold">{workingDays} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={workingDays}
              onChange={(e) => setWorkingDays(parseInt(e.target.value) || 5)}
              className="w-full accent-forest-900"
            />
            <div className="flex justify-between text-[10px] text-stone-600 font-medium pt-0.5">
              <span>1 day (Hybrid)</span>
              <span>5 days (Standard)</span>
              <span>6 days</span>
            </div>
          </div>

          {/* Baseline Mode */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Current Baseline Vehicle
            </label>
            <select
              value={baselineMode}
              onChange={(e) =>
                setBaselineMode(
                  e.target.value as "petrol_car" | "diesel_car" | "motorcycle_2w"
                )
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium"
            >
              <option value="petrol_car">Private Petrol Car (1.2L Hatchback/Sedan)</option>
              <option value="diesel_car">Private Diesel Car / SUV</option>
              <option value="motorcycle_2w">Two-Wheeler Motorcycle / Scooter</option>
            </select>
          </div>
        </div>

        {/* Baseline Impact Readout */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Daily Travel
            </span>
            <span className="font-serif font-bold text-xl text-stone-900">
              {analysis.dailyDistanceKm} km
            </span>
          </div>
          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Baseline Daily CO2
            </span>
            <span className="font-serif font-bold text-xl text-rose-800">
              {analysis.baselineCo2DailyKg} kg
            </span>
          </div>
          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Baseline Weekly CO2
            </span>
            <span className="font-serif font-bold text-xl text-rose-800">
              {analysis.baselineCo2WeeklyKg} kg
            </span>
          </div>
          <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] text-stone-600 uppercase font-semibold block">
              Annual Footprint (48 wks)
            </span>
            <span className="font-serif font-bold text-xl text-rose-900">
              {analysis.baselineCo2YearlyKg} kg
            </span>
          </div>
        </div>
      </Card>

      {/* Mode Comparison Table & Exposure Analysis */}
      <Card className="p-6 space-y-4">
        <h4 className="font-serif font-semibold text-base text-forest-950 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-700" />
          <span>Multimodal Emissions Avoided vs. Personal Smog Inhalation Trade-Off</span>
        </h4>

        <div className="space-y-3">
          {analysis.modes.map((item) => {
            const isRecommended = item.mode === "metro" || item.mode === "electric_bus";
            const isNegativeAvoidance = item.co2AvoidedVsPrivateCarKg < 0;

            return (
              <div
                key={item.mode}
                className={`p-4 rounded-2xl border transition-all ${
                  isRecommended
                    ? "bg-emerald-50/50 border-emerald-300 shadow-sm"
                    : "bg-white border-stone-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-forest-950">
                        {item.modeName}
                      </span>
                      {isRecommended && (
                        <Badge variant="success" className="text-[10px]">
                          Clean & Safe Commute
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                      {item.healthRiskTradeoff}
                    </p>
                  </div>

                  {/* Numbers Column */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-stone-600 uppercase font-semibold block">
                        CO2 Avoided / Day
                      </span>
                      <span
                        className={`font-serif font-bold text-base ${
                          isNegativeAvoidance ? "text-stone-500" : "text-emerald-700"
                        }`}
                      >
                        {isNegativeAvoidance
                          ? "Baseline"
                          : `+${item.co2AvoidedVsPrivateCarKg} kg`}
                      </span>
                      <span className="text-[10px] text-stone-600 font-medium block">
                        ({item.co2GramsPerKm} g/km)
                      </span>
                    </div>

                    <div className="min-w-[120px]">
                      <span className="text-[10px] text-stone-600 uppercase font-semibold block">
                        Smog Inhalation
                      </span>
                      <Badge
                        variant={
                          item.pm25InhalationLevel.includes("Very Low")
                            ? "success"
                            : item.pm25InhalationLevel.includes("Low")
                            ? "teal"
                            : item.pm25InhalationLevel.includes("Extreme")
                            ? "hazard"
                            : "warning"
                        }
                        className="text-[10px] mt-0.5"
                      >
                        {item.pm25InhalationLevel.split(" ")[0]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Methodology & Standards Note */}
      <div className="text-[11px] text-stone-500 p-4 bg-ivory-100/50 rounded-2xl border border-stone-200 space-y-1">
        <span className="font-semibold text-forest-950 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-forest-700" />
          Transparent Methodology & Indian Carbon Factors:
        </span>
        {analysis.methodologyNotes.map((note, idx) => (
          <p key={idx}>• {note}</p>
        ))}
      </div>
    </div>
  );
}
