import React from "react";
import { ShieldCheck, Database, HeartPulse, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-ivory-100/60 text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Mission */}
          <div className="space-y-2 md:col-span-1">
            <h4 className="font-serif font-bold text-sm text-forest-950">
              SaansSetu AI (साँस सेतु)
            </h4>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              Democratizing aerosol science, building-physics models, and grounded generative AI
              to shield Indian families during severe winter smog episodes.
            </p>
          </div>

          {/* Standards & Math */}
          <div className="space-y-2">
            <h5 className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-forest-700" />
              Scientific Standards
            </h5>
            <ul className="space-y-1 text-stone-700 text-[11px]">
              <li>CPCB National Air Quality Index (NAQI)</li>
              <li>NAAQS 24-hr Breakpoint Interpolation</li>
              <li>Copernicus Atmosphere Service (CAMS)</li>
              <li>AHAM / EPA Clean Air Delivery Rate (CADR)</li>
            </ul>
          </div>

          {/* Privacy & Ethics */}
          <div className="space-y-2">
            <h5 className="font-semibold text-stone-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              Privacy & Grounding
            </h5>
            <p className="text-stone-700 text-[11px] leading-relaxed">
              Household health profiles are stored strictly on your local browser. No personal health records are sent to backend databases or sold to commercial third parties.
            </p>
          </div>

          {/* Health Disclaimer */}
          <div className="space-y-2">
            <h5 className="font-semibold text-stone-800 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-red-600" />
              Responsible Health Notice
            </h5>
            <p className="text-stone-700 text-[11px] leading-relaxed">
              Guidance generated is for preventive environmental exposure reduction only. It does NOT constitute medical diagnosis or replace consulting a pulmonologist.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-600 font-medium">
          <p>© {new Date().getFullYear()} SaansSetu AI. Built for Prompt Wars Challenge 6.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" /> CPCB NAQI Protocol 2014
            </span>
            <span>•</span>
            <span>Copernicus ECMWF Atmosphere</span>
            <span>•</span>
            <span>Vercel Deployable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
