import React, { useState } from 'react';
import { ShieldCheck, Camera, MapPin, ArrowRight, BookOpen, User } from 'lucide-react';

interface ConsentModalProps {
  onAccept: () => void;
  isSubmitting: boolean;
}

export default function ConsentModal({ onAccept, isSubmitting }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="w-full h-screen bg-[#FDF9F0] flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-[#004225] p-5 pb-6 border-b-4 border-[#CBA052] relative overflow-hidden flex flex-col items-center text-white z-10 flex-shrink-0">
        <div className="flex items-center justify-center mb-2 bg-white rounded-full p-3 shadow-md">
          <ShieldCheck className="w-8 h-8 text-[#004225]" />
        </div>
        <h1 className="font-serif text-xl font-black tracking-tight text-white text-center">Data Consent</h1>
        <p className="font-mono text-[8px] text-[#CBA052] text-center mt-0.5 uppercase tracking-widest font-black">
          Security & Verification
        </p>
      </div>

      {/* Content Scrollable */}
      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 bg-transparent z-10">
        <p className="font-sans text-xs text-[#1A1A1A] leading-relaxed">
          Welcome to the USSC E-Passport campus tour! To provide you with an interactive and verified stamp experience, we request permission for the following actions:
        </p>

        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="font-sans font-bold text-xs text-[#1A1A1A] block">Photo Stamp Uploads</span>
              <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
                Photos captured are stored in our secure database to generate your digital passport stamp memories.
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="bg-[#004225]/10 rounded-xl p-2 text-[#004225] flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-sans font-bold text-xs text-[#1A1A1A] block">Account Verification</span>
              <span className="font-sans text-[10px] text-[#1A1A1A]/70 block mt-0.5 leading-normal">
                We verify your accounts by accessing your email and student ID for authentication purposes.
              </span>
            </div>
          </li>
        </ul>

        {/* Ink Depression Note */}
        <div className="bg-[#CBA052]/10 p-3 rounded-2xl border border-[#CBA052]/30 mt-1">
          <p className="font-sans text-[10px] text-[#004225] leading-relaxed font-medium">
            Your data is strictly confidential. We use it solely to run the VSU Campus Tour game and verify your physical visits.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-4 z-10 flex-shrink-0">
        <label className="flex items-start gap-2.5 cursor-pointer group select-none">
          <div className="pt-0.5 flex-shrink-0">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-[#004225] border-2 border-gray-300 rounded focus:ring-[#004225]"
            />
          </div>
          <span className="font-sans text-[10px] text-[#1A1A1A]/90 group-hover:text-[#004225] transition-colors leading-snug">
            I agree to upload verification photos and share other personal information for the purpose of tracking.
          </span>
        </label>

        <div className="flex flex-col gap-2 items-center">
          <button 
            type="button"
            disabled={!agreed || isSubmitting}
            onClick={onAccept}
            className="w-full h-11 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#00301a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-[#CBA052] border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              <>
                <span>I Agree &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
