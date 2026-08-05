import React from "react";
import { LogIn, UserPlus } from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthModeSwitcherProps {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}

export default function AuthModeSwitcher({ mode, onSwitchMode }: AuthModeSwitcherProps) {
  return (
    <div className="relative flex rounded-2xl overflow-hidden border-2 border-[#004225] bg-white shadow-sm -mt-8 z-10 mb-4">
      <button
        type="button"
        onClick={() => onSwitchMode("login")}
        className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${mode === "login"
          ? "bg-[#004225] text-[#CBA052]"
          : "text-[#004225] hover:bg-[#CBA052]/10"
          }`}
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onSwitchMode("signup")}
        className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${mode === "signup"
          ? "bg-[#004225] text-[#CBA052]"
          : "text-[#004225] hover:bg-[#CBA052]/10"
          }`}
      >
        <UserPlus className="w-3.5 h-3.5" />
        Register
      </button>
    </div>
  );
}
