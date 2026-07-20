import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { Landmark, Stamp } from '../../../types';
import { seededRandom } from './ProceduralMapCanvas';

interface StickerBookViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
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

  // Seeded rotation between -3 and +3 degrees, stable across renders
  const rotation = (seededRandom(landmark.id, 0) * 6) - 3;

  const handleTileClick = () => {
    if (!isStamped) {
      onSelect();
      return;
    }

    // Play replay animations, sound, and haptic feedback
    setIsReplaying(true);
    playStampSound();
    triggerHapticTick();

    setTimeout(() => {
      setIsReplaying(false);
    }, 500);
  };

  return (
    <button
      onClick={handleTileClick}
      className={`relative flex flex-col items-center text-center select-none cursor-pointer outline-none transition-all duration-300 w-full ${isReplaying ? 'animate-stamp-replay' : ''
        } focus:ring-2 focus:ring-[#CBA052]`}
      style={
        isStamped
          ? {
            backgroundColor: 'rgba(15, 40, 25, 0.88)',
            border: '1.5px solid #CBA052',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(201,161,58,0.10)',
          }
          : {
            backgroundColor: 'rgba(15, 40, 25, 0.40)',
            border: '1.5px dashed rgba(201,161,58,0.30)',
            borderRadius: '12px',
            padding: '12px',
          }
      }
    >
      {isStamped ? (
        <div className="flex flex-col items-center w-full h-full">
          {/* Circular Photo Thumbnail (72px, rotated) */}
          <div className="relative w-[72px] h-[72px] shrink-0" style={{ transform: `rotate(${rotation}deg)` }}>
            {/* Overflow-hidden inner photo container */}
            <div className="w-full h-full rounded-full border-[2.5px] border-[#CBA052] bg-white overflow-hidden flex items-center justify-center shadow-md">
              <img
                src={stamp.photo_url || landmark.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {/* Ink-stamp check icon */}
            <div className="absolute bottom-0.5 right-0.5 bg-[#0F6E56] border border-white text-white w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs z-10">
              <Check className="w-3 h-3" strokeWidth={3.5} />
            </div>
            {/* Gold pulse ring for replay */}
            {isReplaying && (
              <div className="absolute inset-0 rounded-full border-[2.5px] border-[#CBA052] pointer-events-none animate-pulse-ring" />
            )}
          </div>

          {/* Stamped Badge pill */}
          <div className="bg-[#0F6E56] text-[#5DCAA5] rounded-full px-2 py-0.5 mt-[-8px] z-10 shadow-sm">
            <span className="font-mono text-[7px] font-bold uppercase tracking-widest block leading-none">
              stamped
            </span>
          </div>

          {/* Landmark label code */}
          <span className="font-mono text-[8px] font-bold text-[#CBA052] uppercase tracking-widest mt-2 block">
            LANDMARK 0{idx + 1}
          </span>

          {/* Landmark name */}
          <span className="font-serif text-[13px] font-black text-white leading-tight truncate max-w-full mt-0.5">
            {landmark.name}
          </span>

          {/* Thin gold divider line */}
          <div className="w-full h-px bg-[#CBA052]/20 my-2" />

          {/* Flavor text */}
          <span className="font-sans text-[9px] italic text-white/50 leading-tight">
            {landmark.flavorText}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full h-full">
          {/* Circular Placeholder */}
          <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-dashed border-[#CBA052]/30 bg-black/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-white/20" />
          </div>

          {/* Landmark label code */}
          <span className="font-mono text-[8px] font-bold text-[#CBA052]/40 uppercase tracking-widest mt-2 block">
            LANDMARK 0{idx + 1}
          </span>

          {/* Landmark name */}
          <span className="font-serif text-[13px] font-black text-white/40 leading-tight truncate max-w-full mt-0.5">
            {landmark.name}
          </span>

          {/* "tap to visit" text */}
          <span className="font-mono text-[8px] text-[#CBA052]/50 mt-1.5">
            tap to visit
          </span>
        </div>
      )}
    </button>
  );
}

export default function StickerBookView({ landmarks, stamps, onSelectLandmark }: StickerBookViewProps) {
  // Sort landmarks by fixed order (1 to 6)
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);
  const isCompleted = stamps.length === landmarks.length;

  return (
    <div
      className="w-full min-h-full relative select-none"
      style={{
        backgroundColor: '#F2E9D3',
      }}
    >
      {/* Light leather texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 animate-fadeIn"
        style={{
          backgroundImage: "url('/textures/leather.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply',
          opacity: 0.08
        }}
      />

      <style>{`
        @keyframes stampCardReplay {
          0% { transform: scale(1); }
          30% { transform: scale(0.95); }
          70% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes goldPulseRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(100%) skewX(-15deg); }
        }
        .animate-stamp-replay {
          animation: stampCardReplay 400ms ease-in-out;
        }
        .animate-pulse-ring {
          animation: goldPulseRing 500ms ease-out forwards;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex flex-col gap-4 px-4 pt-10 mt-0 pb-20">
        {/* Passport-style section header */}
        <div className="text-left">
          <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#CBA052]">
            Viscan E-Pasaporte
          </p>
          <h2 className="text-lg font-serif font-black text-[#004225]">
            Stamp Collection
          </h2>
          <p className="text-[10px] text-[#004225]/70 mt-0.5">
            {stamps.length} of {landmarks.length} landmarks visited
          </p>
        </div>

        {/* Completion Banner (shown only when all 6 stamped) */}
        {isCompleted && (
          <div
            className="relative overflow-hidden w-full flex flex-col items-center justify-center text-center"
            style={{
              background: 'linear-gradient(135deg, #0F6E56, #004225)',
              border: '1.5px solid #CBA052',
              borderRadius: '16px',
              padding: '16px 20px',
            }}
          >
            {/* Shimmer strip */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"
              style={{
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
              }}
            />

            <span className="text-3xl mb-1.5" role="img" aria-label="trophy">🏆</span>
            <h3 className="font-serif font-black text-lg text-white">
              Tour Complete
            </h3>
            <span className="font-mono text-[#CBA052] text-[9px] font-bold uppercase tracking-widest mt-0.5">
              All 6 landmarks stamped
            </span>
          </div>
        )}

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3 items-stretch w-full mt-1">
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
    </div>
  );
}