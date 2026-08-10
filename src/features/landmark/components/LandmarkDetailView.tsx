import React, { useRef, useState } from 'react';
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    if (!rawFile.type.startsWith('image/')) {
      setErrorMsg('Please select or capture a valid image file.');
      return;
    }
    // Allow up to 50MB before conversion (HEIC files can be large before being converted to JPEG)
    if (rawFile.size > 50 * 1024 * 1024) {
      setErrorMsg('Image file is too large. Please choose a smaller photo.');
      return;
    }

    setErrorMsg(null);

    try {
      // Convert HEIC/HEIF to JPEG if needed (no-op for other formats)
      const file = await normalizeImageFile(rawFile);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Failed to process image. Please try a different photo.');
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMsg('Could not convert this photo format. Please try a different image.');
    }
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onPhotoSelected(previewUrl);
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
        accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
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
            isUploading={isUploading}
            errorMsg={errorMsg}
            handleTriggerInput={handleTriggerInput}
            setPreviewUrl={setPreviewUrl}
            handleConfirm={handleConfirm}
            onViewStickerBook={onViewStickerBook}
          />

        </div>
      </div>
    </div>
  );
}
