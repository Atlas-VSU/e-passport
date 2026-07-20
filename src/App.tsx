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
import { AnimatePresence, motion } from "motion/react";

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
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center min-h-screen"
          >
            <Loader2 className="w-10 h-10 text-[#CBA052] animate-spin mb-4" />
            <span className="font-mono text-xs uppercase text-white/60 tracking-widest">
              Loading Viscan E-Pasaporte...
            </span>
          </motion.div>
        );

      case Page.LOGIN:
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
            <LoginView
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              isLoggingIn={isActionLoading}
              authError={authError}
              onModeChange={() => setAuthError(null)}
            />
          </motion.div>
        );

      case Page.CONSENT:
        return (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
            <ConsentModal
              onAccept={handleAcceptConsent}
              isSubmitting={isActionLoading}
            />
          </motion.div>
        );

      case Page.PASSPORT:
        return (
          <motion.div
            key="passport"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
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
          </motion.div>
        );

      case Page.E_PASSPORT:
        return (
          <motion.div
            key="epassport"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
            <EPassportView
              landmarks={landmarks}
              stamps={stamps}
              currentUser={currentUser}
              onBack={() => setCurrentPage(Page.PASSPORT)}
            />
          </motion.div>
        );

      case Page.LANDMARK_DETAIL:
        if (!selectedLandmark) return null;
        return (
          <motion.div
            key={`detail-${selectedLandmark.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
            <LandmarkDetailView
              landmark={selectedLandmark}
              stamp={stamps.find((s) => s.landmark_id === selectedLandmark.id)}
              isUploading={isActionLoading}
              onBack={() => setCurrentPage(Page.PASSPORT)}
              onPhotoSelected={handlePhotoConfirmed}
              onViewStickerBook={() => {
                setSubView("stickers");
                setCurrentPage(Page.PASSPORT);
              }}
            />
          </motion.div>
        );

      case Page.STAMP_CONFIRMATION:
        if (!selectedLandmark) return null;
        return (
          <motion.div
            key={`confirm-${selectedLandmark.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
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
          </motion.div>
        );

      case Page.COMPLETION:
        return (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full h-full flex flex-col flex-1"
          >
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
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <MobileDeviceGate>
      <AnimatePresence mode="wait">
        {renderCurrentView()}
      </AnimatePresence>
    </MobileDeviceGate>
  );
}
