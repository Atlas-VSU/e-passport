import React from 'react';
import { Landmark, Stamp } from '../../../types';
import ImageWithLoader from '../../../components/ImageWithLoader';

interface InlineStationCellProps {
  landmark: Landmark;
  stamp?: Stamp;
  rotation: number;
  index: number;
}

// Helper to determine the dynamic CSS Grid cell layout styling by VSU tour index
const getGridCellStyle = (index: number) => {
  switch (index) {
    case 0: // Eco Park (Tall vertical rectangle)
      return { gridColumn: '1 / span 3', gridRow: '1 / span 2', aspectRatio: 'auto', height: '100%' };
    case 1: // Admin Bldg (Horizontal rectangle)
      return { gridColumn: '4 / span 3', gridRow: '1 / span 1', aspectRatio: '1.55', height: 'auto' };
    case 2: // Library (Horizontal rectangle)
      return { gridColumn: '4 / span 3', gridRow: '2 / span 1', aspectRatio: '1.55', height: 'auto' };
    case 3: // Obelisk (Square)
      return { gridColumn: '1 / span 2', gridRow: '3 / span 1', aspectRatio: '1', height: 'auto' };
    case 4: // Cell 5 (Square)
      return { gridColumn: '3 / span 2', gridRow: '3 / span 1', aspectRatio: '1', height: 'auto' };
    case 5: // Cell 6 (Square)
      return { gridColumn: '5 / span 2', gridRow: '3 / span 1', aspectRatio: '1', height: 'auto' };
    default:
      return {};
  }
};

// Helper to determine photo overlay color tones by landmark name
const getLandmarkTint = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('eco') || lower.includes('park')) {
    return {
      gradient: 'linear-gradient(to top, rgba(10, 35, 15, 0.95) 0%, rgba(76, 175, 80, 0.3) 60%, transparent 100%)',
    };
  }
  if (lower.includes('admin') || lower.includes('bldg') || lower.includes('building')) {
    return {
      gradient: 'linear-gradient(to top, rgba(45, 30, 5, 0.95) 0%, rgba(201, 161, 58, 0.3) 60%, transparent 100%)',
    };
  }
  if (lower.includes('obelisk') || lower.includes('structure') || lower.includes('monument')) {
    return {
      gradient: 'linear-gradient(to top, rgba(10, 25, 50, 0.95) 0%, rgba(41, 128, 185, 0.3) 60%, transparent 100%)',
    };
  }
  // Default gold/warm brown tint
  return {
    gradient: 'linear-gradient(to top, rgba(45, 30, 5, 0.95) 0%, rgba(201, 161, 58, 0.3) 60%, transparent 100%)',
  };
};

export default function InlineStationCell({ landmark, stamp, rotation, index }: InlineStationCellProps) {
  const hasStamp = !!stamp;
  const gridStyle = getGridCellStyle(index);
  const tint = getLandmarkTint(landmark.name);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden',
        border: hasStamp ? '1.5px solid rgba(203,160,82,0.60)' : '1.5px dashed rgba(100,70,20,0.25)',
        background: hasStamp ? 'transparent' : 'rgba(200,180,140,0.30)',
        ...gridStyle,
      }}
    >
      {/* Photo or placeholder */}
      {hasStamp && stamp?.photo_url ? (
        <>
          <ImageWithLoader
            src={stamp.photo_url}
            alt={landmark.name}
            crossOrigin="anonymous"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
          />

          {/* Tinted Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: tint.gradient,
              zIndex: 1,
            }}
          />

          {/* Cancellation mark overlay (double-ring) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              width: 62,
              height: 62,
              borderRadius: '50%',
              border: '2.5px solid rgba(160, 32, 24, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2, // above photo and overlay, below checkmark
            }}
          >
            {/* Inner Ring */}
            <div
              style={{
                position: 'absolute',
                inset: 3,
                borderRadius: '50%',
                border: '1px solid rgba(160, 32, 24, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '7.5px', color: 'rgba(160, 32, 24, 0.98)', letterSpacing: '1px', fontWeight: 900, lineHeight: 1 }}>
                VISITED
              </span>
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '6px', color: 'rgba(160, 32, 24, 0.88)', letterSpacing: '0.5px', fontWeight: 900, lineHeight: 1, marginTop: 2 }}>
                VSU·26
              </span>
            </div>
          </div>

          {/* Stamp badge */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#c9a13a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              zIndex: 3,
            }}
          >
            <span style={{ fontSize: '8px', color: '#001a10', fontWeight: 900, lineHeight: 1 }}>✓</span>
          </div>

          {/* Label */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '8px',
                lineHeight: 1.1,
                fontWeight: 800,
                textAlign: 'center',
                padding: '1.5px 5px',
                background: 'rgba(0, 0, 0, 0.50)',
                borderRadius: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '90%',
                display: 'inline-block',
                color: '#ffffff',
              }}
            >
              {landmark.name}
            </span>
          </div>
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4, textAlign: 'center' }}>
          <span style={{ fontSize: '16px', opacity: 0.20, lineHeight: 1, marginBottom: 4 }}>📷</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '6px',
            color: 'rgba(80,50,10,0.35)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            lineHeight: 1.1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '100%',
          }}>
            {landmark.name}
          </span>
        </div>
      )}
    </div>
  );
}
