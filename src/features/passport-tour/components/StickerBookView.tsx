import React, { useState } from 'react';
import { Check, Camera } from 'lucide-react';
import { Landmark, Stamp } from '../../../types';

interface StickerBookViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
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
export function getDeterministicStampStyle(landmarkId: string) {
  const seed = landmarkId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = createSeededRandom(seed);
  const rotation = (rand() - 0.5) * 12; // between -6 and +6 degrees
  const offsetX = (rand() - 0.5) * 6;  // between -3px and +3px
  const offsetY = (rand() - 0.5) * 6;  // between -3px and +3px
  return { rotation, offsetX, offsetY };
}

// Web Audio API Programmatic Stamp Synthesizer
export function playStampSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. LOW FREQUENCY THUD
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

    // 2. HIGH FREQUENCY FRICTION/SLAP (White Noise)
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

// Haptic Tick Vibration
export function triggerHapticTick() {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(12);
    } catch {
      // Ignore vibration blocks
    }
  }
}

interface StickerTileProps {
  landmark: Landmark;
  stamp?: Stamp;
  idx: number;
  onSelect: () => void;
}

function StickerTile({ landmark, stamp, idx, onSelect }: StickerTileProps) {
  const [isReplaying, setIsReplaying] = useState(false);
  const isStamped = !!stamp;

  const { rotation, offsetX, offsetY } = getDeterministicStampStyle(landmark.id);

  const handleTileClick = () => {
    if (!isStamped) {
      // Tap to open landmark detail and stamp it
      onSelect();
      return;
    }

    // Play replay animation, thud audio, and haptic feedback
    setIsReplaying(true);
    playStampSound();
    triggerHapticTick();

    setTimeout(() => {
      setIsReplaying(false);
    }, 550);
  };

  return (
    <button
      onClick={handleTileClick}
      className={`relative rounded-3xl border aspect-square flex flex-col items-center justify-center p-3 text-center transition-all duration-300 overflow-hidden outline-none focus:ring-2 focus:ring-[#0f6e56] ${
        isStamped
          ? 'bg-[#F8F3E5] border-[#CBA052]/40 shadow-[0_4px_12px_rgba(15,110,86,0.12)] hover:scale-[1.02] cursor-pointer'
          : 'bg-[#1a1a1a]/5 border-dashed border-[#0F6E56]/15 hover:bg-[#1a1a1a]/10 cursor-pointer shadow-xs'
      }`}
    >
      {/* Visual grain overlay on card surface */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.06%22/%3E%3C/svg%3E')] pointer-events-none opacity-50 z-0" />

      {isStamped ? (
        <div
          className={`flex flex-col items-center z-10 transition-transform ${
            isReplaying ? 'stamp-animate' : ''
          }`}
          style={{
            transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
          }}
        >
          {/* Rounded Stamp Graphic with image and checkmark overlay */}
          <div className="relative w-18 h-18 md:w-20 md:h-20 rounded-full border-[3px] border-[#CBA052] p-1 bg-white shadow-md overflow-hidden flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden border border-dashed border-[#CBA052]/40">
              <img
                src={stamp.photo_url || landmark.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {/* Ink-stamp check icon */}
            <div className="absolute bottom-1 right-1 bg-[#0F6E56] border border-white text-white w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
              <Check className="w-3 h-3" strokeWidth={3.5} />
            </div>
          </div>
          <span className="font-mono text-[8px] font-bold text-[#0F6E56] uppercase tracking-widest mt-2 block">
            Landmark 0{idx + 1}
          </span>
          <span className="font-serif text-[11px] font-black text-gray-800 leading-none truncate max-w-full mt-0.5">
            {landmark.name}
          </span>
          <span className="font-mono text-[6.5px] font-bold text-[#CBA052] uppercase tracking-widest leading-none mt-1">
            Stamped
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center z-10 text-gray-400">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 bg-white/50">
            <Camera className="w-5 h-5 opacity-40 text-[#0F6E56]" />
          </div>
          <span className="font-mono text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            Landmark 0{idx + 1}
          </span>
          <span className="font-serif text-[11px] font-bold text-gray-500 truncate max-w-full leading-tight mt-0.5">
            {landmark.name}
          </span>
          <span className="font-mono text-[7px] text-[#0F6E56] uppercase font-bold tracking-wider mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#0F6E56]/40" />
            Tap to visit
          </span>
        </div>
      )}
    </button>
  );
}

export default function StickerBookView({ landmarks, stamps, onSelectLandmark }: StickerBookViewProps) {
  // Sort landmarks by fixed order (1 to 6)
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full min-h-[500px] p-4 flex flex-col gap-4 parchment-base">
      <style>{`
        @keyframes stampSlam {
          0% { transform: scale(2.2) rotate(-22deg) translate(0, -10px); opacity: 0.3; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.15)); }
          45% { transform: scale(1) rotate(var(--rot)) translate(0, 0); opacity: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
          60% { transform: scaleY(0.86) scaleX(1.05) rotate(var(--rot)); }
          100% { transform: scale(1) rotate(var(--rot)) translate(0, 0); opacity: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15)); }
        }
        .stamp-animate {
          animation: stampSlam 550ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div className="flex flex-col text-left">
        <h2 className="font-serif text-lg font-black text-[#004225] leading-tight">
          Your collection
        </h2>
        <p className="font-sans text-[11px] text-gray-600 leading-normal mt-0.5">
          Tap stamped badges to replay stamp thuds. Unstamped items can be tapped to visit their camera check-in page.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-1">
        {sortedLandmarks.map((landmark, idx) => {
          const stamp = stamps.find((s) => s.landmark_id === landmark.id);
          return (
            <StickerTile
              key={landmark.id}
              landmark={landmark}
              stamp={stamp}
              idx={idx}
              onSelect={() => onSelectLandmark(landmark)}
            />
          );
        })}
      </div>
    </div>
  );
}