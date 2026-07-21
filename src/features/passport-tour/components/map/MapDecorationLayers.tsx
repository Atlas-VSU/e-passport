import React from 'react';
import { seededRandom } from '../../../../lib/utils';

// Seedable generator for horizontal contour lines
function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Generate wavy bezier path coordinates for SVG contour lines
function generateWavyPath(yBase: number, seed: number): string {
  const rand = createSeededRandom(seed);
  const points: { x: number; y: number }[] = [];
  const segments = 8;
  const width = 1000;

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const maxOffset = (i === 0 || i === segments) ? 0 : 25;
    const dy = (rand() - 0.5) * 2 * maxOffset;
    points.push({ x, y: yBase + dy });
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p1.x - (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function MapDecorationLayers() {
  const contourHeights = [60, 320, 600, 880, 1160, 1440, 1720];

  const wildForests = [
    { x: 180, y: 280, id: 'wf1' },
    { x: 820, y: 290, id: 'wf2' },
    { x: 860, y: 650, id: 'wf3' },
    { x: 880, y: 780, id: 'wf4' },
    { x: 110, y: 1120, id: 'wf5' },
    { x: 870, y: 1360, id: 'wf6' },
    { x: 180, y: 1520, id: 'wf7' },
  ];

  const mountains = [
    { x: 140, y: 580 },
    { x: 170, y: 595 },
    { x: 830, y: 920 },
    { x: 865, y: 935 },
    { x: 100, y: 1460 },
    { x: 130, y: 1475 },
  ];

  return (
    <>
      {/* Contour Lines */}
      {contourHeights.map((yBase, idx) => {
        const opacity = 0.32 - (yBase / 1800) * (0.32 - 0.15);
        const pathD = generateWavyPath(yBase, 23456 + idx);
        return (
          <path
            key={`contour-${idx}`}
            d={pathD}
            fill="none"
            stroke="#0F6E56"
            strokeWidth="1.8"
            strokeOpacity={opacity}
          />
        );
      })}

      {/* Mountains */}
      {mountains.map((m, idx) => (
        <g key={`mtn-${idx}`} stroke="#0F6E56" strokeWidth="2.2" strokeOpacity="0.55" fill="none">
          <path d={`M ${m.x - 22} ${m.y + 10} L ${m.x} ${m.y - 18} L ${m.x + 22} ${m.y + 10}`} />
          <path d={`M ${m.x - 10} ${m.y - 4} L ${m.x} ${m.y + 10}`} />
          <path d={`M ${m.x - 4} ${m.y - 12} L ${m.x + 10} ${m.y + 10}`} />
        </g>
      ))}

      {/* Scattered Wild Forests */}
      {wildForests.map((wf) => {
        const trees: React.ReactNode[] = [];
        const count = 4;
        for (let i = 0; i < count; i++) {
          const randAngle = seededRandom(wf.id, i * 3) * Math.PI * 2;
          const randDist = 8 + seededRandom(wf.id, i * 3 + 1) * 16;
          const dx = Math.cos(randAngle) * randDist;
          const dy = Math.sin(randAngle) * randDist;
          const r = 5 + seededRandom(wf.id, i * 3 + 2) * 4;

          trees.push(
            <circle
              key={`wftree-${wf.id}-${i}`}
              cx={wf.x + dx}
              cy={wf.y + dy}
              r={r}
              fill="#5a7a3a"
              opacity="0.75"
            />
          );
        }
        return <g key={`wf-group-${wf.id}`}>{trees}</g>;
      })}

      {/* Sailboat and Ocean ripples */}
      <g transform="translate(800, 1630) scale(0.9)" stroke="#0F6E56" strokeWidth="2.2" strokeOpacity="0.55" fill="none">
        <path d="M 0 10 L 40 10 C 35 22, 5 22, 0 10 Z" fill="#F2E9D3" />
        <line x1="20" y1="10" x2="20" y2="-22" />
        <path d="M 20 -22 L 36 4 L 20 4 Z" fill="#F2E9D3" />
        <path d="M 20 -17 L 7 4 L 20 4 Z" />
        <path d="M -20 28 C -10 24, 0 28, 10 24 C 20 28, 30 24, 40 28" opacity="0.85" strokeWidth="1.5" />
        <path d="M 10 36 C 20 32, 30 36, 40 32 C 50 36, 60 32, 70 36" opacity="0.70" strokeWidth="1.5" />
      </g>

      {/* Compass Rose */}
      <g transform="translate(860, 95) scale(0.9)" opacity="0.85" stroke="#0F6E56" strokeWidth="2.2" fill="none">
        <circle cx="0" cy="0" r="40" strokeDasharray="2 3" />
        <path d="M 0 -50 L 0 50 M -50 0 L 50 0" />
        <path d="M 0 -50 L 10 -15 L 0 0 Z" fill="#C9A13A" stroke="#C9A13A" />
        <path d="M 0 -50 L -10 -15 L 0 0 Z" fill="#b0873e" stroke="#C9A13A" />
        <path d="M 0 50 L 10 15 L 0 0 Z" fill="#0F6E56" />
        <path d="M 0 50 L -10 15 L 0 0 Z" fill="#1F382B" />
        <path d="M 50 0 L 15 10 L 0 0 Z" fill="#0F6E56" />
        <path d="M 50 0 L 15 -10 L 0 0 Z" fill="#1F382B" />
        <path d="M -50 0 L -15 10 L 0 0 Z" fill="#0F6E56" />
        <path d="M -50 0 L -15 -10 L 0 0 Z" fill="#1F382B" />
        <circle cx="0" cy="0" r="4" fill="#C9A13A" stroke="none" />
        <text x="-4" y="-55" fontFamily="serif" fontSize="12" fontWeight="bold" fill="#0F6E56">N</text>
      </g>

      {/* Scale Bar */}
      <g transform="translate(100, 1718)" opacity="0.75" stroke="#0F6E56" strokeWidth="1.8" fill="none">
        <rect x="0" y="0" width="80" height="4" />
        <rect x="0" y="0" width="20" height="4" fill="#0F6E56" />
        <rect x="40" y="0" width="20" height="4" fill="#0F6E56" />
        <text x="0" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">0</text>
        <text x="35" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">500m</text>
        <text x="72" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">1km</text>
      </g>

      {/* Visayas State University Attribution */}
      <text
        x="100"
        y="1750"
        fontFamily="serif"
        fontSize="11"
        fontStyle="italic"
        fill="#0F6E56"
        opacity="0.75"
      >
        Visayas State University
      </text>
    </>
  );
}
