import React from 'react';
import { Lock, Navigation } from 'lucide-react';
import { Landmark, Stamp } from '../types';

interface StampBadgeProps {
  landmark: Landmark;
  stamp?: Stamp;
  isActive: boolean;
  isLocked: boolean;
  onClick: () => void;
}

export default function StampBadge({ landmark, stamp, isActive, isLocked, onClick }: StampBadgeProps) {
  // 1. Locked State
  if (isLocked && !stamp) {
    return (
      <div className="flex items-center gap-3 bg-[#1a1a1a]/5 p-2 pr-4 rounded-full border border-[#1a1a1a]/10 max-w-[240px] opacity-50 grayscale transition-all shadow-sm">
        <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
          <Lock className="text-gray-400 w-5 h-5" />
        </div>
        <div className="text-left overflow-hidden">
          <p className="font-mono text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">Landmark 0{landmark.order}</p>
          <h3 className="font-sans text-xs font-bold text-gray-500 truncate">{landmark.name}</h3>
        </div>
      </div>
    );
  }

  // 2. Stamped State
  if (stamp) {
    return (
      <button 
        onClick={onClick}
        className="flex items-center gap-3 bg-[#CBA052]/10 hover:bg-[#CBA052]/20 p-2 pr-4 rounded-full border-2 border-[#CBA052]/40 max-w-[250px] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#004225] text-left shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <div className="relative w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0 overflow-hidden transform rotate-3 group-hover:rotate-12 transition-transform duration-300">
          <img 
            className="w-full h-full object-cover" 
            src={stamp.photo_url || landmark.photoUrl} 
            alt={landmark.name} 
          />
          {/* Green Check Badge overlay */}
          <div className="absolute -top-0.5 -right-0.5 bg-[#4CAF50] w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="font-mono text-[8px] font-bold text-[#004225] uppercase tracking-widest">Landmark 0{landmark.order}</p>
          <h3 className="font-serif text-xs font-bold text-[#1A1A1A] truncate">{landmark.name}</h3>
          <p className="font-mono text-[8px] text-[#CBA052] font-semibold uppercase mt-0.5 tracking-wider">stamped</p>
        </div>
      </button>
    );
  }

  // 3. Active State (Current Stop)
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 bg-[#004225] p-3 pr-5 rounded-[28px] border-4 border-[#CBA052] shadow-[0_8px_20px_rgba(0,66,37,0.3)] hover:shadow-[0_8px_25px_rgba(203,160,82,0.4)] max-w-[280px] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] group text-left relative overflow-hidden"
    >
      {/* Dynamic ambient background light */}
      <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#CBA052]/20 rounded-full blur-xl pointer-events-none group-hover:bg-[#CBA052]/40 transition-all duration-300" />
      
      <div className="relative flex-shrink-0">
        {/* Pulsing ring */}
        <div className="absolute -inset-1.5 rounded-full bg-[#CBA052] opacity-35 animate-ping group-hover:opacity-50" />
        
        <div className="relative z-10 w-11 h-11 bg-[#CBA052] rounded-full border-2 border-white shadow-md flex items-center justify-center transform group-hover:rotate-12 transition-all">
          <Navigation className="text-[#004225] w-5 h-5 animate-pulse" />
        </div>
      </div>
      
      <div className="overflow-hidden text-white z-10">
        <p className="font-mono text-[8px] font-extrabold text-[#CBA052] uppercase tracking-widest">Current Stop</p>
        <h3 className="font-serif text-sm font-black tracking-tight text-white leading-tight truncate">{landmark.name}</h3>
        <p className="font-mono text-[8px] font-bold text-[#CBA052] uppercase tracking-wider flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-ping" />
          TAP TO VISIT
        </p>
      </div>
    </button>
  );
}
