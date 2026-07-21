import React from 'react';
import { Check, Building, Leaf, BookOpen, Award, Trophy, Palmtree, LucideIcon } from 'lucide-react';
import { Landmark, Stamp } from '../../../../types';
import ImageWithLoader from '../../../../components/ImageWithLoader';

interface MapNodeProps {
  landmark: Landmark;
  stamp?: Stamp;
  isVisible: boolean;
  onSelectLandmark: (landmark: Landmark) => void;
  pos: { x: number; y: number };
  nodeRef: (el: HTMLDivElement | null) => void;
}

// Icon mapping based on zoneType configurations
const iconMap: Record<string, LucideIcon> = {
  building: Building,
  green: Leaf,
  local_library: BookOpen,
  verified: Award,
  stadium: Trophy,
  beach_access: Palmtree,
};

export default function MapNode({
  landmark,
  stamp,
  isVisible,
  onSelectLandmark,
  pos,
  nodeRef
}: MapNodeProps) {
  const isStamped = !!stamp;

  // Active: 84px. Others: 68px.
  const sizeClass = !isStamped ? 'w-[84px] h-[84px]' : 'w-[68px] h-[68px]';

  // Resolve zone specific Icon
  const SpecificIcon = iconMap[landmark.zoneType || ''] ||
    (landmark.icon === 'local_library' ? BookOpen :
      landmark.icon === 'stadium' ? Trophy :
        landmark.icon === 'verified' ? Award :
          landmark.icon === 'beach_access' ? Palmtree :
            landmark.icon === 'nature_people' ? Leaf : Building);

  return (
    <div
      ref={nodeRef}
      data-landmark-id={landmark.id}
      className={`absolute z-10 pointer-events-auto transition-all duration-300 ${isVisible ? 'node-pop-in' : 'node-hidden'
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
        className={`rounded-full flex items-center justify-center relative transition-all duration-200 cursor-pointer shadow-md select-none outline-none focus:ring-2 focus:ring-[#CBA052] ${sizeClass} ${isStamped
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
            <ImageWithLoader
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
}
