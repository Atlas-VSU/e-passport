import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, ArrowRight, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Landmark } from '../../../types';

interface StampConfirmationViewProps {
  landmark: Landmark;
  onContinue: () => void;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  isRound: boolean;
}

export default function StampConfirmationView({ landmark, onContinue }: StampConfirmationViewProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate beautiful random confetti pieces
    const colors = ['#fcd400', '#bdedd2', '#ffffff', '#3b6751', '#ffe16d'];
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      isRound: Math.random() > 0.5
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden z-50 p-5 text-white select-none"
      style={{
        backgroundColor: '#F2E9D3',
      }}
    >
      {/* Light leather texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/textures/leather.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply',
          opacity: 0.08
        }}
      />

      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: -50, x: `${c.left}vw`, rotate: 0, opacity: 1 }}
            animate={{
              y: '105vh',
              rotate: 360 + Math.random() * 360,
              opacity: 0
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              ease: 'linear',
              repeat: 0
            }}
            className="absolute"
            style={{
              backgroundColor: c.color,
              width: `${c.size}px`,
              height: c.isRound ? `${c.size}px` : `${c.size * 1.8}px`,
              borderRadius: c.isRound ? '50%' : '3px',
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <main className="relative z-20 flex flex-col items-center justify-between w-full max-w-[390px] h-[85vh] py-8">

        {/* Stamp Circle slam down animation */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.div
            initial={{ scale: 3.5, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 105,
              damping: 12,
              delay: 0.1
            }}
            className="relative p-[6px] border-4 border-[#CBA052] rounded-full bg-[#fff8f5] shadow-[0_8px_32px_rgba(203,160,82,0.25)] mb-8 max-w-[210px]"
          >
            {/* Inner dashed ring */}
            <div className="border-2 border-dashed border-[#ffe16d] rounded-full p-6 flex flex-col items-center justify-center w-40 h-40 bg-white">
              <CheckCircle className="w-16 h-16 text-[#004225] fill-[#ffe16d]" />
              <h2 className="font-serif text-2xl font-black text-[#004225] tracking-wide mt-2">
                STAMPED!
              </h2>
            </div>
          </motion.div>

          {/* Location details card (styled dark green for contrast on light background) */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center w-full max-w-xs bg-[#0F2819]/95 p-6 rounded-2xl border border-[#CBA052]/30 shadow-xl flex flex-col items-center gap-3"
          >
            <span className="font-mono text-[9px] text-[#ffe16d] font-bold uppercase tracking-widest bg-[#ffe16d]/20 px-3 py-1 rounded-full border border-[#ffe16d]/10">
              Location Verified
            </span>
            <h1 className="font-serif text-lg font-bold text-white mt-1">
              {landmark.name}
            </h1>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 w-full justify-center text-[#c1c8c2]">
              <Calendar className="w-3.5 h-3.5" />
              <p className="font-mono text-[9px] tracking-wider uppercase">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="w-full px-4"
        >
          <button
            onClick={onContinue}
            className="w-full h-14 bg-[#001b0f] text-[#ffe16d] font-mono text-xs uppercase tracking-widest font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#013220] active:scale-[0.98] transition-all shadow-lg border border-[#ffe16d]/20"
          >
            <Award className="w-4 h-4 text-[#ffe16d]" />
            <span>Back to Passport</span>
          </button>
        </motion.div>

      </main>
    </div>
  );
}
