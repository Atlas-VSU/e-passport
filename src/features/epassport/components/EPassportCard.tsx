import React, { forwardRef } from 'react';
import { Landmark, Stamp, Profile } from '../../../types';
import InlineStationCell from './InlineStationCell';
import { seededRandom } from '../../../lib/utils';

interface EPassportCardProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  currentUser: Profile | null;
  issuedDate: string;
  mrzLine1: string;
  mrzLine2: string;
}

export const EPassportCard = forwardRef<HTMLDivElement, EPassportCardProps>((
  { landmarks, stamps, currentUser, issuedDate, mrzLine1, mrzLine2 },
  ref
) => {
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={ref}
      id="passport-card"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#f0e6ce',
      }}
    >
      {/* ── 1. TOP BAND (Dark Green Leather) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #022c16 0%, #001f0f 100%)',
          borderRadius: '24px 24px 0 0',
          borderLeft: '1.5px solid rgba(203,160,82,0.40)',
          borderRight: '1.5px solid rgba(203,160,82,0.40)',
          borderTop: '1.5px solid rgba(203,160,82,0.40)',
          borderBottom: 'none',
          padding: '16px 20px 10px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Diagonal lines pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            overflow: 'hidden',
            opacity: 0.05,
            pointerEvents: 'none',
            backgroundImage: `repeating-linear-gradient(-45deg, #c9a13a 0px, #c9a13a 1px, transparent 1px, transparent 10px)`,
          }}
        />

        {/* Top content (above texture) */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logos without outer border boxes */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', alignItems: 'center', marginBottom: 12 }}>
            <img src="/vsu-brand-logo-gold-2.png" alt="VSU" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <img src="/ussc-logo-gold-2.png" alt="USSC" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </div>

          {/* Institution & Title Block (Left Aligned) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'monospace', fontSize: '8px', color: '#c9a13a', letterSpacing: '2.5px', opacity: 0.8, textTransform: 'uppercase', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Visayas State University
            </span>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 900, color: '#e8d4a0', letterSpacing: '4px', margin: '4px 0 0', textTransform: 'uppercase', lineHeight: 1, whiteSpace: 'nowrap' }}>
              E-PASAPORTE
            </h2>
          </div>
        </div>
      </div>

      {/* Perforated ticket edge notches */}
      <div
        style={{
          height: 8,
          background: 'repeating-linear-gradient(90deg, #f0e6ce 0px, #f0e6ce 4px, transparent 4px, transparent 12px)',
          backgroundColor: '#001f0f',
          borderLeft: '1.5px solid rgba(203,160,82,0.40)',
          borderRight: '1.5px solid rgba(203,160,82,0.40)',
          position: 'relative',
          zIndex: 3,
        }}
      />

      {/* ── 2. BODY (Warm Parchment) ── */}
      <div
        style={{
          background: '#f0e6ce',
          borderLeft: '1.5px solid rgba(203,160,82,0.40)',
          borderRight: '1.5px solid rgba(203,160,82,0.40)',
          borderTop: 'none',
          borderBottom: 'none',
          position: 'relative',
          paddingBottom: 4,
        }}
      >
        {/* Paper grain overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none', zIndex: 1 }}>
          <filter id="postcard-paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
            <feBlend mode="multiply" in="SourceGraphic" in2="noise" />
          </filter>
          <rect width="100%" height="100%" filter="url(#postcard-paper-grain)" />
        </svg>

        {/* Holder Fields Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(100,70,20,0.25)', padding: '12px 24px', position: 'relative', zIndex: 2 }}>
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(80,50,10,0.60)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 3 }}>
              NAME
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900, color: '#1a0e04', letterSpacing: '0.5px', display: 'block' }}>
              {currentUser?.last_name?.toUpperCase() || 'STUDENT'}, {currentUser?.first_name?.toUpperCase() || ''}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(80,50,10,0.60)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 3 }}>
              ISSUED
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900, color: '#1a0e04', letterSpacing: '0.5px' }}>
              {new Date(issuedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stations Grid Section */}
        <div style={{ padding: '10px 24px 8px', position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'monospace', fontSize: '8px', color: '#7a4f10', letterSpacing: '2px', textAlign: 'center', marginBottom: '12px', fontWeight: 800 }}>
            ── CAMPUS STATIONS ──
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            {sortedLandmarks.map((lm, idx) => {
              const stamp = stamps.find(s => s.landmark_id === lm.id);
              const rotation = (seededRandom(lm.id, 0) * 30) - 15;
              return <InlineStationCell key={lm.id} landmark={lm} stamp={stamp} rotation={rotation} index={idx} />;
            })}
          </div>
        </div>

        {/* MRZ Strip */}
        <div style={{
          margin: '8px 24px 10px',
          borderRadius: 8,
          padding: '7px 10px',
          display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(203,160,82,0.08)',
          border: '1px solid rgba(203,160,82,0.20)',
          position: 'relative',
          zIndex: 2,
        }}>
          <p style={{ color: 'rgba(80,50,10,0.50)', fontSize: '6.5px', letterSpacing: '2px', fontFamily: 'monospace', margin: 0, lineHeight: 1.2 }}>
            {mrzLine1}
          </p>
          <p style={{ color: 'rgba(80,50,10,0.50)', fontSize: '6.5px', letterSpacing: '2px', fontFamily: 'monospace', margin: 0, lineHeight: 1.2 }}>
            {mrzLine2}
          </p>
        </div>
      </div>

      {/* ── 3. BOTTOM BAND (Dark Green Leather) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #022c16 0%, #001f0f 100%)',
          borderRadius: '0 0 24px 24px',
          borderLeft: '1.5px solid rgba(203,160,82,0.40)',
          borderRight: '1.5px solid rgba(203,160,82,0.40)',
          borderBottom: '1.5px solid rgba(203,160,82,0.40)',
          borderTop: 'none',
          padding: '12px 14px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Diagonal lines pattern matching top band */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            overflow: 'hidden',
            opacity: 0.05,
            pointerEvents: 'none',
            backgroundImage: `repeating-linear-gradient(-45deg, #c9a13a 0px, #c9a13a 1px, transparent 1px, transparent 10px)`,
          }}
        />

        {/* Bottom content */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '8px', color: '#c9a13a', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>
            CAMPUS TOUR 2026–2027
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '8px', color: '#c9a13a', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>
            VSU · BAYBAY
          </span>
        </div>
      </div>
    </div>
  );
});

EPassportCard.displayName = 'EPassportCard';
