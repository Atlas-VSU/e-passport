import React from 'react';
import { AlertTriangle, X, ImageOff, HardDriveUpload, RefreshCw, FileWarning, CameraOff } from 'lucide-react';

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  body: string;
  primaryLabel: string;
  primaryAction: 'retake' | 'dismiss';
  showSecondary?: boolean;
  secondaryLabel?: string;
}

/** Maps raw error messages to structured, human-friendly modal content. */
function resolveErrorConfig(errorMsg: string): ErrorConfig {
  const lower = errorMsg.toLowerCase();

  // Camera RAW formats (DNG, CR2, CR3, NEF, ARW, ORF, RW2, RAF, PEF, SRW) or decoding failures
  if (
    lower.includes('raw') ||
    lower.includes('dng') ||
    lower.includes('cr2') ||
    lower.includes('cr3') ||
    lower.includes('nef') ||
    lower.includes('arw') ||
    lower.includes('orf') ||
    lower.includes('rw2') ||
    lower.includes('raf') ||
    lower.includes('decode')
  ) {
    return {
      icon: <CameraOff className="w-6 h-6 text-[#CBA052]" />,
      title: 'RAW Photo Not Supported',
      body: 'Camera RAW files (.DNG, .CR2, .NEF, .ARW) cannot be decoded directly by web browsers. Please export or convert your photo to JPEG, PNG, or WebP format first.',
      primaryLabel: 'Select Standard Photo',
      primaryAction: 'retake',
      showSecondary: true,
      secondaryLabel: 'Dismiss',
    };
  }

  // Unsupported file format (e.g. PDF, SVG, video, doc, or non-image format)
  if (
    lower.includes('unsupported') ||
    lower.includes('not supported') ||
    lower.includes('valid photo') ||
    lower.includes('valid image') ||
    lower.includes('invalid image')
  ) {
    return {
      icon: <FileWarning className="w-6 h-6 text-[#CBA052]" />,
      title: 'Unsupported Photo Format',
      body: 'The file format you selected is not supported. Please select or capture a photo in JPEG, PNG, WebP, or HEIC format.',
      primaryLabel: 'Select Valid Photo',
      primaryAction: 'retake',
      showSecondary: true,
      secondaryLabel: 'Dismiss',
    };
  }

  // HEIC / format conversion failures
  if (lower.includes('heic') || lower.includes('convert') || lower.includes('format')) {
    return {
      icon: <ImageOff className="w-6 h-6 text-[#CBA052]" />,
      title: 'Photo Format Issue',
      body: 'Your photo couldn\'t be converted. Try sharing it as JPEG from your camera roll, or choose a different photo.',
      primaryLabel: 'Choose Different Photo',
      primaryAction: 'retake',
      showSecondary: true,
      secondaryLabel: 'Dismiss',
    };
  }

  // Upload / server / network failures
  if (
    lower.includes('upload') ||
    lower.includes('server') ||
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('connection')
  ) {
    return {
      icon: <HardDriveUpload className="w-6 h-6 text-[#CBA052]" />,
      title: 'Upload Failed',
      body: 'Your photo couldn\'t be sent to the server. Check your internet connection and try again — your photo is still saved on your device.',
      primaryLabel: 'Try Again',
      primaryAction: 'dismiss',
      showSecondary: true,
      secondaryLabel: 'Retake Photo',
    };
  }

  // File size
  if (lower.includes('large') || lower.includes('size') || lower.includes('50')) {
    return {
      icon: <ImageOff className="w-6 h-6 text-[#CBA052]" />,
      title: 'Photo Too Large',
      body: 'The selected photo exceeds the 50 MB limit before conversion. Please choose a smaller photo or use your camera app to reduce the resolution.',
      primaryLabel: 'Choose Different Photo',
      primaryAction: 'retake',
    };
  }

  // Corrupted data
  if (lower.includes('corrupt') || lower.includes('data')) {
    return {
      icon: <RefreshCw className="w-6 h-6 text-[#CBA052]" />,
      title: 'Corrupted Photo',
      body: 'The photo data appears to be damaged, possibly due to a poor connection. Please retake the photo and try again.',
      primaryLabel: 'Retake Photo',
      primaryAction: 'retake',
    };
  }

  // Generic / unknown fallback
  return {
    icon: <AlertTriangle className="w-6 h-6 text-[#CBA052]" />,
    title: 'Something Went Wrong',
    body: errorMsg || 'An unexpected error occurred while processing your photo. Please try again.',
    primaryLabel: 'Try Again',
    primaryAction: 'retake',
    showSecondary: true,
    secondaryLabel: 'Dismiss',
  };
}

interface PhotoErrorModalProps {
  errorMsg: string;
  onRetake: () => void;
  onDismiss: () => void;
}

export default function PhotoErrorModal({ errorMsg, onRetake, onDismiss }: PhotoErrorModalProps) {
  const config = resolveErrorConfig(errorMsg);
  const handlePrimary = config.primaryAction === 'retake' ? onRetake : onDismiss;
  const handleSecondary = config.primaryAction === 'retake' ? onDismiss : onRetake;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{ background: 'rgba(10, 8, 4, 0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-error-title"
    >
      {/* Modal card — stop click from propagating to backdrop */}
      <div
        className="w-full max-w-sm flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg, #f7f0e0 0%, #ede2c4 100%)',
          border: '1.5px solid rgba(203,160,82,0.45)',
          borderRadius: '24px',
          boxShadow: '0 -4px 40px rgba(42, 26, 8, 0.28), 0 2px 0 rgba(203,160,82,0.2) inset',
          animation: 'modal-slide-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes modal-slide-up {
            from { transform: translateY(32px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Header bar */}
        <div className="w-full flex items-start justify-between px-5 pt-5 pb-0">
          {/* Icon badge */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(160, 32, 24, 0.10)', border: '1px solid rgba(160,32,24,0.18)' }}
          >
            {config.icon}
          </div>

          {/* Dismiss X */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a4f10]/60 hover:text-[#7a4f10] hover:bg-[#CBA052]/15 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body copy */}
        <div className="px-5 pt-3.5 pb-5 w-full">
          <h2
            id="photo-error-title"
            className="font-mono text-[13px] font-extrabold text-[#1a0e04] tracking-wide mb-1.5"
          >
            {config.title}
          </h2>
          <p className="font-sans text-[11.5px] text-[#5a3a18]/80 leading-relaxed">
            {config.body}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#CBA052]/25 mx-0" />

        {/* Actions */}
        <div className="w-full flex gap-2.5 px-5 py-4">
          {config.showSecondary && config.secondaryLabel && (
            <button
              type="button"
              onClick={handleSecondary}
              className="flex-1 py-2.5 px-3 border border-[#7a4f10]/35 text-[#7a4f10] font-mono text-[10px] uppercase tracking-widest font-bold rounded-[14px] hover:bg-[#CBA052]/10 active:scale-95 transition-all cursor-pointer"
            >
              {config.secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrimary}
            className="flex-1 py-2.5 px-3 bg-[#0F6E56] text-[#FFE58F] font-mono text-[10px] uppercase tracking-widest font-extrabold rounded-[14px] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md border border-[#FFE58F]/20"
          >
            {config.primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
