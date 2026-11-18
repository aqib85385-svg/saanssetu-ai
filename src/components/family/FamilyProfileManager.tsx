"use client";

import React, { useState } from "react";
import { FamilyMember, HealthSensitivity, AgeGroup, CpcbAqiResult } from "@/types";
import { assessHouseholdRisk } from "@/lib/engine/risk-assessment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Users,
  UserPlus,
  HeartPulse,
  Shield,
  Trash2,
  AlertTriangle,
  Heart,
  Baby,
  Activity,
  Wind,
} from "lucide-react";

interface FamilyProfileManagerProps {
  members: FamilyMember[];
  onUpdateMembers: (members: FamilyMember[]) => void;
  aqiResult: CpcbAqiResult;
}

export function FamilyProfileManager({
  members,
  onUpdateMembers,
  aqiResult,
}: FamilyProfileManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [sensitivities, setSensitivities] = useState<HealthSensitivity[]>([]);
  const [commuteType, setCommuteType] = useState<FamilyMember["commuteType"]>("metro");
  const [exposureHours, setExposureHours] = useState(1);

  const householdAssessment = assessHouseholdRisk(members, aqiResult);

  const handleToggleSensitivity = (s: HealthSensitivity) => {
    if (sensitivities.includes(s)) {
      setSensitivities(sensitivities.filter((item) => item !== s));
    } else {
      setSensitivities([...sensitivities, s]);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      name: name.trim(),
      ageGroup,
      sensitivities,
      outdoorExposureHoursPerDay: exposureHours,
      commuteType,
    };

    onUpdateMembers([...members, newMember]);
    setName("");
    setSensitivities([]);
    setIsAdding(false);
  };

  const handleRemoveMember = (id: string) => {
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  // Quick preset templates for rapid setup
  const addPreset = (type: "infant" | "elderly_asthma" | "commuter") => {
    if (type === "infant") {
      onUpdateMembers([
        ...members,
        {
          id: `mem_${Date.now()}`,
          name: "Baby Ayaan (2 yrs)",
          ageGroup: "infant",
          sensitivities: ["respiratory_allergy"],
          outdoorExposureHoursPerDay: 0.5,
          commuteType: "wfh",
        },
      ]);
    } else if (type === "elderly_asthma") {
      onUpdateMembers([
        ...members,
        {
          id: `mem_${Date.now()}`,
          name: "Dadi / Grandmother (68 yrs)",
          ageGroup: "elderly",
          sensitivities: ["asthma", "hypertension"],
          outdoorExposureHoursPerDay: 1,
          commuteType: "walk",
        },
      ]);
    } else {
      onUpdateMembers([
        ...members,
        {
          id: `mem_${Date.now()}`,
          name: "Commuting Parent",
          ageGroup: "adult",
          sensitivities: [],
          outdoorExposureHoursPerDay: 2,
          commuteType: "metro",
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-700" />
            <span>Family Health & Vulnerability Profile</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Personalized exposure calculations tailored to individual physiological age and lung sensitivities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addPreset("infant")}
            className="text-xs"
          >
            + Add Toddler
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addPreset("elderly_asthma")}
            className="text-xs"
          >
            + Add Senior (Asthma)
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Household Vulnerability Status Alert */}
      {householdAssessment.urgentWarnings.length > 0 && (
        <Alert variant="warning" title="Household Smog Warning">
          {householdAssessment.urgentWarnings.map((w, idx) => (
            <p key={idx} className="font-medium">
              {w}
            </p>
          ))}
        </Alert>
      )}

      {/* Add Member Form */}
      {isAdding && (
        <Card className="p-5 border-forest-300 bg-forest-50/20">
          <form onSubmit={handleAddMember} className="space-y-4">
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
                {[
                  { id: "asthma", label: "Asthma" },
                  { id: "copd", label: "COPD / Bronchitis" },
                  { id: "respiratory_allergy", label: "Dust & Smog Allergy" },
                  { id: "cardiovascular", label: "Heart Condition" },
                  { id: "hypertension", label: "Hypertension / BP" },
                  { id: "post_viral_recovery", label: "Post-Viral Cough" },
                ].map((s) => {
                  const isChecked = sensitivities.includes(s.id as HealthSensitivity);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleToggleSensitivity(s.id as HealthSensitivity)}
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

            {/* Commute */}
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
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Member
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Household Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {householdAssessment.memberScores.map((score) => {
          const rawMember = members.find((m) => m.id === score.memberId);
          const isCritical = score.riskLevel === "Critical";
          const isHigh = score.riskLevel === "High";

          return (
            <Card
              key={score.memberId}
              className={`p-5 transition-all flex flex-col justify-between ${
                isCritical
                  ? "border-red-300 bg-red-50/20"
                  : isHigh
                  ? "border-amber-300 bg-amber-50/20"
                  : "border-stone-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-forest-950">
                      {score.memberName}
                    </h4>
                    <span className="text-xs text-stone-500 capitalize">
                      {rawMember?.ageGroup} • {rawMember?.commuteType.replace("_", " ")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(score.memberId)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded hover:bg-stone-100"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Vulnerability Meter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Smog Vulnerability:</span>
                    <Badge
                      variant={isCritical ? "danger" : isHigh ? "warning" : "teal"}
                      className="text-[11px] font-mono"
                    >
                      {score.riskLevel} ({score.vulnerabilityScore}/100)
                    </Badge>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCritical
                          ? "bg-red-600"
                          : isHigh
                          ? "bg-amber-500"
                          : "bg-teal-600"
                      }`}
                      style={{ width: `${score.vulnerabilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Physiological Explanation */}
                <div className="bg-white/80 p-3 rounded-xl border border-stone-200/60 text-xs text-stone-700 leading-relaxed">
                  <span className="font-semibold text-stone-900 block mb-0.5">
                    Biological Impact:
                  </span>
                  {score.individualExplanation}
                </div>

                {/* Mask & Transit Recommendation */}
                <div className="text-xs font-medium text-forest-900 bg-forest-50 p-2.5 rounded-xl border border-forest-100">
                  <span className="text-stone-500 block text-[10px] uppercase tracking-wider">
                    Protective Gear
                  </span>
                  <span className="font-semibold">{score.maskRecommendation}</span>
                </div>

                {/* Specific Action Guidance */}
                <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                  {score.tailoredGuidance.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Responsible Medical Disclaimer Card */}
      <div className="p-4 rounded-2xl bg-ivory-100/70 border border-stone-200 text-xs text-stone-600 leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-forest-950 pb-1">
          <HeartPulse className="w-4 h-4 text-red-600" />
          <span>Responsible Environmental Health Disclaimer</span>
        </div>
        <p>{householdAssessment.medicalDisclaimer}</p>
      </div>
    </div>
  );
}
