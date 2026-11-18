import { CpcbCategory } from "@/types";

export function formatAqi(val: number): string {
  if (isNaN(val) || val < 0) return "--";
  return Math.round(val).toString();
}

export function formatConcentration(val: number, unit: string = "µg/m³"): string {
  if (isNaN(val) || val < 0) return `-- ${unit}`;
  return `${Number(val.toFixed(1))} ${unit}`;
}

export function formatKgCo2(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`;
  }
  return `${Number(kg.toFixed(2))} kg`;
}

export function getAqiCategoryColor(category: CpcbCategory): {
  text: string;
  bg: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case "Good":
      return {
        text: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-300 dark:border-emerald-800",
        dot: "bg-emerald-500",
      };
    case "Satisfactory":
      return {
        text: "text-lime-700 dark:text-lime-300",
        bg: "bg-lime-50 dark:bg-lime-950/40",
        border: "border-lime-300 dark:border-lime-800",
        dot: "bg-lime-500",
      };
    case "Moderately Polluted":
      return {
        text: "text-amber-800 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-300 dark:border-amber-800",
        dot: "bg-amber-500",
      };
    case "Poor":
      return {
        text: "text-orange-800 dark:text-orange-300",
        bg: "bg-orange-50 dark:bg-orange-950/40",
        border: "border-orange-300 dark:border-orange-800",
        dot: "bg-orange-500",
      };
    case "Very Poor":
      return {
        text: "text-red-800 dark:text-red-300",
        bg: "bg-red-50 dark:bg-red-950/40",
        border: "border-red-300 dark:border-red-800",
        dot: "bg-red-500",
      };
    case "Severe":
      return {
        text: "text-rose-900 dark:text-rose-200",
        bg: "bg-rose-100 dark:bg-rose-950/70",
        border: "border-rose-400 dark:border-rose-700",
        dot: "bg-rose-600",
      };
    case "Severe+ / Hazardous":
      return {
        text: "text-red-400",
        bg: "bg-stone-900",
        border: "border-red-600",
        dot: "bg-red-500 animate-ping",
      };
  }
}
