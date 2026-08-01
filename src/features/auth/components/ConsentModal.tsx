import React from 'react';
import ConsentHeader from './ConsentHeader';
import ConsentContent from './ConsentContent';
import ConsentFooter from './ConsentFooter';

interface ConsentModalProps {
  onAccept: () => void;
  isSubmitting: boolean;
}

export default function ConsentModal({ onAccept, isSubmitting }: ConsentModalProps) {
  return (
    <div className="w-full h-screen bg-[#FDF9F0] flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

      <ConsentHeader />
      <ConsentContent />
      <ConsentFooter onAccept={onAccept} isSubmitting={isSubmitting} />
    </div>
  );
}
