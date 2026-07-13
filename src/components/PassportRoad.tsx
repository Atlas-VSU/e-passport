import React from 'react';
import { Landmark, Stamp } from '../types';
import StampBadge from './StampBadge';

interface PassportRoadProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
}

export default function PassportRoad({ landmarks, stamps, onSelectLandmark }: PassportRoadProps) {
  // Sort landmarks by order
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  // Helper to check stamp status
  const getStampForLandmark = (landmarkId: string) => {
    return stamps.find((s) => s.landmark_id === landmarkId);
  };

  // Determine which nodes are active/locked
  // A landmark is unlocked/active if it is the FIRST unstamped landmark, or if all previous landmarks are stamped
  const getLandmarkState = (index: number) => {
    if (index === 0) return { isLocked: false, isActive: !getStampForLandmark(sortedLandmarks[0].id) };
    
    const prevStamped = getStampForLandmark(sortedLandmarks[index - 1].id);
    const currStamped = getStampForLandmark(sortedLandmarks[index].id);
    
    if (currStamped) {
      return { isLocked: false, isActive: false };
    }
    
    // Unlocked if previous is stamped
    if (prevStamped) {
      return { isLocked: false, isActive: true };
    }
    
    return { isLocked: true, isActive: false };
  };

  // Determine completion stroke length based on stamps
  // This calculates how far down the winding gold line should be drawn!
  const getCompletedPathLength = () => {
    let stampedCount = 0;
    for (let i = 0; i < sortedLandmarks.length; i++) {
      if (getStampForLandmark(sortedLandmarks[i].id)) {
        stampedCount++;
      } else {
        break;
      }
    }
    // Map stamped count to percentage or specific path sections
    if (stampedCount === 0) return '0%';
    if (stampedCount === 1) return '15%';
    if (stampedCount === 2) return '35%';
    if (stampedCount === 3) return '55%';
    if (stampedCount === 4) return '72%';
    if (stampedCount === 5) return '88%';
    return '100%';
  };

  const pathLength = getCompletedPathLength();

  return (
    <div className="relative w-full h-[1250px] mt-6 bg-transparent overflow-hidden p-2">
      
      {/* Winding Path SVG Base */}
      <svg 
        aria-hidden="true" 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        preserveAspectRatio="xMidYMin slice" 
        viewBox="0 0 390 1200"
      >
        {/* Uncompleted Path Background (Dashed Gold/Grey) */}
        <path 
          d="M 195 80 C 280 180, 320 280, 260 380 C 180 500, 80 580, 140 700 C 200 820, 300 900, 250 1020 C 200 1100, 195 1150, 195 1150" 
          fill="none" 
          stroke="#CBA052" 
          strokeDasharray="10 10" 
          strokeLinecap="round" 
          strokeWidth="6" 
          strokeOpacity="0.25"
        />
        
        {/* Completed Path Foreground (Forest Green) */}
        <path 
          className="transition-all duration-1000 ease-in-out"
          d="M 195 80 C 280 180, 320 280, 260 380 C 180 500, 80 580, 140 700 C 200 820, 300 900, 250 1020 C 200 1100, 195 1150, 195 1150" 
          fill="none" 
          stroke="#004225" 
          strokeLinecap="round" 
          strokeWidth="10" 
          style={{
            strokeDasharray: '1200',
            strokeDashoffset: `calc(1200 - (1200 * ${pathLength === '100%' ? 1 : parseFloat(pathLength)/100}))`
          }}
        />

        {/* Shimmering Gold center line */}
        <path 
          className="transition-all duration-1000 ease-in-out"
          d="M 195 80 C 280 180, 320 280, 260 380 C 180 500, 80 580, 140 700 C 200 820, 300 900, 250 1020 C 200 1100, 195 1150, 195 1150" 
          fill="none" 
          stroke="#CBA052" 
          strokeLinecap="round" 
          strokeWidth="3" 
          style={{
            strokeDasharray: '1200',
            strokeDashoffset: `calc(1200 - (1200 * ${pathLength === '100%' ? 1 : parseFloat(pathLength)/100}))`
          }}
        />
      </svg>

      {/* Node 1: Obelisk */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[40px] w-full max-w-[280px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(0);
          return (
            <StampBadge 
              landmark={sortedLandmarks[0]}
              stamp={getStampForLandmark(sortedLandmarks[0].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[0])}
            />
          );
        })()}
      </div>

      {/* Node 2: Admin Building */}
      <div className="absolute right-[10px] top-[220px] w-full max-w-[240px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(1);
          return (
            <StampBadge 
              landmark={sortedLandmarks[1]}
              stamp={getStampForLandmark(sortedLandmarks[1].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[1])}
            />
          );
        })()}
      </div>

      {/* Node 3: University Library */}
      <div className="absolute left-[10px] top-[410px] w-full max-w-[240px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(2);
          return (
            <StampBadge 
              landmark={sortedLandmarks[2]}
              stamp={getStampForLandmark(sortedLandmarks[2].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[2])}
            />
          );
        })()}
      </div>

      {/* Node 4: Eco Park */}
      <div className="absolute right-[15px] top-[610px] w-full max-w-[240px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(3);
          return (
            <StampBadge 
              landmark={sortedLandmarks[3]}
              stamp={getStampForLandmark(sortedLandmarks[3].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[3])}
            />
          );
        })()}
      </div>

      {/* Node 5: Oval */}
      <div className="absolute left-[20px] top-[810px] w-full max-w-[240px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(4);
          return (
            <StampBadge 
              landmark={sortedLandmarks[4]}
              stamp={getStampForLandmark(sortedLandmarks[4].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[4])}
            />
          );
        })()}
      </div>

      {/* Node 6: Beach */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[1010px] w-full max-w-[280px]">
        {(() => {
          const { isLocked, isActive } = getLandmarkState(5);
          return (
            <StampBadge 
              landmark={sortedLandmarks[5]}
              stamp={getStampForLandmark(sortedLandmarks[5].id)}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onSelectLandmark(sortedLandmarks[5])}
            />
          );
        })()}
      </div>

    </div>
  );
}
