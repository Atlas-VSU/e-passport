import { playStampSound, seededRandom, triggerHapticTick } from '../../../../lib/utils';
import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { Landmark, Stamp } from '../../../../types';

interface StickerTileProps {
    landmark: Landmark;
    stamp?: Stamp;
    idx: number;
    onSelect: () => void;
}


export default function StickerTile({ landmark, stamp, idx, onSelect }: StickerTileProps) {
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
