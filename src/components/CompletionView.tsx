import React from 'react';
import { Award, Download, Share2, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Landmark, Stamp } from '../types';

interface CompletionViewProps {
  landmarks: Landmark[];
  stamps: Stamp[];
  userName: string;
  onReset: () => void;
}

export default function CompletionView({ landmarks, stamps, userName, onReset }: CompletionViewProps) {
  // Landmarks sorted by order
  const sortedLandmarks = [...landmarks].sort((a, b) => a.order - b.order);

  const handleDownload = () => {
    // Elegant toast trigger representation
    alert("✨ Preparing high-resolution VSU E-Passport certificate for: " + userName + ". Your download will begin shortly!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My VSU E-Passport Campus Tour',
        text: `I completed my academic campus tour of Visayas State University! Stamped ${stamps.length} of ${landmarks.length} landmarks!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      alert("📋 Copied journey shareable link to clipboard! Share it with friends to show your VSU achievement.");
    }
  };

  return (
    <div className="w-full h-screen bg-[#FDF9F0] flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

      {/* Top Header line with Forest Green and Gold accent */}
      <header className="bg-[#004225] text-white shadow-md relative z-10 flex items-center justify-between px-5 py-3 border-b-4 border-[#CBA052] flex-shrink-0">
        <button 
          onClick={onReset}
          className="text-[#CBA052] hover:text-white transition-all p-2 -ml-2 rounded-full flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-extrabold"
          title="Restart Journey"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
        <h1 className="font-serif text-sm font-black italic tracking-wide text-white">
          VSU CAMPUS TOUR
        </h1>
        <div className="w-14"></div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10 flex flex-col gap-4">
        
        {/* Congratulatory Hero Message */}
        <div className="text-center mb-1 mt-1">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
            className="inline-flex items-center gap-1 bg-[#004225]/15 border border-[#CBA052] text-[#004225] font-mono text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2 shadow-sm"
          >
            <Sparkles className="w-3 h-3 fill-[#CBA052]" />
            JOURNEY COMPLETE
          </motion.div>
          <h2 className="font-serif text-xl font-black text-[#1A1A1A] tracking-tight leading-none">
            Congratulations!
          </h2>
          <p className="font-sans text-[11px] text-[#1A1A1A]/70 mt-1 leading-normal">
            Dear <span className="font-extrabold text-[#004225]">{userName}</span>, your university campus tour is complete.
          </p>
        </div>

        {/* The Passport Grid Booklet */}
        <div className="relative w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-2 flex flex-col gap-4">
          
          {/* Stamps Grid (2 Columns, 3 Rows) */}
          <div className="grid grid-cols-2 gap-3 w-full relative z-10">
            {sortedLandmarks.map((lm, idx) => {
              const matchedStamp = stamps.find((s) => s.landmark_id === lm.id);
              const rotation = idx % 2 === 0 ? '-4deg' : '4deg';
              
              return (
                <motion.div 
                  key={lm.id}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.08 + 0.2, type: 'spring', stiffness: 90 }}
                  className="relative aspect-square rounded-2xl bg-[#004225]/5 flex flex-col items-center justify-center p-2 border border-gray-100"
                >
                  {matchedStamp ? (
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-[#CBA052] flex items-center justify-center relative bg-white shadow-sm"
                      style={{ transform: `rotate(${rotation})` }}
                    >
                      <Award className="text-[#004225] w-7 h-7 fill-[#CBA052]/30" />
                      
                      {/* Tiny overlay label representing actual ink stamps */}
                      <div className="absolute -top-1 -right-1.5 rotate-12 bg-[#004225] text-white font-serif text-[7px] font-black px-1 rounded border border-[#CBA052]/50 shadow-sm">
                        OK
                      </div>
                    </div>
                  ) : (
                    // Default fallback representing locked state
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-white">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}
                  
                  <span className="font-mono text-[9px] text-[#004225] font-extrabold mt-2 text-center uppercase tracking-wider truncate w-full px-1">
                    {lm.name.split(' ')[0] || 'Landmark'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Academic watermark on the page background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
            <Award className="w-48 h-48 text-[#004225]" />
          </div>
        </div>

        {/* Action Call To Actions */}
        <div className="w-full mt-auto flex flex-col gap-2.5 pb-2">
          <button 
            onClick={handleDownload}
            className="w-full h-11 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-md hover:bg-[#00301a] active:scale-[0.98] transition-all relative overflow-hidden group border border-[#CBA052]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Download className="w-3.5 h-3.5 text-[#CBA052]" />
            <span>Download Certificate</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="w-full h-11 bg-white border-2 border-[#004225] text-[#004225] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#CBA052]/10 active:scale-[0.98] transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#004225]" />
            <span>Share Journey</span>
          </button>
        </div>

      </div>
    </div>
  );
}
