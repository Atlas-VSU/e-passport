import React from 'react';
import { Stamp } from '../../../types';

interface UserPhotoEntryProps {
  stamp: Stamp;
}

export default function UserPhotoEntry({ stamp }: UserPhotoEntryProps) {
  if (!stamp.photo_url) return null;

  return (
    <div className="flex flex-col text-left animate-fadeIn">
      <span className="font-mono text-[8px] uppercase tracking-widest text-[#7a4f10] mb-2.5 font-bold">
        your photo entry
      </span>
      <div
        className="relative rounded-2xl overflow-hidden border border-[#CBA052]/40 bg-white p-3 shadow-md"
        style={{
          transform: 'rotate(-1deg)',
        }}
      >
        <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
          <img
            src={stamp.photo_url}
            alt="Your entry photo"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2.5 right-2.5 bg-[#0F6E56] text-[#FFE58F] border border-[#FFE58F]/30 rounded-full px-2.5 py-0.5 text-[8.5px] font-mono font-bold tracking-widest shadow-sm">
            CHECKED IN ✓
          </div>
        </div>
        <div className="pt-3 pb-1 px-1 flex justify-between items-center text-[#5a3a18]/70 font-mono text-[9px] tracking-wider">
          <span>VSU CAMPUS TOUR</span>
          <span>
            {stamp.stamped_at
              ? new Date(stamp.stamped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
              : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
