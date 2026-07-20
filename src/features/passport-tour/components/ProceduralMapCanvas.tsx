import React from 'react';
import { Landmark } from '../../../types';

interface ProceduralMapCanvasProps {
  landmarks: Landmark[];
}

// Helper to retrieve node positions dynamically from percentage coordinates
export function getLandmarkCoords(lm: Landmark): { x: number; y: number } {
  return {
    x: (lm.mapX ?? 50) * 10,
    y: (lm.mapY ?? 50) * 18,
  };
}

// Seeded pseudo-random float generator (0 to 1) for stable element layouts
export function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + '-' + index;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

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

export default function ProceduralMapCanvas({ landmarks }: ProceduralMapCanvasProps) {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  // 7 horizontal wavy contour lines vertically distributed across the scroll canvas
  const contourHeights = [60, 320, 600, 880, 1160, 1440, 1720];

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
    // Branching off Admin going left to the edge
    'M 580 150 C 450 120, 300 80, 100 120',
    // Branching off EcoPark going right to the edge
    'M 560 450 C 680 430, 820 480, 920 460',
    // Branching off Library going left
    'M 260 750 C 200 790, 140 760, 60 810',
    // Branching off Obelisk going right to edge
    'M 420 1050 C 580 1020, 750 1080, 940 1040',
    // Branching off Oval going left
    'M 240 1350 C 180 1320, 120 1360, 50 1310',
    // Branching off Beach going right
    'M 460 1650 C 620 1620, 780 1670, 920 1640',
    // Diagonal connecting path between EcoPark and Library
    'M 560 450 C 400 500, 320 620, 260 750',
    // Diagonal connecting path between Obelisk and Oval
    'M 420 1050 C 380 1150, 300 1250, 240 1350',
  ];

  // Grid coordinates for Latitude and Longitude lines
  const latLines = [300, 600, 900, 1200, 1500];
  const lngLines = [200, 400, 600, 800];

  // Fixed coordinates for scattered forest patches (2-4 trees each)
  const wildForests = [
    { x: 180, y: 280, id: 'wf1' },
    { x: 820, y: 290, id: 'wf2' },
    { x: 860, y: 650, id: 'wf3' },
    { x: 880, y: 780, id: 'wf4' },
    { x: 110, y: 1120, id: 'wf5' },
    { x: 870, y: 1360, id: 'wf6' },
    { x: 180, y: 1520, id: 'wf7' },
  ];

  // Mountain ridge coordinates
  const mountains = [
    { x: 140, y: 580 },
    { x: 170, y: 595 },
    { x: 830, y: 920 },
    { x: 865, y: 935 },
    { x: 100, y: 1460 },
    { x: 130, y: 1475 },
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

      {/* 3. Latitude and Longitude Grid Lines (Authentic cartography feel) */}
      <g stroke="#8a7040" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="8 8" fill="none">
        {latLines.map((y) => (
          <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} />
        ))}
        {lngLines.map((x) => (
          <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="1800" />
        ))}
      </g>
      {/* Grid margin text tags */}
      <g fill="#8a7040" fontSize="8.5" fontFamily="serif" opacity="0.5" pointerEvents="none">
        {latLines.map((y, idx) => (
          <text key={`lat-t-${y}`} x="12" y={y - 4}>10° 2{idx}' N</text>
        ))}
        {lngLines.map((x, idx) => (
          <text key={`lng-t-${x}`} x={x + 4} y="22">124° 4{idx}' E</text>
        ))}
      </g>

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

      {/* 5. Contour Lines (Subtle texture layer, max opacity 0.32) */}
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

      {/* 6. Mountains (Decorative ridge lines in empty areas) */}
      {mountains.map((m, idx) => (
        <g key={`mtn-${idx}`} stroke="#0F6E56" strokeWidth="2.2" strokeOpacity="0.55" fill="none">
          <path d={`M ${m.x - 22} ${m.y + 10} L ${m.x} ${m.y - 18} L ${m.x + 22} ${m.y + 10}`} />
          <path d={`M ${m.x - 10} ${m.y - 4} L ${m.x} ${m.y + 10}`} />
          <path d={`M ${m.x - 4} ${m.y - 12} L ${m.x + 10} ${m.y + 10}`} />
        </g>
      ))}

      {/* 7. Scattered Wild Forests (Fills empty background segments) */}
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

      {/* 8. Seeded Decorative Landmark elements (Trees, Buildings, Tracks, Waves, Piazza) */}
      {sortedLandmarks.map((lm) => {
        const pos = getLandmarkCoords(lm);

        // Render Tree Dots (green zones only) - 14 trees, larger radii
        if (lm.zoneType === 'green') {
          const trees: React.ReactNode[] = [];
          const count = 14;
          for (let i = 0; i < count; i++) {
            const randAngle = seededRandom(lm.id, i * 3) * Math.PI * 2;
            const randDist = 32 + seededRandom(lm.id, i * 3 + 1) * 75; // spread wider
            const dx = Math.cos(randAngle) * randDist;
            const dy = Math.sin(randAngle) * randDist;
            const r = 8 + seededRandom(lm.id, i * 3 + 2) * 6; // radius 8-14px

            trees.push(
              <circle
                key={`tree-${lm.id}-${i}`}
                cx={pos.x + dx}
                cy={pos.y + dy}
                r={r}
                fill="#5a7a3a"
                opacity="0.80"
              />
            );
          }
          return <g key={`trees-group-${lm.id}`}>{trees}</g>;
        }

        // Render Building Footprints (building zones only) - 2x3 grid of 6 buildings, larger footprint
        if (lm.zoneType === 'building') {
          const buildings: React.ReactNode[] = [];
          const rows = 2;
          const cols = 3;
          let buildIndex = 0;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const seedIndex = buildIndex * 5;
              const jiggleX = (seededRandom(lm.id, seedIndex) - 0.5) * 12;
              const jiggleY = (seededRandom(lm.id, seedIndex + 1) - 0.5) * 12;
              const w = 24 + seededRandom(lm.id, seedIndex + 2) * 14; // width 24-38px
              const h = 18 + seededRandom(lm.id, seedIndex + 3) * 10; // height 18-28px

              // Distribute grid centers
              let bx = pos.x + (c - 1) * 52 + jiggleX;
              let by = pos.y + (r - 0.5) * 44 + jiggleY;

              // Ensure hit area clearance (marker outer bounds)
              const dist = Math.hypot(bx - pos.x, by - pos.y);
              if (dist < 34) {
                const factor = 34 / (dist || 1);
                bx = pos.x + (bx - pos.x) * factor;
                by = pos.y + (by - pos.y) * factor;
              }

              buildings.push(
                <rect
                  key={`build-${lm.id}-${buildIndex}`}
                  x={bx - w / 2}
                  y={by - h / 2}
                  width={w}
                  height={h}
                  rx="2.5"
                  fill="#c8b07a"
                  stroke="#a08040"
                  strokeWidth="1.2"
                  opacity="0.80"
                />
              );
              buildIndex++;
            }
          }
          return <g key={`builds-group-${lm.id}`}>{buildings}</g>;
        }

        // Render Running Track Lines (sports zones only)
        if (lm.zoneType === 'sports') {
          return (
            <g key={`track-group-${lm.id}`} opacity="0.60" stroke="#8a7040" strokeWidth="2.2" fill="none">
              <ellipse cx={pos.x} cy={pos.y} rx={50} ry={35} />
              <ellipse cx={pos.x} cy={pos.y} rx={40} ry={26} />
              <ellipse cx={pos.x} cy={pos.y} rx={30} ry={17} />
              <line x1={pos.x} y1={pos.y - 35} x2={pos.x} y2={pos.y + 35} strokeDasharray="3 3" />
            </g>
          );
        }

        // Render Wave Crest Ripples (water zones only)
        if (lm.zoneType === 'water') {
          return (
            <g key={`wave-group-${lm.id}`} opacity="0.75" stroke="#2D70B9" strokeWidth="2.2" fill="none">
              <path d={`M ${pos.x - 55} ${pos.y - 20} C ${pos.x - 40} ${pos.y - 28}, ${pos.x - 25} ${pos.y - 20}, ${pos.x - 10} ${pos.y - 28} C ${pos.x + 5} ${pos.y - 20}, ${pos.x + 20} ${pos.y - 28}, ${pos.x + 35} ${pos.y - 20}`} />
              <path d={`M ${pos.x - 40} ${pos.y + 20} C ${pos.x - 25} ${pos.y + 12}, ${pos.x - 10} ${pos.y + 20}, ${pos.x + 5} ${pos.y + 12} C ${pos.x + 20} ${pos.y + 20}, ${pos.x + 35} ${pos.y + 12}, ${pos.x + 50} ${pos.y + 20}`} opacity="0.95" />
            </g>
          );
        }

        // Render Circular Piazza Paving lines (open zones only)
        if (lm.zoneType === 'open') {
          return (
            <g key={`paving-group-${lm.id}`} opacity="0.60" stroke="#a08040" strokeWidth="2.0" fill="none">
              <circle cx={pos.x} cy={pos.y} r="45" strokeDasharray="3 3" />
              <circle cx={pos.x} cy={pos.y} r="28" />
              <circle cx={pos.x} cy={pos.y} r="14" />
              <path d={`M ${pos.x - 45} ${pos.y} L ${pos.x + 45} ${pos.y} M ${pos.x} ${pos.y - 45} L ${pos.x} ${pos.y + 45}`} strokeDasharray="2 2" />
            </g>
          );
        }

        return null;
      })}

      {/* 9. Sailboat and Wave crests in ocean near Beach */}
      <g transform="translate(800, 1630) scale(0.9)" stroke="#0F6E56" strokeWidth="2.2" strokeOpacity="0.55" fill="none">
        {/* Yacht Hull */}
        <path d="M 0 10 L 40 10 C 35 22, 5 22, 0 10 Z" fill="#F2E9D3" />
        <line x1="20" y1="10" x2="20" y2="-22" />
        {/* Sails */}
        <path d="M 20 -22 L 36 4 L 20 4 Z" fill="#F2E9D3" />
        <path d="M 20 -17 L 7 4 L 20 4 Z" />
        {/* Ocean ripples around yacht */}
        <path d="M -20 28 C -10 24, 0 28, 10 24 C 20 28, 30 24, 40 28" opacity="0.85" strokeWidth="1.5" />
        <path d="M 10 36 C 20 32, 30 36, 40 32 C 50 36, 60 32, 70 36" opacity="0.70" strokeWidth="1.5" />
      </g>

      {/* 10. Compass Rose (Fixed position: top-right, enlarged scale 0.9) */}
      <g transform="translate(860, 95) scale(0.9)" opacity="0.85" stroke="#0F6E56" strokeWidth="2.2" fill="none">
        <circle cx="0" cy="0" r="40" strokeDasharray="2 3" />
        <path d="M 0 -50 L 0 50 M -50 0 L 50 0" />
        {/* Gold north pointing needle */}
        <path d="M 0 -50 L 10 -15 L 0 0 Z" fill="#C9A13A" stroke="#C9A13A" />
        <path d="M 0 -50 L -10 -15 L 0 0 Z" fill="#b0873e" stroke="#C9A13A" />
        {/* Remaining compass needles */}
        <path d="M 0 50 L 10 15 L 0 0 Z" fill="#0F6E56" />
        <path d="M 0 50 L -10 15 L 0 0 Z" fill="#1F382B" />
        <path d="M 50 0 L 15 10 L 0 0 Z" fill="#0F6E56" />
        <path d="M 50 0 L 15 -10 L 0 0 Z" fill="#1F382B" />
        <path d="M -50 0 L -15 10 L 0 0 Z" fill="#0F6E56" />
        <path d="M -50 0 L -15 -10 L 0 0 Z" fill="#1F382B" />
        <circle cx="0" cy="0" r="4" fill="#C9A13A" stroke="none" />
        <text x="-4" y="-55" fontFamily="serif" fontSize="12" fontWeight="bold" fill="#0F6E56">N</text>
      </g>

      {/* 11. Cartographic Scale Bar */}
      <g transform="translate(100, 1718)" opacity="0.75" stroke="#0F6E56" strokeWidth="1.8" fill="none">
        <rect x="0" y="0" width="80" height="4" />
        <rect x="0" y="0" width="20" height="4" fill="#0F6E56" />
        <rect x="40" y="0" width="20" height="4" fill="#0F6E56" />
        <text x="0" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">0</text>
        <text x="35" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">500m</text>
        <text x="72" y="-4" fontFamily="monospace" fontSize="6.5" fill="#0F6E56" stroke="none">1km</text>
      </g>

      {/* 12. Visayas State University Caption Attribution */}
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
    </svg>
  );
}