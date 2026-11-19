"use client";

import React from "react";
import { AlertCircle, RefreshCw, Wind } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Props for LoadingAndErrorStates.
 */
export interface LoadingAndErrorStatesProps {
  /** True when initial atmospheric data is loading */
  isLoading: boolean;
  /** Error message string if data load failed */
  loadError: string | null;
  /** Location name being fetched */
  locationName: string;
  /** Retry callback */
  onRetry: () => void;
}

/**
 * Visual loading indicator and error recovery banner for dashboard atmospheric data.
 */
export function LoadingAndErrorStates({
  isLoading,
  loadError,
  locationName,
  onRetry,
}: LoadingAndErrorStatesProps) {
  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="inline-block p-4 rounded-2xl bg-forest-900 text-teal-300 shadow-glass">
          <Wind className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="font-serif font-bold text-xl text-forest-950">
          Synchronizing CAMS Atmospheric Data...
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Fetching Copernicus CAMS global model assimilation and Indian CPCB NAQI breakpoints for {locationName}.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-red-950">
          Station Data Fetch Error
        </h3>
        <p className="text-xs text-stone-600">{loadError}</p>
        <Button size="sm" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry Connection
        </Button>
      </div>
    );
  }

  return null;
}
