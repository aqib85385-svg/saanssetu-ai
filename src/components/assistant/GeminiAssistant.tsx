"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiChatResponse, ActionCard } from "@/lib/gemini/schemas";
import { CpcbAqiResult, FamilyMember, LocationData } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface MessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  structuredData?: AiChatResponse;
  timestamp: string;
}

interface GeminiAssistantProps {
  aqiResult: CpcbAqiResult;
  currentLocation: LocationData;
  members: FamilyMember[];
  language: "en" | "hi";
}

export function GeminiAssistant({
  aqiResult,
  currentLocation,
  members,
  language,
}: GeminiAssistantProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: MessageItem = {
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

      const assistantMsg: MessageItem = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        text: data.reply,
        structuredData: data,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Fallback message
      const errorMsg: MessageItem = {
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

  const promptChips =
    language === "hi"
      ? [
          "क्या मुझे बाहर जाते समय N95 मास्क पहनना चाहिए?",
          "क्या सुबह की सैर (morning walk) पर जाना सुरक्षित है?",
          "घर की खिड़कियां किस समय खोलनी चाहिए?",
          "क्या पौधे (indoor plants) हवा साफ कर सकते हैं?",
        ]
      : [
          "Should I wear an N95 mask outside today?",
          "Is an early morning walk safe in this smog?",
          "When is the safest time to ventilate our home?",
          "Do indoor houseplants really clean PM2.5?",
        ];

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
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-forest-900 text-white"
                      : "bg-teal-700 text-teal-100 shadow-sm"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-forest-900 text-white rounded-tr-none"
                      : "bg-white border border-stone-200 text-stone-900 rounded-tl-none shadow-xs space-y-3"
                  }`}
                >
                  {/* Markdown Reply */}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Structured Data: Key Takeaway */}
                  {msg.structuredData?.keyTakeaway && (
                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-950 font-medium text-xs">
                      <span className="font-bold text-teal-800 uppercase text-[10px] block mb-0.5">
                        Key Takeaway
                      </span>
                      {msg.structuredData.keyTakeaway}
                    </div>
                  )}

                  {/* Structured Data: Action Cards */}
                  {msg.structuredData?.actionCards &&
                    msg.structuredData.actionCards.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        {msg.structuredData.actionCards.map((card, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-ivory-50/90 border border-stone-200 space-y-1.5 text-xs text-stone-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-forest-950">
                                {card.title}
                              </span>
                              <Badge variant="teal" className="text-[10px]">
                                {card.whenToPerform}
                              </Badge>
                            </div>
                            <p className="font-medium text-stone-900">{card.action}</p>
                            <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                              <span className="font-semibold text-stone-700">Reason:</span>{" "}
                              {card.reason}
                            </div>
                            <div className="text-[11px] text-emerald-800">
                              <span className="font-semibold">Expected Impact:</span>{" "}
                              {card.expectedImpact}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Follow-up Question Chips */}
                  {msg.structuredData?.followUpSuggestions && (
                    <div className="pt-2 border-t border-stone-100 space-y-1">
                      <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider block">
                        Suggested Follow-Ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.structuredData.followUpSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-forest-100 hover:text-forest-950 text-stone-700 transition-colors text-left"
                          >
                            → {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 text-right pt-1">{msg.timestamp}</div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-stone-500 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Evaluating aerosol models & grounding guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips Bar */}
        <div className="p-2.5 bg-white border-t border-stone-100 overflow-x-auto flex gap-1.5 scrollbar-none">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-ivory-100 hover:bg-ivory-200 text-forest-950 font-medium whitespace-nowrap border border-stone-200/80 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="p-3 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === "hi"
                  ? "स्मॉग, वेंटिलेशन या स्वास्थ्य के बारे में पूछें..."
                  : "Ask about N95 masks, CADR sizing, bedroom sealing, morning walk..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-stone-900"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              size="md"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
