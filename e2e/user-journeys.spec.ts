import { test, expect } from "@playwright/test";

test.describe("SaansSetu AI Core User Journeys", () => {
  test("Journey 1: Dashboard loads with CPCB AQI, primary pollutant and activity windows", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Title branding check
    await expect(page.locator("header").getByText("SaansSetu AI")).toBeVisible();
    await expect(page.locator("text=Indian CPCB NAQI")).toBeVisible();

    // Multipollutant grid
    await expect(page.locator("text=Multipollutant Sub-Indices")).toBeVisible();
    await expect(page.locator("text=PM2.5")).toBeVisible();

    // Diurnal activity windows
    await expect(page.locator("text=Diurnal Activity Windows")).toBeVisible();
    await expect(page.locator("text=Safest Outdoor Window")).toBeVisible();
    await expect(page.locator("text=Hazardous Inversion Trap")).toBeVisible();
  });

  test("Journey 2: Location selector allows switching Indian cities", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click Change location
    await page.click("button[title*='monitoring station']");

    // Modal appears with presets
    await expect(page.locator("text=Select Air Quality Station")).toBeVisible();
    await expect(page.locator("text=Gurugram (Cyber City)")).toBeVisible();

    // Click Gurugram
    await page.click("text=Gurugram (Cyber City)");

    // Header now reflects Gurugram
    await expect(page.locator("header")).toContainText("Gurugram");
  });

  test("Journey 3: Family health profile allows adding vulnerable members and viewing biological explanations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Switch to Family Health tab
    await page.click("text=Family Health");
    await expect(page.locator("text=Family Health & Vulnerability Profile")).toBeVisible();

    // Check preloaded members
    await expect(page.locator("text=Dadi (Grandmother, 68y)")).toBeVisible();

    // Click Add Member
    await page.click("text=Add Member");
    await page.fill("input[placeholder*='e.g. Papa']", "Chachu (Delhi Police)");
    await page.click("text=Asthma");
    await page.click("text=Save Member");

    // New member card appears with vulnerability score
    await expect(page.locator("text=Chachu (Delhi Police)")).toBeVisible();
  });

  test("Journey 4: Daily Routine Planner adheres to strict ventilation and commute guidance", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click("text=Daily Routine");
    await expect(page.locator("text=AI Daily Smog Defense Routine")).toBeVisible();

    // Commute guidance and ventilation cards visible
    await expect(page.locator("text=Commute Timing & Gear")).toBeVisible();
    await expect(page.locator("text=Ventilation Windows")).toBeVisible();
  });

  test("Journey 5: Smart Indoor Air Protection calculates CADR and budget options", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click("text=Indoor Protection");
    await expect(page.locator("text=Smart Indoor Air Protection & CADR Sizing")).toBeVisible();

    // Plant myth alert visible
    await expect(page.locator("text=Scientific Fact: Plants vs. Mechanical HEPA Filters")).toBeVisible();

    // CADR assessment metrics visible
    await expect(page.locator("text=Engineering CADR Assessment")).toBeVisible();
    await expect(page.locator("text=Budget-Sensitive Purifier Sizing Options")).toBeVisible();
    await expect(page.locator("text=DIY Box-Fan")).toBeVisible();
  });

  test("Journey 6: Sustainable Commute Engine analyzes carbon and personal exposure tradeoffs", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click("text=Clean Commute");
    await expect(page.locator("text=Sustainable Commute & Inhalation Exposure Engine")).toBeVisible();
    await expect(page.locator("text=The Active Travel Winter Paradox")).toBeVisible();
    await expect(page.locator("text=Urban Metro Rail")).toBeVisible();
  });

  test("Journey 7: Conversational AI Assistant responds to prompt chips", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click("text=AI Assistant");
    await expect(page.locator("text=SaansSetu Conversational AI")).toBeVisible();

    // Click a prompt chip
    await page.click("text=Should I wear an N95 mask outside today?");

    // Expect assistant to reply with N95 advice and action cards
    await expect(page.locator("text=Key Takeaway")).toBeVisible({ timeout: 10000 });
  });

  test("Journey 8: Community Action Center provides WhatsApp share text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.click("text=Community");
    await expect(page.locator("text=Community Action Center & GRAP Protocols")).toBeVisible();

    // WhatsApp broadcast card exists
    await expect(page.locator("text=WhatsApp Broadcast Card")).toBeVisible();
    await expect(page.locator("button:has-text('Copy Broadcast')")).toBeVisible();
  });

  test("Journey 9: Language toggle switches smoothly to Hindi", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click language toggle button via accessible label
    await page.locator("button[aria-label*='language']").click({ force: true });

    // Navigation updates to Hindi
    await expect(page.locator("text=वायु गुणवत्ता")).toBeVisible();
    await expect(page.locator("text=परिवार स्वास्थ्य")).toBeVisible();
  });
});
