import React from 'react';
import { Landmark } from '../../../../types';
import { getLandmarkCoords } from '../../../../lib/utils';
import MapGridOverlay from './MapGridOverlay';
import MapDecorationLayers from './MapDecorationLayers';
import MapLandmarkZones from './MapLandmarkZones';

interface ProceduralMapCanvasProps {
  landmarks: Landmark[];
}

export default function ProceduralMapCanvas({ landmarks }: ProceduralMapCanvasProps) {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  // Draw campus road network connecting adjacent zones sequentially
  const roadPaths: string[] = [];
  const routeNodes = sortedLandmarks.map((lm) => getLandmarkCoords(lm));

  for (let i = 0; i < routeNodes.length - 1; i++) {
    const p0 = routeNodes[i];
    const p1 = routeNodes[i + 1];
    const dy = (p1.y - p0.y) * 0.45;
    const sign = i % 2 === 0 ? 1 : -1;
    const offset = 95 * sign;
    const d = `M ${p0.x} ${p0.y} C ${p0.x + offset} ${p0.y + dy}, ${p1.x - offset} ${p1.y - dy}, ${p1.x} ${p1.y}`;
    roadPaths.push(d);
  }

  // Secondary/Incidental roads to fill empty landscape areas
  const secondaryPaths = [
    'M 580 150 C 450 120, 300 80, 100 120',
    'M 560 450 C 680 430, 820 480, 920 460',
    'M 260 750 C 200 790, 140 760, 60 810',
    'M 420 1050 C 580 1020, 750 1080, 940 1040',
    'M 240 1350 C 180 1320, 120 1360, 50 1310',
    'M 460 1650 C 620 1620, 780 1670, 920 1640',
    'M 560 450 C 400 500, 320 620, 260 750',
    'M 420 1050 C 380 1150, 300 1250, 240 1350',
  ];

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      preserveAspectRatio="none"
      viewBox="0 0 1000 1800"
    >
      {/* 1. Parchment Base Layer */}
      <rect width="1000" height="1800" fill="#F2E9D3" />

      {/* Radial Wash Gradients for Zones */}
      <defs>
        <radialGradient id="green-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A8D080" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#A8D080" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#A8D080" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="water-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B8D4E8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#B8D4E8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#B8D4E8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="building-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8DCC0" stopOpacity="0.60" />
          <stop offset="60%" stopColor="#E8DCC0" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E8DCC0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sports-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8DFA0" stopOpacity="0.48" />
          <stop offset="60%" stopColor="#C8DFA0" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#C8DFA0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="open-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0E8D0" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#F0E8D0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F0E8D0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 2. Soft-Edged Zone Fills (Larger Ellipses for noticeable color wash) */}
      {sortedLandmarks.map((lm) => {
        const pos = getLandmarkCoords(lm);
        const radius = (lm.zoneRadius || 80) * 2.2;
        const zone = lm.zoneType || 'open';
        return (
          <ellipse
            key={`zone-${lm.id}`}
            cx={pos.x}
            cy={pos.y}
            rx={radius}
            ry={radius * 0.7}
            fill={`url(#${zone}-wash)`}
          />
        );
      })}

      {/* 3. Latitude and Longitude Grid Lines */}
      <MapGridOverlay />

      {/* 4. Campus Decorative Road Networks */}
      {/* Main road paths */}
      {roadPaths.map((d, idx) => (
        <path
          key={`road-${idx}`}
          d={d}
          fill="none"
          stroke="#8a7040"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeDasharray="6 6"
          opacity="0.75"
        />
      ))}
      {/* Secondary branching road paths to fill space */}
      {secondaryPaths.map((d, idx) => (
        <path
          key={`sec-road-${idx}`}
          d={d}
          fill="none"
          stroke="#8a7040"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.55"
        />
      ))}

      {/* 5-7. Mountains, contours, rose, yacht, and attribution decor */}
      <MapDecorationLayers />

      {/* 8. Landmark Zones Footprints (Buildings, Trees, Tracks, Ripples) */}
      <MapLandmarkZones landmarks={landmarks} />
    </svg>
  );
}
