import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Share2, Sparkles, Loader2, CheckCircle2, Map } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { Landmark, Stamp, Profile } from '../types';

interface EPassportViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  currentUser: Profile | null;
  onBack: () => void;
}

// ─── colour tokens (plain hex / rgba only — no oklab!) ───────────────────────
const C = {
  green:       '#004225',
  greenDark:   '#001a10',
  greenDeep:   '#001508',
  greenMid:    '#0a2015',
  gold:        '#CBA052',
  goldDark:    '#8b6a1f',
  white:       '#ffffff',
  black:       '#000000',
  // rgba equivalents for opacity variants
  goldAlpha07: 'rgba(203,160,82,0.07)',
  goldAlpha15: 'rgba(203,160,82,0.15)',
  goldAlpha20: 'rgba(203,160,82,0.20)',
  goldAlpha40: 'rgba(203,160,82,0.40)',
  goldAlpha50: 'rgba(203,160,82,0.50)',
  goldAlpha60: 'rgba(203,160,82,0.60)',
  goldAlpha70: 'rgba(203,160,82,0.70)',
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha25: 'rgba(255,255,255,0.25)',
  whiteAlpha40: 'rgba(255,255,255,0.40)',
  whiteAlpha70: 'rgba(255,255,255,0.70)',
  blackAlpha40: 'rgba(0,0,0,0.40)',
  blackAlpha75: 'rgba(0,0,0,0.75)',
  green2:      'rgba(0,66,37,0.30)',
};

