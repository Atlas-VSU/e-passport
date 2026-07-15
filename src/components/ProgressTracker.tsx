import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProgressTrackerProps {
  stampsCount: number;
  totalCount: number;
}

const GOLD = '#CBA052';
const GREEN_DARK = '#00301A';

/** Swap this path for your own asset — shown inside the moving head marker.
 *  Leave as null to keep the placeholder frame until you have one ready. */
const HEAD_IMAGE_URL: string | null = '/head-marker.png';

/** Interpolates a shade of green by progress (0 = deep, 1 = brightest)
 *  so filled segments visibly lighten as the journey progresses. */
function greenShade(t: number) {
  const lightness = 16 + t * 26; // 16% -> 42%
  return `hsl(151, 42%, ${lightness}%)`;
}

export default function ProgressTracker({ stampsCount, totalCount }: ProgressTrackerProps) {
  const percent = totalCount > 0 ? Math.min(100, Math.max(0, (stampsCount / totalCount) * 100)) : 0;
  const isComplete = totalCount > 0 && stampsCount === totalCount;
  const segments = Array.from({ length: Math.max(totalCount, 1) });
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-white/10 rounded-2xl p-4 pt-4 text-white border border-[#CBA052]/20 shadow-inner backdrop-blur-sm">

      {/* ── visa-field style header: label/status left, reference number right ── */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-serif text-[12px] font-bold tracking-[0.18em] uppercase text-[#CBA052]">
            Record of Entries
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/50 mt-1">
            Status — {isComplete ? 'Journey Complete' : 'In Progress'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-xl font-bold text-white leading-none tracking-wide">
            {pad(stampsCount)}<span className="text-white/40 mx-0.5 font-normal">/</span>{pad(totalCount)}
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#CBA052]/70 mt-1">
            Entries Recorded
          </p>
        </div>
      </div>

      <div className="h-px bg-[#CBA052]/25 mb-3.5" />

      {/* sectioned progress bar with an image-ready head marker */}
      <div className="relative pt-4">
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out flex flex-col items-center"
          style={{ left: `${percent}%` }}
        >
          <div
            className="w-7 h-7 rounded-full border-2 shadow-lg overflow-hidden flex items-center justify-center"
            style={{ borderColor: GOLD, background: GREEN_DARK }}
          >
            {HEAD_IMAGE_URL ? (
              <img src={HEAD_IMAGE_URL} alt="Current progress" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-3 h-3 text-[#CBA052]/50" />
            )}
          </div>
          <div
            className="w-0 h-0 -mt-px"
            style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `5px solid ${GOLD}` }}
          />
        </div>

        <div className="flex gap-[3px]">
          {segments.map((_, i) => {
            const filled = i < stampsCount;
            const t = totalCount > 1 ? i / (totalCount - 1) : 1;
            return (
              <div
                key={i}
                className="h-2.5 flex-1 rounded-[2px] transition-colors duration-500"
                style={{
                  background: filled ? greenShade(t) : 'rgba(0,48,26,0.45)',
                  boxShadow: filled ? `0 0 5px ${greenShade(t)}` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}