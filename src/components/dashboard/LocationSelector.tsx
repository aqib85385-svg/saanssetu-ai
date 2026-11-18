"use client";

import React, { useState } from "react";
import { Search, MapPin, Navigation, X, Check } from "lucide-react";
import { LocationData } from "@/types";
import { INDIAN_CITY_PRESETS } from "@/lib/api/open-meteo";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onUseCurrentLocation: () => void;
  isLocating?: boolean;
}

export function LocationSelector({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      // Fallback to presets matching query
      const filtered = INDIAN_CITY_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Select Air Quality Station
            </h3>
            <p className="text-xs text-stone-500">
              Choose an Indian city or use GPS geolocation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Geolocation Button */}
        <div className="pt-4">
          <button
            onClick={() => {
              onUseCurrentLocation();
              onClose();
            }}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 transition-colors"
          >
            <Navigation className={`w-4 h-4 text-forest-700 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Detecting GPS Position..." : "Use My Current Geolocation"}</span>
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian city (e.g. Kanpur, Ghaziabad, Jaipur)..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-stone-900"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 px-3 py-1 rounded-lg text-xs font-medium bg-forest-900 text-white hover:bg-forest-800"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Dynamic Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border-t border-stone-100 pt-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Search Results
            </span>
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {searchResults.map((loc, idx) => (
                <button
                  key={`${loc.name}-${idx}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left text-sm hover:bg-ivory-100 text-forest-950 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                    <span>{loc.name}</span>
                    {loc.admin1 && (
                      <span className="text-xs text-stone-400">({loc.admin1})</span>
                    )}
                  </div>
                  {currentLocation.name === loc.name && (
                    <Check className="w-4 h-4 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Major Indian Smog Metropolitan Presets */}
        <div className="mt-5 border-t border-stone-100 pt-4">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Major Indian Airsheds & Metro Hubs
          </span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {INDIAN_CITY_PRESETS.map((preset) => {
              const isSelected = currentLocation.name === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => {
                    onSelectLocation(preset);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                    isSelected
                      ? "bg-forest-900 text-white border-forest-900 shadow-sm"
                      : "bg-ivory-50/80 hover:bg-ivory-100 text-forest-950 border-stone-200/80"
                  }`}
                >
                  <div className="truncate">
                    <p className="font-semibold truncate">{preset.name}</p>
                    <p className={`text-[10px] ${isSelected ? "text-teal-200" : "text-stone-400"}`}>
                      {preset.admin1 || preset.country}
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-300 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
