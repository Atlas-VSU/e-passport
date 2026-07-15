/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { landmarks } from './lib/landmarks';
import { Profile, Stamp, Landmark } from './types';
import ProgressTracker from './components/ProgressTracker';
import PassportRoad from './components/PassportRoad';
import ConsentModal from './components/ConsentModal';
import LoginView from './components/LoginView';
import LandmarkDetailView from './components/LandmarkDetailView';
import StampConfirmationView from './components/StampConfirmationView';
import CompletionView from './components/CompletionView';
import { getSupabase } from './lib/supabase/client';
import { LogOut, Loader2, Download } from 'lucide-react';
import { createPortal } from 'react-dom';

// Helper: safely parse JSON without throwing on HTML error pages
async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Non-JSON response from server:', text.slice(0, 300));
    return { error: `Server error (${res.status}). Check server logs.` };
  }
}

enum Page {
  LOADING,
  LOGIN,
  CONSENT,
  PASSPORT,
  LANDMARK_DETAIL,
  STAMP_CONFIRMATION,
  COMPLETION
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOADING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Session check on load — use Supabase client-side SDK directly
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase();

      if (supabase) {
        // Supabase persists session in localStorage — check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user) {
          await handleSessionUser(supabase, session.user);
          return;
        }
      }

      // No active session or Supabase not configured
      setCurrentPage(Page.LOGIN);
    }

    checkSession();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Helper: fetch profile + stamps for a logged-in Supabase user
  // ──────────────────────────────────────────────────────────────────────────
  async function handleSessionUser(supabase: any, authUser: any) {
    // Fetch profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const userProfile: Profile = profile || {
      id: authUser.id,
      first_name: authUser.user_metadata?.first_name || null,
      last_name: authUser.user_metadata?.last_name || null,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
      email: authUser.email,
      student_id: authUser.user_metadata?.student_id || null,
      avatar_url: null,
      consent_given: false,
      consent_timestamp: null,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(userProfile);
    await loadUserStamps(authUser.id);

    if (!userProfile.consent_given) {
      setCurrentPage(Page.CONSENT);
    } else {
      setCurrentPage(Page.PASSPORT);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Load user stamps (via Express API — stamps are server-managed)
  // ──────────────────────────────────────────────────────────────────────────
  const loadUserStamps = async (userId: string) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        // Fetch directly from Supabase if available
        const { data, error } = await supabase
          .from('stamps')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) {
          setStamps(data);
          if (data.length === landmarks.length) {
            setCurrentPage(Page.COMPLETION);
          }
          return;
        }
      }
      // Fallback: Express API
      const res = await fetch(`/api/stamps?userId=${userId}`);
      const data = await safeJson(res);
      if (data?.stamps) {
        setStamps(data.stamps);
        if (data.stamps.length === landmarks.length) {
          setCurrentPage(Page.COMPLETION);
        }
      }
    } catch (err) {
      console.error('Failed to load stamps:', err);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Login — Supabase client-side directly (no Express proxy)
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    setIsActionLoading(true);
    setAuthError(null);
    try {
      const supabase = getSupabase();

      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          const msg = error.message?.toLowerCase();
          if (msg?.includes('invalid') || msg?.includes('credentials') || msg?.includes('email not confirmed')) {
            setAuthError('Invalid email or password. Please try again.');
          } else {
            setAuthError(error.message || 'Login failed. Please try again.');
          }
          return;
        }

        if (data?.user) {
          await handleSessionUser(supabase, data.user);
          return;
        }
      }

      // ── Fallback to Express API when Supabase not configured ──
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const resData = await safeJson(res);

      if (!res.ok || resData?.error) {
        setAuthError(resData?.error || 'Login failed. Please check your credentials.');
        return;
      }

      if (resData?.user) {
        setCurrentUser(resData.user);
        await loadUserStamps(resData.user.id);
        if (!resData.user.consent_given) {
          setCurrentPage(Page.CONSENT);
        } else {
          setCurrentPage(Page.PASSPORT);
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      setAuthError('Failed to connect. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Sign Up — Supabase client-side directly (no Express proxy)
  // ──────────────────────────────────────────────────────────────────────────
  const handleSignUp = async (
    firstName: string,
    lastName: string,
    studentId: string,
    email: string,
    password: string
  ) => {
    setIsActionLoading(true);
    setAuthError(null);
    try {
      const supabase = getSupabase();

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              student_id: studentId,
              full_name: `${firstName} ${lastName}`,
            },
          },
        });

        if (error) {
          const msg = error.message?.toLowerCase();
          if (msg?.includes('already registered') || msg?.includes('already exists') || msg?.includes('user already')) {
            setAuthError('An account with this email already exists. Please sign in instead.');
          } else {
            setAuthError(error.message || 'Sign up failed. Please try again.');
          }
          return;
        }

        if (data?.user) {
          // Upsert profile row with all custom fields
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`,
            email,
            student_id: studentId,
            avatar_url: null,
            consent_given: false,
          }, { onConflict: 'id' });

          await handleSessionUser(supabase, data.user);
          return;
        }
      }

      // ── Fallback to Express API when Supabase not configured ──
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, studentId, email, password })
      });
      const resData = await safeJson(res);

      if (!res.ok || resData?.error) {
        setAuthError(resData?.error || 'Sign up failed. Please try again.');
        return;
      }

      if (resData?.user) {
        setCurrentUser(resData.user);
        await loadUserStamps(resData.user.id);
        setCurrentPage(Page.CONSENT);
      }
    } catch (err) {
      console.error('Sign up failed:', err);
      setAuthError('Failed to create account. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Consent agreement — write to Supabase profiles table directly
  // ──────────────────────────────────────────────────────────────────────────
  const handleAcceptConsent = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      const supabase = getSupabase();
      const timestamp = new Date().toISOString();

      if (supabase) {
        await supabase
          .from('profiles')
          .update({ consent_given: true, consent_timestamp: timestamp })
          .eq('id', currentUser.id);

        const updated = { ...currentUser, consent_given: true, consent_timestamp: timestamp };
        setCurrentUser(updated);
        setCurrentPage(Page.PASSPORT);
        return;
      }

      // Fallback to Express API
      const res = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, consentGiven: true })
      });
      const data = await safeJson(res);

      if (data?.profile) {
        setCurrentUser(data.profile);
        setCurrentPage(Page.PASSPORT);
      }
    } catch (err) {
      console.error('Consent approval failed:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Stamp photo upload — use Supabase storage directly or Express fallback
  // ──────────────────────────────────────────────────────────────────────────
  const handlePhotoConfirmed = async (base64Photo: string) => {
    if (!currentUser || !selectedLandmark) return;
    setIsActionLoading(true);
    try {
      const supabase = getSupabase();

      if (supabase) {
        // Upload photo to Supabase Storage
        const base64Data = base64Photo.replace(/^data:image\/\w+;base64,/, '');
        const byteString = atob(base64Data);
        const bytes = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'image/jpeg' });

        const storagePath = `${currentUser.id}/${selectedLandmark.id}.jpg`;
        const { error: storageError } = await supabase.storage
          .from('stamps')
          .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });

        let photoUrl = '';
        if (!storageError) {
          const { data: urlData } = supabase.storage.from('stamps').getPublicUrl(storagePath);
          photoUrl = urlData?.publicUrl || '';
        }

        // Upsert stamp row
        const { data: stampData, error: stampError } = await supabase
          .from('stamps')
          .upsert({
            user_id: currentUser.id,
            landmark_id: selectedLandmark.id,
            photo_url: photoUrl || base64Photo,
            stamped_at: new Date().toISOString(),
          }, { onConflict: 'user_id,landmark_id' })
          .select()
          .single();

        if (!stampError && stampData) {
          setStamps(prev => {
            const filtered = prev.filter(s => s.landmark_id !== selectedLandmark.id);
            return [...filtered, stampData];
          });
          setCurrentPage(Page.STAMP_CONFIRMATION);
          return;
        }
      }

      // Fallback to Express API
      const res = await fetch('/api/stamps/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          landmarkId: selectedLandmark.id,
          photoBase64: base64Photo
        })
      });
      const data = await safeJson(res);

      if (data?.stamp) {
        setStamps(prev => {
          const filtered = prev.filter(s => s.landmark_id !== selectedLandmark.id);
          return [...filtered, data.stamp];
        });
        setCurrentPage(Page.STAMP_CONFIRMATION);
      }
    } catch (err) {
      console.error('Stamp photo upload failed:', err);
      alert('Failed to upload visit proof photo. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Log out
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setStamps([]);
    setSelectedLandmark(null);
    setAuthError(null);
    setCurrentPage(Page.LOGIN);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // View routing
  // ──────────────────────────────────────────────────────────────────────────
  const renderCurrentView = () => {
    switch (currentPage) {
      case Page.LOADING:
        return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 text-[#CBA052] animate-spin mb-4" />
            <span className="font-mono text-xs uppercase text-white/60 tracking-widest">
              Loading USSC E-Passport...
            </span>
          </div>
        );

      case Page.LOGIN:
        return (
          <LoginView
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            isLoggingIn={isActionLoading}
            authError={authError}
            onModeChange={() => setAuthError(null)}
          />
        );

      case Page.CONSENT:
        return (
          <ConsentModal
            onAccept={handleAcceptConsent}
            isSubmitting={isActionLoading}
          />
        );

      case Page.PASSPORT: {
        const nextLandmark = landmarks.find(lm => !stamps.some(s => s.landmark_id === lm.id));

        return (
          <div className="flex flex-col w-full h-screen bg-[#FDF9F0] relative overflow-hidden">
            {/* Ambient paper texture overlay */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

            {/* Top Navigation Bar */}
            <header className="bg-[#004225] pt-[max(1.25rem,env(safe-area-inset-top))] px-4 pb-7 text-white rounded-b-[40px] shadow-lg relative z-10 overflow-hidden flex flex-col gap-4">
              {/* sheen + guilloché texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)]" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 20 C10 0 30 40 40 20' fill='none' stroke='%23f4deb2' stroke-width='1' opacity='0.45'/%3E%3Cpath d='M0 30 C10 10 30 50 40 30' fill='none' stroke='%23d8c184' stroke-width='1' opacity='0.24'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-x-4 bottom-3 h-px bg-[#CBA052]/40" />

              <div className="relative flex justify-between items-center gap-1.5">
                <div className="flex items-center gap-2 shrink-0 max-w-[36%]">
                  <div className="w-11 h-11 rounded-full bg-[#CBA052] border-2 border-white flex items-center justify-center overflow-hidden shadow-md shrink-0">
                    {currentUser?.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#004225] font-black text-sm" aria-hidden="true">
                        {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : currentUser?.name ? currentUser.name[0].toUpperCase() : 'E'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="font-sans text-xs font-black text-white truncate w-full">
                      {currentUser?.first_name || currentUser?.name || 'Explorer'}
                    </span>
                    <span className="font-mono text-[9px] text-[#E2C185] uppercase tracking-wider font-extrabold truncate w-full">
                      {currentUser?.student_id ? `ID: ${currentUser.student_id}` : 'Student'}
                    </span>
                  </div>
                </div>

                <div className="text-center flex flex-col justify-center basis-[50%] min-w-0 px-1">
                  <h1 className="text-[9px] font-bold uppercase tracking-widest text-[#CBA052]">Campus Tour</h1>
                  <p className="text-[11px] font-black italic tracking-wide text-white leading-none">USSC E-PASSPORT</p>
                </div>

                <div className="flex justify-end basis-[15%] flex-shrink-0">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    aria-label="Sign Out"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-sm flex-shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>

                  {/* Custom Integrated Confirmation Modal */}
                  {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                      {/* Card container */}
                      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-gray-100 transform scale-100 transition-all relative z-[10000]">
                        
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                          <LogOut className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-gray-900 font-sans text-lg font-black mb-2">
                          Sign Out?
                        </h3>
                        <p className="text-gray-500 font-sans text-sm mb-6 leading-relaxed">
                          Are you sure you want to exit the E-Passport? You can log back in anytime to continue your journey.
                        </p>
                        
                        <div className="flex gap-3">
                          {/* Cancel Button */}
                          <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-sans font-bold text-sm hover:bg-gray-50 active:scale-98 transition-all"
                          >
                            Stay
                          </button>
                          {/* Confirm Logout Button */}
                          <button
                            onClick={() => {
                              setShowLogoutConfirm(false);
                              handleLogOut();
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-sm active:scale-98 transition-all shadow-sm"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              <div
                className="relative"
                role="group"
                aria-label={`Passport progress: ${stamps.length} of ${landmarks.length} stamps collected`}
              >
                <ProgressTracker
                  stampsCount={stamps.length}
                  totalCount={landmarks.length}
                />
              </div>
            </header>

            {/* Journey Scrollable Canvas */}
            <div className="flex-1 overflow-y-auto px-4 select-none scrollbar-thin z-10 relative">
              <PassportRoad
                landmarks={landmarks}
                stamps={stamps}
                onSelectLandmark={(lm) => {
                  setSelectedLandmark(lm);
                  setCurrentPage(Page.LANDMARK_DETAIL);
                }}
              />
            </div>

            {/* Next up Footer */}
            {nextLandmark ? (
              <div className="p-4 px-6 bg-white border-t border-gray-100 flex items-center justify-between z-10 rounded-t-[32px] shadow-inner relative">
                <div className="flex-1 text-left overflow-hidden mr-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next up</p>
                  <p className="font-black text-[#004225] text-xs md:text-sm truncate">{nextLandmark.name}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedLandmark(nextLandmark);
                    setCurrentPage(Page.LANDMARK_DETAIL);
                  }}
                  className="bg-[#CBA052] hover:bg-[#b0873e] text-[#004225] font-extrabold text-xs tracking-wider uppercase px-5 py-3 rounded-2xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <span className="text-sm font-bold">+</span>
                  <span>STAMP</span>
                </button>
              </div>
            ) : (
              <div className="p-4 px-6 bg-white border-t border-gray-100 grid gap-2 items-center justify-center z-10 rounded-t-[32px] shadow-inner relative">
                <div className="flex-1 text-center overflow-hidden mr-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">You've got the whole campus</p>
                  <p className="font-black text-[#004225] text-xs md:text-sm truncate">CONGRATULATIONS!</p>
                </div>
                <button
                  onClick={() => { }}
                  className="bg-[#CBA052] hover:bg-[#b0873e] text-[#004225] font-extrabold text-xs tracking-wider uppercase px-5 py-3 rounded-2xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PASSPORT</span>
                </button>
              </div>
            )}
          </div>
        );
      }

      case Page.LANDMARK_DETAIL:
        if (!selectedLandmark) return null;
        return (
          <LandmarkDetailView
            landmark={selectedLandmark}
            stamp={stamps.find(s => s.landmark_id === selectedLandmark.id)}
            isUploading={isActionLoading}
            onBack={() => setCurrentPage(Page.PASSPORT)}
            onPhotoSelected={handlePhotoConfirmed}
          />
        );

      case Page.STAMP_CONFIRMATION:
        if (!selectedLandmark) return null;
        return (
          <StampConfirmationView
            landmark={selectedLandmark}
            onContinue={() => {
              if (stamps.length === landmarks.length) {
                setCurrentPage(Page.COMPLETION);
              } else {
                setCurrentPage(Page.PASSPORT);
              }
            }}
          />
        );

      case Page.COMPLETION:
        return (
          <CompletionView
            landmarks={landmarks}
            stamps={stamps}
            userName={currentUser?.first_name || currentUser?.name || 'Gladiator Visitor'}
            onReset={() => {
              if (confirm('Are you sure you want to restart your campus tour? This will reset your stamp collection.')) {
                setStamps([]);
                setCurrentPage(Page.PASSPORT);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* ── Mobile / Tablet: full screen app ── */}
      <div className="lg:hidden min-h-screen w-full flex flex-col bg-[#004225] font-sans text-[#1A1A1A] antialiased">
        {renderCurrentView()}
      </div>

      {/* ── Desktop: not supported message ── */}
      <div className="hidden lg:flex min-h-screen w-full flex-col items-center justify-center bg-[#004225] text-white gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-[#CBA052] flex items-center justify-center shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#004225]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div className="text-center max-w-sm">
          <h1 className="font-serif text-2xl font-black text-[#CBA052] uppercase tracking-widest mb-2">
            Mobile Only
          </h1>
          <p className="font-sans text-sm text-white/80 leading-relaxed">
            USSC E-Passport is designed for mobile and tablet devices. Please open this app on your smartphone or tablet to begin your campus tour.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest border border-white/10 rounded-full px-4 py-2">
          <span>Visayas State University</span>
          <span>·</span>
          <span>E-Passport</span>
        </div>
      </div>
    </>
  );
}
