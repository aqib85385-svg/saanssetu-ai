import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f4",
          100: "#dbece5",
          200: "#b8d9cc",
          300: "#8bbeaa",
          400: "#5d9e85",
          500: "#3d826a",
          600: "#2d6753",
          700: "#245344",
          800: "#1e4337",
          900: "#1a382f",
          950: "#0b1f1a",
        },
        ivory: {
          50: "#faf9f6",
          100: "#f4f1ea",
          200: "#e8e3d5",
          300: "#d7cfbc",
          400: "#c2b59d",
          500: "#b19f83",
        },
        aqi: {
          good: "#15803d",
          satisfactory: "#65a30d",
          moderate: "#d97706",
          poor: "#ea580c",
          veryPoor: "#dc2626",
          severe: "#991b1b",
          hazardous: "#450a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 15px -3px rgba(11, 31, 26, 0.08), 0 4px 6px -4px rgba(11, 31, 26, 0.04)",
        glass: "0 8px 32px 0 rgba(11, 31, 26, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
