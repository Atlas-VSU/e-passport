import React from "react";
import { ShieldCheck } from "lucide-react";

interface SignUpConsentSectionProps {
  consentGiven: boolean;
  hasOpenedPolicy: boolean;
  onConsentChange: (checked: boolean) => void;
  onInterceptClick: (e: React.MouseEvent) => void;
  onOpenPolicy: () => void;
}

export default function SignUpConsentSection({
  consentGiven,
  hasOpenedPolicy,
  onConsentChange,
  onInterceptClick,
  onOpenPolicy,
}: SignUpConsentSectionProps) {
  return (
    <div
      className={`rounded-2xl border ${
        hasOpenedPolicy
          ? "border-[#CBA052]/40 bg-[#FAF7F0]"
          : "border-[#004225]/20 bg-[#F5F2E9]"
      } p-3.5 flex flex-col gap-2.5 transition-all`}
    >
      <label
        onClick={onInterceptClick}
        className="flex items-start gap-2.5 cursor-pointer group select-none"
      >
        <div className="pt-0.5 flex-shrink-0">
          <input
            id="signup-consent-checkbox"
            type="checkbox"
            checked={consentGiven}
            disabled={!hasOpenedPolicy}
            onChange={(e) => {
              if (hasOpenedPolicy) {
                onConsentChange(e.target.checked);
              }
            }}
            className="w-4 h-4 text-[#004225] border-2 border-gray-300 rounded focus:ring-[#004225] cursor-pointer disabled:opacity-50"
          />
        </div>
        <span className="font-sans text-[11px] text-[#1A1A1A]/90 group-hover:text-[#004225] transition-colors leading-snug">
          I consent to providing my personal details, capturing my photos, and verifying my account information.
        </span>
      </label>

      <div className="flex items-center justify-between pt-1 border-t border-[#004225]/5">
        {!hasOpenedPolicy ? (
          <span className="font-sans text-[10px] text-[#8B2E2E] font-medium animate-pulse flex items-center gap-1">
            * Read policy below to unlock checkbox
          </span>
        ) : (
          <span className="font-sans text-[10px] text-[#004225] font-medium flex items-center gap-1">
            ✓ Policy reviewed
          </span>
        )}
        <button
          type="button"
          onClick={onOpenPolicy}
          className="font-sans text-[10px] font-bold text-[#004225] hover:underline flex items-center gap-1.5 ml-auto"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#CBA052]" />
          <span>
            {hasOpenedPolicy
              ? "Review Data Privacy Policy"
              : "Read Data Privacy Policy"}
          </span>
        </button>
      </div>
    </div>
  );
}
