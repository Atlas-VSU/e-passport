import React from "react";

export function VerisMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l8 16 8-16M8 4l4 8 4-8" />
    </svg>
  );
}

interface VerisFooterProps {
  className?: string;
  variant?: "light" | "dark";
}

export default function VerisFooter({
  className = "",
  variant = "light",
}: VerisFooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={`w-full py-4 text-center flex flex-col items-center justify-center gap-1 font-sans ${className}`}
    >
      <div
        className={`flex items-center justify-center gap-1.5 text-xs ${
          isDark ? "text-white/70" : "text-gray-500"
        }`}
      >
        <span>Powered by</span>
        <span
          className={`inline-flex items-center gap-1 font-mono text-xs font-bold tracking-wider ${
            isDark ? "text-[#CBA052]" : "text-[#004225]"
          }`}
        >
          <VerisMark
            className={`w-3.5 h-3.5 ${
              isDark ? "text-[#CBA052]" : "text-[#004225]"
            }`}
          />
          VERIS
        </span>
      </div>
      <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>
        © {new Date().getFullYear()} VERIS. All rights reserved.
      </p>
    </footer>
  );
}
