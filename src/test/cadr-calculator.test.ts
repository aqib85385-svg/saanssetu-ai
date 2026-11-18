import { describe, it, expect } from "vitest";
import { calculateRoomCadr } from "@/lib/engine/cadr-calculator";
import { IndoorRoomConfig } from "@/types";

describe("CADR and Air Purifier Engine", () => {
  it("calculates room volume and required CADR for 4.5 ACH correctly", () => {
    const room: IndoorRoomConfig = {
      id: "room-1",
      roomName: "Master Bedroom",
      areaSqFt: 200,
      ceilingHeightFt: 10,
      sealingQuality: "average",
      hasAirConditioner: true,
      hasPurifier: true,
      purifierCadrCfm: 150,
      indoorSources: ["none"],
    };

    const res = calculateRoomCadr(room, 4.5);

    // Volume = 200 * 10 = 2000 cu ft
    expect(res.roomVolumeCuFt).toBe(2000);
    // Required CADR = (2000 * 4.5) / 60 = 150 CFM
    expect(res.requiredCadrCfm).toBe(150);
    expect(res.requiredCadrM3h).toBe(Math.round(150 * 1.69901));
    // Purifier delivers 150 CFM -> 4.5 ACH
    expect(res.currentAchWithPurifier).toBe(4.5);
    expect(res.status).toBe("optimal");
  });

  it("identifies insufficient purifier capacity", () => {
    const room: IndoorRoomConfig = {
      id: "room-2",
      roomName: "Large Living Room",
      areaSqFt: 400,
      ceilingHeightFt: 10, // 4000 cu ft
      sealingQuality: "poor_drafty",
      hasAirConditioner: true,
      hasPurifier: true,
      purifierCadrCfm: 80, // only achieves 1.2 ACH
      indoorSources: ["none"],
    };

    const res = calculateRoomCadr(room, 4.5);
    expect(res.currentAchWithPurifier).toBe(1.2);
    expect(res.status).toBe("insufficient");
    expect(res.recommendations.some((r) => r.includes("below"))).toBe(true);
  });

  it("handles rooms with no purifier installed", () => {
    const room: IndoorRoomConfig = {
      id: "room-3",
      roomName: "Kid Bedroom",
      areaSqFt: 120,
      ceilingHeightFt: 9.5,
      sealingQuality: "average",
      hasAirConditioner: false,
      hasPurifier: false,
      indoorSources: ["none"],
    };

    const res = calculateRoomCadr(room, 4.5);
    expect(res.status).toBe("no_purifier");
    expect(res.currentAchWithPurifier).toBe(0);
    expect(res.budgetOptions.length).toBeGreaterThanOrEqual(3);
    // Verifies budget DIY box fan option is present
    expect(res.budgetOptions.some((b) => b.name.includes("DIY"))).toBe(true);
  });
});
