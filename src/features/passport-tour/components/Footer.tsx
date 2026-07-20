/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Map, BookOpen } from "lucide-react";

interface FooterProps {
  subView: "map" | "stickers" | "passport";
  isComplete: boolean;
  setSubView: (view: "map" | "stickers" | "passport") => void;
  onViewPassport: () => void;
}

export default function Footer({
  subView,
  isComplete,
  setSubView,
  onViewPassport,
}: FooterProps) {
  const isMap = subView === "map";

  return (
    <div className="relative overflow-hidden bg-[#004225] border-t border-[#CBA052]/20 flex flex-col z-30 rounded-t-4xl passport-leather-overlay shrink-0 shadow-[0_-12px_24px_rgba(0,0,0,0.4)]">
      {/* Light gradient highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />

      {/* Taller container with extra bottom safe area padding */}
      <div className="relative pt-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] px-6 flex justify-center items-center">
        {
          isComplete ? (
            <button
              onClick={onViewPassport}
              className="w-auto py-2.5 px-6 bg-[#CBA052] hover:bg-[#b0873e] active:scale-95 text-[#004225] font-mono text-xs font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(203,160,82,0.25)] hover:shadow-[0_6px_16px_rgba(203,160,82,0.35)] cursor-pointer"

            >
              <BookOpen className="w-4 h-4 text-[#004225]" />
              <span>Download E-Passport</span>
            </button>
          ) : (
            <button
              onClick={() => setSubView(isMap ? "stickers" : "map")}
              className="w-auto py-2.5 px-6 bg-[#CBA052] hover:bg-[#b0873e] active:scale-95 text-[#004225] font-mono text-xs font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(203,160,82,0.25)] hover:shadow-[0_6px_16px_rgba(203,160,82,0.35)] cursor-pointer"
            >
              {isMap ? (
                <>
                  <BookOpen className="w-4 h-4 text-[#004225]" />
                  <span>View my stamp book</span>
                </>
              ) : (
                <>
                  <Map className="w-4 h-4 text-[#004225]" />
                  <span>View tour map</span>
                </>
              )}
            </button>

          )
        }




      </div>
    </div>
  );
}
