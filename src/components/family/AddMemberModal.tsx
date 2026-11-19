"use client";

import React, { useState } from "react";
import { FamilyMember, HealthSensitivity, AgeGroup } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Available health conditions for vulnerability profiling.
 */
const HEALTH_CONDITIONS: { id: HealthSensitivity; label: string }[] = [
  { id: "asthma", label: "Asthma" },
  { id: "copd", label: "COPD / Bronchitis" },
  { id: "respiratory_allergy", label: "Dust & Smog Allergy" },
  { id: "cardiovascular", label: "Heart Condition" },
  { id: "hypertension", label: "Hypertension / BP" },
  { id: "post_viral_recovery", label: "Post-Viral Cough" },
];

/**
 * Props for the AddMemberModal component.
 */
export interface AddMemberModalProps {
  /** Callback fired when a new member is submitted */
  onAdd: (member: FamilyMember) => void;
  /** Callback fired when the cancel button is clicked */
  onCancel: () => void;
}

/**
 * Form modal component for registering a new family member profile.
 *
 * Captures name, physiological age group, respiratory sensitivities, commute mode,
 * and daily outdoor exposure hours.
 */
export function AddMemberModal({ onAdd, onCancel }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [sensitivities, setSensitivities] = useState<HealthSensitivity[]>([]);
  const [commuteType, setCommuteType] = useState<FamilyMember["commuteType"]>("metro");
  const [exposureHours, setExposureHours] = useState(1);

  const handleToggleSensitivity = (s: HealthSensitivity) => {
    if (sensitivities.includes(s)) {
      setSensitivities(sensitivities.filter((item) => item !== s));
    } else {
      setSensitivities([...sensitivities, s]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      id: `mem_${Date.now()}`,
      name: name.trim(),
      ageGroup,
      sensitivities,
      outdoorExposureHoursPerDay: exposureHours,
      commuteType,
    });
  };

  return (
    <Card className="p-5 border-forest-300 bg-forest-50/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="font-serif font-semibold text-sm text-forest-950">
          New Household Member
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Name / Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Papa, Aarav, Grandma"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white"
            >
              <option value="infant">Infant / Toddler (0–4 yrs)</option>
              <option value="child">Child / Teen (5–17 yrs)</option>
              <option value="adult">Adult (18–59 yrs)</option>
              <option value="elderly">Senior Citizen (60+ yrs)</option>
              <option value="pregnant">Pregnant Individual</option>
            </select>
          </div>
        </div>

        {/* Health Conditions */}
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1.5">
            Respiratory or Cardiovascular Sensitivities
          </label>
          <div className="flex flex-wrap gap-2">
            {HEALTH_CONDITIONS.map((s) => {
              const isChecked = sensitivities.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleToggleSensitivity(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    isChecked
                      ? "bg-forest-900 text-white border-forest-900 font-medium"
                      : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commute & Exposure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Primary Commute Mode
            </label>
            <select
              value={commuteType}
              onChange={(e) => setCommuteType(e.target.value as FamilyMember["commuteType"])}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white"
            >
              <option value="metro">Delhi Metro / Suburban Train</option>
              <option value="bus">City Bus (DTC/BEST)</option>
              <option value="car_closed">Closed AC Car / Cab</option>
              <option value="bike_two_wheeler">Motorcycle / Scooter</option>
              <option value="walk">Walking</option>
              <option value="wfh">Stay at Home / WFH</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Outdoor Exposure Hours / Day
            </label>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={exposureHours}
              onChange={(e) => setExposureHours(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Member
          </Button>
        </div>
      </form>
    </Card>
  );
}
