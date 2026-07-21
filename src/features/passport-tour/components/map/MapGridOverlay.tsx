import React from 'react';

export default function MapGridOverlay() {
  const latLines = [300, 600, 900, 1200, 1500];
  const lngLines = [200, 400, 600, 800];

  return (
    <>
      {/* Latitude and Longitude Grid Lines */}
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
    </>
  );
}
