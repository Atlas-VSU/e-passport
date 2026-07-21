import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { Stamp } from '../../../types';

interface CheckInStatusProps {
  stamp?: Stamp;
  previewUrl: string | null;
  isUploading: boolean;
  errorMsg: string | null;
  handleTriggerInput: () => void;
  setPreviewUrl: (url: string | null) => void;
  handleConfirm: () => void;
  onViewStickerBook?: () => void;
}

export default function CheckInStatus({
  stamp,
  previewUrl,
  isUploading,
  errorMsg,
  handleTriggerInput,
  setPreviewUrl,
  handleConfirm,
  onViewStickerBook
}: CheckInStatusProps) {
  return (
    <>
      {errorMsg && (
        <div className="p-3 bg-red-950/20 text-red-800 border border-red-900/30 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {stamp ? (
        /* Stamped / Validated State */
        <div
          className="flex flex-col items-center text-center p-4.5 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)'
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center mb-1 font-bold">
            proof of visit validated
          </span>

          {/* Visa Ink Stamp cancellation mark */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              border: '2.5px solid rgba(160, 32, 24, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '12px 0 18px',
              transform: 'rotate(-6deg)',
              boxShadow: '0 2px 6px rgba(160,32,24,0.1)'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '1px solid rgba(160, 32, 24, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '8.5px', color: 'rgba(160, 32, 24, 0.98)', letterSpacing: '1.5px', fontWeight: 900, lineHeight: 1 }}>
                VISITED
              </span>
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '7px', color: 'rgba(160, 32, 24, 0.88)', letterSpacing: '0.5px', fontWeight: 900, lineHeight: 1, marginTop: 2 }}>
                VSU·26
              </span>
            </div>
          </div>

          {/* Stamped Badge pill */}
          <div className="bg-[#0F6E56] text-[#FFE58F] border border-[#FFE58F]/30 rounded-full px-2.5 py-0.5 mb-4 shadow-xs">
            <span className="font-mono text-[7.5px] font-bold uppercase tracking-widest block leading-none">
              verified check-in
            </span>
          </div>

          {/* CTA Button: view stamp book */}
          <button
            onClick={onViewStickerBook}
            className="w-full py-3 px-4 bg-[#0F6E56] border border-[#CBA052] text-[#FFE58F] font-mono text-[11px] font-bold tracking-widest rounded-[20px] uppercase hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            view stamp book
          </button>
        </div>
      ) : previewUrl ? (
        /* Image Preview & Confirming State */
        <div
          className="flex flex-col items-center text-center p-4.5 gap-3.5"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)'
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center font-bold">
            confirm your check-in
          </span>
          <div className="w-full h-44 rounded-xl overflow-hidden border border-[#CBA052]/40 relative shadow-inner">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2.5 w-full">
            <button
              onClick={() => setPreviewUrl(null)}
              className="flex-1 py-2.5 px-3 border border-[#7a4f10]/40 text-[#7a4f10] font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-[#CBA052]/10 active:scale-95 transition-all cursor-pointer"
            >
              retake
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUploading}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#FFE58F] to-[#D4AF37] text-[#1c1103] font-mono text-[10px] uppercase tracking-widest font-extrabold rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
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
          className="flex flex-col p-4.5 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(240, 230, 206, 0.90)',
            border: '1.5px solid rgba(203,160,82,0.40)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(42, 26, 8, 0.06)'
          }}
        >
          <span className="font-mono text-[8px] text-[#7a4f10] uppercase tracking-widest text-center mb-3 font-bold">
            proof of visit required
          </span>

          <div className="flex items-center gap-4">
            {/* Left: 56px circle camera button */}
            <button
              onClick={handleTriggerInput}
              className="w-14 h-14 rounded-full bg-[#0F6E56] border-[2.5px] border-[#CBA052] flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              style={{
                boxShadow: '0 0 0 4px rgba(203,160,82,0.12)'
              }}
            >
              <Camera className="w-5.5 h-5.5 text-white" />
            </button>

            {/* Right: explanatory text block */}
            <div className="flex flex-col text-left">
              <span className="font-sans text-xs font-bold text-[#1a0e04]">
                Take a photo here
              </span>
              <span className="font-sans text-[10px] text-[#5a3a18]/70 leading-relaxed mt-0.5">
                Stand at this landmark and snap a photo to earn your stamp
              </span>
            </div>
          </div>

          {/* Full-width CTA button below the row */}
          <button
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
