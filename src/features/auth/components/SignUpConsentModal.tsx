import React from "react";
import { X } from "lucide-react";
import ConsentHeader from "./ConsentHeader";
import ConsentContent from "./ConsentContent";

interface SignUpConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function SignUpConsentModal({
  isOpen,
  onClose,
  onAccept,
}: SignUpConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md max-h-[85vh] bg-[#FDF9F0] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-[#CBA052]">
        <div className="relative">
          <ConsentHeader />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <ConsentContent />
        </div>
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 px-4 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-xl text-center shadow hover:bg-[#00301a] transition-all"
          >
            I Agree & Accept
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-gray-100 text-gray-700 font-sans text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
