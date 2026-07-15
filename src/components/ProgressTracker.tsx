import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface ProgressTrackerProps {
  stampsCount: number;
  totalCount: number;
}

const GOLD = "#CBA052";
const GREEN_DARK = "#00301A";

const HEAD_IMAGE_URL: string | null = "public/head-marker.png";

function greenShade(t: number) {
  const lightness = 20 + t * 30; // widened + raised floor so it stays legible under glare
  return `hsl(151, 55%, ${lightness}%)`;
}

export default function ProgressTracker({
  stampsCount,
  totalCount,
}: ProgressTrackerProps) {
  const percent =
    totalCount > 0
      ? Math.min(100, Math.max(0, (stampsCount / totalCount) * 100))
      : 0;
  const isComplete = totalCount > 0 && stampsCount === totalCount;
  const segments = Array.from({ length: Math.max(totalCount, 1) });

  return (
    <div className="bg-white/10 rounded-2xl p-4 pt-4 text-white border border-[#CBA052]/20 shadow-inner backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-serif text-[12px] font-bold tracking-[0.18em] uppercase text-[#CBA052]">
            Record of Entries
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/50 mt-1">
            Status — {isComplete ? "Journey Complete" : "In Progress"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-xl font-bold text-white leading-none tracking-wide">
            {stampsCount}
            <span className="text-white/40 mx-0.5 font-normal">/</span>
            {totalCount}
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#CBA052]/70 mt-1">
            Entries Recorded
          </p>
        </div>
      </div>

      <div className="h-px bg-[#CBA052]/25 mb-0.5" />

      <div className="relative h-13 mb-1.5">
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out flex flex-col items-center"
          style={{ left: `clamp(22px, ${percent}%, calc(100% - 22px))` }}
        >
          <div className="w-13 h-13 flex items-center justify-center overflow-hidden">
            {HEAD_IMAGE_URL ? (
              <img
                src={HEAD_IMAGE_URL}
                alt="Current progress"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#CBA052]/60" />
            )}
          </div>
          {/* larger, drop-shadowed pointer so it reads clearly against the bar instead of blending in */}
          <div
            className="w-0 h-0 -mt-px"
            style={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: `9px solid ${GOLD}`,
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))",
            }}
          />
        </div>
      </div>

      <div className="flex gap-0.75">
        {segments.map((_, i) => {
          const filled = i < stampsCount;
          const t = totalCount > 1 ? i / (totalCount - 1) : 1;
          return (
            <div
              key={i}
              className="h-4 flex-1 rounded-[3px] transition-colors duration-500"
              style={{
                background: filled ? greenShade(t) : "#0A1F14",
                border: filled
                  ? "0.5px solid rgba(255,255,255,0.35)"
                  : `0.5px solid ${GOLD}55`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}