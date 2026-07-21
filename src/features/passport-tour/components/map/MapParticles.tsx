import React from 'react';

export default function MapParticles() {
  return (
    <>
      {/* Ambient drifting particles */}
      <div className="absolute top-[320px] left-[15%] w-2 h-2 rounded-full bg-[#CBA052]/20 pointer-events-none z-10 animate-dust1" />
      <div className="absolute top-[850px] left-[80%] w-3 h-3 rounded-full bg-[#0F6E56]/15 pointer-events-none z-10 animate-dust2" />
      <div className="absolute top-[1380px] left-[25%] w-2.5 h-2.5 rounded-full bg-[#CBA052]/18 pointer-events-none z-10 animate-dust3" />
    </>
  );
}