export default function EPassportView({ landmarks, stamps, currentUser, onBack }: EPassportViewProps) {
  const passportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  const studentName =
    currentUser?.first_name && currentUser?.last_name
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser?.first_name || currentUser?.name || 'VSU Student';

  const issuedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ──────────────────────────────────────────────────────────────────────
  // html-to-image shared options
  // SVG foreignObject renderer — browser draws text/layout natively,
  // so oklab/oklch/flexbox all work without any workarounds.
  // ──────────────────────────────────────────────────────────────────────
  const exportOptions = {
    quality: 1,
    pixelRatio: 3,           // ~3× for crisp Instagram-ready output
    backgroundColor: '#001a10',
    fetchRequestInit: { mode: 'cors' as RequestMode },
    // Give the browser an extra frame to finish loading images
    onClone: (doc: Document) => {
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    },
  };

  // ──────────────────────────────────────────────────────────────────────
  // Download as PNG
  // ──────────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!passportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(passportRef.current, exportOptions);
      const link = document.createElement('a');
      link.download = `VSU-EPassport-${studentName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.\n\n' + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // Share via Web Share API (file-based on mobile, URL fallback on desktop)
  // ──────────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!passportRef.current) return;
    try {
      const blob = await toBlob(passportRef.current, { ...exportOptions, pixelRatio: 2 });
      if (!blob) return;
      const file = new File([blob], 'VSU-EPassport.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My VSU E-Passport',
          text: '✅ I completed the VSU Campus Tour! 🎓 #VSU #CampusTour',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My VSU E-Passport',
          text: '✅ I completed the VSU Campus Tour! 🎓 #VSU #CampusTour',
          url: window.location.href,
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.log('Share cancelled:', err);
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // MRZ lines
  // ──────────────────────────────────────────────────────────────────────
  const mrzLine1 = 'PVSU' +
    (currentUser?.last_name?.toUpperCase() || 'STUDENT').padEnd(10, '<').slice(0, 10) +
    '<<<<<<<<<<<<<<<<<<';
  const mrzLine2 =
    (currentUser?.student_id || '00000000').padEnd(9, '<').slice(0, 9) +
    '8PHL' + stamps.length + 'OF' + landmarks.length + '<VISAYAS STATE';

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ width: '100%', minHeight: '100vh', background: '#0a1a0f', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' }}
    >
      {/* Ambient bokeh (outside card, Tailwind OK here) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full" style={{ background: C.goldAlpha15, filter: 'blur(64px)' }} />
        <div className="absolute bottom-24 right-[-40px] w-56 h-56 rounded-full" style={{ background: C.green2, filter: 'blur(64px)' }} />
      </div>

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-5 pb-3">
        <button
          id="epassport-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 transition-colors font-mono text-[10px] uppercase tracking-wider"
          style={{ color: C.whiteAlpha70 }}
        >
          <Map className="w-4 h-4" />
          Map
        </button>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.goldAlpha70 }}>
          VSU E-Passport
        </span>
        <div style={{ width: 80 }} />
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center gap-6" style={{ padding: '8px 16px 128px' }}>

        {/* Title badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div
            className="inline-flex items-center gap-1.5 font-mono font-black uppercase mb-2"
            style={{
              background: C.goldAlpha15,
              border: `1px solid ${C.goldAlpha40}`,
              color: C.gold,
              fontSize: '9px',
              letterSpacing: '0.12em',
              padding: '6px 12px',
              borderRadius: '999px',
            }}
          >
            <Sparkles className="w-3 h-3" style={{ fill: C.gold }} />
            Campus Tour Complete
          </div>
          <h1 style={{ color: C.white, fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '20px', margin: 0 }}>
            Your E-Passport
          </h1>
          <p style={{ color: C.whiteAlpha40, fontSize: '10px', fontFamily: 'monospace', marginTop: 4 }}>
            Download &amp; share to your story or post
          </p>
        </motion.div>

        {/* ════════════════════════════════════════════
            PASSPORT CARD  — 100% inline styles inside
            ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 80 }}
          style={{ width: '100%' }}
        >
          <div
            ref={passportRef}
            id="passport-card"
            style={{
              background: `linear-gradient(145deg, #003020 0%, #001a10 40%, #0a2015 60%, #001508 100%)`,
              fontFamily: 'Georgia, serif',
              borderRadius: '28px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              border: `3px solid ${C.goldAlpha40}`,
            }}
          >
            {/* Security dot pattern */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `radial-gradient(circle at 2px 2px, ${C.gold} 1px, transparent 0)`,
                backgroundSize: '12px 12px',
                opacity: 0.04,
              }}
            />

            {/* ── HEADER BAND ── */}
            <div style={{ position: 'relative', padding: '20px 20px 14px', borderBottom: `1px solid ${C.goldAlpha20}`, display: 'flex', flexDirection: 'column', gap: 4 }}>

              {/* VSU Brand Logo */}
              <div className='flex gap-2'>
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                }}>
                  <img
                  src={"/vsu-brand-logo.png"}
                  alt="VSU Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                </div>
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                }}>
                  <img
                  src={"/ussc-logo.png"}
                  alt="USSC Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                </div>
              </div>

              {/* VSU + USSC */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <p style={{ color: C.gold, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '7px', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                     Visayas State University
                  </p>
                  <p style={{ color: C.goldAlpha70, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '6px', margin: 0, fontFamily: 'monospace' }}>
                    University Supreme Student Council - Baybay
                  </p>
                </div>

                
              </div>

              {/* E-PASSPORT title */}
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: C.white, fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '18px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
                  E - P A S S P O R T
                </h2>
                <p style={{ color: C.goldAlpha60, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2, fontFamily: 'monospace' }}>
                  Campus Tour · Academic Year 2025–2026
                </p>
              </div>
            </div>

            {/* ── HOLDER SECTION ── */}
            <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: `1px solid ${C.goldAlpha15}` }}>

    

              {/* Fields */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className='grid grid-cols-2'>
                <InlineFieldRow label="Surname"
                  value={(currentUser?.last_name?.toUpperCase()) || studentName.split(' ').slice(1).join(' ').toUpperCase() || 'STUDENT'} />
                <InlineFieldRow label="Given Names"
                  value={(currentUser?.first_name || studentName.split(' ')[0] || '').toUpperCase()} />
                  </div>
                <InlineFieldRow label="Date Issued"
                  value={issuedDate} />
              </div>
            </div>

            {/* ── STATION PHOTOS GRID ── */}
            <div style={{ padding: '14px 14px 10px' }}>
              <p style={{ color: C.goldAlpha60, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10, textAlign: 'center', fontFamily: 'monospace' }}>
                ──  Campus Stations Visited  ──
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {sortedLandmarks.map((lm) => {
                  const stamp = stamps.find(s => s.landmark_id === lm.id);
                  return <InlineStationCell key={lm.id} landmark={lm} stamp={stamp} />;
                })}
              </div>
            </div>

            {/* ── MRZ ── */}
            <div style={{
              margin: '8px 14px 14px',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex', flexDirection: 'column', gap: 4,
              background: C.goldAlpha07,
              border: `1px solid ${C.goldAlpha15}`,
            }}>
              <p style={{ color: C.goldAlpha70, fontSize: '7px', letterSpacing: '0.3em', fontFamily: 'monospace', margin: 0 }}>
                {mrzLine1}
              </p>
              <p style={{ color: C.goldAlpha70, fontSize: '7px', letterSpacing: '0.28em', fontFamily: 'monospace', margin: 0 }}>
                {mrzLine2}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <p style={{ color: C.goldAlpha40, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', margin: 0 }}>
                  Stamps: {stamps.length}/{landmarks.length}
                </p>
                <p style={{ color: C.goldAlpha40, fontSize: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace', margin: 0 }}>
                  USSC Campus Tour 2025–26
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tip */}
        <p className="text-center px-6" style={{ color: C.whiteAlpha40, fontSize: '10px', fontFamily: 'monospace', lineHeight: 1.6 }}>
          Download to save or share directly to Instagram story, Facebook post, or any social media. 📸
        </p>
      </div>

      {/* ── Sticky Bottom Buttons ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-4"
        style={{ paddingBottom: 24, paddingTop: 12, background: 'linear-gradient(to top, #0a1a0f 70%, transparent)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, margin: '0 auto' }}>

          {/* Download */}
          <motion.button
            id="epassport-download-btn"
            onClick={handleDownload}
            disabled={isExporting}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden font-mono font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
            style={{
              width: '100%', height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
              fontSize: '13px', letterSpacing: '0.12em',
              background: exported
                ? 'linear-gradient(135deg, #1a6b35, #004225)'
                : `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: exported ? C.white : C.greenDark,
              boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
            }}
          >
            {isExporting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating…</span></>
            ) : exported ? (
              <><CheckCircle2 className="w-5 h-5" /><span>Downloaded!</span></>
            ) : (
              <><Download className="w-5 h-5" /><span>Download Passport</span></>
            )}
          </motion.button>

          {/* Share */}
          <motion.button
            id="epassport-share-btn"
            onClick={handleShare}
            whileTap={{ scale: 0.97 }}
            className="font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            style={{
              width: '100%', height: 48, borderRadius: 16, cursor: 'pointer',
              fontSize: '11px', letterSpacing: '0.1em',
              background: C.whiteAlpha10,
              border: `1px solid ${C.goldAlpha40}`,
              color: C.gold,
            }}
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Social Media</span>
          </motion.button>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Internal sub-components — all inline styles
// ─────────────────────────────────────────────

function InlineFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ lineHeight: 1.3 }}>
      <span style={{ color: 'rgba(203,160,82,0.50)', textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '6px', letterSpacing: '0.12em', display: 'block' }}>
        {label}
      </span>
      <span style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.05em', display: 'block' }}>
        {value}
      </span>
    </div>
  );
}

function InlineStationCell({ landmark, stamp }: { landmark: Landmark; stamp?: Stamp }) {
  const hasStamp = !!stamp;
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '10px',
        overflow: 'hidden',
        border: hasStamp ? '1.5px solid rgba(203,160,82,0.5)' : '1.5px dashed rgba(255,255,255,0.1)',
        background: hasStamp ? 'rgba(0,66,37,0.3)' : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Photo or placeholder */}
      {hasStamp && stamp?.photo_url ? (
        <img
          src={stamp.photo_url}
          alt={landmark.name}
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '18px', opacity: 0.2 }}>📷</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hasStamp
            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 32%, transparent 62%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)',
        }}
      />

      {/* Stamp badge */}
      {hasStamp && (
        <div
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#CBA052',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontSize: '7px', color: '#001a10', fontWeight: 900, lineHeight: 1 }}>✓</span>
        </div>
      )}

      {/* Label — fixed-height flex bar, no baseline math for html2canvas to mess up */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '7px',
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textAlign: 'center',
            padding: '0 3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            display: 'inline-block',
            color: hasStamp ? '#ffffff' : 'rgba(255,255,255,0.3)',
            textShadow: hasStamp ? '0 1px 3px rgba(0,0,0,0.9)' : 'none',
          }}
        >
          {landmark.name}
        </span>
      </div>
    </div>
  );
}