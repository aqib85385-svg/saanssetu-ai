"use client";

import React from "react";
import {
  LocationData,
  FamilyMember,
  IndoorRoomConfig,
  CpcbAqiResult,
  DailyRoutinePlan,
} from "@/types";
import { AirQualityApiResponse } from "@/lib/api/open-meteo";
import { ActivityWindowAssessment } from "@/lib/aqi/inversion-engine";

import { AqiOverviewCard } from "@/components/dashboard/AqiOverviewCard";
import { PollutantGrid } from "@/components/dashboard/PollutantGrid";
import { DiurnalForecast } from "@/components/dashboard/DiurnalForecast";
import { ActivityWindows } from "@/components/dashboard/ActivityWindows";
import { FamilyProfileManager } from "@/components/family/FamilyProfileManager";
import { DailyRoutinePlanner } from "@/components/routine/DailyRoutinePlanner";
import { IndoorAirProtection } from "@/components/indoor/IndoorAirProtection";
import { CommuteImpactEngine } from "@/components/commute/CommuteImpactEngine";
import { GeminiAssistant } from "@/components/assistant/GeminiAssistant";
import { CommunityActionCenter } from "@/components/community/CommunityActionCenter";

/**
 * Props for DashboardTabContent.
 */
export interface DashboardTabContentProps {
  activeTab: string;
  aqiResult: CpcbAqiResult;
  currentLocation: LocationData;
  curReadings: {
    source: string;
    lastUpdated: string;
    isObservation: boolean;
  };
  topPriorityScore: number;
  activityAssessment: ActivityWindowAssessment;
  apiData: AirQualityApiResponse | null;
  members: FamilyMember[];
  onUpdateMembers: (members: FamilyMember[]) => void;
  routinePlan: DailyRoutinePlan;
  rooms: IndoorRoomConfig[];
  onUpdateRooms: (rooms: IndoorRoomConfig[]) => void;
  language: "en" | "hi";
}

/**
 * Renders the active tab view across Air Intelligence, Family Health,
 * Daily Routine, Indoor Protection, Commute, AI Assistant, and Community.
 */
export function DashboardTabContent({
  activeTab,
  aqiResult,
  currentLocation,
  curReadings,
  topPriorityScore,
  activityAssessment,
  apiData,
  members,
  onUpdateMembers,
  routinePlan,
  rooms,
  onUpdateRooms,
  language,
}: DashboardTabContentProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* 1. Hero CPCB AQI Meter */}
          <AqiOverviewCard
            aqiResult={aqiResult}
            locationName={currentLocation.name}
            source={curReadings.source}
            lastUpdated={curReadings.lastUpdated}
            isObservation={curReadings.isObservation}
            topPriorityScore={topPriorityScore}
          />

          {/* 2. Multipollutant Breakdown Grid */}
          <PollutantGrid
            pollutants={aqiResult.pollutants}
            missingPollutants={aqiResult.missingPollutants}
          />

          {/* 3. Diurnal Activity Windows (Atmospheric Inversion Engine) */}
          <ActivityWindows assessment={activityAssessment} />

          {/* 4. 24-hr Diurnal Timeline & 7-Day Forecast */}
          <DiurnalForecast
            hourly={apiData?.hourly || []}
            daily={apiData?.daily || []}
          />
        </div>
      )}

      {activeTab === "family" && (
        <FamilyProfileManager
          members={members}
          onUpdateMembers={onUpdateMembers}
          aqiResult={aqiResult}
        />
      )}

      {activeTab === "routine" && (
        <DailyRoutinePlanner
          plan={routinePlan}
          aqiResult={aqiResult}
        />
      )}

      {activeTab === "indoor" && (
        <IndoorAirProtection
          rooms={rooms}
          onUpdateRooms={onUpdateRooms}
          aqiResult={aqiResult}
        />
      )}

      {activeTab === "commute" && <CommuteImpactEngine />}

      {activeTab === "assistant" && (
        <GeminiAssistant
          aqiResult={aqiResult}
          currentLocation={currentLocation}
          members={members}
          language={language}
        />
      )}

      {activeTab === "community" && (
        <CommunityActionCenter
          aqiResult={aqiResult}
          locationName={currentLocation.name}
        />
      )}
    </div>
  );
}
