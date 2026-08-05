import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface ConsentFooterProps {
  onAccept: () => void;
  isSubmitting: boolean;
}

export default function ConsentFooter({ onAccept, isSubmitting }: ConsentFooterProps) {
  const [agreed, setAgreed] = useState(false);

  return (
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
  );
}
