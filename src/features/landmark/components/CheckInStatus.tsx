import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Stamp } from '../../../types';
import PhotoErrorModal from './PhotoErrorModal';

interface CheckInStatusProps {
  stamp?: Stamp;
  previewUrl: string | null;
  isProcessing: boolean;     // HEIC conversion / FileReader running in background
  isConfirmReady: boolean;   // background conversion succeeded, safe to upload
  isUploading: boolean;      // server upload in progress
  isPendingSync?: boolean;   // stamp saved offline, waiting for connection sync
  errorMsg: string | null;
  onDismissError: () => void;
  handleTriggerInput: () => void;
  onRetake: () => void;
  handleConfirm: () => void;
  onViewStickerBook?: () => void;
}

const UPLOAD_STAGES = [
  'Uploading photo…',
  'Processing image…',
  'Stamping your passport…',
];

const PROCESSING_STAGES = [
  'Reading photo data…',
  'Decoding image format…',
  'Optimizing high-res photo…',
  'Compressing image for fast upload…',
  'Finalizing photo preview…',
];

/** Cycles through processing stage labels to explain why photo conversion takes time. */
function useProcessingStageLabel(isProcessing: boolean): string {
  const [stageIndex, setStageIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!isProcessing) {
      setStageIndex(0);
      return;
    }

    const delays = [0, 1800, 3800, 6000, 8500];
    delays.forEach((delay, i) => {
      const t = setTimeout(() => setStageIndex(i), delay);
      timersRef.current.push(t);
    });

    return () => timersRef.current.forEach(clearTimeout);
  }, [isProcessing]);

  return PROCESSING_STAGES[Math.min(stageIndex, PROCESSING_STAGES.length - 1)];
}

/** Cycles through upload stage labels to give real-feeling progress feedback. */
function useUploadStageLabel(isUploading: boolean): string {
  const [stageIndex, setStageIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any running timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!isUploading) {
      setStageIndex(0);
      return;
    }
    const delays = [0, 2500, 5000];
    delays.forEach((delay, i) => {
      const t = setTimeout(() => setStageIndex(i), delay);
      timersRef.current.push(t);
    });
    return () => timersRef.current.forEach(clearTimeout);
  }, [isUploading]);

  return UPLOAD_STAGES[Math.min(stageIndex, UPLOAD_STAGES.length - 1)];
}

