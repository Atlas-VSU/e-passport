/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Page, Profile, Stamp, Landmark } from "../types";
import { checkSession, signIn, signUp, signOut } from "../features/auth/services/auth";
import { uploadStampPhoto } from "../features/landmark/services/stamps";
import { acceptConsent } from "../features/auth/services/profile";
import { landmarks } from "../lib/landmarks";

export function useEPassport() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOADING);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Free-Roam Map & Sticker Book states
  const [subView, setSubView] = useState<"map" | "stickers">("map");
  const [justStampedId, setJustStampedId] = useState<string | null>(null);
  const [milestonesFired, setMilestonesFired] = useState({ m3: false, m6: false });
  const [activeCelebration, setActiveCelebration] = useState<3 | 6 | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Session check on load
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function initSession() {
      try {
        const sessionData = await checkSession();
        if (sessionData) {
          setCurrentUser(sessionData.user);
          setStamps(sessionData.stamps);
          setMilestonesFired({
            m3: sessionData.stamps.length >= 3,
            m6: sessionData.stamps.length >= 6,
          });

          if (!sessionData.user.consent_given) {
            setCurrentPage(Page.CONSENT);
          } else {
            setCurrentPage(Page.PASSPORT);
          }
        } else {
          setCurrentPage(Page.LOGIN);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setCurrentPage(Page.LOGIN);
      }
    }
    initSession();
  }, []);

  // Trigger milestone celebrations once count goals are met during exploration
  useEffect(() => {
    if (currentPage === Page.PASSPORT) {
      const count = stamps.length;
      if (count === 3 && !milestonesFired.m3) {
        setMilestonesFired((prev) => ({ ...prev, m3: true }));
        setActiveCelebration(3);
      } else if (count === 6 && !milestonesFired.m6) {
        setMilestonesFired((prev) => ({ ...prev, m6: true }));
        setActiveCelebration(6);
      }
    }
  }, [currentPage, stamps.length, milestonesFired.m3, milestonesFired.m6]);

  // Clear the transient newly stamped ID after 5 seconds to prevent re-slamming animations
  useEffect(() => {
    if (currentPage === Page.PASSPORT && justStampedId) {
      const timer = setTimeout(() => {
        setJustStampedId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, justStampedId]);

  // Auto-dismiss the 3-of-6 milestone cheer after 4 seconds
  useEffect(() => {
    if (activeCelebration === 3) {
      const timer = setTimeout(() => {
        setActiveCelebration(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeCelebration]);

  // Auto-dismiss the 6-of-6 completion cheer after 5 seconds and route to E-Passport
  useEffect(() => {
    if (activeCelebration === 6) {
      const timer = setTimeout(() => {
        setActiveCelebration(null);
        setCurrentPage(Page.E_PASSPORT);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeCelebration]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Login
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    setIsActionLoading(true);
    setAuthError(null);
    try {
      const sessionData = await signIn(email, password);
      setCurrentUser(sessionData.user);
      setStamps(sessionData.stamps);
      setMilestonesFired({
        m3: sessionData.stamps.length >= 3,
        m6: sessionData.stamps.length >= 6,
      });

      if (!sessionData.user.consent_given) {
        setCurrentPage(Page.CONSENT);
      } else {
        setCurrentPage(Page.PASSPORT);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setAuthError(err.message || "Failed to connect. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Sign Up
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
      const sessionData = await signUp(firstName, lastName, studentId, email, password);
      setCurrentUser(sessionData.user);
      setStamps(sessionData.stamps);
      setMilestonesFired({
        m3: sessionData.stamps.length >= 3,
        m6: sessionData.stamps.length >= 6,
      });

      if (!sessionData.user.consent_given) {
        setCurrentPage(Page.CONSENT);
      } else {
        setCurrentPage(Page.PASSPORT);
      }
    } catch (err: any) {
      console.error("Sign up failed:", err);
      setAuthError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Consent agreement
  // ──────────────────────────────────────────────────────────────────────────
  const handleAcceptConsent = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      const updatedProfile = await acceptConsent(currentUser);
      setCurrentUser(updatedProfile);
      setCurrentPage(Page.PASSPORT);
    } catch (err) {
      console.error("Consent approval failed:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Stamp photo upload
  // ──────────────────────────────────────────────────────────────────────────
  const handlePhotoConfirmed = async (base64Photo: string) => {
    if (!currentUser || !selectedLandmark) return;
    setIsActionLoading(true);
    try {
      const newStamp = await uploadStampPhoto(currentUser.id, selectedLandmark.id, base64Photo);
      setJustStampedId(selectedLandmark.id);
      setStamps((prev) => {
        const filtered = prev.filter((s) => s.landmark_id !== selectedLandmark.id);
        return [...filtered, newStamp];
      });
      setCurrentPage(Page.STAMP_CONFIRMATION);
    } catch (err) {
      console.error("Stamp photo upload failed:", err);
      alert("Failed to upload visit proof photo. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Log out
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogOut = async () => {
    await signOut();
    setCurrentUser(null);
    setStamps([]);
    setSelectedLandmark(null);
    setAuthError(null);
    setCurrentPage(Page.LOGIN);
  };

  return {
    currentPage,
    setCurrentPage,
    currentUser,
    setCurrentUser,
    stamps,
    setStamps,
    selectedLandmark,
    setSelectedLandmark,
    isActionLoading,
    setIsActionLoading,
    subView,
    setSubView,
    justStampedId,
    setJustStampedId,
    milestonesFired,
    activeCelebration,
    setActiveCelebration,
    authError,
    setAuthError,
    showLogoutConfirm,
    setShowLogoutConfirm,
    handleLogin,
    handleSignUp,
    handleAcceptConsent,
    handlePhotoConfirmed,
    handleLogOut,
  };
}
