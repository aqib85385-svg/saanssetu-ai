"use client";

import React from "react";
import { Wind, ShieldAlert, Globe, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LocationData, CpcbCategory } from "@/types";

interface HeaderProps {
  currentLocation: LocationData;
  category: CpcbCategory;
  aqi: number;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  language: "en" | "hi";
  onLanguageToggle: () => void;
  onOpenLocationSearch: () => void;
}

export function Header({
  currentLocation,
  category,
  aqi,
  activeTab,
  onTabChange,
  language,
  onLanguageToggle,
  onOpenLocationSearch,
}: HeaderProps) {
  const isSevere = aqi > 300;

  const navItems = [
    { id: "dashboard", labelEn: "Air Intelligence", labelHi: "वायु गुणवत्ता", icon: Wind },
    { id: "family", labelEn: "Family Health", labelHi: "परिवार स्वास्थ्य", icon: ShieldAlert },
    { id: "routine", labelEn: "Daily Routine", labelHi: "दैनिक योजना" },
    { id: "indoor", labelEn: "Indoor Protection", labelHi: "इनडोर सुरक्षा" },
    { id: "commute", labelEn: "Clean Commute", labelHi: "क्लीन कम्यूट" },
    { id: "assistant", labelEn: "AI Assistant", labelHi: "AI सहायक", special: true },
    { id: "community", labelEn: "Community", labelHi: "सामुदायिक" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200/90 transition-all">
      {/* Emergency Smog Alert Banner (GRAP Trigger) */}
      {isSevere && (
        <div className="bg-stone-900 text-red-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-red-900">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>
            {language === "hi"
              ? `गंभीर स्मॉग अलर्ट: ${currentLocation.name} में AQI ${aqi} पहुंच चुका है (GRAP लागू)। खिड़कियां बंद रखें और N95 मास्क पहनें।`
              : `CRITICAL SMOG ALERT: AQI ${aqi} in ${currentLocation.name}. Severe health emergency. Keep windows sealed & wear N95 outdoors.`}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-teal-300 shadow-sm">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-forest-950">
                  SaansSetu AI
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-forest-100 text-forest-800 font-mono font-medium">
                  साँस सेतु
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Urban Smog & Air Intelligence for Indian Families
              </p>
            </div>
          </div>

          {/* Location & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Location selector trigger */}
            <button
              onClick={onOpenLocationSearch}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-ivory-100 hover:bg-ivory-200 text-forest-900 border border-stone-200/80 transition-colors"
              title="Change monitoring station or city"
            >
              <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[180px] font-medium">
                {currentLocation.name}
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Change</span>
            </button>

            {/* Live AQI Badge */}
            <Badge
              variant={aqi > 300 ? "hazard" : aqi > 200 ? "danger" : aqi > 100 ? "warning" : "success"}
              className="hidden sm:inline-flex text-xs py-1 px-2.5 font-mono"
            >
              AQI {aqi} • {category}
            </Badge>

            {/* Language toggle */}
            <button
              onClick={onLanguageToggle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-forest-900 hover:bg-stone-100 border border-stone-200 transition-colors"
              aria-label="Toggle language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-semibold">{language === "en" ? "हिंदी" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav
          className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-stone-100 text-xs sm:text-sm font-medium"
          aria-label="Dashboard views"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-forest-900 text-white font-semibold shadow-sm"
                    : item.special
                    ? "text-teal-700 hover:bg-teal-50 font-medium"
                    : "text-stone-600 hover:text-forest-900 hover:bg-stone-100"
                }`}
              >
                {item.special && <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />}
                {language === "hi" ? item.labelHi : item.labelEn}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
