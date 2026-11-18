"use client";

import React, { useState } from "react";
import { IndoorRoomConfig, CpcbAqiResult } from "@/types";
import { calculateRoomCadr } from "@/lib/engine/cadr-calculator";
import { estimateIndoorAirQuality } from "@/lib/engine/indoor-model";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Home,
  ShieldCheck,
  Check,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Flame,
  Info,
  DollarSign,
  Layers,
} from "lucide-react";

interface IndoorAirProtectionProps {
  rooms: IndoorRoomConfig[];
  onUpdateRooms: (rooms: IndoorRoomConfig[]) => void;
  aqiResult: CpcbAqiResult;
}

export function IndoorAirProtection({
  rooms,
  onUpdateRooms,
  aqiResult,
}: IndoorAirProtectionProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    rooms[0]?.id || "r1"
  );

  const selectedRoom =
    rooms.find((r) => r.id === selectedRoomId) || rooms[0] || {
      id: "r1",
      roomName: "Master Bedroom",
      areaSqFt: 180,
      ceilingHeightFt: 10,
      sealingQuality: "average" as const,
      hasAirConditioner: true,
      hasPurifier: true,
      purifierCadrCfm: 150,
      indoorSources: ["none" as const],
    };

  const cadrResult = calculateRoomCadr(selectedRoom, 4.5);
  const outdoorPm25 = aqiResult.pollutants.find((p) => p.code === "pm25")?.value || 210;
  const indoorEstimate = estimateIndoorAirQuality(selectedRoom, aqiResult.aqi, outdoorPm25);

  const handleUpdateCurrentRoom = (partial: Partial<IndoorRoomConfig>) => {
    const updated = rooms.map((r) =>
      r.id === selectedRoom.id ? { ...r, ...partial } : r
    );
    onUpdateRooms(updated);
  };

  const handleToggleSource = (
    src: "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
  ) => {
    let newSources = [...selectedRoom.indoorSources];
    if (newSources.includes(src)) {
      newSources = newSources.filter((s) => s !== src);
    } else {
      newSources = newSources.filter((s) => s !== "none").concat(src);
    }
    if (newSources.length === 0) newSources = ["none"];
    handleUpdateCurrentRoom({ indoorSources: newSources });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
          <Home className="w-6 h-6 text-forest-700" />
          <span>Smart Indoor Air Protection & CADR Sizing</span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Aerosol mass-balance physics for room volume, infiltration barriers, source control, and genuine filtration
        </p>
      </div>

      {/* Scientific Reality Banner on Houseplants */}
      <Alert variant="info" title="Scientific Fact: Plants vs. Mechanical HEPA Filters">
        Peer-reviewed aerosol research (Waring et al., 2019) confirms potted indoor plants (e.g. Snake plants, Areca palms) have a Clean Air Delivery Rate (CADR) near zero for PM2.5. Do not rely on plants to scrub winter smog. True mechanical HEPA filtration and door sealing are indispensable.
      </Alert>

      {/* Room Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              selectedRoom.id === room.id
                ? "border-forest-900 text-forest-950 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {room.roomName}
          </button>
        ))}
      </div>

      {/* Main Room Configuration & CADR Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Geometry & Sealing Config */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-5 space-y-4">
            <h4 className="font-serif font-semibold text-sm text-forest-950">
              Room Dimensions & Building Envelope
            </h4>

            {/* Room Area Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
                <span>Room Floor Area</span>
                <span className="font-mono font-bold">{selectedRoom.areaSqFt} sq ft</span>
              </div>
              <input
                type="range"
                min="60"
                max="600"
                step="10"
                value={selectedRoom.areaSqFt}
                onChange={(e) =>
                  handleUpdateCurrentRoom({ areaSqFt: parseInt(e.target.value) || 120 })
                }
                className="w-full accent-forest-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 pt-0.5">
                <span>60 sq ft (Compact)</span>
                <span>600 sq ft (Large Hall)</span>
              </div>
            </div>

            {/* Ceiling Height */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Ceiling Height (ft)
              </label>
              <select
                value={selectedRoom.ceilingHeightFt || 9.5}
                onChange={(e) =>
                  handleUpdateCurrentRoom({
                    ceilingHeightFt: parseFloat(e.target.value) || 9.5,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
              >
                <option value="9">9 ft (Standard Apartment)</option>
                <option value="9.5">9.5 ft (Typical)</option>
                <option value="10">10 ft (High Ceiling)</option>
                <option value="11">11 ft (Old Bungalow / Penthouse)</option>
              </select>
            </div>

            {/* Sealing Quality */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Window & Door Sealing Quality
              </label>
              <select
                value={selectedRoom.sealingQuality}
                onChange={(e) =>
                  handleUpdateCurrentRoom({
                    sealingQuality: e.target.value as IndoorRoomConfig["sealingQuality"],
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium"
              >
                <option value="poor_drafty">Drafty (Loose sliding frames, gaps &gt; 5mm)</option>
                <option value="average">Average (Standard Indian aluminium frames)</option>
                <option value="well_sealed_weatherstripped">Well-Sealed (Rubber gaskets / weatherstripped)</option>
              </select>
            </div>

            {/* Purifier Toggle & Capacity */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoom.hasPurifier}
                  onChange={(e) => handleUpdateCurrentRoom({ hasPurifier: e.target.checked })}
                  className="rounded text-forest-900 focus:ring-forest-600 w-4 h-4"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Air Purifier Installed in this room
                </span>
              </label>

              {selectedRoom.hasPurifier && (
                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Purifier CADR Rating</span>
                    <span className="font-mono font-bold">
                      {selectedRoom.purifierCadrCfm || 150} CFM (
                      {Math.round((selectedRoom.purifierCadrCfm || 150) * 1.699)} m³/h)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="450"
                    step="10"
                    value={selectedRoom.purifierCadrCfm || 150}
                    onChange={(e) =>
                      handleUpdateCurrentRoom({ purifierCadrCfm: parseInt(e.target.value) || 150 })
                    }
                    className="w-full accent-forest-900"
                  />
                </div>
              )}
            </div>

            {/* Indoor Pollution Combustion Checklist */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                Active Indoor Combustion Sources
              </span>
              <div className="space-y-1.5">
                {[
                  { id: "agarbatti", label: "Agarbatti (Incense sticks)" },
                  { id: "dhoop", label: "Dhoop / Camphor (Resin)" },
                  { id: "mosquito_coil", label: "Mosquito Coil Burning" },
                  { id: "frying", label: "Frequent High-Heat Frying / Tadka" },
                  { id: "smoking", label: "Indoor Tobacco Smoking" },
                ].map((item) => {
                  const isChecked = selectedRoom.indoorSources.includes(
                    item.id as "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
                  );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleToggleSource(
                          item.id as "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
                        )
                      }
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? "bg-rose-50 text-rose-900 border-rose-300"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-[10px]">
                        {isChecked ? "+ Extreme PM" : "Clean"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: CADR Analysis, Infiltration vs Clean Air & Budget Purifiers */}
        <div className="space-y-4 lg:col-span-2">
          {/* CADR Performance Summary */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                  Engineering CADR Assessment
                </span>
                <h3 className="font-serif font-bold text-xl text-forest-950">
                  {selectedRoom.roomName} ({cadrResult.roomVolumeCuFt} cu ft / {cadrResult.roomVolumeM3} m³)
                </h3>
              </div>

              <Badge
                variant={
                  cadrResult.status === "optimal"
                    ? "success"
                    : cadrResult.status === "adequate"
                    ? "warning"
                    : "danger"
                }
                className="text-xs px-3 py-1 font-mono uppercase"
              >
                {cadrResult.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Key CADR Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-center">
              <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Required CADR (4.5 ACH)
                </span>
                <span className="text-xl font-serif font-bold text-stone-900">
                  {cadrResult.requiredCadrCfm} CFM
                </span>
                <span className="text-[10px] text-stone-500 block">
                  ({cadrResult.requiredCadrM3h} m³/h)
                </span>
              </div>

              <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Current ACH Delivery
                </span>
                <span className="text-xl font-serif font-bold text-forest-900">
                  {cadrResult.currentAchWithPurifier} ACH
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Target: 4.5+ ACH
                </span>
              </div>

              <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  Est. Indoor PM2.5
                </span>
                <span className="text-xl font-serif font-bold text-emerald-800">
                  {indoorEstimate.estimatedIndoorPm25} µg/m³
                </span>
                <span className="text-[10px] text-stone-500 block">
                  vs {outdoorPm25} µg outdoor
                </span>
              </div>

              <div className="bg-ivory-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  HEPA Cleaning Ratio
                </span>
                <span className="text-xl font-serif font-bold text-teal-800">
                  {indoorEstimate.hepaEffectivenessPercent}%
                </span>
                <span className="text-[10px] text-stone-500 block">
                  Particulate scrub rate
                </span>
              </div>
            </div>

            {/* Infiltration vs Purification Explanations */}
            <div className="space-y-2 pt-2 text-xs">
              {cadrResult.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                  <Check className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Budget-Sensitive Purifier Sizing Guide */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-semibold text-sm text-forest-950 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Budget-Sensitive Purifier Sizing Options</span>
              </h4>
              <span className="text-xs text-stone-400">
                For {selectedRoom.areaSqFt} sq ft space
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

          {/* Transparent Model Assumptions Disclosure */}
          <div className="text-[11px] text-stone-500 p-3 bg-ivory-100/50 rounded-xl border border-stone-200 space-y-1">
            <span className="font-semibold text-forest-950 block">
              Transparent Calculation Methodology & Physics Assumptions:
            </span>
            {indoorEstimate.scientificAssumptions.map((assump, idx) => (
              <p key={idx}>• {assump}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
