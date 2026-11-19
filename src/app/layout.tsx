import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaansSetu AI — Urban Air Pollution & Winter Smog Intelligence",
  description:
    "Intelligent assistant helping Indian families and communities navigate severe winter smog and urban air pollution with CPCB calculations, personalized routines, CADR sizing, and grounded AI.",
  keywords: [
    "Air Quality Index",
    "CPCB AQI",
    "Delhi Smog",
    "Winter Pollution",
    "PM2.5",
    "HEPA Purifier CADR",
    "N95 Mask Advisory",
    "SaansSetu",
  ],
  authors: [{ name: "SaansSetu Environmental AI Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#FAF9F6] text-[#1A2421] selection:bg-teal-200 selection:text-forest-950">
        {children}
      </body>
    </html>
  );
}
