/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase } from "../../../lib/supabase/client";
import { Profile } from "../../../types";
import { safeJson } from "../../../services/api";

export async function acceptConsent(currentUser: Profile): Promise<Profile> {
  const supabase = getSupabase();
  const timestamp = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase
      .from("profiles")
      .update({ consent_given: true, consent_timestamp: timestamp })
      .eq("id", currentUser.id);

    if (error) {
      throw error;
    }

    return {
      ...currentUser,
      consent_given: true,
      consent_timestamp: timestamp,
    };
  }

  // Fallback to Express API
  const res = await fetch("/api/auth/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: currentUser.id, consentGiven: true }),
  });
  const data = await safeJson(res);

  if (!res.ok || data?.error || !data?.profile) {
    throw new Error(data?.error || "Consent approval failed.");
  }
  return data.profile;
}
