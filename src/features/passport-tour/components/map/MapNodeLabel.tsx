import React from 'react';
import { Landmark, Stamp } from '../../../../types';

interface MapNodeLabelProps {
  landmark: Landmark;
  stamp?: Stamp;
  idx: number;
  isVisible: boolean;
  isJustStamped: boolean;
  onSelectLandmark: (landmark: Landmark) => void;
  pos: { x: number; y: number };
}

// Seedable pseudo-random number generator
function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Deterministic stamp styling so rotations and offsets are stable across renders
function getDeterministicStampStyle(landmarkId: string) {
  const seed = landmarkId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = createSeededRandom(seed);
  const rotation = (rand() - 0.5) * 12; // between -6 and +6 degrees
  const offsetX = (rand() - 0.5) * 6;  // between -3px and +3px
  const offsetY = (rand() - 0.5) * 6;  // between -3px and +3px
  return { rotation, offsetX, offsetY };
}

export default function MapNodeLabel({
  landmark,
  stamp,
  idx,
  isVisible,
  isJustStamped,
  onSelectLandmark,
  pos
}: MapNodeLabelProps) {
  const isStamped = !!stamp;
  let stateText = isStamped ? 'stamped' : 'tap to stamp';
  const { rotation, offsetX, offsetY } = getDeterministicStampStyle(landmark.id);

  return (
    <button
      onClick={() => onSelectLandmark(landmark)}
      className={`absolute z-10 flex flex-col items-center justify-center p-[6px] px-[12px] w-[140px] max-w-[140px] text-center pointer-events-auto rounded-[8px] border shadow-xs select-none transition-all duration-300 font-sans focus:outline-none focus:ring-1 focus:ring-[#C9A13A] ${isVisible ? 'node-pop-in' : 'node-hidden'
        } ${isJustStamped ? 'stamp-slam-effect' : ''
        }`}
      style={{
        left: `clamp(80px, ${pos.x / 10}%, calc(100% - 80px))`,
        top: `${pos.y + (!isStamped ? 48 : 40)}px`,
        transform: isJustStamped
          ? undefined
          : `translateX(-50%) rotate(${rotation * 0.5}deg) translate(${offsetX * 0.4}px, ${offsetY * 0.4}px)`,
        backgroundColor: 'rgba(15, 40, 25, 0.88)',
        borderColor: !isStamped ? '#C9A13A' : '#4a7a4a',
        '--rot': `${rotation * 0.5}deg`,
      } as React.CSSProperties}
    >
      {/* Landmark index line */}
      <span className={`text-[9px] font-mono tracking-widest font-extrabold leading-none ${!isStamped ? 'text-[#C9A13A]' : 'text-[#4a7a4a]'
        }`}>
        LANDMARK 0{idx + 1}
      </span>

      {/* Landmark name */}
      <span className="text-[14px] font-serif font-semibold text-[#F2E9D3] leading-tight block w-full truncate mt-0.5">
        {landmark.name}
      </span>

      {/* State status indicator */}
      {stateText && (
        <span className="text-[10px] font-mono tracking-wide leading-none text-[#5DCAA5] mt-0.5">
          {stateText}
        </span>
      )}
    </button>
  );
}
