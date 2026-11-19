"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiChatResponse } from "@/lib/gemini/schemas";
import { CpcbAqiResult, FamilyMember, LocationData } from "@/types";
import { Card } from "@/components/ui/Card";
import { Sparkles, ShieldCheck } from "lucide-react";
import { ChatMessageItem, ChatMessageList } from "./ChatMessageList";
import { ChatInputBar } from "./ChatInputBar";

/**
 * Props for GeminiAssistant component.
 */
export interface GeminiAssistantProps {
  /** Active CPCB AQI result for current selected city */
  aqiResult: CpcbAqiResult;
  /** Geocoded location data */
  currentLocation: LocationData;
  /** Household member profiles for personalization context */
  members: FamilyMember[];
  /** UI language ('en' | 'hi') */
  language: "en" | "hi";
}

const PROMPT_CHIPS_HI = [
  "क्या मुझे बाहर जाते समय N95 मास्क पहनना चाहिए?",
  "क्या सुबह की सैर (morning walk) पर जाना सुरक्षित है?",
  "घर की खिड़कियां किस समय खोलनी चाहिए?",
  "क्या पौधे (indoor plants) हवा साफ कर सकते हैं?",
];

const PROMPT_CHIPS_EN = [
  "Should I wear an N95 mask outside today?",
  "Is an early morning walk safe in this smog?",
  "When is the safest time to ventilate our home?",
  "Do indoor houseplants really clean PM2.5?",
];

/**
 * Conversational Environmental AI assistant interface anchored to live aerosol physics
 * and personalized household health profiles.
 */
export function GeminiAssistant({
  aqiResult,
  currentLocation,
  members,
  language,
}: GeminiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "initial-welcome",
      sender: "assistant",
      text:
        language === "hi"
          ? `नमस्ते! मैं **SaansSetu AI** हूँ — आपका व्यक्तिगत पर्यावरण और स्मॉग सुरक्षा सहायक। वर्तमान में **${currentLocation.name}** में AQI **${aqiResult.aqi} (${aqiResult.category})** है। आप मुझसे मास्क, वेंटिलेशन, सुबह की सैर, बच्चों की सुरक्षा या एयर प्यूरीफायर से जुड़ा कोई भी सवाल पूछ सकते हैं।`
          : `Hello! I am **SaansSetu AI** — your winter smog intelligence and environmental defense assistant. Ambient air quality in **${currentLocation.name}** is currently **AQI ${aqiResult.aqi} (${aqiResult.category})** with ${aqiResult.primaryPollutant} as primary pollutant. Ask me any question on mask selection, ventilation timing, morning walks, or household protection.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const payload = {
        message: textToSend,
        language,
        context: {
          locationName: currentLocation.name,
          aqi: aqiResult.aqi,
          category: aqiResult.category,
          primaryPollutant: aqiResult.primaryPollutant,
          householdMembersCount: members.length,
          hasSensitiveMembers: members.some(
            (m) =>
              m.sensitivities.length > 0 ||
              m.ageGroup === "infant" ||
              m.ageGroup === "elderly"
          ),
        },
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data: AiChatResponse = await res.json();

      const assistantMsg: ChatMessageItem = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        text: data.reply,
        structuredData: data,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessageItem = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text:
          language === "hi"
            ? "क्षमा करें, नेटवर्क में अस्थायी रुकावट आई है। कृपया पुनः प्रयास करें।"
            : "Network interruption encountered. Generating grounded fallback guidance.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptChips = language === "hi" ? PROMPT_CHIPS_HI : PROMPT_CHIPS_EN;

  return (
    <div className="space-y-4">
      {/* Title & Grounding Verification Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-2xl text-forest-950 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>SaansSetu Conversational AI</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Context-aware environmental intelligence powered by scientific decision engines
          </p>
        </div>

        {/* Fact Grounding Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory-100 border border-stone-200 text-xs text-forest-900 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Anchored to {currentLocation.name} • AQI {aqiResult.aqi}
          </span>
        </div>
      </div>

      {/* Main Chat Window */}
      <Card className="p-0 overflow-hidden border-stone-200 shadow-card flex flex-col h-[600px]">
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onSelectSuggestion={(sug) => handleSendMessage(sug)}
        />

        <ChatInputBar
          inputQuery={inputQuery}
          onChangeQuery={setInputQuery}
          onSubmit={() => handleSendMessage()}
          isLoading={isLoading}
          promptChips={promptChips}
          onSelectPrompt={(chip) => handleSendMessage(chip)}
          language={language}
        />
      </Card>
    </div>
  );
}
