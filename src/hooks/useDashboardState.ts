"use client";

import { useState, useEffect, useCallback } from "react";
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

/**
 * Default family profiles preset representing vulnerable Indian demographic archetypes.
 */
export const DEFAULT_MEMBERS: FamilyMember[] = [
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

/**
 * Default room configurations for indoor aerosol modeling.
 */
export const DEFAULT_ROOMS: IndoorRoomConfig[] = [
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

/**
 * Custom hook orchestrating global dashboard state, localStorage synchronization,
 * live atmospheric data queries, and scientific calculations.
 */
export function useDashboardState() {
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
      // Graceful fallback if storage unavailable
    }
  }, []);

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

  const loadAirQuality = useCallback(async (loc: LocationData) => {
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
  }, []);

  useEffect(() => {
    loadAirQuality(currentLocation);
  }, [currentLocation, loadAirQuality]);

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

  const activityAssessment = computeActivityWindows(apiData?.hourly || []);
  const routinePlan = planDailyRoutine(aqiResult, members, activityAssessment, rooms);
  const allDailyActions = generateDailyActions(aqiResult, members, rooms);
  const topPriorityScore = allDailyActions[0]?.actionPriorityScore || 85;

  return {
    currentLocation,
    setCurrentLocation,
    language,
    activeTab,
    setActiveTab,
    isLocationSelectorOpen,
    setIsLocationSelectorOpen,
    isLocating,
    members,
    rooms,
    apiData,
    isLoading,
    loadError,
    curReadings,
    aqiResult,
    activityAssessment,
    routinePlan,
    topPriorityScore,
    handleUpdateMembers,
    handleUpdateRooms,
    handleToggleLanguage,
    loadAirQuality,
    handleUseCurrentLocation,
  };
}
