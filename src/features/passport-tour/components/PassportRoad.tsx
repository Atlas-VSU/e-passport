import React, { useEffect, useRef, useState } from 'react';
import { Check, Navigation, Building, Leaf, BookOpen, Award, Trophy, Palmtree, LucideIcon } from 'lucide-react';
import { Landmark, Stamp } from '../../../types';
import ProceduralMapCanvas from './ProceduralMapCanvas';

interface PassportRoadProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
  justStampedId: string | null;
  nudgeLandmarkId: string | null;
}

// Helper to retrieve node positions dynamically from percentage coordinates
export function getLandmarkCoords(lm: Landmark): { x: number; y: number } {
  return {
    x: (lm.mapX ?? 50) * 10,
    y: (lm.mapY ?? 50) * 18,
  };
}

// Icon mapping based on zoneType configurations
const iconMap: Record<string, LucideIcon> = {
  building: Building,
  green: Leaf,
  local_library: BookOpen, // fallback config support
  verified: Award,
  stadium: Trophy,
  beach_access: Palmtree,
};

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

// Web Audio API Programmatic Stamp Synthesizer
function playStampSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.error('Audio playback failed', err);
  }
}

// Haptic Tick
function triggerHapticTick() {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(12);
    } catch {
      // Ignore vibration blocks
    }
  }
}

