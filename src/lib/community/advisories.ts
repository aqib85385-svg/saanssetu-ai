import { CommunityAdvisory, CpcbAqiResult } from "@/types";

export function getCommunityAdvisories(aqiResult: CpcbAqiResult, locationName: string): CommunityAdvisory[] {
  const aqi = aqiResult.aqi;

  const advisories: CommunityAdvisory[] = [
    {
      target: "Schools",
      triggerCondition: aqi > 400 ? "GRAP Stage III / IV Trigger (Severe+)" : aqi > 300 ? "GRAP Stage II (Very Poor)" : "Preventive Winter Guidelines",
      headline: aqi > 400
        ? "Emergency Suspension of Physical Schooling (Primary & Middle)"
        : aqi > 300
        ? "Mandatory Cancellation of Outdoor Morning Assemblies & Sports"
        : "Standard Winter Smog School Safeguards",
      actionItems: aqi > 400
        ? [
            "Mandate online classes for nursery through 8th standard immediately in accordance with CAQM GRAP IV guidelines.",
            "Indoor seating with closed windows for senior exam classes; no outdoor sports or physical training (PT).",
            "Bus transport: Keep windows rolled up; bus drivers strictly prohibited from idling diesel engines while waiting.",
          ]
        : [
            "Conduct morning prayers/assemblies inside classrooms or broadcast via PA system; cancel outdoor ground assemblies.",
            "Substitute outdoor sports periods with indoor board games, library study, or environmental education.",
            "Provide clean drinking water hydration breaks to help clear throat particulate irritation.",
          ],
      whatsappShareText: `🏫 *SCHOOL & PARENT SMOG ALERT (${locationName})*\n\n⚠️ *Current CPCB AQI:* ${aqi} (${aqiResult.category})\n\n*Urgent School Actions Required:*\n• ${aqi > 400 ? "Online classes for primary grades (GRAP Stage IV)" : "Cancel all outdoor morning assemblies and sports"}\n• Keep classroom windows latched; avoid early morning outdoor play\n• Children commuting must wear well-fitted N95 masks\n\n_Generated via SaansSetu AI Environmental Intelligence_`,
    },
    {
      target: "Housing Societies (RWAs)",
      triggerCondition: "Winter Smog RWA Action Matrix",
      headline: "RWA / Society Smog Action Plan & Clean Heat Initiative",
      actionItems: [
        "🔥 Provide electric room heaters (oil/quartz) to all night security guards and maintenance staff to eliminate biomass, dry leaf, and trash burning in metal drums.",
        "💧 Water-sprinkle internal paved roads and perimeter trees daily at 11:30 AM to suppress settled road dust resuspension.",
        "🍂 Enforce strict zero-burning penalty for garden leaf litter; mandate on-site composting pits.",
        "🚗 Mandate security guards turn off visitor car idling at main gates; promote carpooling boards on society apps.",
      ],
      whatsappShareText: `🏢 *RESIDENT WELFARE ASSOCIATION (RWA) NOTICE*\n\n📍 *Location:* ${locationName} | *AQI:* ${aqi} (${aqiResult.category})\n\n*Society Winter Smog Protocol:*\n1. ✅ *Guard Welfare:* Management has provided electric heaters for night shifts. Open wood/trash burning is strictly prohibited.\n2. 💧 *Dust Control:* Internal roads will be watered at 11:30 AM.\n3. 🚫 *Zero Leaf Burning:* Sweepers instructed to compost dry leaves.\n\n_Let's protect our community's lungs together. — SaansSetu AI_`,
    },
    {
      target: "Workplaces",
      triggerCondition: aqi > 300 ? "Critical Smog Exposure Alert" : "Air Quality Best Practices",
      headline: "Corporate Workplace Air Safety & Commute Flexibility",
      actionItems: [
        aqi > 300
          ? "Implement voluntary Work-From-Home (WFH) or staggered timings (11:00 AM - 04:00 PM) to avoid peak smog inversion windows."
          : "Encourage hybrid working for employees with asthma, elderly parents, or infants.",
        "Upgrade HVAC building intake filters to minimum MERV 13 / MERV 14; verify differential pressure gauges.",
        "Incentivize metro passes and company AC shuttle buses over solo petrol/diesel cars.",
      ],
      whatsappShareText: `💼 *WORKPLACE AIR QUALITY ADVISORY*\n\n*Airshed:* ${locationName} | *CPCB AQI:* ${aqi}\n\n*Recommendations for Employers & Teams:*\n• Stagger morning commute hours to avoid 7:30 - 9:30 AM peak inversion.\n• WFH recommended for sensitive groups and expectant mothers.\n• Commercial buildings: verify HVAC fresh-air intake filtration.\n\n_SaansSetu AI Workplace Health Engine_`,
    },
    {
      target: "Family WhatsApp",
      triggerCondition: "Daily Family Protection Briefing",
      headline: "Family & Senior WhatsApp Broadcast Card",
      actionItems: [
        "Copy and forward this pre-formatted message to your family WhatsApp group to warn elders against early morning walks and remind kids to wear N95 masks.",
      ],
      whatsappShareText: `🫁 *SAANSSETU DAILY FAMILY HEALTH ALERT*\n\n📍 *City:* ${locationName}\n📊 *CPCB AQI:* ${aqi} (${aqiResult.category})\n🔴 *Primary Pollutant:* ${aqiResult.primaryPollutant}\n\n*4 Must-Do Steps Today:*\n1. 🚫 *Dada-Dadi/Parents:* Please cancel morning walks between 5 AM - 9:30 AM. Do light yoga inside.\n2. 😷 *Commuting:* Wear an N95 mask before stepping outside. Normal cloth masks do not stop PM2.5.\n3. 🪟 *Windows:* Keep windows shut. Midday (1-3 PM) is the only time for quick fresh air.\n4. 🧹 *Cleaning:* Use wet mopping (pocha) only; no dry sweeping. Turn on bedroom air purifier 45 mins before bedtime.\n\n_Share to protect family members! Generated by SaansSetu AI_`,
    },
  ];

  return advisories;
}
