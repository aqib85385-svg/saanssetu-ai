# SaansSetu AI (साँस सेतु) — Urban Air Pollution & Winter Smog Assistant

> **Prompt Wars Challenge 6 Submission**  
> An intelligent environmental defense platform empowering Indian families and housing societies to navigate severe winter smog and urban air pollution through deterministic aerosol physics, building-envelope science, and grounded generative AI.

---

## 1. Executive Summary & The Problem

Every winter across Northern India (the Indo-Gangetic Plain: Delhi-NCR, Uttar Pradesh, Bihar, Haryana, and Punjab) and coastal metros like Mumbai and Kolkata, a dangerous convergence of meteorological phenomena traps toxic air:
1. **Planetary Boundary Layer Suppression & Thermal Inversion:** Nocturnal radiative cooling of the surface creates an atmospheric inversion cap (< 150m height) that prevents vertical dispersion, concentrating vehicular exhaust, stubble smoke, and industrial particulate matter at human breathing height.
2. **The Active-Travel Paradox:** Well-intentioned citizens who jog, cycle, or walk during peak morning inversion breathe 4 to 8 times more air volume ($V_E = 30-60\text{ L/min}$ vs $8\text{ L/min}$ at rest), driving toxic fine particles ($\text{PM}_{2.5}$) directly into deep lung alveoli and systemic circulation.
3. **Pervasive Consumer Misinformation:** Families waste money on ineffective counter-measures—such as buying potted snake plants under the false belief they scrub particulate smog, or opening windows when ambient outdoor air is 10 times more toxic than enclosed indoor air.

**SaansSetu AI** bridges the gap between complex atmospheric science and everyday household actions.

---

## 2. Technology Stack

- **Framework:** Next.js 14 (App Router, zero external database requirements)
- **Language:** TypeScript 5.7 (Strict Mode, 0 `any` types)
- **Styling:** Tailwind CSS (Bespoke environmental editorial palette: deep forest green `#0B1F1A`, teal `#0D9488`, warm ivory `#FAF9F6`, and official CPCB severity indicators)
- **Environmental Intelligence:** Autonomous Context-Aware Decision Engine (100% zero-cost, self-contained, no API key required; optional Gemini API integration)
- **Validation:** Zod (runtime validation on all external inputs, geocoding parameters, and structured output)
- **Atmospheric Data:** Open-Meteo Air Quality API with European Centre for Medium-Range Weather Forecasts (**Copernicus CAMS Global Atmospheric Model**)
- **Geocoding:** Open-Meteo Geocoding API + GPS browser geolocation + Major Indian metro airshed presets
- **Unit & Integration Testing:** Vitest 2.1 + `@testing-library/react` + v8 coverage provider (102 tests across 14 suites, 97.50% overall statement coverage, 100% function coverage)
- **End-to-End & Accessibility Testing:** Playwright + `@axe-core/playwright` (22/22 tests passing across Desktop and Mobile viewports)
- **Deployment:** Vercel-ready with zero external database or paid API key dependencies.

---

## 3. Seven Core Modules

### 1. Intelligent Air Quality Dashboard
- **Indian CPCB NAQI Calculation:** Exact 6-category sub-index linear interpolation based on Central Pollution Control Board standards (Good 0–50, Satisfactory 51–100, Moderately Polluted 101–200, Poor 201–300, Very Poor 301–400, Severe 401–500, and Severe+ Hazardous > 500 for emergency winter smog).
- **Primary Pollutant Identification:** Identifies which monitored pollutant dictates the overall index ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$) and displays the ratio to 24-hr safe NAAQS standards.
- **Forecast vs. Observation Attribution:** Transparently tags ground station observations vs. Copernicus CAMS model assimilations, data sources, and last-updated timestamps.
- **Diurnal Activity Windows:** Evaluates diurnal thermal inversion cycles to recommend the safest outdoor activity window (typically 12:30 PM – 3:30 PM midday solar valley) and warns against early morning inversion traps (5:00 AM – 9:30 AM).

