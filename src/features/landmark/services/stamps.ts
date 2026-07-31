/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabase } from "../../../lib/supabase/client";
import { Stamp } from "../../../types";
import { safeJson } from "../../../services/api";
import { getFirebaseStorage } from "@/src/lib/firebase/storage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function fetchUserStamps(userId: string): Promise<Stamp[]> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("stamps")
        .select("*")
        .eq("user_id", userId);
      if (!error && data) {
        return data;
      }
    }
    const res = await fetch(`/api/stamps?userId=${userId}`);
    const data = await safeJson(res);
    if (data?.stamps) {
      return data.stamps;
    }
    return [];
  } catch (err) {
    console.error("Failed to load stamps:", err);
    return [];
  }
}

export async function uploadStampPhoto(
  userId: string,
  landmarkId: string,
  base64Photo: string
): Promise<Stamp> {
  const supabase = getSupabase();
  const firebaseStorage = getFirebaseStorage();

  if (supabase) {
    // Upload photo to Supabase Storage
    const base64Data = base64Photo.replace(/^data:image\/\w+;base64,/, "");
    const byteString = atob(base64Data);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/jpeg" });

    const MAX_SIZE_MB = 8;

    if (blob.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`Photo is too large. Please keep it under ${MAX_SIZE_MB}MB.`);
    }

    const storagePath = `e-passport/${userId}/${landmarkId}.jpg`;
    let photoUrl = "";

    if (firebaseStorage) {
      try {
        const storageRef = ref(firebaseStorage, storagePath);
        await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });

        photoUrl = await getDownloadURL(storageRef);
      } catch (storageError) {
        console.error("Firebase Storage upload error: ", storageError);

        throw new Error("Failed to upload photo to Firebase storage.");
      }
    }

    // Upsert stamp row
    const { data: stampData, error: stampError } = await supabase
      .from("stamps")
      .upsert(
        {
          user_id: userId,
          landmark_id: landmarkId,
          photo_url: photoUrl || base64Photo,
          stamped_at: new Date().toISOString(),
        },
        { onConflict: "user_id,landmark_id" }
      )
      .select()
      .single();

    if (stampError || !stampData) {
      throw stampError || new Error("Failed to save stamp metadata to Supabase");
    }
    return stampData;
  }

  // Fallback to Express API
  const res = await fetch("/api/stamps/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      landmarkId,
      photoBase64: base64Photo,
    }),
  });
  const data = await safeJson(res);

  if (!res.ok || data?.error || !data?.stamp) {
    throw new Error(data?.error || "Failed to upload visit proof photo.");
  }
  return data.stamp;
}
