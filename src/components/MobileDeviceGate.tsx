/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface MobileDeviceGateProps {
  children: React.ReactNode;
}

export default function MobileDeviceGate({ children }: MobileDeviceGateProps) {
  return (
    <>
      <style>{`
        .app-shell { display: flex; }
        .desktop-blocked { display: none; }
        @media (hover: hover) and (pointer: fine) and (min-width: 1280px) {
          .app-shell { display: none; }
          .desktop-blocked { display: flex; }
        }
      `}</style>

      {/* ── Mobile / Tablet: full screen app ── */}
      <div className="app-shell min-h-screen w-full flex-col bg-[#004225] font-sans text-[#1A1A1A] antialiased mx-auto max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        {children}
      </div>

      {/* ── Desktop: not supported message ── */}
      <div className="desktop-blocked min-h-screen w-full flex-col items-center justify-center bg-[#004225] text-white gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-[#CBA052] flex items-center justify-center shadow-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-[#004225]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div className="text-center max-w-sm">
          <h1 className="font-serif text-2xl font-black text-[#CBA052] uppercase tracking-widest mb-2">
            Mobile Only
          </h1>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            Viscan E-Pasaporte is designed for mobile and tablet devices. Please
            open this app on your smartphone or tablet to begin your campus
            tour.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest border border-white/10 rounded-full px-4 py-2">
          <span>Visayas State University</span>
          <span>·</span>
          <span>E-Passport</span>
        </div>
      </div>
    </>
  );
}
