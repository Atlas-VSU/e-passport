import React, { useState } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import SignUpFields from "./SignUpFields";
import SignUpConsentSection from "./SignUpConsentSection";
import SignUpConsentModal from "./SignUpConsentModal";

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
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasOpenedPolicy, setHasOpenedPolicy] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [signupError, setSignupError] = useState("");

  const STUDENT_ID_PATTERN = /^\d{2}-\d-\d{5}$/;

  const handleSignUpSubmit = async (e: React.FormEvent) => {
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
        "Student ID must be in the format XX-X-XXXXX (e.g. 26-1-00067)."
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
    if (!hasOpenedPolicy) {
      setSignupError("Please review the Data Privacy Policy terms before registering.");
      setShowConsentModal(true);
      setHasOpenedPolicy(true);
      return;
    }
    if (!consentGiven) {
      setSignupError("You must agree to account verification, photo capture, and data accuracy terms before registering.");
      return;
    }
    await onSignUp(firstName, lastName, studentId, signupEmail, signupPassword);
    
    // Clear registration fields
    setFirstName("");
    setLastName("");
    setStudentId("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirm("");
    setConsentGiven(false);
    setHasOpenedPolicy(false);
    setSignupError("");
  };

  const handleInterceptClick = (e: React.MouseEvent) => {
    if (!hasOpenedPolicy) {
      e.preventDefault();
      setShowConsentModal(true);
      setHasOpenedPolicy(true);
      setSignupError("Please review the Data Privacy Policy terms to enable agreement.");
    }
  };

  const handleOpenPolicy = () => {
    setShowConsentModal(true);
    setHasOpenedPolicy(true);
    if (signupError.includes("Policy")) setSignupError("");
  };

  const handleAcceptModal = () => {
    setConsentGiven(true);
    setHasOpenedPolicy(true);
    setShowConsentModal(false);
    if (signupError.includes("consent") || signupError.includes("Policy")) {
      setSignupError("");
    }
  };

  const handleCloseModal = () => {
    setShowConsentModal(false);
    setHasOpenedPolicy(true);
  };

  return (
    <>
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

        <SignUpFields
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          studentId={studentId}
          setStudentId={setStudentId}
          signupEmail={signupEmail}
          setSignupEmail={setSignupEmail}
          signupPassword={signupPassword}
          setSignupPassword={setSignupPassword}
          signupConfirm={signupConfirm}
          setSignupConfirm={setSignupConfirm}
          showSignupPassword={showSignupPassword}
          setShowSignupPassword={setShowSignupPassword}
          inputClass={inputClass}
          labelClass={labelClass}
          iconWrap={iconWrap}
          iconSlotClass={iconSlotClass}
        />

        <SignUpConsentSection
          consentGiven={consentGiven}
          hasOpenedPolicy={hasOpenedPolicy}
          onConsentChange={(checked) => {
            setConsentGiven(checked);
            if (checked && signupError.includes("consent")) {
              setSignupError("");
            }
          }}
          onInterceptClick={handleInterceptClick}
          onOpenPolicy={handleOpenPolicy}
        />

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

      <SignUpConsentModal
        isOpen={showConsentModal}
        onClose={handleCloseModal}
        onAccept={handleAcceptModal}
      />
    </>
  );
}
