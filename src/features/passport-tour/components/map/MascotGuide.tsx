import React from 'react';

interface MascotGuideProps {
  pos: { x: number; y: number } | null;
}

export default function MascotGuide({ pos }: MascotGuideProps) {
  if (!pos) return null;

  return (
    <div
      className="absolute z-20 pointer-events-none mascot-bounce-cheer"
      style={{
        left: `calc(${pos.x / 10}% + 36px)`,
        top: `${pos.y - 36}px`,
      }}
    >
      <img
        src="./head-marker.png"
        alt="Mascot guide"
        className="w-16 h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}
