/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface MilestoneCelebrationProps {
  activeCelebration: 3 | 6 | null;
  stampsCount: number;
}

export default function MilestoneCelebration({
  activeCelebration,
  stampsCount,
}: MilestoneCelebrationProps) {
  if (!activeCelebration) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-6 text-center animate-fade-in pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,212,0,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative bg-[#fff8f5] rounded-3xl p-8 max-w-sm border-2 border-[#CBA052] shadow-[0_12px_40px_rgba(201,161,58,0.25)] flex flex-col items-center gap-4 animate-scale-up">
        <div className="text-[#CBA052] animate-bounce mb-1">
          <span className="text-4xl">🎉</span>
        </div>

        <h3 className="font-serif text-2xl font-black text-[#004225] leading-tight">
          {activeCelebration === 3 ? "Halfway there!" : "Tour complete!"}
        </h3>

        <p className="font-sans text-xs text-gray-700 leading-relaxed">
          {activeCelebration === 3
            ? "You have successfully visited and stamped 3 of 6 landmarks! Keep exploring to complete your Viscan E-Pasaporte!"
            : "Outstanding achievement! You have visited all 6 landmarks across the VSU campus. Accessing your completed digital passport now!"}
        </p>

        <div className="w-16 h-16 rounded-full bg-[#004225] border-2 border-[#CBA052] flex items-center justify-center shadow-md mt-2">
          <span className="font-mono text-lg font-black text-[#CBA052]">
            {stampsCount}/6
          </span>
        </div>

        <span className="font-mono text-[9px] text-[#004225] uppercase tracking-widest font-extrabold animate-pulse mt-1">
          {activeCelebration === 3
            ? "Auto-dismissing..."
            : "Preparing passport..."}
        </span>
      </div>
    </div>
  );
}
