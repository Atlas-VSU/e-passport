import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (base64Photo: string) => void;
  isUploading: boolean;
}

export default function PhotoUpload({ onPhotoSelected, isUploading }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (limit to 8MB)
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

  const handleRetake = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onPhotoSelected(previewUrl);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input supporting mobile camera direct capture */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleFileChange}
      />

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-[#ba1a1a] rounded-lg text-xs flex items-center gap-2 border border-[#ba1a1a]/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!previewUrl ? (
        <div className="flex flex-col items-center justify-center py-5 border-t border-gray-100 mt-2">
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-3">
            Proof of Visit Required
          </p>
          <button 
            type="button"
            onClick={handleTriggerInput}
            className="bg-[#004225] hover:bg-[#00301a] text-[#CBA052] rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all active:scale-95 duration-150 group"
          >
            <Camera className="w-6 h-6 text-[#CBA052] group-hover:scale-110 transition-transform" />
          </button>
          <span className="font-sans text-xs text-[#004225] font-black mt-2.5 tracking-wide">
            Tap to Open Camera
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-3 pt-3 border-t border-gray-100">
          {/* Circular/Square Preview */}
          <div className="w-full h-40 rounded-2xl bg-gray-100 overflow-hidden relative border-2 border-[#004225] shadow-inner mb-3">
            <img 
              src={previewUrl} 
              alt="Visit proof preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/15 flex items-center justify-center pointer-events-none">
              <span className="bg-[#004225]/90 text-[#CBA052] font-mono text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border border-[#CBA052]/30">
                PREVIEW READY
              </span>
            </div>
          </div>

          <div className="flex gap-2.5 w-full">
            <button 
              type="button"
              disabled={isUploading}
              onClick={handleRetake}
              className="flex-1 py-2.5 px-3 border-2 border-[#004225] hover:bg-[#CBA052]/10 rounded-2xl text-[#004225] font-mono text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake
            </button>
            <button 
              type="button"
              disabled={isUploading}
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-3 bg-[#004225] text-[#CBA052] rounded-2xl font-mono text-[10px] uppercase tracking-widest font-extrabold shadow-md hover:bg-[#00301a] transition-all flex items-center justify-center gap-1.5 disabled:opacity-75"
            >
              {isUploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#CBA052] border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#CBA052]" />
                  Confirm Visit
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
