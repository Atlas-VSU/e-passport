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
import { Award, LogOut, Loader2, Landmark as LandmarkIcon } from 'lucide-react';

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

  // 1. Check session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (data?.user) {
          setCurrentUser(data.user);
          await loadUserStamps(data.user.id);
          
          if (!data.user.consent_given) {
            setCurrentPage(Page.CONSENT);
          } else {
            setCurrentPage(Page.PASSPORT);
          }
        } else {
          setCurrentPage(Page.LOGIN);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setCurrentPage(Page.LOGIN);
      }
    }
    checkSession();
  }, []);

  // 2. Load user stamps
  const loadUserStamps = async (userId: string) => {
    try {
      const res = await fetch(`/api/stamps?userId=${userId}`);
      const data = await res.json();
      if (data?.stamps) {
        setStamps(data.stamps);
        
        // If all 6 landmarks are stamped, redirect immediately to completion
        if (data.stamps.length === landmarks.length) {
          setCurrentPage(Page.COMPLETION);
        }
      }
    } catch (err) {
      console.error('Failed to load stamps:', err);
    }
  };

  // 3. Handle login action
  const handleLogin = async (email: string, name: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      
      if (data?.user) {
        setCurrentUser(data.user);
        await loadUserStamps(data.user.id);
        
        if (!data.user.consent_given) {
          setCurrentPage(Page.CONSENT);
        } else {
          // Check if already completed
          const userStamps = stamps;
          if (userStamps.length === landmarks.length) {
            setCurrentPage(Page.COMPLETION);
          } else {
            setCurrentPage(Page.PASSPORT);
          }
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Failed to connect. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Handle popup Google Sign In
  const handleGoogleLogin = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();

      // Open Google OAuth Provider URL directly in popup
      const authWindow = window.open(
        url,
        'vsu_oauth_popup',
        'width=500,height=600'
      );

      if (!authWindow) {
        alert('Please allow popups to sign in with Google.');
        setIsActionLoading(false);
      }
    } catch (err) {
      console.error('OAuth initiation failed:', err);
      alert('OAuth initialization error.');
      setIsActionLoading(false);
    }
  };

  // Listen for message events from popup
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Allow local and standard run.app origins
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        const userObj = event.data.user;
        setCurrentUser(userObj);
        await loadUserStamps(userObj.id);

        if (!userObj.consent_given) {
          setCurrentPage(Page.CONSENT);
        } else {
          setCurrentPage(Page.PASSPORT);
        }
        setIsActionLoading(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // 5. Handle Consent agreement
  const handleAcceptConsent = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, consentGiven: true })
      });
      const data = await res.json();
      
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

  // 6. Handle Stamp capture photo confirmation
  const handlePhotoConfirmed = async (base64Photo: string) => {
    if (!currentUser || !selectedLandmark) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/stamps/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          landmarkId: selectedLandmark.id,
          photoBase64: base64Photo
        })
      });
      const data = await res.json();
      
      if (data?.stamp) {
        // Append or replace new stamp
        setStamps((prev) => {
          const filtered = prev.filter((s) => s.landmark_id !== selectedLandmark.id);
          return [...filtered, data.stamp];
        });
        
        // Show success slam down screen first!
        setCurrentPage(Page.STAMP_CONFIRMATION);
      }
    } catch (err) {
      console.error('Stamp photo upload failed:', err);
      alert('Failed to upload visit proof photo. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 7. Reset/Log out flow
  const handleLogOut = () => {
    setCurrentUser(null);
    setStamps([]);
    setSelectedLandmark(null);
    setCurrentPage(Page.LOGIN);
  };

  // View routing switcher
  const renderCurrentView = () => {
    switch (currentPage) {
      case Page.LOADING:
        return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-[#013220] animate-spin mb-4" />
            <span className="font-mono text-xs uppercase text-[#717973] tracking-widest">
              Loading VSU E-Passport...
            </span>
          </div>
        );

      case Page.LOGIN:
        return (
          <LoginView 
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            isLoggingIn={isActionLoading}
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
        const nextLandmark = landmarks.find(lm => !stamps.some(s => s.landmark_id === lm.id)) || landmarks[landmarks.length - 1];
        
        return (
          <div className="flex flex-col w-full max-w-[380px] h-[720px] mx-auto bg-[#FDF9F0] rounded-[48px] shadow-2xl border-[8px] border-[#1A1A1A] relative overflow-hidden my-4">
            {/* Ambient paper texture overlay */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_2px_2px,rgba(0,66,37,0.02)_1px,transparent_0) [background-size:16px_16px] pointer-events-none z-0" />

            {/* Top Navigation Bar with Green Background & Golden Accents */}
            <div className="bg-[#004225] p-5 pb-7 text-white rounded-b-[40px] shadow-lg relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#CBA052] border-2 border-white flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                    {currentUser?.avatar_url ? (
                      <img 
                        src={currentUser.avatar_url} 
                        alt={currentUser.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[#004225] font-black text-sm">
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : 'E'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-sans text-xs font-black text-white truncate max-w-[80px]">
                      {currentUser?.name || 'Explorer'}
                    </span>
                    <span className="font-mono text-[8px] text-[#CBA052] uppercase tracking-wider font-extrabold">
                      {currentUser?.id.includes('visitor') ? 'Visitor' : 'Student'}
                    </span>
                  </div>
                </div>

                <div className="text-center flex-1 mx-1">
                  <h1 className="text-[9px] font-bold uppercase tracking-widest text-[#CBA052]">Campus Tour</h1>
                  <p className="text-base font-black italic tracking-wide text-white leading-none">VSU E-PASSPORT</p>
                </div>

                <button 
                  onClick={handleLogOut}
                  aria-label="Sign Out"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-sm flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Tracker Card directly embedded in the header block */}
              <ProgressTracker 
                stampsCount={stamps.length}
                totalCount={landmarks.length}
              />
            </div>

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

            {/* Elegant Next up Footer bar matching the Design HTML */}
            {nextLandmark && (
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
              // Refresh stamps logic and verify completion
              const nextStamps = stamps;
              if (nextStamps.length === landmarks.length) {
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
            userName={currentUser?.name || 'Gladiator Visitor'}
            onReset={() => {
              // Allow restarting to try again
              if (confirm("Are you sure you want to restart your campus tour? This will reset your stamp collection.")) {
                fetch('/api/stamps/upload', { method: 'DELETE' }).catch(() => {});
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#004225] font-sans text-[#1A1A1A] antialiased p-3 md:p-6">
      {renderCurrentView()}
    </div>
  );
}
