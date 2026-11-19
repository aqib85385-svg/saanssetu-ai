"use client";

import React, { useState } from "react";
import { IndoorRoomConfig, CpcbAqiResult } from "@/types";
import { calculateRoomCadr } from "@/lib/engine/cadr-calculator";
import { estimateIndoorAirQuality } from "@/lib/engine/indoor-model";
import { Alert } from "@/components/ui/Alert";
import { Home } from "lucide-react";
import { RoomConfigForm } from "./RoomConfigForm";
import { CadrMetricsCard } from "./CadrMetricsCard";
import { BudgetPurifierGuide } from "./BudgetPurifierGuide";

/**
 * Props for IndoorAirProtection.
 */
export interface IndoorAirProtectionProps {
  /** Array of configured household rooms */
  rooms: IndoorRoomConfig[];
  /** Callback fired when room configuration changes */
  onUpdateRooms: (rooms: IndoorRoomConfig[]) => void;
  /** Live or simulated ambient CPCB AQI result */
  aqiResult: CpcbAqiResult;
}

/**
 * Smart Indoor Air Protection module coordinating room CADR sizing,
 * infiltration physics, and budget filtration alternatives.
 */
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
          <span>Smart Indoor Air Protection &amp; CADR Sizing</span>
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
                ? "border-forest-900 text-forest-900 bg-white shadow-xs"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {room.roomName}
          </button>
        ))}
      </div>

      {/* Main Grid: Config Form & CADR Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RoomConfigForm
          selectedRoom={selectedRoom}
          onUpdateRoom={handleUpdateCurrentRoom}
          onToggleSource={handleToggleSource}
        />

        <div className="space-y-4 lg:col-span-2">
          <CadrMetricsCard
            selectedRoom={selectedRoom}
            cadrResult={cadrResult}
            indoorEstimate={indoorEstimate}
            outdoorPm25={outdoorPm25}
          />

          <BudgetPurifierGuide
            areaSqFt={selectedRoom.areaSqFt}
            cadrResult={cadrResult}
          />
        </div>
      </div>
    </div>
  );
}
