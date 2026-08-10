import React, { useEffect, useRef, useState } from 'react';
import { Landmark, Stamp } from '../../../types';
import LandmarkHeader from './LandmarkHeader';
import LandmarkHero from './LandmarkHero';
import LandmarkInfo from './LandmarkInfo';
import UserPhotoEntry from './UserPhotoEntry';
import CheckInStatus from './CheckInStatus';
import { normalizeImageFile } from '../../../utils/imageUtils';

interface LandmarkDetailViewProps {
  landmark: Landmark;
  stamp?: Stamp;
  isUploading: boolean;
  isPendingSync: boolean;
  onBack: () => void;
  onPhotoSelected: (base64Photo: string) => void;
  onViewStickerBook?: () => void;
}

/** Promisified FileReader so we can await it inline. */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export default function LandmarkDetailView({
  landmark,
  stamp,
  isUploading,
  isPendingSync,
  onBack,
  onPhotoSelected,
  onViewStickerBook,
}: LandmarkDetailViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Object URL for instant display — never sent to the server
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Base64 JPEG that will actually be uploaded — computed in the background
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track the current object URL so we can revoke it when no longer needed
  const objectUrlRef = useRef<string | null>(null);

  // Revoke the object URL when the component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const revokeCurrentObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Intercept camera RAW file formats (.dng, .cr2, .cr3, .nef, .arw, .orf, .rw2, .raf, .pef, .srw)
    const rawFormatExt = /\.(dng|cr2|cr3|nef|arw|orf|rw2|raf|pef|srw|dcr|erf|mrw)$/i;
    const isRawMime = rawFile.type.includes('raw') || rawFile.type.includes('dng') || rawFile.type.includes('cr2') || rawFile.type.includes('nef') || rawFile.type.includes('arw');
    if (rawFormatExt.test(rawFile.name) || isRawMime) {
      setErrorMsg('Camera RAW photos (.DNG, .CR2, .NEF, .ARW) are not supported. Please convert your photo to JPEG, PNG, or WebP first.');
      return;
    }

    // Some browsers (older iOS Safari) omit the MIME type for HEIC files entirely
    // (file.type === ''), so we also accept files whose extension is a known image format.
    const knownImageExt = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i;
    const hasImageMime = rawFile.type.startsWith('image/');
    const hasImageExt = knownImageExt.test(rawFile.name);
    if (!hasImageMime && !hasImageExt) {
      setErrorMsg('The selected file format is unsupported. Please choose a valid photo (JPEG, PNG, WebP, or HEIC).');
      return;
    }
    // Allow up to 50MB before conversion (HEIC files can be large before being converted to JPEG)
    if (rawFile.size > 50 * 1024 * 1024) {
      setErrorMsg('Image file is too large. Please choose a smaller photo.');
      return;
    }

    setErrorMsg(null);
    setUploadBase64(null);

    // ── Step 1: Show the preview instantly via an object URL ──────────────
    // This works immediately regardless of file format. Safari renders HEIC
    // natively; other browsers render JPEG/PNG/WebP. The user sees their photo
    // right away while conversion runs in the background.
    revokeCurrentObjectUrl();
    const objUrl = URL.createObjectURL(rawFile);
    objectUrlRef.current = objUrl;
    setPreviewUrl(objUrl);
    setIsProcessing(true);

    // ── Step 2: Convert HEIC → JPEG in the background ─────────────────────
    // normalizeImageFile is a no-op for non-HEIC formats so this stays fast.
    // We then read the result as a base64 data URL for the upload payload.
    try {
      const normalized = await normalizeImageFile(rawFile);
      const base64 = await readFileAsDataURL(normalized);
      setUploadBase64(base64);
      // Update the preview URL with the converted and compressed photo payload
      // so Chrome/Firefox/Edge render the compressed photo cleanly before confirm.
      setPreviewUrl(base64);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not process this photo format. Please try a different image.'
      );
      // Leave the preview visible so the user can see what failed,
      // but the confirm button will remain disabled (uploadBase64 is null).
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    revokeCurrentObjectUrl();
    setPreviewUrl(null);
    setUploadBase64(null);
    setErrorMsg(null);
    // Reset the input so the same file can be re-selected and fires onChange again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (uploadBase64) {
      onPhotoSelected(uploadBase64);
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col relative overflow-hidden text-[#1a0e04] select-none"
      style={{ background: '#F2E9D3' }}
    >
      {/* Dark vignette overlay sits at z-30, framing the cover photo (z-10) but sitting under the sticky header (z-40) */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          boxShadow: 'inset 0 0 80px 40px rgba(12, 22, 18, 0.75)',
        }}
      />

      {/* Hidden file input supporting mobile camera or gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* SCROLLABLE VIEWPORT (holds sticky header, absolute hero, and scrollable contents; no z-index class to flatten stacking context) */}
      <div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col select-text relative">

        <LandmarkHeader onBack={onBack} />

        <LandmarkHero landmark={landmark} />

        <div className="px-5 flex flex-col gap-4.5 mt-[220px] pb-[100px] relative z-20">

          <LandmarkInfo landmark={landmark} />

          {stamp && <UserPhotoEntry stamp={stamp} />}
          <CheckInStatus
            stamp={stamp}
            previewUrl={previewUrl}
            isProcessing={isProcessing}
            isConfirmReady={!!uploadBase64 && !isProcessing}
            isUploading={isUploading}
            isPendingSync={isPendingSync}
            errorMsg={errorMsg}
            onDismissError={() => setErrorMsg(null)}
            handleTriggerInput={handleTriggerInput}
            onRetake={handleRetake}
            handleConfirm={handleConfirm}
            onViewStickerBook={onViewStickerBook}
          />

        </div>
      </div>
    </div>
  );
}
