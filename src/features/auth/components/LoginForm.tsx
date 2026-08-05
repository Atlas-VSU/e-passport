import React, { useState } from "react";
import { LogIn, Key, Mail, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  isLoggingIn: boolean;
  onSwitchToSignup: () => void;
  inputClass: string;
  labelClass: string;
  iconWrap: string;
  iconSlotClass: string;
}

export default function LoginForm({
  onLogin,
  isLoggingIn,
  onSwitchToSignup,
  inputClass,
  labelClass,
  iconWrap,
  iconSlotClass,
}: LoginFormProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    onLogin(loginEmail, loginPassword);
  };

  return (
    <form
      onSubmit={handleLoginSubmit}
      className="relative flex flex-col gap-4"
    >
      <div className="relative space-y-4 rounded-3xl border border-[#004225]/10 bg-white p-4">
        <div className="space-y-1">
          <p className={labelClass}>Email</p>
          <div className={iconWrap}>
            <span className={iconSlotClass}>
              <Mail className="text-[#004225] w-4 h-4" />
            </span>
            <input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="your_email@gmail.com"
              required
              className={inputClass}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className={labelClass}>Password</p>
          <div className={iconWrap}>
            <span className={iconSlotClass}>
              <Key className="text-[#004225] w-4 h-4" />
            </span>
            <input
              id="login-password"
              type={showLoginPassword ? "text" : "password"}
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              aria-label={
                showLoginPassword ? "Hide password" : "Show password"
              }
              className="text-gray-400 hover:text-[#004225] transition-colors focus:outline-none flex items-center justify-center shrink-0"
            >
              {showLoginPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full h-12 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00301a] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
      >
        {isLoggingIn ? (
          <span className="animate-pulse">Signing in...</span>
        ) : (
          <>
            <span>Sign In</span>
            <LogIn className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="text-center">
        <p className="font-sans text-xs text-gray-500 normal-case">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#004225] font-black underline underline-offset-2"
          >
            Register now
          </button>
        </p>
      </div>
    </form>
  );
}
