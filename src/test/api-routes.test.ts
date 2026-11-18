import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as airQualityHandler } from "@/app/api/air-quality/route";
import { GET as geocodeHandler } from "@/app/api/geocode/route";
import { POST as chatHandler } from "@/app/api/chat/route";

describe("API Route Security & Input Validation", () => {
  describe("GET /api/air-quality", () => {
    it("returns 200 with structured air quality data for valid Indian coordinates", async () => {
      const req = new NextRequest("http://localhost:3000/api/air-quality?lat=28.61&lon=77.20&name=Delhi");
      const res = await airQualityHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty("location");
      expect(data).toHaveProperty("current");
      expect(data.current).toHaveProperty("pm25");
      expect(data.current).toHaveProperty("pm10");
      expect(data).toHaveProperty("hourly");
      expect(data).toHaveProperty("daily");
    });

    it("returns 400 for out-of-range latitude (> 90)", async () => {
      const req = new NextRequest("http://localhost:3000/api/air-quality?lat=120&lon=77.20");
      const res = await airQualityHandler(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain("Invalid geographic coordinates");
    });

    it("returns 400 for invalid non-numeric longitude", async () => {
      const req = new NextRequest("http://localhost:3000/api/air-quality?lat=28.61&lon=invalid");
      const res = await airQualityHandler(req);
      expect(res.status).toBe(400);
    });

    it("enforces 429 rate limit when requests exceed threshold", async () => {
      const clientIp = `test_ip_aq_${Date.now()}`;
      let lastRes;
      // Send 62 requests to exhaust the 60 req/min limit
      for (let i = 0; i < 62; i++) {
        const req = new NextRequest("http://localhost:3000/api/air-quality?lat=28.61&lon=77.20", {
          headers: { "x-forwarded-for": clientIp },
        });
        lastRes = await airQualityHandler(req);
      }
      expect(lastRes?.status).toBe(429);
      const data = await lastRes?.json();
      expect(data.error).toContain("Too many requests");
    });
  });

  describe("GET /api/geocode", () => {
    it("returns default Indian presets when query is empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/geocode?q=");
      const res = await geocodeHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.some((d: { name: string }) => d.name.includes("Delhi"))).toBe(true);
    });

    it("filters presets matching specific city query", async () => {
      const req = new NextRequest("http://localhost:3000/api/geocode?q=gurugram");
      const res = await geocodeHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.some((d: { name: string }) => d.name.includes("Gurugram"))).toBe(true);
    });
  });

  describe("POST /api/chat", () => {
    it("returns 200 with grounded response for valid message", async () => {
      const body = {
        message: "Should I open windows today in Delhi?",
        language: "en",
        context: {
          locationName: "New Delhi",
          aqi: 350,
          category: "Very Poor",
        },
      };

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await chatHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty("reply");
      expect(data).toHaveProperty("keyTakeaway");
      expect(data).toHaveProperty("actionCards");
    });

    it("returns 400 when message is empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "" }),
      });

      const res = await chatHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
    });

    it("returns 400 when message exceeds 1000 characters", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "A".repeat(1050) }),
      });

      const res = await chatHandler(req);
      expect(res.status).toBe(400);
    });

    it("enforces 429 rate limit on chat endpoint", async () => {
      const clientIp = `test_chat_ip_${Date.now()}`;
      let lastRes;
      for (let i = 0; i < 27; i++) {
        const req = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": clientIp,
          },
          body: JSON.stringify({ message: "Quick check" }),
        });
        lastRes = await chatHandler(req);
      }
      expect(lastRes?.status).toBe(429);
      const data = await lastRes?.json();
      expect(data.error).toContain("Rate limit reached");
    });
  });
});
