"use client";

import React, { useState } from "react";
import { HourlyForecastItem, DailyForecastItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sun, Moon, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { getAqiCategoryColor } from "@/lib/utils/formatters";

interface DiurnalForecastProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export function DiurnalForecast({ hourly, daily }: DiurnalForecastProps) {
  const [activeView, setActiveView] = useState<"24h" | "7day">("24h");

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span>Diurnal Atmospheric Forecast & Smog Dynamics</span>
          </CardTitle>
          <p className="text-xs text-stone-500 mt-0.5">
            Hourly planetary boundary layer dispersion model & weekly outlook
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-stone-100 p-0.5 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveView("24h")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === "24h"
                ? "bg-white text-forest-950 font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Next 24 Hours
          </button>
          <button
            onClick={() => setActiveView("7day")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === "7day"
                ? "bg-white text-forest-950 font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            7-Day Outlook
          </button>
        </div>
      </div>

      <div className="pt-4">
        {activeView === "24h" ? (
          <div>
            <div className="flex items-center justify-between pb-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Midday Convective Valley (Cleanest)
              </span>
              <span className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Night / Morning Inversion Trap (Peak Smog)
              </span>
            </div>

            {/* Hourly horizontal scroll */}
            <div
              tabIndex={0}
              aria-label="Hourly diurnal air quality forecast timeline"
              className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin focus:outline-none focus:ring-2 focus:ring-forest-600/40 rounded-2xl"
              onKeyDown={(e) => {
                if (e.target === e.currentTarget) {
                  if (e.key === "ArrowRight") {
                    e.currentTarget.scrollBy({ left: 80, behavior: "smooth" });
                  } else if (e.key === "ArrowLeft") {
                    e.currentTarget.scrollBy({ left: -80, behavior: "smooth" });
                  }
                }
              }}
            >
              {hourly.map((item, idx) => {
                const colors = getAqiCategoryColor(item.category);
                const isNight =
                  item.hourFormatted.includes("AM") &&
                  (parseInt(item.hourFormatted) <= 8 || parseInt(item.hourFormatted) === 12);

                return (
                  <div
                    key={`${item.time}-${idx}`}
                    className="flex-shrink-0 w-20 p-3 rounded-2xl bg-ivory-50/70 border border-stone-200/80 flex flex-col items-center justify-between text-center space-y-1.5 hover:bg-white hover:border-forest-600 transition-all"
                  >
                    <span className="text-xs font-medium text-stone-600">
                      {item.hourFormatted}
                    </span>

                    <span className={`w-2 h-2 rounded-full ${colors.dot}`} />

                    <div className="font-serif font-bold text-lg text-stone-900">
                      {item.aqi}
                    </div>

                    <div className="text-[10px] text-stone-600 font-mono">
                      {item.pm25} µg
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium truncate max-w-full ${colors.bg} ${colors.text}`}
                    >
                      {item.category.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daily.map((day) => {
              const colors = getAqiCategoryColor(day.category);
              return (
                <div
                  key={day.date}
                  className="p-3.5 rounded-2xl bg-ivory-50/80 border border-stone-200 flex flex-col justify-between space-y-2 hover:bg-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-forest-950">
                      {day.dayOfWeek}
                    </span>
                    <span className="text-[10px] text-stone-600 font-medium">
                      {day.date.slice(5)}
                    </span>
                  </div>

                  <div>
                    <div className="font-serif font-bold text-2xl text-stone-900">
                      {day.aqi}
                    </div>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${colors.bg} ${colors.text}`}
                    >
                      {day.category}
                    </span>
                  </div>

                  <div className="text-[10px] text-stone-500 border-t border-stone-200/60 pt-2">
                    PM2.5: {day.pm25Min} – {day.pm25Max} µg/m³
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
