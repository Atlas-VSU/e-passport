import React, { useState } from 'react';
import { LogIn, Key, Mail, Eye, EyeOff, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, name: string) => void;
  onGoogleLogin: () => void;
  isLoggingIn: boolean;
}

export default function LoginView({ onLogin, onGoogleLogin, isLoggingIn }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isVisitorMode, setIsVisitorMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email, guestName || email.split('@')[0]);
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) return;
    onLogin(`${guestName.toLowerCase().replace(/\s+/g, '-')}@visitor.vsu.edu.ph`, guestName);
  };

  return (
    <div className="w-full max-w-[380px] h-[720px] mx-auto bg-[#FDF9F0] rounded-[48px] shadow-2xl border-[8px] border-[#1A1A1A] p-6 md:p-8 relative overflow-y-auto flex flex-col gap-6 my-4">
      {/* Decorative Stamp Slot (top right) */}
      <div className="absolute top-4 right-4 w-12 h-12 border-2 border-dashed border-[#CBA052]/40 rounded-md flex items-center justify-center opacity-60">
        <ShieldCheck className="text-[#CBA052] w-5 h-5" />
      </div>

      {/* Header section with University Seal */}
      <header className="text-center flex flex-col items-center gap-3 mt-4">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-[#CBA052] shadow-inner overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp2sBzLI1xPXv6z2EFg4v-JE_X6la7unIVAMQnw7cqVXBeyK-Au3VpRS4T7RQ7GVjjVK0yI8RJ_4X-BXafhexkK9hxwSxKaOxIdUZlsoENaNpY3xMF62WDVCjJzFIppAxom80idElG7DfkvGaqHoI2tmISZjqXX5_ouxxjU4SBQQ63OWjzcKJZMM7S0Np8n_Fg8mFiEmRhoOkc1MOsk6CXXiTA5f715hqQOjztMqWW01aBRKEDKH_ZRA" 
            alt="Visayas State University Seal" 
          />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <h1 className="font-serif text-2xl font-black text-[#004225] uppercase tracking-wider">
            VSU E-Passport
          </h1>
          <p className="font-sans text-xs text-[#1A1A1A]/80 max-w-[220px] mx-auto leading-normal">
            Your digital journey through Visayas State University.
          </p>
        </div>
      </header>

      {/* Forms Section */}
      {!isVisitorMode ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-1">
          <div className="flex flex-col gap-4">
            {/* Student ID / Email Input */}
            <div className="flex flex-col gap-1 relative">
              <label className="font-mono text-[9px] text-[#004225] font-extrabold uppercase tracking-widest" htmlFor="email">
                Student ID / Email
              </label>
              <div className="flex items-center relative border-b-2 border-[#CBA052]/50 focus-within:border-[#004225] transition-all">
                <Mail className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email"
                  required
                  className="w-full font-sans text-[#1A1A1A] pb-2 pl-7 pr-2 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1 relative">
              <label className="font-mono text-[9px] text-[#004225] font-extrabold uppercase tracking-widest" htmlFor="password">
                Password
              </label>
              <div className="flex items-center relative border-b-2 border-[#CBA052]/50 focus-within:border-[#004225] transition-all">
                <Key className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full font-sans text-[#1A1A1A] pb-2 pl-7 pr-10 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2.5 text-gray-400 hover:text-[#004225] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00301a] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              <span>Sign In</span>
              <LogIn className="w-4 h-4" />
            </button>

            {/* Google OAuth Button */}
            <button 
              type="button"
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 bg-white text-[#004225] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-3 border-2 border-[#004225] hover:bg-[#CBA052]/10 active:scale-[0.98] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.42 8.78 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.58l3.76 2.91c2.2-2.03 3.47-5.01 3.47-8.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.08 10.71c-.24-.73-.38-1.51-.38-2.31s.14-1.58.38-2.31L1.25 5.12C.45 6.72 0 8.51 0 10.4s.45 3.68 1.25 5.28l3.83-2.97z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.05.7-2.39 1.12-4.2 1.12-3.22 0-5.99-2.38-6.92-5.67l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
                />
              </svg>
              <span>Google Sign In</span>
            </button>

            <div className="text-center">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert("Verification link sent to your registered academic email."); }}
                className="font-mono text-[9px] text-[#004225] hover:text-[#CBA052] underline decoration-[#004225]/30 underline-offset-4 transition-colors font-bold"
              >
                Forgot Password?
              </a>
            </div>
          </div>
        </form>
      ) : (
        /* Visitor Pass Mode */
        <form onSubmit={handleVisitorSubmit} className="flex flex-col gap-5 mt-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 relative">
              <label className="font-mono text-[9px] text-[#004225] font-extrabold uppercase tracking-widest" htmlFor="visitorName">
                Visitor Full Name
              </label>
              <div className="flex items-center relative border-b-2 border-[#CBA052]/50 focus-within:border-[#004225] transition-all">
                <Mail className="text-[#004225] absolute left-0 bottom-2.5 w-4 h-4" />
                <input 
                  id="visitorName"
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name (e.g. John Doe)"
                  required
                  className="w-full font-sans text-[#1A1A1A] pb-2 pl-7 pr-2 bg-transparent text-xs md:text-sm placeholder:text-gray-400 outline-none border-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-[#004225] text-[#CBA052] font-mono text-xs uppercase tracking-widest font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00301a] active:scale-[0.98] transition-all shadow-md"
            >
              <span>Issue Visitor Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              type="button"
              onClick={() => setIsVisitorMode(false)}
              className="w-full h-11 border-2 border-[#004225] text-[#004225] hover:bg-[#CBA052]/10 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-2xl flex items-center justify-center gap-2"
            >
              Back to Student Login
            </button>
          </div>
        </form>
      )}

      {/* Footer info: Toggle Visitor Pass */}
      {!isVisitorMode && (
        <div className="mt-auto text-center border-t border-[#CBA052]/30 pt-4">
          <p className="font-mono text-[9px] text-[#1A1A1A]/60 uppercase tracking-widest font-bold">
            Guest or Visitor?
          </p>
          <button 
            onClick={() => setIsVisitorMode(true)}
            className="inline-flex items-center gap-1 font-sans text-xs text-[#004225] font-black mt-1.5 hover:underline focus:outline-none"
          >
            <span>Register for a Visitor Pass</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#004225]" />
          </button>
        </div>
      )}
    </div>
  );
}
