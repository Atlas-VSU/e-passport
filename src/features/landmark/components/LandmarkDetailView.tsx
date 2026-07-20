import React from 'react';
import { ArrowLeft, Landmark as LandmarkIcon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Landmark, Stamp } from '../../../types';
import PhotoUpload from './PhotoUpload';

interface LandmarkDetailViewProps {
  landmark: Landmark;
  stamp?: Stamp;
  isUploading: boolean;
  onBack: () => void;
  onPhotoSelected: (base64Photo: string) => void;
}

export default function LandmarkDetailView({ 
  landmark, 
  stamp, 
  isUploading, 
  onBack, 
  onPhotoSelected 
}: LandmarkDetailViewProps) {
  
  return (
    <div className="w-full h-screen bg-[#FDF9F0] flex flex-col relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <header className="bg-[#004225] text-white shadow-md relative z-10 flex items-center justify-between px-5 py-3 border-b-4 border-[#CBA052] passport-leather-overlay">
        <button 
          onClick={onBack}
          aria-label="Back to Passport"
          className="hover:bg-white/10 transition-all flex items-center justify-center w-9 h-9 rounded-full text-[#CBA052]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-sm font-black italic tracking-wide text-white flex-1 text-center">
          VSU CAMPUS TOUR
        </h1>
        <div className="w-9 h-9 flex items-center justify-center text-[#CBA052]">
          <LandmarkIcon className="w-5 h-5" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 relative z-10 flex flex-col gap-3">
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 flex flex-col mt-1">
          
          {/* Stamp Status slot (top right absolute) */}
          <div className="relative w-full">
            <div className={`absolute -top-1 -right-1 w-14 h-14 rounded-full flex items-center justify-center z-20 transition-all duration-300 border-2 ${
              stamp 
                ? 'border-[#CBA052] bg-[#CBA052]/10' 
                : 'border-dashed border-gray-300 bg-gray-50'
            }`}>
              <CheckCircle2 className={`w-6 h-6 ${
                stamp ? 'text-[#004225] fill-[#CBA052] scale-110 animate-pulse' : 'text-gray-300 opacity-60'
              }`} />
            </div>
          </div>

          {/* Showcase Photo */}
          <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3.5 relative shadow-inner">
            <img 
              className="object-cover w-full h-full" 
              src={stamp?.photo_url || landmark.photoUrl} 
              alt={landmark.name} 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="font-mono text-[9px] text-[#004225] uppercase tracking-widest font-extrabold">
              {landmark.label || `Landmark 0${landmark.order}`}
            </span>
            <h2 className="font-serif text-lg font-black text-[#1A1A1A] tracking-tight leading-tight">
              {landmark.name}
            </h2>
            <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed mt-1">
              {landmark.description}
            </p>
          </div>

          {/* Upload Camera Logic or Stamped feedback */}
          {stamp ? (
            <div className="bg-[#CBA052]/15 p-4 rounded-2xl border-2 border-[#CBA052]/40 flex flex-col items-center gap-2.5 text-center mt-auto animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-[#004225] flex items-center justify-center text-[#CBA052]">
                <CheckCircle2 className="w-5 h-5 fill-[#CBA052] text-[#004225]" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#004225]">Stamp fully verified!</h4>
                <p className="font-sans text-xs text-[#1A1A1A]/80 mt-1">
                  You successfully checked-in and captured this landmark on{' '}
                  <span className="font-mono font-bold text-[#004225]">
                    {new Date(stamp.stamped_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>.
                </p>
              </div>
            </div>
          ) : (
            <PhotoUpload 
              onPhotoSelected={onPhotoSelected}
              isUploading={isUploading}
            />
          )}

        </div>
      </main>
    </div>
  );
}
