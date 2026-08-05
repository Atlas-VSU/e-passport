import React, { useState, useEffect, useRef } from 'react';
import { Landmark } from '../../../types';
import ImageWithLoader from '../../../components/ImageWithLoader';
import { motion } from 'motion/react';

interface LandmarkHeroProps {
  landmark: Landmark;
}

export default function LandmarkHero({ landmark }: LandmarkHeroProps) {
  const photos = landmark.photoUrls || (landmark.photoUrl ? [landmark.photoUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(prev + 1, photos.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40;

    if (delta > threshold && currentIndex < photos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (delta < -threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-[280px] overflow-hidden shrink-0 z-10">
      {/* Carousel Track wrapper */}
      <div
        className="relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex w-full h-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {photos.map((src, i) => (
            <div key={src} className="w-full h-full shrink-0 select-none pointer-events-none relative">
              <ImageWithLoader
                className="object-cover w-full h-full"
                src={src}
                alt={`${landmark.name} ${i + 1}`}
                referrerPolicy="no-referrer"
                showSpinner
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination dots (placed on the very bottom of the photo container) */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-black/35 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 pointer-events-auto">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${index === currentIndex
                ? 'bg-[#CBA052] scale-110 w-3 h-1.5'
                : 'bg-white/40 hover:bg-white/60 w-1.5 h-1.5'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay at the bottom of the hero image */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, transparent, #F2E9D3)'
        }}
      />
    </div>
  );
}