import { Landmark, Stamp } from '../../../../types';
import StickerTile from './StickerTile';
interface StickerBookViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
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
