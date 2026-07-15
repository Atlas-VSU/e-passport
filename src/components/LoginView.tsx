import React, { useState } from "react";
import {
  LogIn,
  Key,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  User,
  Hash,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

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

export default function LoginView({
  onLogin,
  onSignUp,
  isLoggingIn,
  authError,
  onModeChange,
}: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");

  const STUDENT_ID_PATTERN = /^\d{2}-\d-\d{5}$/;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    onLogin(loginEmail, loginPassword);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (
      !firstName ||
      !lastName ||
      !studentId ||
      !signupEmail ||
      !signupPassword
    )
      return;
    if (!STUDENT_ID_PATTERN.test(studentId)) {
      setSignupError(
        "Student ID must be in the format XX-X-XXXXX (e.g. 24-1-00067).",
      );
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    onSignUp(firstName, lastName, studentId, signupEmail, signupPassword);
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setSignupError("");
    onModeChange?.();
  };

  const inputClass =
    "w-full font-sans text-[#1A1A1A] pb-2 pr-2 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0";
  const labelClass = "font-sans text-[11px] text-gray-500 font-medium";
  const iconWrap =
    "flex items-center gap-2 bg-white/40 rounded-lg px-2 border-b-2 border-[#CBA052]/50 focus-within:bg-white focus-within:shadow-sm focus-within:border-[#004225] transition-all py-1";
  const iconSlotClass = "w-5 flex justify-center shrink-0";

  return (
    <main className="w-full min-h-screen bg-[#FDF9F0] p-4 md:p-6 flex flex-col gap-4">
      {/* ── COVER ── */}
      <section className="relative overflow-hidden rounded-t-4xl border border-[#00321c]/30 bg-[#004225] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 20 C10 0 30 40 40 20' fill='none' stroke='%23f4deb2' stroke-width='1' opacity='0.45'/%3E%3Cpath d='M0 30 C10 10 30 50 40 30' fill='none' stroke='%23d8c184' stroke-width='1' opacity='0.24'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-x-4 bottom-3 h-px bg-[#CBA052]/40" />

        <header className="relative flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center gap-5 px-3 py-2  overflow-hidden">
            <div className="w-15 h-15 md:w-17 md:h-17 flex items-center justify-center overflow-hidden ">
              <img
                className="h-full w-full object-contain"
                src="/vsu-brand-logo.png"
                alt="Visayas State University Seal"
              />
            </div>
            <div className="w-15 h-15 md:w-17 md:h-17  flex items-center justify-center overflow-hidden ">
              <img
                className="w-full h-full"
                src="/ussc-logo.png"
                alt="USSC Logo"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CBA052]/30 bg-[#00321c]/40 px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#CBA052]" />
              <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-[#CBA052]/90">
                Official Entry Pass
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-[#F4D78A] uppercase tracking-[0.28em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
              USSC E-Passport
            </h1>
            <p className="font-sans text-xs text-[#F6EEDC]/80 max-w-65 mx-auto leading-normal pb-8">
              Your digital ticket to the iconic VSU landmarks.
            </p>
          </div>
        </header>
      </section>

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

        {/* Mode switcher lives outside the forms, since login and signup are separate forms below */}
        <div className="relative flex rounded-2xl overflow-hidden border-2 border-[#004225] bg-white shadow-sm -mt-8 z-10 mb-4">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-[#004225] text-[#CBA052]"
                : "text-[#004225] hover:bg-[#CBA052]/10"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-[#004225] text-[#CBA052]"
                : "text-[#004225] hover:bg-[#CBA052]/10"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
        </div>

        {authError && (
          <div className="flex items-center justify-center gap-2 bg-[#FBEAEA] border border-[#E8B4B4] text-[#8B2E2E] text-xs font-sans rounded-2xl px-4 py-3 text-center mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
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
                  onClick={() => switchMode("signup")}
                  className="text-[#004225] font-black underline underline-offset-2"
                >
                  Register now
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ── SIGN UP FORM ── */}
        {mode === "signup" && (
          <form
            onSubmit={handleSignUpSubmit}
            className="relative flex flex-col gap-4"
          >
            {signupError && (
              <div className="flex items-center justify-center gap-2 bg-[#FBEAEA] border border-[#E8B4B4] text-[#8B2E2E] text-xs font-sans rounded-2xl px-4 py-2.5 text-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signupError}</span>
              </div>
            )}

            <div className="relative space-y-4 rounded-3xl border border-[#004225]/10 bg-white p-4">
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="space-y-1 flex-1">
                    <p className={labelClass}>First Name</p>
                    <div className={iconWrap}>
                      <span className={iconSlotClass}>
                        <User className="text-[#004225] w-4 h-4" />
                      </span>
                      <input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Juan"
                        required
                        className={inputClass}
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <p className={labelClass}>Last Name</p>
                    <div className={iconWrap}>
                      <span className={iconSlotClass}>
                        <User className="text-[#004225] w-4 h-4" />
                      </span>
                      <input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="dela Cruz"
                        required
                        className={inputClass}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Student ID</p>
                  <div className={iconWrap}>
                    <span className={iconSlotClass}>
                      <Hash className="text-[#004225] w-4 h-4" />
                    </span>
                    <input
                      id="student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 24-1-00067"
                      pattern="\d{2}-\d-\d{5}"
                      title="Format: XX-X-XXXXX (e.g. 24-1-00067)"
                      maxLength={10}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1">
                  <p className={labelClass}>Email</p>
                  <div className={iconWrap}>
                    <span className={iconSlotClass}>
                      <Mail className="text-[#004225] w-4 h-4" />
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
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
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      aria-label={
                        showSignupPassword ? "Hide password" : "Show password"
                      }
                      className="text-gray-400 hover:text-[#004225] transition-colors focus:outline-none flex items-center justify-center shrink-0"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Confirm Password</p>
                  <div className={iconWrap}>
                    <span className={iconSlotClass}>
                      <Key className="text-[#004225] w-4 h-4" />
                    </span>
                    <input
                      id="signup-confirm"
                      type={showSignupPassword ? "text" : "password"}
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00301a] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 mt-1"
            >
              {isLoggingIn ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="font-sans text-xs text-gray-500 normal-case">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[#004225] font-black underline underline-offset-2"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