export default function CheckInStatus({
  stamp,
  previewUrl,
  isProcessing,
  isConfirmReady,
  isUploading,
  isPendingSync,
  errorMsg,
  onDismissError,
  handleTriggerInput,
  onRetake,
  handleConfirm,
  onViewStickerBook,
}: CheckInStatusProps) {
  const processingLabel = useProcessingStageLabel(isProcessing);
  const uploadLabel = useUploadStageLabel(isUploading);

  const isPending = isPendingSync || (stamp as any)?._pending;

  return (
    <>
      {/* Error modal — rendered as a portal-like fixed overlay above all content */}
      {errorMsg && (
        <PhotoErrorModal
          errorMsg={errorMsg}
          onRetake={() => { onDismissError(); onRetake(); }}
          onDismiss={onDismissError}
        />
      )}

      {stamp ? (
        /* ── Stamped / Validated State ── */
        <div
          className="flex flex-col items-center text-center p-4.5 animate-fadeIn relative"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)',
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center mb-1 font-bold">
            {isPending ? 'photo saved offline • sync pending' : 'proof of visit validated'}
          </span>

          {/* Visa ink stamp */}
          <div
            style={{
              width: 76, height: 76,
              borderRadius: '50%',
              border: isPending ? '2.5px dashed rgba(203, 160, 82, 0.9)' : '2.5px solid rgba(160, 32, 24, 0.88)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '12px 0 18px',
              transform: 'rotate(-6deg)',
              boxShadow: '0 2px 6px rgba(160,32,24,0.1)',
            }}
          >
            <div
              style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                border: isPending ? '1px dashed rgba(203, 160, 82, 0.7)' : '1px solid rgba(160, 32, 24, 0.65)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '8.5px', color: isPending ? '#7a4f10' : 'rgba(160, 32, 24, 0.98)', letterSpacing: '1.5px', fontWeight: 900, lineHeight: 1 }}>
                {isPending ? 'SAVED' : 'VISITED'}
              </span>
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '7px', color: isPending ? '#7a4f10' : 'rgba(160, 32, 24, 0.88)', letterSpacing: '0.5px', fontWeight: 900, lineHeight: 1, marginTop: 2 }}>
                VSU·26
              </span>
            </div>
          </div>

          <div className={`${isPending ? 'bg-[#7a4f10] text-[#FFE58F]' : 'bg-[#0F6E56] text-[#FFE58F]'} border border-[#FFE58F]/30 rounded-full px-2.5 py-0.5 mb-2 shadow-xs`}>
            <span className="font-mono text-[7.5px] font-bold uppercase tracking-widest block leading-none">
              {isPending ? '⚡ saved offline (will sync online)' : 'verified check-in'}
            </span>
          </div>

          {isPending && (
            <p className="font-sans text-[10.5px] text-[#5a3a18]/80 leading-tight mb-3 px-2">
              Your photo stamp is safely stored on this device and will automatically upload when internet connects.
            </p>
          )}

          <button
            type="button"
            onClick={onViewStickerBook}
            className="w-full py-3 px-4 bg-[#0F6E56] border border-[#CBA052] text-[#FFE58F] font-mono text-[11px] font-bold tracking-widest rounded-[20px] uppercase hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            view stamp book
          </button>
        </div>

      ) : previewUrl ? (
        /* ── Preview & Confirm State ── */
        <div
          className="flex flex-col items-center text-center p-4.5 gap-3.5"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)',
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center font-bold">
            {isProcessing ? 'preparing photo…' : 'confirm your check-in'}
          </span>

          {/* Photo preview with processing overlay */}
          <div className="w-full h-44 rounded-xl overflow-hidden border border-[#CBA052]/40 relative shadow-inner">
            <img
              src={previewUrl}
              alt="Your photo preview"
              className="w-full h-full object-cover transition-opacity duration-200"
              onError={(e) => {
                // If browser cannot render raw file blob (e.g. HEIC in Chrome), hide broken img icon
                (e.currentTarget as HTMLElement).style.opacity = '0';
              }}
              onLoad={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            />

            {/* Conversion overlay — visible while photo is being converted & downscaled */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-[3px] p-4 animate-fadeIn">
                <span
                  className="block w-7 h-7 rounded-full border-2 border-[#FFE58F]/30 border-t-[#FFE58F] animate-spin"
                  aria-hidden="true"
                />
                <span className="text-[#FFE58F] font-mono text-[9.5px] uppercase tracking-widest px-2 text-center font-bold leading-snug transition-all duration-300">
                  {processingLabel}
                </span>
                <span className="text-white/75 font-sans text-[9px] text-center max-w-[210px] leading-tight">
                  High-res & HEIC photos take a few seconds to decode and compress
                </span>
              </div>
            )}
          </div>

          {/* Upload progress — only shown while uploading to server */}
          {isUploading && (
            <div className="w-full flex flex-col items-center gap-2 py-1">
              <div className="flex items-center gap-2">
                <span
                  className="block w-4 h-4 rounded-full border-2 border-[#CBA052]/30 border-t-[#CBA052] animate-spin"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] text-[#7a4f10] tracking-wide">
                  {uploadLabel}
                </span>
              </div>

              {/* Indeterminate progress bar */}
              <div className="w-full h-1 rounded-full bg-[#CBA052]/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#CBA052] to-[#FFE58F]"
                  style={{ animation: 'upload-bar 6s ease-in-out forwards' }}
                />
              </div>

              <style>{`
                @keyframes upload-bar {
                  0%   { width: 0%; }
                  30%  { width: 40%; }
                  60%  { width: 70%; }
                  85%  { width: 88%; }
                  100% { width: 95%; }
                }
              `}</style>
            </div>
          )}

          <div className="flex gap-2.5 w-full">
            <button
              type="button"
              onClick={onRetake}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 border border-[#7a4f10]/40 text-[#7a4f10] font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-[#CBA052]/10 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmReady || isUploading}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#FFE58F] to-[#D4AF37] text-[#1c1103] font-mono text-[10px] uppercase tracking-widest font-extrabold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isUploading ? (
                <>
                  <span className="block w-3 h-3 rounded-full border-2 border-[#1c1103]/30 border-t-[#1c1103] animate-spin" aria-hidden="true" />
                  <span>stamping…</span>
                </>
              ) : isProcessing ? (
                <span>preparing…</span>
              ) : (
                <span>confirm stamp</span>
              )}
            </button>
          </div>
        </div>

      ) : (
        /* ── Unstamped / Camera CTA State ── */
        <div
          className="flex flex-col p-4.5 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)',
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center mb-3 font-bold">
            proof of visit required
          </span>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleTriggerInput}
              className="w-14 h-14 rounded-full bg-[#0F6E56] border-[2.5px] border-[#CBA052] flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              style={{ boxShadow: '0 0 0 4px rgba(203,160,82,0.12)' }}
            >
              <Camera className="w-5.5 h-5.5 text-white" />
            </button>

            <div className="flex flex-col text-left">
              <span className="font-sans text-xs font-bold text-[#1a0e04]">
                Take a photo here
              </span>
              <span className="font-sans text-[10px] text-[#5a3a18]/70 leading-relaxed mt-0.5">
                Stand at this landmark and snap a photo to earn your stamp
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerInput}
            className="w-full py-3 bg-gradient-to-r from-[#FFE58F] to-[#D4AF37] hover:brightness-105 active:scale-[0.98] text-[#1c1103] font-mono text-[11px] font-bold tracking-widest rounded-[20px] uppercase mt-4 transition-all cursor-pointer shadow-md"
          >
            tap to open camera
          </button>
        </div>
      )}
    </>
  );
}
