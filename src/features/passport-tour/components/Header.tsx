/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { Profile } from "../../../types";
import ProgressTracker from "../../../components/ProgressTracker";

interface HeaderProps {
  currentUser: Profile | null;
  stampsCount: number;
  totalCount: number;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  handleLogOut: () => void;
}

export default function Header({
  currentUser,
  stampsCount,
  totalCount,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogOut,
}: HeaderProps) {
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

          {showLogoutConfirm &&
            typeof document !== "undefined" &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-gray-100 transform scale-100 transition-all relative z-[10000]">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 font-sans text-lg font-black mb-2">
                    Sign Out?
                  </h3>
                  <p className="text-gray-500 font-sans text-sm mb-6 leading-relaxed">
                    Are you sure you want to exit the E-Passport? You can log
                    back in anytime to continue your journey.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-sans font-bold text-sm hover:bg-gray-50 active:scale-98 transition-all"
                    >
                      Stay
                    </button>
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
