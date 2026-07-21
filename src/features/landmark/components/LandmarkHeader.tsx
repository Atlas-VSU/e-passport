import React from 'react';
import { ArrowLeft, Landmark as LandmarkIcon } from 'lucide-react';

interface LandmarkHeaderProps {
  onBack: () => void;
}

export default function LandmarkHeader({ onBack }: LandmarkHeaderProps) {
  return (
    <header
      className="sticky top-0 left-0 right-0 z-40 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3.5 text-white rounded-b-[40px] shadow-xl overflow-hidden passport-leather-overlay shrink-0"
      style={{
        background: "#004225",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)] pointer-events-none" />

      <button
        onClick={onBack}
        aria-label="Back to Passport"
        className="relative z-10 hover:bg-white/10 transition-all flex items-center justify-center w-9 h-9 rounded-full text-[#CBA052] cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 text-[#CBA052]" />
      </button>
      <h1 className="relative z-10 font-mono text-[9px] uppercase tracking-widest text-[#CBA052] font-bold flex-1 text-center">
        VSU CAMPUS TOUR
      </h1>
      <div className="relative z-10 w-9 h-9 flex items-center justify-center text-[#CBA052]">
        <LandmarkIcon className="w-5 h-5 text-[#CBA052]" />
      </div>
    </header>
  );
}
