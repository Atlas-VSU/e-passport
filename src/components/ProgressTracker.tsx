import React from 'react';

interface ProgressTrackerProps {
  stampsCount: number;
  totalCount: number;
}

export default function ProgressTracker({ stampsCount, totalCount }: ProgressTrackerProps) {
  const percent = Math.min(100, Math.max(0, (stampsCount / totalCount) * 100));
  const isComplete = stampsCount === totalCount;

  return (
    <div className="bg-white/10 rounded-2xl p-4 text-white border border-white/10 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold tracking-tight uppercase opacity-80">
          {isComplete ? "🎉 Passport Completed" : "Your Journey"}
        </span>
        <span className="text-xl font-black font-mono">
          {stampsCount}/{totalCount} <span className="text-xs font-medium opacity-60 tracking-wider">STAMPS</span>
        </span>
      </div>
      {/* Dynamic Progress Bar matching design */}
      <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-[1px]">
        <div 
          className="h-full bg-[#CBA052] rounded-full shadow-[0_0_10px_#CBA052] transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

