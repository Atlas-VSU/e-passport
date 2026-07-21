/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { Profile } from "../types";
import ProgressTracker from "./ProgressTracker";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentUser: Profile | null;
  stampsCount: number;
  totalCount: number;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  handleLogOut: () => void | Promise<void>;
}

export default function Header({
  currentUser,
  stampsCount,
  totalCount,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogOut,
}: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className="pt-[max(1.25rem,env(safe-area-inset-top))] px-4 pb-4 text-white rounded-b-[40px] shadow-xl relative z-30 overflow-hidden flex flex-col gap-4 passport-leather-overlay shrink-0"
      style={{
        background: "#004225",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_42%)]" />

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
              <span
                className="text-[#004225] font-black text-sm"
                aria-hidden="true"
              >
                {currentUser?.first_name
                  ? currentUser.first_name[0].toUpperCase()
                  : currentUser?.name
                    ? currentUser.name[0].toUpperCase()
                    : "E"}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-sans text-xs font-black text-white truncate w-full">
              {currentUser?.first_name || currentUser?.name || "Explorer"}
            </span>
            <span className="font-mono text-[9px] text-[#E2C185] uppercase tracking-wider font-extrabold truncate w-full">
              {currentUser?.student_id
                ? `ID: ${currentUser.student_id}`
                : "Student"}
            </span>
          </div>
        </div>

        <div className="text-center flex flex-col justify-center basis-[50%] min-w-0 px-1">
          <h1 className="text-[9px] font-bold uppercase tracking-widest text-[#CBA052]">
            Campus Tour
          </h1>
          <p className="text-[11px] font-black italic tracking-wide text-white leading-none whitespace-nowrap">
            VISCAN E-PASAPORTE
          </p>
        </div>

        <div className="flex justify-end basis-[15%] shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Sign Out"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-sm shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {typeof document !== "undefined" &&
            createPortal(
              <AnimatePresence>
                {showLogoutConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, y: 10, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 350 }}
                      className="bg-[#002b18] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border-2 border-[#CBA052]/40 relative z-[10000] passport-leather-overlay overflow-hidden"
                    >
                      {/* Subtle gold radial glow inside */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(202,160,82,0.12),transparent_60%)] pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[#CBA052]/10 border border-[#CBA052]/35 text-[#CBA052] flex items-center justify-center mb-4">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <h3 className="text-[#CBA052] font-serif text-xl font-black mb-2">
                          Sign Out?
                        </h3>
                        <p className="text-[#F2E9D3]/85 font-sans text-xs mb-6 leading-relaxed">
                          Are you sure you want to exit the Viscan E-Pasaporte ? You can log
                          back in anytime to continue your journey.
                        </p>
                        <div className="flex gap-3 w-full">
                          <button
                            onClick={() => setShowLogoutConfirm(false)}
                            disabled={isLoggingOut}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-[#F2E9D3] font-sans font-bold text-sm hover:bg-white/5 active:scale-98 transition-all cursor-pointer disabled:opacity-30"
                          >
                            Stay
                          </button>
                          <button
                            onClick={onConfirmSignOut}
                            disabled={isLoggingOut}
                            className="flex-1 py-3 px-4 rounded-xl bg-[#CBA052] hover:bg-[#b0873e] text-[#001a0e] font-sans font-black text-sm active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isLoggingOut ? (
                              <>
                                <span className="w-3 h-3 border-2 border-[#001a0e] border-t-transparent rounded-full animate-spin"></span>
                                <span>Exiting...</span>
                              </>
                            ) : (
                              <span>Sign Out</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
      </div>

      <div
        className="relative"
        role="group"
        aria-label={`Passport progress: ${stampsCount} of ${totalCount} stamps collected`}
      >
        <ProgressTracker stampsCount={stampsCount} totalCount={totalCount} />
      </div>
    </header>
  );
}
