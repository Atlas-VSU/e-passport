import React from "react";
import { User, Hash, Mail, Key, Eye, EyeOff } from "lucide-react";

interface SignUpFieldsProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  studentId: string;
  setStudentId: (val: string) => void;
  signupEmail: string;
  setSignupEmail: (val: string) => void;
  signupPassword: string;
  setSignupPassword: (val: string) => void;
  signupConfirm: string;
  setSignupConfirm: (val: string) => void;
  showSignupPassword: boolean;
  setShowSignupPassword: (val: boolean) => void;
  inputClass: string;
  labelClass: string;
  iconWrap: string;
  iconSlotClass: string;
}

export default function SignUpFields({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  studentId,
  setStudentId,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupConfirm,
  setSignupConfirm,
  showSignupPassword,
  setShowSignupPassword,
  inputClass,
  labelClass,
  iconWrap,
  iconSlotClass,
}: SignUpFieldsProps) {
  return (
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
  );
}
