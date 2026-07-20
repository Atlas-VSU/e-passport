/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import PassportRoad from "./PassportRoad";
import StickerBookView from "./StickerBookView";
import MilestoneCelebration from "./MilestoneCelebration";
import { Landmark, Stamp, Profile, Page } from "../../../types";

interface PassportTourViewProps {
  currentUser: Profile | null;
  stamps: Stamp[];
  landmarks: Landmark[];
  subView: "map" | "stickers";
  setSubView: (view: "map" | "stickers") => void;
  justStampedId: string | null;
  setSelectedLandmark: (lm: Landmark | null) => void;
  setCurrentPage: (page: Page) => void;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  handleLogOut: () => void;
  activeCelebration: 3 | 6 | null;
}

export default function PassportTourView({
  currentUser,
  stamps,
  landmarks,
  subView,
  setSubView,
  justStampedId,
  setSelectedLandmark,
  setCurrentPage,
  showLogoutConfirm,
  setShowLogoutConfirm,
  handleLogOut,
  activeCelebration,
}: PassportTourViewProps) {
  const nextLandmark = landmarks.find(
    (lm) => !stamps.some((s) => s.landmark_id === lm.id)
  );

  return (
    <div className="passport-wallet flex flex-col w-full h-screen relative overflow-hidden">
      {/* Color overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 30, 18, 0.72)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Vignette layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.50) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Main Flex Container */}
      <div
        className="flex flex-col w-full h-full relative bg-transparent"
        style={{ position: "relative", zIndex: 2 }}
      >
        <Header
          currentUser={currentUser}
          stampsCount={stamps.length}
          totalCount={landmarks.length}
          showLogoutConfirm={showLogoutConfirm}
          setShowLogoutConfirm={setShowLogoutConfirm}
          handleLogOut={handleLogOut}
        />

        {/* MAP AREA: Negative margins tuck this under the header and footer */}
        <div className="flex-1 relative overflow-hidden z-20 -mt-[40px] -mb-[40px]">
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{ boxShadow: "inset 0 0 35px 12px rgba(12, 22, 18, 0.8)" }}
          />

          {/* Padding top and bottom ensures the road isn't hidden behind the opaque UI */}
          <div className="w-full h-full overflow-y-auto overflow-x-hidden select-none scrollbar-thin relative py-[10px]">
            {subView === "map" ? (
              <PassportRoad
                landmarks={landmarks}
                stamps={stamps}
                onSelectLandmark={(lm) => {
                  setSelectedLandmark(lm);
                  setCurrentPage(Page.LANDMARK_DETAIL);
                }}
                justStampedId={justStampedId}
                nudgeLandmarkId={nextLandmark ? nextLandmark.id : null}
              />
            ) : (
              <StickerBookView
                landmarks={landmarks}
                stamps={stamps}
                onSelectLandmark={(lm) => {
                  setSelectedLandmark(lm);
                  setCurrentPage(Page.LANDMARK_DETAIL);
                }}
              />
            )}
          </div>
        </div>

        <Footer
          subView={subView}
          setSubView={setSubView}
        />
      </div>

      <MilestoneCelebration
        activeCelebration={activeCelebration}
        stampsCount={stamps.length}
      />
    </div>
  );
}