### 2. Family Health & Exposure Profile
- **Demographic Vulnerability:** Distinguishes infants/toddlers (who inhale 2.5x more air per kg of body mass and have underdeveloped alveolar barriers), elderly (impaired mucociliary clearance), children, adults, and pregnant individuals.
- **Clinical Comorbidities:** Evaluates asthma, COPD, cardiovascular conditions, dust/smog allergies, hypertension, and post-viral recovery.
- **Member Vulnerability Score (0–100):** Combines age physiology, health sensitivities, daily outdoor exposure hours, and commute type.
- **Tailored Guidance:** Specific mask recommendations (N95/FFP2 with airtight seal vs. staying strictly indoors) and medicine accessibility reminders.
- **Responsible Medical Notice:** Prominent disclaimer clarifying that guidance is environmental and preventive, not clinical diagnosis.

### 3. AI Daily Routine Planner
- **Four Diurnal Time Blocks:** Morning, Afternoon, Evening, and Bedtime recommendations.
- **Commute Window Guidance:** Optimal departure times to avoid peak nocturnal and rush-hour smog traps.
- **Exercise Scheduling:** Automatic substitution of outdoor runs with indoor yoga, resistance bands, or treadmill workouts in a HEPA-purified space.
- **Strict Ventilation Protocol:** Strictly prohibits opening windows when ambient outdoor air is worse than indoor air without explicit carbon dioxide flush justification.
- **Cooking & Bedtime Protocol:** Kitchen exhaust isolation during frying/tadka, and bedroom HEPA purifier pre-run 45 minutes before sleep.

### 4. Smart Indoor Air Protection & CADR Sizing
- **CADR Engine:** Calculates Clean Air Delivery Rate in CFM and $\text{m}^3/\text{h}$ required to achieve 4.5 Air Changes per Hour (ACH) for any room geometry:
  $$\text{CADR (CFM)} = \frac{\text{Room Area (sq ft)} \times \text{Ceiling Height (ft)} \times \text{Target ACH}}{60}$$
- **Building Envelope Sealing Audit:** Assesses infiltration rates for drafty sliding windows (0.78 factor) vs. average frames (0.55 factor) vs. weatherstripped gasket seals (0.32 factor).
- **Source Control:** Calculates indoor particulate spikes from agarbatti (incense sticks), dhoop resin, mosquito coils, and cooking oil aerosolization.
- **Budget Purifiers:** Detailed comparison of DIY Corsi-Rosenthal Box-Fans with MERV-13 filters (~₹2,500) vs. entry-level True HEPA units (~₹8,500) vs. dual-fan living room units (~₹22,000).
- **Plant Myth Clarification:** Transparently explains that potted plants have near-zero CADR for airborne $\text{PM}_{2.5}$ particles, debunking false marketing.

### 5. Sustainable Commute & Impact Engine
- **Multimodal Carbon Comparison:** Compares Delhi Metro, Electric AC Buses, CNG City Buses, Carpools, Bicycles, Walking, Two-Wheelers, and Private Petrol/Diesel Cars using Bureau of Energy Efficiency (BEE) and Central Electricity Authority (CEA) Indian grid emission factors.
- **Personal Inhalation Exposure Trade-Off:** Separately analyzes respiratory exposure:
  - Metro / Electric AC Bus: Very Low to Low (HEPA / Filtered cabin)
  - Two-Wheeler / Walking: Extreme to High (sitting directly in exhaust plumes at roadside)
- **Weekly & Annual Impact:** Quantifies $\text{kg CO}_2$ avoided over 5-day work weeks and 48-week working years.

