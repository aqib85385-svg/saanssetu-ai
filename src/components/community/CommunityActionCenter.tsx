"use client";

import React, { useState } from "react";
import { CpcbAqiResult } from "@/types";
import { getCommunityAdvisories } from "@/lib/community/advisories";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Users2,
  School,
  Building2,
  Briefcase,
  Share2,
  Copy,
  Check,
  Flame,
  Droplets,
  Award,
} from "lucide-react";

interface CommunityActionCenterProps {
  aqiResult: CpcbAqiResult;
  locationName: string;
}

export function CommunityActionCenter({
  aqiResult,
  locationName,
}: CommunityActionCenterProps) {
  const [activeTab, setActiveTab] = useState<
    "Schools" | "Housing Societies (RWAs)" | "Workplaces" | "Family WhatsApp"
  >("Schools");

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const advisories = getCommunityAdvisories(aqiResult, locationName);
  const currentAdvisory =
    advisories.find((a) => a.target === activeTab) || advisories[0];

  const handleCopyWhatsApp = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Community collective action challenges
  const [challenges, setChallenges] = useState([
    {
      id: "c1",
      title: "Clean Heat for Guards: Donate an Electric Quartz/Oil Heater",
      impact: "Stops 1 night of wood/trash/leaf burning (~2.5 kg PM2.5 emissions)",
      done: false,
    },
    {
      id: "c2",
      title: "RWA Tree & Perimeter Road Water Sprinkling at 11:30 AM",
      impact: "Suppresses 40% of resuspended roadside silt",
      done: true,
    },
    {
      id: "c3",
      title: "Mandate Zero-Idling for Delivery and Visitor Cabs at Society Gate",
      impact: "Eliminates concentrated tailpipe plumes at pedestrian entrance",
      done: false,
    },
    {
      id: "c4",
      title: "Organize Society Carpooling WhatsApp Group for Metro Commuters",
      impact: "Avoids ~85 kg CO2 and 4 individual car trips daily",
      done: false,
    },
  ]);

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
          <Users2 className="w-6 h-6 text-forest-700" />
          <span>Community Action Center & GRAP Protocols</span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Collective defenses, RWA guard clean-heat initiatives, school safeguards, and WhatsApp-ready family alerts
        </p>
      </div>

      {/* Target Audience Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        {[
          { id: "Schools", label: "Schools & Colleges", icon: School },
          { id: "Housing Societies (RWAs)", label: "Housing Societies (RWA)", icon: Building2 },
          { id: "Workplaces", label: "Corporate Workplaces", icon: Briefcase },
          { id: "Family WhatsApp", label: "Family WhatsApp Alert", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-forest-900 text-forest-950 bg-white"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Advisory Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Official Guidance & Checklist */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-600 tracking-wider">
                  Target: {currentAdvisory.target}
                </span>
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  {currentAdvisory.headline}
                </h3>
              </div>
              <Badge variant="hazard" className="self-start sm:self-auto text-xs">
                {currentAdvisory.triggerCondition}
              </Badge>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Standard Operating Procedures (SOPs):
              </span>
              {currentAdvisory.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-50/70 border border-stone-200 text-xs text-stone-800 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-forest-900 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Collective Action Checklist / Challenges */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-semibold text-base text-forest-950 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>RWA & Society Low-Emission Challenge</span>
              </h4>
              <span className="text-xs font-mono text-emerald-800 font-semibold">
                {challenges.filter((c) => c.done).length}/{challenges.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {challenges.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleChallenge(c.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    c.done
                      ? "bg-emerald-50/50 border-emerald-300 text-emerald-950"
                      : "bg-white border-stone-200 text-stone-800 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        c.done
                          ? "bg-forest-900 border-forest-900 text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {c.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{c.title}</p>
                      <p className="text-[11px] text-stone-500">{c.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pre-Formatted WhatsApp Share Card */}
        <div className="space-y-4">
          <Card className="p-5 border-emerald-300/80 bg-emerald-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-forest-950 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp Broadcast Card</span>
              </h4>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleCopyWhatsApp(currentAdvisory.whatsappShareText, 0)}
                className="text-xs py-1 px-3"
              >
                {copiedIndex === 0 ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Broadcast
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-stone-500">
              Pre-formatted with emojis and bullet points for instant sharing to family or RWA WhatsApp groups:
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {currentAdvisory.whatsappShareText}
            </div>

            <div className="text-[11px] text-stone-600 font-medium text-center">
              Tap &apos;Copy Broadcast&apos; and paste directly into WhatsApp or Telegram.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
