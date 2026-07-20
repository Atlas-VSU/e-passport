/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase } from "../../../lib/supabase/client";
import { Profile, Stamp } from "../../../types";
import { safeJson } from "../../../services/api";
import { fetchUserStamps } from "../../landmark/services/stamps";

export async function fetchProfile(supabase: any, authUser: any): Promise<Profile> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return profile || {
    id: authUser.id,
    first_name: authUser.user_metadata?.first_name || null,
    last_name: authUser.user_metadata?.last_name || null,
    name:
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "Student",
    email: authUser.email,
    student_id: authUser.user_metadata?.student_id || null,
    avatar_url: null,
    consent_given: false,
    consent_timestamp: null,
    created_at: new Date().toISOString(),
  };
}

export async function checkSession(): Promise<{ user: Profile; stamps: Stamp[] } | null> {
  const supabase = getSupabase();
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const userProfile = await fetchProfile(supabase, session.user);
      const stamps = await fetchUserStamps(session.user.id);
      return { user: userProfile, stamps };
    }
  }
  return null;
}

export async function signIn(email: string, password: string): Promise<{ user: Profile; stamps: Stamp[] }> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase();
      if (
        msg?.includes("invalid") ||
        msg?.includes("credentials") ||
        msg?.includes("email not confirmed")
      ) {
        throw new Error("Invalid email or password. Please try again.");
      } else {
        throw new Error(error.message || "Login failed. Please try again.");
      }
    }

    if (data?.user) {
      const userProfile = await fetchProfile(supabase, data.user);
      const stamps = await fetchUserStamps(data.user.id);
      return { user: userProfile, stamps };
    }
  }

  // Fallback to Express API
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const resData = await safeJson(res);

  if (!res.ok || resData?.error) {
    throw new Error(resData?.error || "Login failed. Please check your credentials.");
  }

  if (resData?.user) {
    const stamps = await fetchUserStamps(resData.user.id);
    return { user: resData.user, stamps };
  }

  throw new Error("Authentication failed. No user data returned.");
}

export async function signUp(
  firstName: string,
  lastName: string,
  studentId: string,
  email: string,
  password: string
): Promise<{ user: Profile; stamps: Stamp[] }> {
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
      if (
        msg?.includes("already registered") ||
        msg?.includes("already exists") ||
        msg?.includes("user already")
      ) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else {
        throw new Error(error.message || "Sign up failed. Please try again.");
      }
    }

    if (data?.user) {
      // Upsert profile row with all custom fields
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
          email,
          student_id: studentId,
          avatar_url: null,
          consent_given: false,
        },
        { onConflict: "id" }
      );

      const userProfile = await fetchProfile(supabase, data.user);
      const stamps = await fetchUserStamps(data.user.id);
      return { user: userProfile, stamps };
    }
  }

  // Fallback to Express API
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      studentId,
      email,
      password,
    }),
  });
  const resData = await safeJson(res);

  if (!res.ok || resData?.error) {
    throw new Error(resData?.error || "Sign up failed. Please try again.");
  }

  if (resData?.user) {
    const stamps = await fetchUserStamps(resData.user.id);
    return { user: resData.user, stamps };
  }

  throw new Error("Registration failed. No user data returned.");
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
