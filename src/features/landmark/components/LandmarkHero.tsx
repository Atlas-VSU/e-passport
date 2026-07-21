import React from 'react';
import { Landmark } from '../../../types';

interface LandmarkHeroProps {
  landmark: Landmark;
}

export default function LandmarkHero({ landmark }: LandmarkHeroProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-[280px] overflow-hidden shrink-0 z-10">
      <img
        className="object-cover w-full h-full"
        src={landmark.photoUrl}
        alt={landmark.name}
        referrerPolicy="no-referrer"
      />
      {/* Gradient overlay at the bottom of the hero image */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, transparent, #F2E9D3)'
        }}
      />
    </div>
  );
}
