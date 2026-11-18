import { describe, it, expect } from "vitest";
import { estimateIndoorAirQuality } from "@/lib/engine/indoor-model";
import { IndoorRoomConfig } from "@/types";

describe("Indoor Air Quality Model", () => {
  it("shows higher PM2.5 infiltration for drafty rooms without purifiers", () => {
    const draftyRoom: IndoorRoomConfig = {
      id: "r1",
      roomName: "Living Room",
      areaSqFt: 300,
      ceilingHeightFt: 10,
      sealingQuality: "poor_drafty",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["none"],
    };

    const sealedPurifiedRoom: IndoorRoomConfig = {
      id: "r2",
      roomName: "Bedroom",
      areaSqFt: 150,
      ceilingHeightFt: 10,
      sealingQuality: "well_sealed_weatherstripped",
      hasAirConditioner: true,
      hasPurifier: true,
      purifierCadrCfm: 200,
      indoorSources: ["none"],
    };

    const outdoorAqi = 350;
    const outdoorPm25 = 250;

    const resDrafty = estimateIndoorAirQuality(draftyRoom, outdoorAqi, outdoorPm25);
    const resSealed = estimateIndoorAirQuality(sealedPurifiedRoom, outdoorAqi, outdoorPm25);

    expect(resDrafty.estimatedIndoorPm25).toBeGreaterThan(resSealed.estimatedIndoorPm25);
    expect(resSealed.hepaEffectivenessPercent).toBeGreaterThan(70);
  });

  it("identifies incense (agarbatti) and mosquito coils as major indoor sources", () => {
    const incenseRoom: IndoorRoomConfig = {
      id: "r3",
      roomName: "Puja Room",
      areaSqFt: 80,
      ceilingHeightFt: 9.5,
      sealingQuality: "average",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["agarbatti", "dhoop"],
    };

    const res = estimateIndoorAirQuality(incenseRoom, 200, 120);
    expect(res.sourceContributionPm25).toBeGreaterThan(300);
    expect(res.keyMitigations.some((m) => m.toLowerCase().includes("agarbatti") || m.toLowerCase().includes("combustion"))).toBe(true);
  });

  it("contains transparent scientific disclaimer explaining these are model estimates", () => {
    const room: IndoorRoomConfig = {
      id: "r4",
      roomName: "Study",
      areaSqFt: 100,
      ceilingHeightFt: 9,
      sealingQuality: "average",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["none"],
    };

    const res = estimateIndoorAirQuality(room, 200, 120);
    expect(res.scientificAssumptions.some((a) => a.includes("DISCLAIMER"))).toBe(true);
    expect(res.scientificAssumptions.some((a) => a.includes("plants"))).toBe(true);
  });

  it("handles smoking, frying, and mosquito coils in closed rooms", () => {
    const smokingRoom: IndoorRoomConfig = {
      id: "r5",
      roomName: "Balcony Room",
      areaSqFt: 150,
      ceilingHeightFt: 10,
      sealingQuality: "poor_drafty",
      hasAirConditioner: false,
      hasPurifier: true,
      purifierCadrCfm: 40, // very undersized CADR
      indoorSources: ["smoking", "frying", "mosquito_coil"],
    };

    const res = estimateIndoorAirQuality(smokingRoom, 250, 180);
    expect(res.sourceContributionPm25).toBeGreaterThan(600);
    expect(res.primaryIndoorRisk).toContain("combustion");
    expect(res.hepaEffectivenessPercent).toBeLessThan(60);
    expect(res.keyMitigations.some((m) => m.includes("undersized"))).toBe(true);
  });

  it("estimates indoor AQI brackets accurately for moderate particulate ranges", () => {
    // Test room with average sealing and moderate ambient PM2.5 (e.g. 70 ug/m3 -> indoor ~40 ug/m3 -> bracket 31-60)
    const moderateRoom: IndoorRoomConfig = {
      id: "r6",
      roomName: "Bedroom 2",
      areaSqFt: 140,
      ceilingHeightFt: 9.5,
      sealingQuality: "average",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["none"],
    };

    const resModerate = estimateIndoorAirQuality(moderateRoom, 130, 70);
    expect(resModerate.estimatedIndoorPm25).toBeGreaterThanOrEqual(30);
    expect(resModerate.estimatedIndoorPm25).toBeLessThanOrEqual(60);
    expect(resModerate.estimatedIndoorAqi).toBeGreaterThan(50);
    expect(resModerate.estimatedIndoorAqi).toBeLessThanOrEqual(100);

    // Test room in bracket 91-120 ug/m3
    const elevatedRoom: IndoorRoomConfig = {
      id: "r7",
      roomName: "Dining",
      areaSqFt: 200,
      ceilingHeightFt: 10,
      sealingQuality: "poor_drafty",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["none"],
    };

    const resElevated = estimateIndoorAirQuality(elevatedRoom, 220, 140);
    expect(resElevated.estimatedIndoorAqi).toBeGreaterThanOrEqual(100);
  });
});
