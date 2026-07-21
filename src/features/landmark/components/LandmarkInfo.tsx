import React from 'react';
import { Landmark } from '../../../types';

interface LandmarkInfoProps {
  landmark: Landmark;
}

export default function LandmarkInfo({ landmark }: LandmarkInfoProps) {
  return (
    <>
      {/* Landmark Title and Label Section */}
      <div className="flex flex-col text-left pb-0.5 animate-fadeIn">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#7a4f10] font-black">
          {landmark.label || `LANDMARK 0${landmark.order}`}
        </span>
        <h2 className="font-serif text-[26px] font-black text-[#1a0e04] leading-tight mt-1">
          {landmark.name}
        </h2>
      </div>

      {/* B. ABOUT THIS LANDMARK */}
      <div className="flex flex-col text-left">
        <span className="font-mono text-[8px] uppercase tracking-widest text-[#7a4f10] mb-1.5 font-bold">
          about this landmark
        </span>
        <p className="font-sans text-sm text-[#3a220b] leading-relaxed">
          {landmark.description}
        </p>
      </div>

      {/* C. DID YOU KNOW CARD */}
      <div className="bg-[#CBA052]/12 border border-[#CBA052]/35 rounded-xl p-4 flex flex-col text-left shadow-xs">
        <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest mb-1.5 font-bold">
          ✦ did you know
        </span>
        <p className="font-sans text-[11px] text-[#4a2e12] leading-relaxed italic">
          {landmark.funFact}
        </p>
      </div>

      {/* D. THIN GOLD DIVIDER */}
      <div className="w-full h-[1px] bg-[#CBA052]/30 shrink-0" />
    </>
  );
}
