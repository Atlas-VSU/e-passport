/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { landmarks } from "./lib/landmarks";
import { Page } from "./types";
import ConsentModal from "./features/auth/components/ConsentModal";
import LoginView from "./features/auth/components/LoginView";
import LandmarkDetailView from "./features/landmark/components/LandmarkDetailView";
import StampConfirmationView from "./features/landmark/components/StampConfirmationView";
import CompletionView from "./features/completion/components/CompletionView";
import EPassportView from "./features/epassport/components/EPassportView";
import PassportTourView from "./features/passport-tour/components/PassportTourView";
import MobileDeviceGate from "./components/MobileDeviceGate";
import { useEPassport } from "./hooks/useEPassport";
import { Loader2 } from "lucide-react";

export default function App() {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    stamps,
    selectedLandmark,
    setSelectedLandmark,
    isActionLoading,
    subView,
    setSubView,
    justStampedId,
    activeCelebration,
    authError,
    setAuthError,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleLogin,
    handleSignUp,
    handleAcceptConsent,
    handlePhotoConfirmed,
    handleLogOut,
  } = useEPassport();

  const renderCurrentView = () => {
    switch (currentPage) {
      case Page.LOADING:
        return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 text-[#CBA052] animate-spin mb-4" />
            <span className="font-mono text-xs uppercase text-white/60 tracking-widest">
              Loading Viscan E-Pasaporte...
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

      case Page.PASSPORT:
        return (
          <PassportTourView
            currentUser={currentUser}
            stamps={stamps}
            landmarks={landmarks}
            subView={subView}
            setSubView={setSubView}
            justStampedId={justStampedId}
            setSelectedLandmark={setSelectedLandmark}
            setCurrentPage={setCurrentPage}
            showLogoutConfirm={showLogoutConfirm}
            setShowLogoutConfirm={setShowLogoutConfirm}
            handleLogOut={handleLogOut}
            activeCelebration={activeCelebration}
          />
        );

      case Page.LANDMARK_DETAIL:
        if (!selectedLandmark) return null;
        return (
          <LandmarkDetailView
            landmark={selectedLandmark}
            stamp={stamps.find((s) => s.landmark_id === selectedLandmark.id)}
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
            userName={
              currentUser?.first_name ||
              currentUser?.name ||
              "Gladiator Visitor"
            }
            onBackToMap={() => setCurrentPage(Page.PASSPORT)}
            onShowPassport={() => setCurrentPage(Page.E_PASSPORT)}
          />
        );

      case Page.E_PASSPORT:
        return (
          <EPassportView
            landmarks={landmarks}
            stamps={stamps}
            currentUser={currentUser}
            onBack={() => setCurrentPage(Page.PASSPORT)}
          />
        );

      default:
        return null;
    }
  };

  return <MobileDeviceGate>{renderCurrentView()}</MobileDeviceGate>;
}