export default function PassportRoad({
  landmarks,
  stamps,
  onSelectLandmark,
  justStampedId,
  nudgeLandmarkId,
}: PassportRoadProps) {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  // Discovery Pop-In states via IntersectionObserver
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [visibleNodes, setVisibleNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const landmarkId = entry.target.getAttribute('data-landmark-id');
            if (landmarkId) {
              setVisibleNodes((prev) => ({ ...prev, [landmarkId]: true }));
              observer.unobserve(entry.target); // Trigger exactly once
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(nodeRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [landmarks]);

  // Audio/Haptic trigger on mount when returning with a newly minted stamp
  useEffect(() => {
    if (justStampedId) {
      playStampSound();
      triggerHapticTick();
    }
  }, [justStampedId]);

  // Map landmarks to coordinates for route drawing
  const routeNodes = sortedLandmarks.map((lm) => getLandmarkCoords(lm));

  // Generate continuous route wandering curves
  let routePathD = '';
  if (routeNodes.length > 0) {
    routePathD = `M ${routeNodes[0].x} ${routeNodes[0].y}`;
    for (let i = 0; i < routeNodes.length - 1; i++) {
      const p0 = routeNodes[i];
      const p1 = routeNodes[i + 1];
      const dy = (p1.y - p0.y) * 0.45;
      
      const sign = i % 2 === 0 ? 1 : -1;
      const meanderX = 130 * sign;
      
      routePathD += ` C ${p0.x + meanderX} ${p0.y + dy}, ${p1.x - meanderX} ${p1.y - dy}, ${p1.x} ${p1.y}`;
    }
  }

  // Anchor Companion Mascot (32px) beside the most recently stamped node (or active if 0 stamps)
  const lastStamp = stamps.length > 0
    ? stamps.reduce((latest, s) => {
        return new Date(s.stamped_at) > new Date(latest.stamped_at) ? s : latest;
      }, stamps[0])
    : null;

  const mascotTargetId = lastStamp ? lastStamp.landmark_id : nudgeLandmarkId;
  const mascotLm = landmarks.find((lm) => lm.id === mascotTargetId);
  const mascotPos = mascotLm ? getLandmarkCoords(mascotLm) : null;

  return (
    <div className="relative w-full h-[1800px] overflow-hidden select-none">
      {/* Procedural Map Base Layer */}
      <ProceduralMapCanvas landmarks={landmarks} />

      <style>{`
        @keyframes mapDash {
          to {
            stroke-dashoffset: -9;
          }
        }
        .map-trail {
          animation: mapDash 15s linear infinite;
        }
        @keyframes mascotCheer {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0); }
          25% { transform: translate(0, -6px) scale(1.08) rotate(-4deg); }
          75% { transform: translate(0, -6px) scale(1.08) rotate(4deg); }
        }
        .mascot-bounce-cheer {
          animation: mascotCheer 1.8s ease-in-out infinite;
        }
        @keyframes popIn {
          0% { transform: scale(0.75); opacity: 0; }
          70% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        .node-pop-in {
          animation: popIn 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .node-hidden {
          opacity: 0;
          transform: scale(0.75);
        }
        @keyframes stampSlam {
          0% { transform: scale(2.2) rotate(-22deg) translate(-50%, -50%); opacity: 0.3; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.15)); }
          45% { transform: scale(1) rotate(var(--rot)) translate(-50%, -50%); opacity: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
          60% { transform: scaleY(0.86) scaleX(1.05) rotate(var(--rot)) translate(-50%, -50%); }
          100% { transform: scale(1) rotate(var(--rot)) translate(-50%, -50%); opacity: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15)); }
        }
        .stamp-slam-effect {
          animation: stampSlam 550ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes drift1 {
          0% { transform: translateY(0) translateX(0) scale(0.95); opacity: 0.14; }
          50% { transform: translateY(-45px) translateX(15px) scale(1.1); opacity: 0.22; }
          100% { transform: translateY(-90px) translateX(0) scale(0.95); opacity: 0.14; }
        }
        @keyframes drift2 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.12; }
          50% { transform: translateY(-65px) translateX(-20px) scale(0.85); opacity: 0.20; }
          100% { transform: translateY(-130px) translateX(0) scale(1); opacity: 0.12; }
        }
        @keyframes drift3 {
          0% { transform: translateY(0) translateX(0) scale(0.9); opacity: 0.16; }
          50% { transform: translateY(-50px) translateX(12px) scale(1.05); opacity: 0.24; }
          100% { transform: translateY(-100px) translateX(0) scale(0.9); opacity: 0.16; }
        }
        .animate-dust1 { animation: drift1 14s ease-in-out infinite; }
        .animate-dust2 { animation: drift2 18s ease-in-out infinite; }
        .animate-dust3 { animation: drift3 16s ease-in-out infinite; }
      `}</style>

      {/* SVG Canvas for Gold Trail overlays only (above base canvas, below nodes) */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1800"
      >
        {/* Render Gold Route Path */}
        {routePathD && (
          <>
            {/* Trail Drop Shadow */}
            <path
              d={routePathD}
              fill="none"
              stroke="rgba(15, 110, 86, 0.35)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="3 6"
              transform="translate(1, 1.5)"
            />
            {/* Active Dotted Trail */}
            <path
              className="map-trail"
              d={routePathD}
              fill="none"
              stroke="#C9A13A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="3 6"
            />
          </>
        )}
      </svg>

      {/* Ambient drifting particles */}
      <div className="absolute top-[320px] left-[15%] w-2 h-2 rounded-full bg-[#CBA052]/20 pointer-events-none z-10 animate-dust1" />
      <div className="absolute top-[850px] left-[80%] w-3 h-3 rounded-full bg-[#0F6E56]/15 pointer-events-none z-10 animate-dust2" />
      <div className="absolute top-[1380px] left-[25%] w-2.5 h-2.5 rounded-full bg-[#CBA052]/18 pointer-events-none z-10 animate-dust3" />

      {/* Anchor Companion Mascot (Larger floating sticker) standing beside the current focus node */}
      {mascotPos && (
        <div
          className="absolute z-20 pointer-events-none mascot-bounce-cheer"
          style={{
            left: `calc(${mascotPos.x / 10}% + 36px)`,
            top: `${mascotPos.y - 36}px`,
          }}
        >
          <img
            src="./head-marker.png"
            alt="Mascot guide"
            className="w-16 h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}

      {/* 1. Landmark Markers (Nodes layer) */}
      {sortedLandmarks.map((landmark, idx) => {
        const pos = getLandmarkCoords(landmark);
        const stamp = stamps.find((s) => s.landmark_id === landmark.id);

        const isStamped = !!stamp;

        const isVisible = visibleNodes[landmark.id];

        // Node Visual Type Configuration
        // Active: 84px. Others: 68px.
        const sizeClass = !isStamped ? 'w-[84px] h-[84px]' : 'w-[68px] h-[68px]';
        
        // Resolve zone specific Icon
        const SpecificIcon = iconMap[landmark.zoneType || ''] || landmark.icon === 'local_library' ? BookOpen : landmark.icon === 'stadium' ? Trophy : landmark.icon === 'verified' ? Award : landmark.icon === 'beach_access' ? Palmtree : landmark.icon === 'nature_people' ? Leaf : Building;

        return (
          <div
            key={`node-${landmark.id}`}
            ref={(el) => {
              nodeRefs.current[landmark.id] = el;
            }}
            data-landmark-id={landmark.id}
            className={`absolute z-10 pointer-events-auto transition-all duration-300 ${
              isVisible ? 'node-pop-in' : 'node-hidden'
            }`}
            style={{
              left: `${pos.x / 10}%`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
             {/* Tap target circle */}
            <button
              onClick={() => onSelectLandmark(landmark)}
              className={`rounded-full flex items-center justify-center relative transition-all duration-200 cursor-pointer shadow-md select-none outline-none focus:ring-2 focus:ring-[#CBA052] ${sizeClass} ${
                isStamped
                  ? 'bg-white border-2 border-[#C9A13A] p-0.5 overflow-hidden hover:brightness-105 active:scale-95'
                  : 'bg-[#0F6E56] border-[3px] border-[#C9A13A] hover:brightness-105 active:scale-95'
              }`}
              style={{
                boxShadow: !isStamped
                  ? '0 0 0 6px rgba(201,161,58,0.20)'
                  : undefined,
              }}
            >
              {isStamped ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img
                    src={stamp?.photo_url || landmark.photoUrl}
                    alt={landmark.name}
                    className="w-full h-full object-cover grayscale-[25%] contrast-[105%] brightness-[90%]"
                  />
                  {/* Green ink diagonal stamp overlay */}
                  <div className="absolute inset-0 flex items-center justify-center rotate-[-12deg] pointer-events-none select-none">
                    <span className="border-1.5 border-[#4CAF50]/90 text-[#4CAF50]/90 text-[7.5px] font-mono font-extrabold uppercase px-1 py-0.5 rounded-xs tracking-wider bg-white/75 backdrop-blur-[0.5px]">
                      stamped
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-[62px] h-[62px] rounded-full bg-[#1a4a30] flex items-center justify-center border border-[#CBA052]/30">
                  <SpecificIcon className="w-7 h-7 text-[#C9A13A]" />
                </div>
              )}
            </button>

            {/* Check badge positioned outside the overflow-hidden button */}
            {isStamped && (
              <div className="absolute -top-1 -right-1 bg-[#4CAF50] w-[24px] h-[24px] rounded-full border border-white flex items-center justify-center shadow-md z-20 pointer-events-none">
                <Check className="w-4 h-4 text-white" strokeWidth={4.5} />
              </div>
            )}
          </div>
        );
      })}

      {/* 2. Compact labels layer (Centered on node coordinate, clamped to margins) */}
      {sortedLandmarks.map((landmark, idx) => {
        const pos = getLandmarkCoords(landmark);
        const stamp = stamps.find((s) => s.landmark_id === landmark.id);

        const isStamped = !!stamp;
        const isJustStamped = justStampedId === landmark.id;

        const isVisible = visibleNodes[landmark.id];
        
        let stateText = isStamped ? 'stamped' : 'tap to stamp';

        const { rotation, offsetX, offsetY } = getDeterministicStampStyle(landmark.id);

        return (
          <button
            key={`label-${landmark.id}`}
            onClick={() => onSelectLandmark(landmark)}
            className={`absolute z-10 flex flex-col items-center justify-center p-[6px] px-[12px] w-[140px] max-w-[140px] text-center pointer-events-auto rounded-[8px] border shadow-xs select-none transition-all duration-300 font-sans focus:outline-none focus:ring-1 focus:ring-[#C9A13A] ${
              isVisible ? 'node-pop-in' : 'node-hidden'
            } ${
              isJustStamped ? 'stamp-slam-effect' : ''
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
            <span className={`text-[9px] font-mono tracking-widest font-extrabold leading-none ${
              !isStamped ? 'text-[#C9A13A]' : 'text-[#4a7a4a]'
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
      })}
    </div>
  );
}