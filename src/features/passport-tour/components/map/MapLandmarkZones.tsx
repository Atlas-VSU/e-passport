import React from 'react';
import { Landmark } from '../../../../types';
import { seededRandom, getLandmarkCoords } from '../../../../lib/utils';

interface MapLandmarkZonesProps {
  landmarks: Landmark[];
}

export default function MapLandmarkZones({ landmarks }: MapLandmarkZonesProps) {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedLandmarks.map((lm) => {
        const pos = getLandmarkCoords(lm);

        // Render Tree Dots (green zones only)
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

        // Render Building Footprints (building zones only)
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
    </>
  );
}
