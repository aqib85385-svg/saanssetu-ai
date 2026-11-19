"use client";

import React, { useState } from "react";
import { FamilyMember, CpcbAqiResult } from "@/types";
import { assessHouseholdRisk } from "@/lib/engine/risk-assessment";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Users, UserPlus, HeartPulse } from "lucide-react";
import { AddMemberModal } from "./AddMemberModal";
import { MemberRiskCard } from "./MemberRiskCard";

/**
 * Props for the FamilyProfileManager component.
 */
export interface FamilyProfileManagerProps {
  /** Array of active family member profiles */
  members: FamilyMember[];
  /** Callback fired whenever member profiles are added, removed, or modified */
  onUpdateMembers: (members: FamilyMember[]) => void;
  /** Current CPCB AQI assessment data */
  aqiResult: CpcbAqiResult;
}

/**
 * Comprehensive management interface for household family profiles,
 * mapping age groups and pre-existing respiratory conditions to customized
 * physiological vulnerability scores and protective guidelines.
 */
export function FamilyProfileManager({
  members,
  onUpdateMembers,
  aqiResult,
}: FamilyProfileManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const householdAssessment = assessHouseholdRisk(members, aqiResult);

  const handleAddMember = (newMember: FamilyMember) => {
    onUpdateMembers([...members, newMember]);
    setIsAdding(false);
  };

  const handleRemoveMember = (id: string) => {
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  /**
   * Helper to quickly populate common archetypes (toddler, senior with asthma, commuter).
   */
  const addPreset = (type: "infant" | "elderly_asthma") => {
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
    } else {
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
        <AddMemberModal
          onAdd={handleAddMember}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* Household Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {householdAssessment.memberScores.map((score) => (
          <MemberRiskCard
            key={score.memberId}
            score={score}
            rawMember={members.find((m) => m.id === score.memberId)}
            onRemove={handleRemoveMember}
          />
        ))}
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
