import { describe, it, expect } from "vitest";
import { getCommunityAdvisories } from "@/lib/community/advisories";
import { calculateCpcbAqi } from "@/lib/aqi/cpcb-calculator";

describe("Community Advisories & GRAP Protocol Engine", () => {
  it("triggers GRAP Stage IV emergency school shutdown when AQI > 400", () => {
    const severeAqi = calculateCpcbAqi({ pm25: 350 });
    const advisories = getCommunityAdvisories(severeAqi, "New Delhi (NCR)");

    const schoolAdv = advisories.find((a) => a.target === "Schools");
    expect(schoolAdv).toBeDefined();
    expect(schoolAdv?.headline).toContain("Emergency Suspension");
    expect(schoolAdv?.whatsappShareText).toContain("GRAP Stage IV");
  });

  it("triggers RWA guard clean-heat advisory with electric heater distribution", () => {
    const poorAqi = calculateCpcbAqi({ pm25: 110 });
    const advisories = getCommunityAdvisories(poorAqi, "Gurugram");

    const rwaAdv = advisories.find((a) => a.target === "Housing Societies (RWAs)");
    expect(rwaAdv).toBeDefined();
    expect(rwaAdv?.actionItems.some((a) => a.includes("electric room heaters"))).toBe(true);
    expect(rwaAdv?.whatsappShareText).toContain("Guard Welfare");
  });

  it("generates WhatsApp shareable message for families with emojis and action points", () => {
    const aqiResult = calculateCpcbAqi({ pm25: 220 });
    const advisories = getCommunityAdvisories(aqiResult, "Noida Sector 62");

    const familyAdv = advisories.find((a) => a.target === "Family WhatsApp");
    expect(familyAdv).toBeDefined();
    expect(familyAdv?.whatsappShareText).toContain("Dada-Dadi");
    expect(familyAdv?.whatsappShareText).toContain("N95");
    expect(familyAdv?.whatsappShareText).toContain("SaansSetu AI");
  });
});
