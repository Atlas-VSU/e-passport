import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Sparkles, Loader2, CheckCircle2, Map } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { Landmark, Stamp, Profile } from '../../../types';
import { EPassportCard } from './EPassportCard';

interface EPassportViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  currentUser: Profile | null;
  onBack: () => void;
}

export default function EPassportView({ landmarks, stamps, currentUser, onBack }: EPassportViewProps) {
  const passportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const studentName =
    currentUser?.first_name && currentUser?.last_name
      ? `${currentUser.first_name} ${currentUser.last_name}`
      : currentUser?.first_name || currentUser?.name || 'VSU Student';

  const issuedDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // html-to-image shared options
  const exportOptions = {
    quality: 1,
    pixelRatio: 3,           // ~3× for crisp Instagram-ready output
    backgroundColor: '#001a10',
    fetchRequestInit: { mode: 'cors' as RequestMode },
    onClone: (doc: Document) => {
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    },
  };

  // Download as PNG
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

  // Share via Web Share API
  const handleShare = async () => {
    if (!passportRef.current) return;
    try {
      const blob = await toBlob(passportRef.current, { ...exportOptions, pixelRatio: 2 });
      if (!blob) return;
      const file = new File([blob], 'VSU-EPassport.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Viscan E-Pasaporte',
          text: 'I completed the VSU Campus Tour! #VSU #CampusTour',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Viscan E-Pasaporte',
          text: 'I completed the VSU Campus Tour! #VSU #CampusTour',
          url: window.location.href,
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.log('Share cancelled:', err);
    }
  };

  // MRZ lines (conforming to TD2 standard: 36 characters per line, only A-Z, 0-9, and <)
  const mrzLastName = (currentUser?.last_name || 'STUDENT').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const mrzFirstName = (currentUser?.first_name || 'VISITOR').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const mrzLine1 = `P<VSU${mrzLastName}<<${mrzFirstName}`.padEnd(36, '<').slice(0, 36);

  const cleanStudentId = (currentUser?.student_id || '00000000').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const idField = cleanStudentId.padEnd(9, '<').slice(0, 9);
  const stampsCount = stamps.length.toString().padStart(2, '0');
  const landmarksCount = landmarks.length.toString().padStart(2, '0');
  const progressCode = `S${stampsCount}L${landmarksCount}`;
  const mrzLine2 = `${idField}8PHL<<${progressCode}<<<<<VISAYAS<STATE`.padEnd(36, '<').slice(0, 36);

  return (
    <div
      className="relative h-screen flex flex-col overflow-hidden font-sans select-none"
      style={{ background: '#F2E9D3' }}
    >
      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: 'inset 0 0 80px 40px rgba(12, 22, 18, 0.75)',
        }}
      />

      {/* Layout wrapper */}
      <div className="flex flex-col w-full h-full relative z-20 overflow-hidden">
        {/* Scrollable content wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-20">

          {/* Top nav (rendered sticky inside the scroll container) */}
          <header
            className="sticky top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pb-4 text-white rounded-b-[40px] shadow-xl overflow-hidden passport-leather-overlay shrink-0"
            style={{
              paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
              background: '#004225',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {/* Sheen overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)] pointer-events-none" />

            {/* Back button */}
            <button
              id="epassport-back-btn"
              onClick={onBack}
              className="relative z-10 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-extrabold transition-all px-3.5 py-1.5 rounded-full border border-[#CBA052]/40 text-[#CBA052] bg-white/5 hover:bg-white/10 hover:border-[#CBA052] hover:text-[#CBA052] active:scale-95 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            {/* Center label */}
            <span className="relative z-10 font-mono text-[9px] uppercase tracking-widest text-[#CBA052]/80">
              Viscan E-Pasaporte
            </span>

            {/* Spacer to balance layout */}
            <div style={{ width: 60 }} />
          </header>

          {/* Main scroll content with padding and flex centering */}
          <div className="px-4 py-6 flex flex-col items-center gap-6">
            {/* Title header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center' }}
            >
              <h1 className="font-serif text-xl font-black text-[#1a0e04] m-0 text-center whitespace-nowrap">
                Your Viscan E-Pasaporte
              </h1>
              <p className="font-mono text-[10px] text-[#5a3a18]/60 mt-1 text-center">
                Download &amp; share to your story or post
              </p>
            </motion.div>

            {/* Passport Card Wrapper with Drop Shadow */}
            <div
              className="w-full relative animate-fadeIn"
              style={{
                filter: 'drop-shadow(0 16px 36px rgba(42, 26, 8, 0.16)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 80 }}
                style={{ width: '100%' }}
              >
                {/* Decomposed Passport Card */}
                <EPassportCard
                  ref={passportRef}
                  landmarks={landmarks}
                  stamps={stamps}
                  currentUser={currentUser}
                  issuedDate={issuedDate}
                  mrzLine1={mrzLine1}
                  mrzLine2={mrzLine2}
                />
              </motion.div>
            </div>

            {/* Tip */}
            <p className="text-center px-6 font-mono text-[10px] text-[#5a3a18]/60 leading-relaxed">
              Download to save or share directly to Instagram story, Facebook post, or any social media.
            </p>
          </div>
        </div>

        {/* Footer (sticky bottom buttons) */}
        <footer
          className="relative z-30 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 bg-[#004225] border-t border-[#CBA052]/20 rounded-t-[32px] passport-leather-overlay shadow-[0_-12px_24px_rgba(0,0,0,0.3)] shrink-0"
          style={{
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480, margin: '0 auto' }}>
            <motion.button
              id="epassport-download-btn"
              onClick={handleDownload}
              disabled={isExporting}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden font-mono font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 w-full rounded-full active:scale-95 transition-all cursor-pointer"
              style={{
                height: 52,
                border: 'none',
                fontSize: '12px',
                letterSpacing: '0.12em',
                background: exported
                  ? 'linear-gradient(135deg, #1a6b35, #004225)'
                  : 'linear-gradient(135deg, #FFE58F, #D4AF37)',
                color: exported ? '#ffffff' : '#1c1103',
                boxShadow: exported
                  ? '0 6px 24px rgba(0,0,0,0.4)'
                  : '0 4px 12px rgba(212,175,55,0.25)',
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

            <motion.button
              id="epassport-share-btn"
              onClick={handleShare}
              whileTap={{ scale: 0.97 }}
              className="font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 w-full h-12 rounded-full cursor-pointer text-[11px] tracking-[0.1em] bg-white/10 border border-[#D4AF37]/50 text-[#FFE58F] active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Social Media</span>
            </motion.button>
          </div>
        </footer>
      </div>
    </div>
  );
}