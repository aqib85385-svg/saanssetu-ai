"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";

/**
 * Props for ChatInputBar.
 */
export interface ChatInputBarProps {
  /** Current text query in input */
  inputQuery: string;
  /** Setter for input text */
  onChangeQuery: (text: string) => void;
  /** Submit handler */
  onSubmit: (e?: React.FormEvent) => void;
  /** Whether response is currently streaming or fetching */
  isLoading: boolean;
  /** Array of clickable prompt chips */
  promptChips: string[];
  /** Handler when a prompt chip is clicked */
  onSelectPrompt: (chip: string) => void;
  /** UI language for input placeholder */
  language: "en" | "hi";
}

/**
 * Chat input bar containing quick prompt suggestion chips and message input field.
 */
export function ChatInputBar({
  inputQuery,
  onChangeQuery,
  onSubmit,
  isLoading,
  promptChips,
  onSelectPrompt,
  language,
}: ChatInputBarProps) {
  return (
    <>
      {/* Prompt Chips Bar */}
      <div className="p-2.5 bg-white border-t border-stone-100 overflow-x-auto flex gap-1.5 scrollbar-none">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(chip)}
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
            onSubmit(e);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => onChangeQuery(e.target.value)}
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
    </>
  );
}
