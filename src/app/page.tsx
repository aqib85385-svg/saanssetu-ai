"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocationSelector } from "@/components/dashboard/LocationSelector";
import { LoadingAndErrorStates } from "@/components/dashboard/LoadingAndErrorStates";
import { DashboardTabContent } from "@/components/dashboard/DashboardTabContent";
import { useDashboardState } from "@/hooks/useDashboardState";

/**
 * Main application homepage for SaansSetu AI.
 *
 * Coordinates atmospheric data assimilation, CPCB calculations,
 * and multi-tab operational modules.
 */
export default function HomePage() {
  const {
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
  } = useDashboardState();

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
        <LoadingAndErrorStates
          isLoading={isLoading && !apiData}
          loadError={loadError && !apiData ? loadError : null}
          locationName={currentLocation.name}
          onRetry={() => loadAirQuality(currentLocation)}
        />

        {(!isLoading || apiData) && (
          <DashboardTabContent
            activeTab={activeTab}
            aqiResult={aqiResult}
            currentLocation={currentLocation}
            curReadings={curReadings}
            topPriorityScore={topPriorityScore}
            activityAssessment={activityAssessment}
            apiData={apiData}
            members={members}
            onUpdateMembers={handleUpdateMembers}
            routinePlan={routinePlan}
            rooms={rooms}
            onUpdateRooms={handleUpdateRooms}
            language={language}
          />
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
