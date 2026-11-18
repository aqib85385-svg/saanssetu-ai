"use client";

import React, { useState, useEffect } from "react";
import {
  LocationData,
  FamilyMember,
  IndoorRoomConfig,
  CpcbAqiResult,
} from "@/types";
import { INDIAN_CITY_PRESETS, AirQualityApiResponse } from "@/lib/api/open-meteo";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";
import { computeActivityWindows } from "@/lib/aqi/inversion-engine";
import { planDailyRoutine } from "@/lib/engine/routine-planner";
import { generateDailyActions } from "@/lib/engine/action-priority";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocationSelector } from "@/components/dashboard/LocationSelector";
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

import { AlertCircle, RefreshCw, Sparkles, Wind } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Default family profile presets
const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: "m_dadi",
    name: "Dadi (Grandmother, 68y)",
    ageGroup: "elderly",
    sensitivities: ["asthma", "hypertension"],
    outdoorExposureHoursPerDay: 1,
    commuteType: "walk",
  },
  {
    id: "m_toddler",
    name: "Aarav (Toddler, 3y)",
    ageGroup: "infant",
    sensitivities: ["respiratory_allergy"],
    outdoorExposureHoursPerDay: 0.5,
    commuteType: "wfh",
  },
  {
    id: "m_parent",
    name: "Vikram (Commuter, 38y)",
    ageGroup: "adult",
    sensitivities: [],
    outdoorExposureHoursPerDay: 2,
    commuteType: "metro",
  },
];

// Default indoor room configurations
const DEFAULT_ROOMS: IndoorRoomConfig[] = [
  {
    id: "r1",
    roomName: "Master Bedroom",
    areaSqFt: 180,
    ceilingHeightFt: 10,
    sealingQuality: "average",
    hasAirConditioner: true,
    hasPurifier: true,
    purifierCadrCfm: 160,
    indoorSources: ["none"],
  },
  {
    id: "r2",
    roomName: "Living & Dining Room",
    areaSqFt: 340,
    ceilingHeightFt: 10,
    sealingQuality: "poor_drafty",
    hasAirConditioner: true,
    hasPurifier: false,
    indoorSources: ["agarbatti"],
  },
  {
    id: "r3",
    roomName: "Kid's Study Room",
    areaSqFt: 120,
    ceilingHeightFt: 9.5,
    sealingQuality: "well_sealed_weatherstripped",
    hasAirConditioner: false,
    hasPurifier: true,
    purifierCadrCfm: 110,
    indoorSources: ["none"],
  },
];

export default function HomePage() {
  const [currentLocation, setCurrentLocation] = useState<LocationData>(
    INDIAN_CITY_PRESETS[0] // New Delhi
  );
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [rooms, setRooms] = useState<IndoorRoomConfig[]>(DEFAULT_ROOMS);

  const [apiData, setApiData] = useState<AirQualityApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load saved local storage on initial mount
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem("saans_members");
      if (savedMembers) setMembers(JSON.parse(savedMembers));

      const savedRooms = localStorage.getItem("saans_rooms");
      if (savedRooms) setRooms(JSON.parse(savedRooms));

      const savedLang = localStorage.getItem("saans_lang");
      if (savedLang === "en" || savedLang === "hi") setLanguage(savedLang);
    } catch {
      // Fallback gracefully
    }
  }, []);

  // Sync to local storage
  const handleUpdateMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem("saans_members", JSON.stringify(newMembers));
    } catch {}
  };

  const handleUpdateRooms = (newRooms: IndoorRoomConfig[]) => {
    setRooms(newRooms);
    try {
      localStorage.setItem("saans_rooms", JSON.stringify(newRooms));
    } catch {}
  };

  const handleToggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    try {
      localStorage.setItem("saans_lang", nextLang);
    } catch {}
  };

  // Fetch air quality data for location
  const loadAirQuality = async (loc: LocationData) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `/api/air-quality?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(
          loc.name
        )}`
      );
      if (!res.ok) {
        throw new Error(`Air quality service returned status ${res.status}`);
      }
      const data: AirQualityApiResponse = await res.json();
      setApiData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load station data";
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAirQuality(currentLocation);
  }, [currentLocation]);

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const geoLoc: LocationData = {
          name: "My GPS Location",
          country: "India",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timezone: "Asia/Kolkata",
        };
        setCurrentLocation(geoLoc);
      },
      (err) => {
        setIsLocating(false);
        alert(`Could not acquire GPS position: ${err.message}. Using New Delhi default.`);
      },
      { timeout: 8000 }
    );
  };

  // Calculate CPCB AQI from current API readings
  const curReadings = apiData?.current || {
    time: new Date().toISOString(),
    pm25: 220,
    pm10: 310,
    no2: 64,
    so2: 18,
    co: 1.6,
    o3: 40,
    source: "Copernicus CAMS Global Atmospheric Model",
    lastUpdated: "Just now",
    isObservation: false,
  };

  const aqiResult: CpcbAqiResult = calculateCpcbAqi({
    pm25: curReadings.pm25,
    pm10: curReadings.pm10,
    no2: curReadings.no2,
    so2: curReadings.so2,
    co: curReadings.co,
    o3: curReadings.o3,
  });

  // Calculate diurnal activity windows assessment
  const activityAssessment = computeActivityWindows(apiData?.hourly || []);

  // Calculate daily routine plan
  const routinePlan = planDailyRoutine(aqiResult, members, activityAssessment, rooms);

  // Top action priority score
  const allDailyActions = generateDailyActions(aqiResult, members, rooms);
  const topPriorityScore = allDailyActions[0]?.actionPriorityScore || 85;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6]">
      {/* Top Navigation Header */}
      <Header
        currentLocation={currentLocation}
        category={aqiResult.category}
        aqi={aqiResult.aqi}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        onLanguageToggle={handleToggleLanguage}
        onOpenLocationSearch={() => setIsLocationSelectorOpen(true)}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Loading Overlay */}
        {isLoading && !apiData && (
          <div className="py-24 text-center space-y-4">
            <div className="inline-block p-4 rounded-2xl bg-forest-900 text-teal-300 shadow-glass">
              <Wind className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="font-serif font-bold text-xl text-forest-950">
              Synchronizing CAMS Atmospheric Data...
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Fetching Copernicus CAMS global model assimilation and Indian CPCB NAQI breakpoints for {currentLocation.name}.
            </p>
          </div>
        )}

        {/* Error State */}
        {loadError && !apiData && (
          <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-red-950">
              Station Data Fetch Error
            </h3>
            <p className="text-xs text-stone-600">{loadError}</p>
            <Button size="sm" onClick={() => loadAirQuality(currentLocation)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Connection
            </Button>
          </div>
        )}

        {/* Active Content Module */}
        {(!isLoading || apiData) && (
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
                onUpdateMembers={handleUpdateMembers}
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
                onUpdateRooms={handleUpdateRooms}
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
        )}
      </main>

      {/* Location Modal */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          setIsLocationSelectorOpen(false);
        }}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
