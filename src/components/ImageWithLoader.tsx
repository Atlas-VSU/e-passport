import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  showSpinner?: boolean;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export default function ImageWithLoader({
  showSpinner = false,
  wrapperClassName = "",
  wrapperStyle,
  className = "",
  onLoad,
  style,
  alt = "",
  ...props
}: ImageWithLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${wrapperClassName}`}
      style={{
        ...wrapperStyle,
        backgroundColor: isLoaded ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Loading Skeleton / Spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/[0.04] animate-pulse">
          {showSpinner && (
            <Loader2 className="w-5 h-5 text-[#CBA052]/50 animate-spin" />
          )}
        </div>
      )}

      {/* Actual Image */}
      <img
        alt={alt}
        onLoad={handleLoad}
        style={{
          ...style,
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
