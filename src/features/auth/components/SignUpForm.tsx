import React, { useState } from "react";
import {
  Key,
  Mail,
  Eye,
  EyeOff,
  User,
  Hash,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface SignUpFormProps {
  onSignUp: (
    firstName: string,
    lastName: string,
    studentId: string,
    email: string,
    password: string,
  ) => void;
  isLoggingIn: boolean;
  onSwitchToLogin: () => void;
  inputClass: string;
  labelClass: string;
  iconWrap: string;
  iconSlotClass: string;
}

export default function SignUpForm({
  onSignUp,
  isLoggingIn,
  onSwitchToLogin,
  inputClass,
  labelClass,
  iconWrap,
  iconSlotClass,
}: SignUpFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");

  const STUDENT_ID_PATTERN = /^\d{2}-\d-\d{5}$/;

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
        "Student ID must be in the format XX-X-XXXXX (e.g. 26-1-00067).",
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

  return (
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
                placeholder="e.g. 26-1-00067"
                pattern="\d{2}-\d-\d{5}"
                title="Format: XX-X-XXXXX (e.g. 26-1-00067)"
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
            onClick={onSwitchToLogin}
            className="text-[#004225] font-black underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}
