import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import LoginCover from "./LoginCover";
import AuthModeSwitcher from "./AuthModeSwitcher";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

type AuthMode = "login" | "signup";

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (
    firstName: string,
    lastName: string,
    studentId: string,
    email: string,
    password: string,
  ) => void;
  isLoggingIn: boolean;
  authError: string | null;
  /** Called whenever the user switches between Sign In / Register.
   *  Wire this to clear parent-owned authError so a stale error from
   *  one mode doesn't linger after switching to the other. */
  onModeChange?: () => void;
}

// Shared style tokens passed to form subcomponents
const inputClass =
  "w-full font-sans text-[#1A1A1A] pb-2 pr-2 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0";
const labelClass = "font-sans text-[11px] text-gray-500 font-medium";
const iconWrap =
  "flex items-center gap-2 bg-white/40 rounded-lg px-2 border-b-2 border-[#CBA052]/50 focus-within:bg-white focus-within:shadow-sm focus-within:border-[#004225] transition-all py-1";
const iconSlotClass = "w-5 flex justify-center shrink-0";

export default function LoginView({
  onLogin,
  onSignUp,
  isLoggingIn,
  authError,
  onModeChange,
}: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    onModeChange?.();
  };

  return (
    <main className="w-full min-h-screen bg-[#FDF9F0] p-4 md:p-6 flex flex-col gap-4">
      {/* ── COVER ── */}
      <LoginCover />

      {/* ── CARD ── */}
      <section
        aria-labelledby="auth-form-heading"
        className="relative z-20 -mt-10 rounded-b-4xl border-2 border-dashed border-[#CBA052]/40 bg-[#FFFDF8] p-4 pt-16 shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="absolute inset-x-0 -top-3 h-8 bg-[#FFFDF8] bg-[radial-gradient(circle_at_top,rgba(255,253,248,0.96)_20%,transparent_20%)] bg-size-[16px_16px]" />
        <div className="absolute inset-x-6 -top-5 h-1 border-t-15 border-dashed border-[#CBA052]/90" />
        <div className="absolute left-1/2 -top-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#CBA052]/90 bg-[#004225] shadow-sm" />
        <h2 id="auth-form-heading" className="sr-only">
          Authentication form
        </h2>

        {/* Mode Switcher */}
        <AuthModeSwitcher mode={mode} onSwitchMode={switchMode} />

        {authError && (
          <div className="flex items-center justify-center gap-2 bg-[#FBEAEA] border border-[#E8B4B4] text-[#8B2E2E] text-xs font-sans rounded-2xl px-4 py-3 text-center mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <LoginForm
            onLogin={onLogin}
            isLoggingIn={isLoggingIn}
            onSwitchToSignup={() => switchMode("signup")}
            inputClass={inputClass}
            labelClass={labelClass}
            iconWrap={iconWrap}
            iconSlotClass={iconSlotClass}
          />
        )}

        {/* ── SIGN UP FORM ── */}
        {mode === "signup" && (
          <SignUpForm
            onSignUp={onSignUp}
            isLoggingIn={isLoggingIn}
            onSwitchToLogin={() => switchMode("login")}
            inputClass={inputClass}
            labelClass={labelClass}
            iconWrap={iconWrap}
            iconSlotClass={iconSlotClass}
          />
        )}
      </section>
    </main>
  );
}