### 6. Context-Aware Intelligence Assistant (Zero-Cost, No API Key Required)
- **100% Free & Self-Contained:** SaansSetu AI does NOT require any paid API, personal API key, or third-party generative AI account to provide complete, production-grade intelligence.
- **11 Domain-Specific Scientific Engines:** Comprehensive coverage across CPCB AQI interpretations, N95/FFP2 respirator fit, window ventilation discipline, inversion thermodynamics, CADR purifier sizing, debunking houseplant myths, commute exposures, vulnerable demographics, and indoor combustion source control.
- **Bilingual Support:** Full English and fluent, natural Hindi (Devanagari script) with culturally resonant environmental terminology (जैसे वायु गुणवत्ता सूचकांक, एन-95 मास्क, सीलबंद खिड़कियां).
- **Numeric Fact Grounding:** Anchored strictly to real atmospheric physics and deterministic engine state (measured AQI, CPCB category, primary pollutant, family sensitivities) to eliminate hallucinations.
- **Structured Output Schema:** Zod-validated response containing markdown answer, key takeaway sentence, structured action cards, and clickable follow-up suggestions.
- **Hybrid Support:** Includes optional Gemini API support (`gemini-1.5-flash`) if an administrator configures `GEMINI_API_KEY`, but operates with full fidelity and zero latency out-of-the-box using the deterministic engine.

### 7. Community Action Center & GRAP Protocols
- **Institutional Advisories:** CAQM Graded Response Action Plan (GRAP Stages I through IV) triggers for schools, colleges, and workplaces.
- **Housing Society / RWA Initiatives:** Guidance for providing electric quartz heaters to night security guards to prevent open drum fires (burning leaves, wood, and plastic), along with perimeter road water misting.
- **Family WhatsApp Broadcast Cards:** Pre-formatted message templates with emojis and bullet points, copyable in 1 click for instant sharing to family or neighborhood groups.

---

## 4. Unique Differentiators: The Air Action Engine

Every single recommendation generated by SaansSetu AI contains 6 mandatory attributes:
1. **Recommended Action:** Precise, concrete operational directive.
2. **Scientific Reason:** The underlying chemical, physical, or physiological cause.
3. **Who Benefits:** Specific demographics or family members who benefit.
4. **When to Perform:** Exact time of day or diurnal window.
5. **Expected Impact:** Estimated percentage reduction in particulate mass or inhalation risk.
6. **Confidence & Assumptions:** Explicitly stated model assumptions.

### Action Priority Score (APS)
Ranked objectively using the following mathematical formulation:
$$\text{APS} = \text{clamp}\left( \text{round}\left( \frac{S_{\text{pollution}} \times M_{\text{household}} \times B_{\text{intervention}}}{100} \right), 5, 100 \right)$$
Where:
- $S_{\text{pollution}} = \min\left(\max\left( \frac{\text{AQI} - 50}{400} \times 100, 5\right), 100\right)$
- $M_{\text{household}} \in [1.0, 2.5]$ based on the presence of infants, asthmatics, elderly, or pregnant family members.
- $B_{\text{intervention}} \in [10, 100]$ weighted by clinical efficacy (e.g., nocturnal bedroom HEPA = 95, N95 commute mask = 92, window sealing = 85).

---

## 5. Security & Engineering Standards

- **Server-Side API Key Protection:** `GEMINI_API_KEY` is accessed only within Next.js Route Handlers (`/api/chat`), never bundled into client JavaScript.
- **In-Memory Token-Bucket Rate Limiting:** All API endpoints (`/api/air-quality`, `/api/geocode`, `/api/chat`) enforce IP-based rate limiting with automatic background sweep.
- **Runtime Zod Validation:** User queries are sanitized, trimmed, and strictly bounded to 1000 characters to prevent prompt injection and denial-of-service payloads.
- **Zero Sensitive PII Retention:** Family health profiles and room dimensions are saved only to browser `localStorage`. No personal health data is transmitted to or stored in backend databases.
- **Clean Architecture:** Fully decoupled, pure mathematical calculation modules under `src/lib/` completely independent of React or DOM dependencies.

