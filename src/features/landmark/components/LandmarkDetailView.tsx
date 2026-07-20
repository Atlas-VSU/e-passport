import React, { useRef, useState } from 'react';
import { ArrowLeft, Landmark as LandmarkIcon, Check, Camera, Lock, AlertCircle } from 'lucide-react';
import { Landmark, Stamp } from '../../../types';

interface LandmarkDetailViewProps {
  landmark: Landmark;
  stamp?: Stamp;
  isUploading: boolean;
  onBack: () => void;
  onPhotoSelected: (base64Photo: string) => void;
  onViewStickerBook?: () => void;
}

export default function LandmarkDetailView({
  landmark,
  stamp,
  isUploading,
  onBack,
  onPhotoSelected,
  onViewStickerBook
}: LandmarkDetailViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 8MB)
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select or capture a valid image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size must be smaller than 8MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image capture.');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onPhotoSelected(previewUrl);
    }
  };

  const emojiMap: Record<string, string> = {
    building: '📚',
    green: '🌿',
    water: '🏖',
    sports: '🏃',
    open: '🌿',
  };

  const zoneEmoji = emojiMap[landmark.zoneType || ''] || '🏛';

  return (
    <div className="w-full h-screen bg-[#001a0e] flex flex-col relative overflow-hidden text-white select-none">

      {/* Hidden file input supporting mobile camera direct capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. FULL-BLEED HERO (top 260px) */}
      <div className="absolute top-0 left-0 right-0 h-[260px] overflow-hidden z-0">
        <img
          className="object-cover w-full h-full"
          src={stamp?.photo_url || landmark.photoUrl}
          alt={landmark.name}
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay at the bottom of the hero image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent, #001a0e)'
          }}
        />

        {/* Landmark name and code bottom-left */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col text-left">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[#CBA052] font-bold">
            {landmark.label || `LANDMARK 0${landmark.order}`}
          </span>
          <h2 className="font-serif text-2xl font-black text-white leading-tight mt-0.5">
            {landmark.name}
          </h2>
        </div>
      </div>

      {/* Floating nav bar sits on top of the hero */}
      <header
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3.5 text-white rounded-b-[24px] shadow-lg overflow-hidden passport-leather-overlay"
        style={{
          background: "#004225",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)]" />

        <button
          onClick={onBack}
          aria-label="Back to Passport"
          className="relative z-10 hover:bg-white/10 transition-all flex items-center justify-center w-9 h-9 rounded-full text-[#CBA052] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#CBA052]" />
        </button>
        <h1 className="relative z-10 font-mono text-[9px] uppercase tracking-widest text-[#CBA052] font-bold flex-1 text-center">
          VSU CAMPUS TOUR
        </h1>
        <div className="relative z-10 w-9 h-9 flex items-center justify-center text-[#CBA052]">
          <LandmarkIcon className="w-5 h-5 text-[#CBA052]" />
        </div>
      </header>

      {/* 2. SCROLLABLE CONTENT AREA (below hero, starting at y=245px) */}
      <div
        className="absolute inset-x-0 bottom-0 top-[245px] overflow-y-auto z-10 px-4 pb-[100px] flex flex-col gap-3.5 bg-[#001a0e] select-text"
        style={{
          boxShadow: '0 -20px 20px -10px #001a0e'
        }}
      >

        {/* B. ABOUT THIS LANDMARK */}
        <div className="flex flex-col text-left">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[#CBA052] mb-1.5 font-bold">
            about this landmark
          </span>
          <p className="font-sans text-sm text-white/72 leading-relaxed">
            {landmark.description}
          </p>
        </div>

        {/* C. DID YOU KNOW CARD */}
        <div className="bg-[#CBA052]/10 border border-[#CBA052]/30 rounded-xl p-3 flex flex-col text-left">
          <span className="font-mono text-[8px] text-[#CBA052] uppercase tracking-widest mb-1.5 font-bold">
            ✦ did you know
          </span>
          <p className="font-sans text-[11px] text-white/80 leading-relaxed italic">
            {landmark.funFact}
          </p>
        </div>

        {/* D. THIN GOLD DIVIDER */}
        <div className="w-full h-[1px] bg-[#CBA052]/20 shrink-0" />

        {/* E. PROOF OF VISIT CARD */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 text-[#ffb4ab] border border-red-900/30 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {stamp ? (
          /* Stamped State */
          <div
            className="flex flex-col items-center text-center p-3.5"
            style={{
              backgroundColor: 'rgba(15,40,25,0.90)',
              border: '1.5px solid #CBA052',
              borderRadius: '14px'
            }}
          >
            <span className="font-mono text-[8px] text-[#CBA052] uppercase tracking-widest text-center mb-2.5 font-bold">
              proof of visit required
            </span>

            {/* Circular Stamp Thumbnail */}
            <div className="relative w-[72px] h-[72px] shrink-0 mb-1">
              <div className="w-full h-full rounded-full border-[2.5px] border-[#CBA052] bg-white overflow-hidden flex items-center justify-center shadow-md">
                <img
                  src={stamp.photo_url || landmark.photoUrl}
                  alt="Stamp"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0.5 right-0.5 bg-[#0F6E56] border border-white text-white w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
              </div>
            </div>

            {/* Stamped Badge pill */}
            <div className="bg-[#0F6E56] text-[#5DCAA5] border border-[#5DCAA5]/30 rounded-full px-2 py-0.5 mb-3 shadow-sm">
              <span className="font-mono text-[7px] font-bold uppercase tracking-widest block leading-none">
                stamped
              </span>
            </div>

            {/* CTA Button: visit again */}
            <button
              onClick={onViewStickerBook}
              className="w-full py-2.5 px-4 bg-[#0F6E56]/50 border border-[#5DCAA5] text-[#5DCAA5] font-mono text-[11px] font-bold tracking-wider rounded-[20px] uppercase hover:bg-[#0F6E56]/70 active:scale-95 transition-all cursor-pointer"
            >
              visit again
            </button>
          </div>
        ) : previewUrl ? (
          /* Image Preview & Confirming State */
          <div
            className="flex flex-col items-center text-center p-3.5 gap-3"
            style={{
              backgroundColor: 'rgba(15,40,25,0.90)',
              border: '1.5px solid #CBA052',
              borderRadius: '14px'
            }}
          >
            <span className="font-mono text-[8px] text-[#CBA052] uppercase tracking-widest text-center font-bold">
              confirm your check-in
            </span>
            <div className="w-full h-40 rounded-xl overflow-hidden border border-[#CBA052]/40 relative">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setPreviewUrl(null)}
                className="flex-1 py-2 px-3 border border-[#CBA052]/30 text-white font-mono text-[10px] uppercase tracking-wider font-bold rounded-xl hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              >
                retake
              </button>
              <button
                onClick={handleConfirm}
                disabled={isUploading}
                className="flex-1 py-2 px-3 bg-[#CBA052] text-[#001a0e] font-mono text-[10px] uppercase tracking-wider font-extrabold rounded-xl hover:bg-[#b0873e] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="animate-pulse">stamping...</span>
                ) : (
                  <span>confirm stamp</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Unstamped State: camera row & open camera CTA */
          <div
            className="flex flex-col p-3.5"
            style={{
              backgroundColor: 'rgba(15,40,25,0.90)',
              border: '1.5px solid #CBA052',
              borderRadius: '14px'
            }}
          >
            <span className="font-mono text-[8px] text-[#CBA052] uppercase tracking-widest text-center mb-2.5 font-bold">
              proof of visit required
            </span>

            <div className="flex items-center gap-3">
              {/* Left: 56px circle camera button */}
              <button
                onClick={handleTriggerInput}
                className="w-14 h-14 rounded-full bg-[#0F6E56] border-[2.5px] border-[#CBA052] flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                style={{
                  boxShadow: '0 0 0 4px rgba(203,160,82,0.15)'
                }}
              >
                <Camera className="w-5.5 h-5.5 text-white" />
              </button>

              {/* Right: explanatory text block */}
              <div className="flex flex-col text-left">
                <span className="font-sans text-xs font-bold text-white">
                  Take a photo here
                </span>
                <span className="font-sans text-[10px] text-white/55 leading-relaxed mt-0.5">
                  Stand at this landmark and snap a photo to earn your stamp
                </span>
              </div>
            </div>

            {/* Full-width CTA button below the row */}
            <button
              onClick={handleTriggerInput}
              className="w-full py-2.5 bg-[#CBA052] hover:bg-[#b0873e] active:scale-[0.98] text-[#001a0e] font-mono text-[11px] font-bold tracking-wider rounded-[20px] uppercase mt-3 transition-all cursor-pointer"
            >
              tap to open camera
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
