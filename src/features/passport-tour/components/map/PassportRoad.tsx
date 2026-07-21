import React, { useEffect, useRef, useState } from 'react';
import { Landmark, Stamp } from '../../../../types';
import ProceduralMapCanvas from './ProceduralMapCanvas';
import MapParticles from './MapParticles';
import MascotGuide from './MascotGuide';
import MapNode from './MapNode';
import MapNodeLabel from './MapNodeLabel';
import { getLandmarkCoords, playStampSound, triggerHapticTick } from '@/src/lib/utils';

interface PassportRoadProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  onSelectLandmark: (landmark: Landmark) => void;
  justStampedId: string | null;
  nudgeLandmarkId: string | null;
}

export default function PassportRoad({
  landmarks,
  stamps,
  onSelectLandmark,
  justStampedId,
  nudgeLandmarkId,
}: PassportRoadProps) {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  // Discovery Pop-In states via IntersectionObserver
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [visibleNodes, setVisibleNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const landmarkId = entry.target.getAttribute('data-landmark-id');
            if (landmarkId) {
              setVisibleNodes((prev) => ({ ...prev, [landmarkId]: true }));
              observer.unobserve(entry.target); // Trigger exactly once
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(nodeRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [landmarks]);

  // Audio/Haptic trigger on mount when returning with a newly minted stamp
  useEffect(() => {
    if (justStampedId) {
      playStampSound();
      triggerHapticTick();
    }
  }, [justStampedId]);

  // Map landmarks to coordinates for route drawing
  const routeNodes = sortedLandmarks.map((lm) => getLandmarkCoords(lm));

  // Generate continuous route wandering curves
  let routePathD = '';
  if (routeNodes.length > 0) {
    routePathD = `M ${routeNodes[0].x} ${routeNodes[0].y}`;
    for (let i = 0; i < routeNodes.length - 1; i++) {
      const p0 = routeNodes[i];
      const p1 = routeNodes[i + 1];
      const dy = (p1.y - p0.y) * 0.45;

      const sign = i % 2 === 0 ? 1 : -1;
      const meanderX = 130 * sign;

      routePathD += ` C ${p0.x + meanderX} ${p0.y + dy}, ${p1.x - meanderX} ${p1.y - dy}, ${p1.x} ${p1.y}`;
    }
  }

  // Anchor Companion Mascot (32px) beside the most recently stamped node (or active if 0 stamps)
  const lastStamp = stamps.length > 0
    ? stamps.reduce((latest, s) => {
      return new Date(s.stamped_at) > new Date(latest.stamped_at) ? s : latest;
    }, stamps[0])
    : null;

  const mascotTargetId = lastStamp ? lastStamp.landmark_id : nudgeLandmarkId;
  const mascotLm = landmarks.find((lm) => lm.id === mascotTargetId);
  const mascotPos = mascotLm ? getLandmarkCoords(mascotLm) : null;

  return (
    <div className="relative w-full h-[1800px] overflow-hidden select-none">
      {/* Procedural Map Base Layer */}
      <ProceduralMapCanvas landmarks={landmarks} />

      <style>{`
        @keyframes mapDash {
          to {
            stroke-dashoffset: -9;
          }
        }
        .map-trail {
          animation: mapDash 15s linear infinite;
        }
        @keyframes mascotCheer {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0); }
          25% { transform: translate(0, -6px) scale(1.08) rotate(-4deg); }
          75% { transform: translate(0, -6px) scale(1.08) rotate(4deg); }
        }
        .mascot-bounce-cheer {
          animation: mascotCheer 1.8s ease-in-out infinite;
        }
        @keyframes popIn {
          0% { transform: scale(0.75); opacity: 0; }
          70% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        .node-pop-in {
          animation: popIn 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .node-hidden {
          opacity: 0;
          transform: scale(0.75);
        }
        @keyframes stampSlam {
          0% { transform: scale(2.2) rotate(-22deg) translate(-50%, -50%); opacity: 0.3; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.15)); }
          45% { transform: scale(1) rotate(var(--rot)) translate(-50%, -50%); opacity: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
          60% { transform: scaleY(0.86) scaleX(1.05) rotate(var(--rot)) translate(-50%, -50%); }
          100% { transform: scale(1) rotate(var(--rot)) translate(-50%, -50%); opacity: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15)); }
        }
        .stamp-slam-effect {
          animation: stampSlam 550ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes drift1 {
          0% { transform: translateY(0) translateX(0) scale(0.95); opacity: 0.14; }
          50% { transform: translateY(-45px) translateX(15px) scale(1.1); opacity: 0.22; }
          100% { transform: translateY(-90px) translateX(0) scale(0.95); opacity: 0.14; }
        }
        @keyframes drift2 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.12; }
          50% { transform: translateY(-65px) translateX(-20px) scale(0.85); opacity: 0.20; }
          100% { transform: translateY(-130px) translateX(0) scale(1); opacity: 0.12; }
        }
        @keyframes drift3 {
          0% { transform: translateY(0) translateX(0) scale(0.9); opacity: 0.16; }
          50% { transform: translateY(-50px) translateX(12px) scale(1.05); opacity: 0.24; }
          100% { transform: translateY(-100px) translateX(0) scale(0.9); opacity: 0.16; }
        }
        .animate-dust1 { animation: drift1 14s ease-in-out infinite; }
        .animate-dust2 { animation: drift2 18s ease-in-out infinite; }
        .animate-dust3 { animation: drift3 16s ease-in-out infinite; }
      `}</style>

      {/* SVG Canvas for Gold Trail overlays only (above base canvas, below nodes) */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1800"
      >
        {/* Render Gold Route Path */}
        {routePathD && (
          <>
            {/* Trail Drop Shadow */}
            <path
              d={routePathD}
              fill="none"
              stroke="rgba(15, 110, 86, 0.35)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="3 6"
              transform="translate(1, 1.5)"
            />
            {/* Active Dotted Trail */}
            <path
              className="map-trail"
              d={routePathD}
              fill="none"
              stroke="#C9A13A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="3 6"
            />
          </>
        )}
      </svg>

      {/* Ambient drifting particles sub-component */}
      <MapParticles />

      {/* Companion Mascot guide guide */}
      <MascotGuide pos={mascotPos} />

      {/* 1. Landmark Markers (Nodes layer) */}
      {sortedLandmarks.map((landmark) => {
        const pos = getLandmarkCoords(landmark);
        const stamp = stamps.find((s) => s.landmark_id === landmark.id);
        const isVisible = visibleNodes[landmark.id];

        return (
          <MapNode
            key={`node-${landmark.id}`}
            landmark={landmark}
            stamp={stamp}
            isVisible={isVisible}
            onSelectLandmark={onSelectLandmark}
            pos={pos}
            nodeRef={(el) => {
              nodeRefs.current[landmark.id] = el;
            }}
          />
        );
      })}

      {/* 2. Compact labels layer (Centered on node coordinate, clamped to margins) */}
      {sortedLandmarks.map((landmark, idx) => {
        const pos = getLandmarkCoords(landmark);
        const stamp = stamps.find((s) => s.landmark_id === landmark.id);
        const isJustStamped = justStampedId === landmark.id;
        const isVisible = visibleNodes[landmark.id];

        return (
          <MapNodeLabel
            key={`label-${landmark.id}`}
            landmark={landmark}
            stamp={stamp}
            idx={idx}
            isVisible={isVisible}
            isJustStamped={isJustStamped}
            onSelectLandmark={onSelectLandmark}
            pos={pos}
          />
        );
      })}
    </div>
  );
}
