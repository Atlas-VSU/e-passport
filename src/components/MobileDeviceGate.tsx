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
      <div className="desktop-blocked min-h-screen w-full flex-col items-center justify-center bg-[#001a0e] text-white p-8 relative overflow-hidden select-none">
        {/* Background leather texture backdrop */}
        <div
          className="absolute inset-0 passport-leather-overlay opacity-30 pointer-events-none"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Main Card simulating the Passport Wallet */}
        <div
          className="relative z-10 w-full max-w-sm bg-[#004225] rounded-[32px] p-8 border-2 border-[#CBA052]/50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-center flex flex-col items-center gap-6 passport-leather-overlay overflow-hidden"
          style={{ transform: "translateZ(0)" }}
        >
          {/* Ambient inner gold glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(202,160,82,0.15),transparent_65%)] pointer-events-none" />

          {/* Golden Badge Logo / Icon */}
          <div
            className="w-18 h-18 rounded-full bg-[#CBA052]/10 border border-[#CBA052]/35 flex items-center justify-center mb-1 shrink-0"
            style={{
              filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.75)) drop-shadow(0px 6px 12px rgba(0,0,0,0.4))"
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-[#CBA052]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-3 max-w-xs relative z-10">
            <h1 className="font-serif text-2xl font-black text-[#CBA052] uppercase tracking-[0.16em] drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.5)]">
              Mobile Only
            </h1>
            <p className="font-sans text-xs text-[#F2E9D3]/85 leading-relaxed">
              Viscan E-Pasaporte is designed specifically for mobile and tablet devices to facilitate physical location stamp verification.
            </p>
            <p className="font-sans text-[11px] text-[#F2E9D3]/65 leading-relaxed">
              Please scan the QR code or open this page on your smartphone to start your campus journey.
            </p>
          </div>

          {/* Footer badge */}
          <div className="relative z-10 flex items-center gap-2 font-mono text-[9px] text-[#CBA052] uppercase tracking-[0.18em] border border-[#CBA052]/30 rounded-full px-4 py-2 bg-[#002b18]/60 backdrop-blur-[2px] mt-1">
            <span>Viscan E-Pasaporte</span>
          </div>
        </div>
      </div>
    </>
  );
}
