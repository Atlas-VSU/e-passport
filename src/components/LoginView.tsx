import React, { useState } from 'react';
import { LogIn, Key, Mail, Eye, EyeOff, ShieldCheck, UserPlus, User, Hash, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (firstName: string, lastName: string, studentId: string, email: string, password: string) => void;
  isLoggingIn: boolean;
  authError: string | null;
}

export default function LoginView({ onLogin, onSignUp, isLoggingIn, authError }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [loginSubmitError, setLoginSubmitError] = useState('');

  // Sign Up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupErrors, setSignupErrors] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [signupSubmitError, setSignupSubmitError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = { email: '', password: '' };

    if (!loginEmail.trim()) {
      nextErrors.email = 'Please enter your email.';
    }
    if (!loginPassword.trim()) {
      nextErrors.password = 'Please enter your password.';
    }

    setLoginErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      setLoginSubmitError('Please fill in all fields');
      return;
    }

    setLoginSubmitError('');
    onLogin(loginEmail.trim(), loginPassword);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedStudentId = studentId.trim();
    const trimmedSignupEmail = signupEmail.trim();
    const trimmedSignupPassword = signupPassword.trim();
    const trimmedSignupConfirm = signupConfirm.trim();

    const nextErrors = {
      firstName: '',
      lastName: '',
      studentId: '',
      email: '',
      password: '',
      confirm: '',
    };

    if (!trimmedFirstName) nextErrors.firstName = 'Please enter your first name.';
    if (!trimmedLastName) nextErrors.lastName = 'Please enter your last name.';
    if (!trimmedStudentId) nextErrors.studentId = 'Please enter your student ID.';
    if (!trimmedSignupEmail) nextErrors.email = 'Please enter your email.';
    if (!trimmedSignupPassword) nextErrors.password = 'Please enter a password.';
    if (!trimmedSignupConfirm) nextErrors.confirm = 'Please confirm your password.';

    setSignupErrors(nextErrors);
    setSignupError('');
    setSignupSubmitError('');

    if (nextErrors.firstName || nextErrors.lastName || nextErrors.studentId || nextErrors.email || nextErrors.password || nextErrors.confirm) {
      setSignupSubmitError('Please fill in all fields');
      return;
    }

    if (trimmedSignupPassword !== trimmedSignupConfirm) {
      setSignupErrors((prev) => ({ ...prev, confirm: 'Passwords do not match.' }));
      setSignupError('Passwords do not match.');
      return;
    }
    if (trimmedSignupPassword.length < 6) {
      setSignupErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }));
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    onSignUp(trimmedFirstName, trimmedLastName, trimmedStudentId, trimmedSignupEmail, trimmedSignupPassword);
  };

  const inputClass =
    'w-full font-sans text-[#1A1A1A] pb-2 pl-7 pr-2 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0';
  const labelClass =
    'font-mono text-[9px] text-[#004225] font-extrabold uppercase tracking-widest';
  const iconWrap =
    'flex items-center relative border-b-2 border-[#CBA052]/50 focus-within:border-[#004225] transition-all';

  return (
    <div className="w-full min-h-screen bg-[#FDF9F0] p-6 relative overflow-y-auto flex flex-col gap-5">

      {/* Header */}
      <header className="text-center flex flex-col items-center gap-3 mt-4">
        <div className="flex flex-row items-center gap-3">
          <div className="w-17 h-20 bg-white flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full"
              src="/vsu-brand-logo.png"
              alt="Visayas State University Seal"
            />
          </div>
            <div className="w-20 h-20 bg-white flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full"
              src="/ussc-logo.png"
              alt="USSC Logo"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <h1 className="font-serif text-2xl font-black text-[#004225] uppercase tracking-wider">
            USSC E-Passport
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/80 max-w-[220px] mx-auto leading-normal">
            Discover the iconic landmarks of Visayas State University!
          </p>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="flex rounded-2xl overflow-hidden border-2 border-[#004225] bg-white">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'login'
              ? 'bg-[#004225] text-[#CBA052]'
              : 'text-[#004225] hover:bg-[#CBA052]/10'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-[#004225] text-[#CBA052]'
              : 'text-[#004225] hover:bg-[#CBA052]/10'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Register
        </button>
      </div>

      {/* Error Banner */}
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-xl px-4 py-3 text-center">
          {authError}
        </div>
      )}

      {/* ─── LOGIN FORM ─── */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
          {(loginSubmitError || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-xl px-4 py-2.5 text-center" role="alert">
              {loginSubmitError || authError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="login-email">Email</label>
              <div className={iconWrap}>
                <Mail className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginErrors.email) {
                      setLoginErrors((prev) => ({ ...prev, email: '' }));
                    }
                    if (loginSubmitError) {
                      setLoginSubmitError('');
                    }
                  }}
                  placeholder="student@vsu.edu.ph"
                  required
                  className={inputClass}
                />
              </div>
              {loginErrors.email && <p className="text-[10px] text-red-600 font-sans">{loginErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="login-password">Password</label>
              <div className={iconWrap}>
                <Key className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginErrors.password) {
                      setLoginErrors((prev) => ({ ...prev, password: '' }));
                    }
                    if (loginSubmitError) {
                      setLoginSubmitError('');
                    }
                  }}
                  placeholder="••••••••"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-0 bottom-2.5 text-gray-400 hover:text-[#004225] transition-colors focus:outline-none"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && <p className="text-[10px] text-red-600 font-sans">{loginErrors.password}</p>}
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
            <p className="font-mono text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#004225] font-black underline underline-offset-2"
              >
                Register now
              </button>
            </p>
          </div>
        </form>
      )}

      {/* ─── SIGN UP FORM ─── */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
          {(signupSubmitError || signupError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-xl px-4 py-2.5 text-center" role="alert">
              {signupSubmitError || signupError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* First Name + Last Name row */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className={labelClass} htmlFor="first-name">First Name</label>
                <div className={iconWrap}>
                  <User className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (signupErrors.firstName) {
                        setSignupErrors((prev) => ({ ...prev, firstName: '' }));
                      }
                      if (signupSubmitError) {
                        setSignupSubmitError('');
                      }
                    }}
                    placeholder="Juan"
                    required
                    className={inputClass}
                  />
                </div>
                {signupErrors.firstName && <p className="text-[10px] text-red-600 font-sans">{signupErrors.firstName}</p>}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className={labelClass} htmlFor="last-name">Last Name</label>
                <div className={iconWrap}>
                  <User className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (signupErrors.lastName) {
                        setSignupErrors((prev) => ({ ...prev, lastName: '' }));
                      }
                      if (signupSubmitError) {
                        setSignupSubmitError('');
                      }
                    }}
                    placeholder="dela Cruz"
                    required
                    className={inputClass}
                  />
                </div>
                {signupErrors.lastName && <p className="text-[10px] text-red-600 font-sans">{signupErrors.lastName}</p>}
              </div>
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="student-id">Student ID</label>
              <div className={iconWrap}>
                <Hash className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="student-id"
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    if (signupErrors.studentId) {
                      setSignupErrors((prev) => ({ ...prev, studentId: '' }));
                    }
                    if (signupSubmitError) {
                      setSignupSubmitError('');
                    }
                  }}
                  placeholder="e.g. 2024-12345"
                  required
                  className={inputClass}
                />
              </div>
              {signupErrors.studentId && <p className="text-[10px] text-red-600 font-sans">{signupErrors.studentId}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="signup-email">Email</label>
              <div className={iconWrap}>
                <Mail className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (signupErrors.email) {
                      setSignupErrors((prev) => ({ ...prev, email: '' }));
                    }
                    if (signupSubmitError) {
                      setSignupSubmitError('');
                    }
                  }}
                  placeholder="student@vsu.edu.ph"
                  required
                  className={inputClass}
                />
              </div>
              {signupErrors.email && <p className="text-[10px] text-red-600 font-sans">{signupErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="signup-password">Password</label>
              <div className={iconWrap}>
                <Key className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (signupErrors.password) {
                      setSignupErrors((prev) => ({ ...prev, password: '' }));
                    }
                    if (signupSubmitError) {
                      setSignupSubmitError('');
                    }
                  }}
                  placeholder="Min. 6 characters"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-0 bottom-2.5 text-gray-400 hover:text-[#004225] transition-colors focus:outline-none"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupErrors.password && <p className="text-[10px] text-red-600 font-sans">{signupErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="signup-confirm">Confirm Password</label>
              <div className={iconWrap}>
                <Key className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input
                  id="signup-confirm"
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupConfirm}
                  onChange={(e) => {
                    setSignupConfirm(e.target.value);
                    if (signupErrors.confirm) {
                      setSignupErrors((prev) => ({ ...prev, confirm: '' }));
                    }
                    if (signupSubmitError) {
                      setSignupSubmitError('');
                    }
                  }}
                  placeholder="Re-enter password"
                  required
                  className={`${inputClass} pr-10`}
                />
              </div>
              {signupErrors.confirm && <p className="text-[10px] text-red-600 font-sans">{signupErrors.confirm}</p>}
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
            <p className="font-mono text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#004225] font-black underline underline-offset-2"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
