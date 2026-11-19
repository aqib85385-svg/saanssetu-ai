"use client";

import React from "react";
import { IndoorRoomConfig } from "@/types";
import { Card } from "@/components/ui/Card";
import { Layers } from "lucide-react";

/**
 * Props for RoomConfigForm.
 */
export interface RoomConfigFormProps {
  /** Currently selected indoor room configuration */
  selectedRoom: IndoorRoomConfig;
  /** Callback to update partial properties of the selected room */
  onUpdateRoom: (partial: Partial<IndoorRoomConfig>) => void;
  /** Callback to toggle specific indoor particulate emission sources */
  onToggleSource: (
    src: "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
  ) => void;
}

/**
 * Room configuration inputs: dimensions, sealing tightness, purifiers and emission sources.
 */
export function RoomConfigForm({
  selectedRoom,
  onUpdateRoom,
  onToggleSource,
}: RoomConfigFormProps) {
  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
          <Layers className="w-4 h-4 text-forest-700" />
          <span>Room Geometry &amp; Barriers</span>
        </h3>
        <span className="text-xs font-mono font-medium text-stone-600">
          {selectedRoom.roomName}
        </span>
      </div>

      {/* Area & Height */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
            <span>Floor Area (sq ft)</span>
            <span className="font-mono font-bold">{selectedRoom.areaSqFt} sq ft</span>
          </div>
          <input
            type="range"
            min="60"
            max="600"
            step="10"
            value={selectedRoom.areaSqFt}
            onChange={(e) =>
              onUpdateRoom({ areaSqFt: parseInt(e.target.value) || 120 })
            }
            className="w-full accent-forest-900"
          />
          <div className="flex justify-between text-[10px] text-stone-600 font-medium pt-0.5">
            <span>60 sq ft (Compact)</span>
            <span>600 sq ft (Large Hall)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Ceiling Height (ft)
          </label>
          <select
            value={selectedRoom.ceilingHeightFt || 9.5}
            onChange={(e) =>
              onUpdateRoom({ ceilingHeightFt: parseFloat(e.target.value) || 10 })
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium"
          >
            <option value="9">9 ft (Standard Flat)</option>
            <option value="9.5">9.5 ft (Typical)</option>
            <option value="10">10 ft (Spacious)</option>
            <option value="11">11 ft (High Ceiling / Kothi)</option>
            <option value="12">12 ft (Loft / High Rise)</option>
          </select>
        </div>
      </div>

      {/* Building Envelope Sealing Quality */}
      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1">
          Window &amp; Door Sealing Quality
        </label>
        <select
          value={selectedRoom.sealingQuality}
          onChange={(e) =>
            onUpdateRoom({
              sealingQuality: e.target.value as IndoorRoomConfig["sealingQuality"],
            })
          }
          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium"
        >
          <option value="well_sealed_weatherstripped">
            Well-Sealed (Rubber Gaskets / Weatherstripped)
          </option>
          <option value="average">Average Indian Apartment (Standard Sliding / Gaps)</option>
          <option value="poor_drafty">Drafty / Loose Wooden Frames (High Infiltration)</option>
        </select>
      </div>

      {/* Purifier Configuration */}
      <div className="pt-2 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-800">
            Has Air Purifier in this Room
          </span>
          <input
            type="checkbox"
            checked={selectedRoom.hasPurifier}
            onChange={(e) => onUpdateRoom({ hasPurifier: e.target.checked })}
            className="w-4 h-4 accent-forest-900 rounded"
          />
        </div>

        {selectedRoom.hasPurifier && (
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1">
              <span>Purifier CADR Rating (CFM)</span>
              <span className="font-mono font-bold text-teal-800">
                {selectedRoom.purifierCadrCfm || 120} CFM
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="450"
              step="10"
              value={selectedRoom.purifierCadrCfm || 120}
              onChange={(e) =>
                onUpdateRoom({ purifierCadrCfm: parseInt(e.target.value) || 120 })
              }
              className="w-full accent-teal-700"
            />
            <div className="flex justify-between text-[10px] text-stone-500 pt-0.5">
              <span>50 CFM (Small DIY)</span>
              <span>250 CFM (Mid HEPA)</span>
              <span>450 CFM (Heavy Duty)</span>
            </div>
          </div>
        )}
      </div>

      {/* Internal Combustion Sources */}
      <div className="pt-2 border-t border-stone-100">
        <label className="block text-xs font-semibold text-stone-800 mb-1.5">
          Indoor Particle Emission Sources
        </label>
        <p className="text-[11px] text-stone-500 mb-2">
          Internal smoke can elevate indoor PM2.5 higher than outdoor ambient levels.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { id: "agarbatti", label: "Agarbatti (Incense)" },
            { id: "dhoop", label: "Dhoop / Camphor" },
            { id: "mosquito_coil", label: "Mosquito Coil" },
            { id: "frying", label: "Tadka / Deep Frying" },
          ].map((src) => {
            const isChecked = selectedRoom.indoorSources.includes(
              src.id as "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
            );
            return (
              <button
                type="button"
                key={src.id}
                onClick={() =>
                  onToggleSource(
                    src.id as "agarbatti" | "dhoop" | "mosquito_coil" | "frying" | "smoking"
                  )
                }
                className={`p-2 rounded-xl border text-left font-medium transition-all ${
                  isChecked
                    ? "bg-red-50 text-red-900 border-red-300"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isChecked ? "bg-red-500" : "bg-stone-300"
                    }`}
                  />
                  <span>{src.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
