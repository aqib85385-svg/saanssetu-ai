"use client";

import React, { RefObject } from "react";
import { AiChatResponse } from "@/lib/gemini/schemas";
import { Bot, User, Sparkles } from "lucide-react";
import { ActionCardItem } from "./ActionCardItem";

/**
 * Single chat message representation.
 */
export interface ChatMessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  structuredData?: AiChatResponse;
  timestamp: string;
}

/**
 * Props for ChatMessageList.
 */
export interface ChatMessageListProps {
  /** Array of messages in chat thread */
  messages: ChatMessageItem[];
  /** Whether a response is loading */
  isLoading: boolean;
  /** Ref for auto-scrolling to bottom */
  messagesEndRef: React.RefObject<HTMLDivElement>;
  /** Callback when follow-up suggestion chip is clicked */
  onSelectSuggestion: (suggestion: string) => void;
}

/**
 * Scrollable list of chat messages with user/bot avatars, markdown text,
 * key takeaway callout, structured action cards, and suggested follow-ups.
 */
export function ChatMessageList({
  messages,
  isLoading,
  messagesEndRef,
  onSelectSuggestion,
}: ChatMessageListProps) {
  return (
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
                      <ActionCardItem key={idx} card={card} />
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
                        onClick={() => onSelectSuggestion(sug)}
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
            <span>Evaluating aerosol models &amp; grounding guidance...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
