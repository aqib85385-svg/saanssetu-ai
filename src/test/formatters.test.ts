import { describe, it, expect } from "vitest";
import {
  formatAqi,
  formatConcentration,
  formatKgCo2,
  getAqiCategoryColor,
} from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { CpcbCategory } from "@/types";

describe("Formatters and Visual Utilities", () => {
  it("merges class names cleanly with cn utility", () => {
    expect(cn("px-4", "py-2", { "bg-red-500": true, "hidden": false })).toContain("px-4");
    expect(cn("px-4 px-6")).toBe("px-6");
  });

  it("formats AQI values correctly and handles invalid inputs", () => {
    expect(formatAqi(152.4)).toBe("152");
    expect(formatAqi(0)).toBe("0");
    expect(formatAqi(-5)).toBe("--");
    expect(formatAqi(NaN)).toBe("--");
  });

  it("formats pollutant concentrations with units", () => {
    expect(formatConcentration(125.67)).toBe("125.7 µg/m³");
    expect(formatConcentration(1.23, "mg/m³")).toBe("1.2 mg/m³");
    expect(formatConcentration(-1)).toBe("-- µg/m³");
    expect(formatConcentration(NaN)).toBe("-- µg/m³");
  });

  it("formats carbon emissions in g or kg", () => {
    expect(formatKgCo2(0.45)).toBe("450 g");
    expect(formatKgCo2(3.567)).toBe("3.57 kg");
    expect(formatKgCo2(12.0)).toBe("12 kg");
  });

  it("returns styling for all 7 official CPCB categories", () => {
    const categories: CpcbCategory[] = [
      "Good",
      "Satisfactory",
      "Moderately Polluted",
      "Poor",
      "Very Poor",
      "Severe",
      "Severe+ / Hazardous",
    ];

    for (const cat of categories) {
      const colors = getAqiCategoryColor(cat);
      expect(colors).toHaveProperty("text");
      expect(colors).toHaveProperty("bg");
      expect(colors).toHaveProperty("border");
      expect(colors).toHaveProperty("dot");
      expect(colors.text.length).toBeGreaterThan(0);
    }
  });
});