---

## 6. Testing & Quality Assurance

SaansSetu AI maintains rigorous automated test coverage across unit, integration, end-to-end, and accessibility test suites:

- **Unit & Integration Suite (Vitest):** **102 / 102 tests passed** across 14 test files.
- **End-to-End & Accessibility (Playwright + axe-core):** **22 / 22 tests passed** across Chromium and Mobile Chrome viewports.
- **Overall Statement Coverage:** **97.50%** across all files (85.54% branch, 100% function coverage).
- **Core Decision Engine Coverage (`src/lib/engine/`):** **98.24% statement coverage** (91.32% branch coverage).

### Run Test Suite
```bash
# Run unit & integration tests
npm test

# Run tests with v8 code coverage
npm run test:coverage

# Run TypeScript type check
npm run type-check

# Run Next.js production build verification
npm run build

# Run Playwright E2E & Accessibility tests
npm run test:e2e
```

### Coverage Highlights (Vitest v8)
- `src/lib/aqi/`: **98.65%** statements (85.86% branch)
  - `cpcb-standards.ts`: **100%**
  - `inversion-engine.ts`: **100%**
  - `cpcb-calculator.ts`: **96.52%**
- `src/lib/engine/` (Decision Engines): **98.24%** statements (91.32% branch)
  - `cadr-calculator.ts`: **100%**
  - `commute-engine.ts`: **100%**
  - `indoor-model.ts`: **100%**
  - `routine-planner.ts`: **100%**
  - `action-priority.ts`: **96.72%**
  - `risk-assessment.ts`: **95.85%** statements (95.12% branch)
- `src/lib/community/`: **100%** statements (100% branch)
- `src/lib/utils/`: **100%** statements (100% branch)
- **Overall Codebase:** **97.50%** statements, **85.54%** branch, **100%** functions across all modules!

---

## 7. Getting Started

- **Repository:** [https://github.com/aqib85385-svg/saanssetu-ai](https://github.com/aqib85385-svg/saanssetu-ai)

### Prerequisites
- Node.js 18.x, 20.x, or 22.x+
- npm 9+ (or yarn / pnpm)

### Instant Setup (No API Keys Required!)
SaansSetu AI runs 100% out-of-the-box with zero paid API keys or signups. The core conversational assistant runs on the built-in context-aware deterministic intelligence engine:

```bash
# Clone the repository
git clone https://github.com/aqib85385-svg/saanssetu-ai.git
cd saans-setu-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. All live Open-Meteo atmospheric forecasts, CPCB AQI calculations, personalized family routines, CADR sizing, and the intelligent assistant are immediately active!

*(Optional: If you wish to enable Google Gemini API mode, copy `.env.example` to `.env.local` and add `GEMINI_API_KEY`, but this is entirely optional. The application works completely without it.)*

---

## 8. Deployment Instructions

SaansSetu AI is designed for seamless deployment on Vercel or any Node.js hosting platform with zero external database requirements:

### Vercel Deployment (Recommended)
1. Push your repository to GitHub (`https://github.com/aqib85385-svg/saanssetu-ai`).
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Framework preset will automatically be detected as **Next.js**.
4. No environment variables are required for deployment.
5. Deploy. The application builds and serves via Vercel Edge/Serverless functions.

### Self-Hosted Node.js Server
```bash
# Build production bundle
npm run build

# Start production server on port 3000
npm run start
```

---

## 9. Responsible Health & Medical Disclaimer

SaansSetu AI provides preventive environmental exposure calculations based on published epidemiological studies and Central Pollution Control Board (CPCB) standards. It does NOT provide clinical medical diagnosis, treatment plans, or emergency services. If you or any family member experience acute breathlessness, severe coughing, chest tightness, or dizziness, seek immediate medical care from a qualified pulmonologist or hospital emergency room.
