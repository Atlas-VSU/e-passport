/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stamp } from "../../../types";
import { safeJson } from "../../../services/api";

// --- IndexedDB Setup ---
const DB_NAME = "e-passport-offline";
const STORE_NAME = "pending-stamps";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(stampTask: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(stampTask);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPendingStamps(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const allItems = request.result || [];
      // Only return items that haven't been synced to the backend yet
      resolve(allItems.filter((item: any) => !item.synced));
    };
    request.onerror = () => reject(request.error);
  });
}

// --- Image Compression ---
async function compressImage(base64Str: string, maxSizeMB: number): Promise<string> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  let byteString = "";
  try {
    byteString = atob(base64Str.split(",")[1] || base64Str);
  } catch (e) {
    return base64Str;
  }
  
  if (byteString.length <= maxSizeBytes) {
    return base64Str; // Already small enough
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str.includes("data:image") ? base64Str : `data:image/jpeg;base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      let quality = 0.9;
      let dataUrl = "";
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      // Target max size for Base64 characters (Base64 is 4/3 the size of the raw bytes)
      // We leave 0.5MB breathing room for JSON overhead.
      const targetBase64Chars = (maxSizeMB - 0.5) * 1024 * 1024 * (4 / 3);

      // Loop until the exported Base64 string is strictly under our limit
      do {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        dataUrl = canvas.toDataURL("image/jpeg", quality);

        if (dataUrl.length > targetBase64Chars) {
          quality = Math.max(0.1, quality - 0.15); // Drop quality to a min of 0.1
          width *= 0.85;   // Shrink dimensions
          height *= 0.85;
        }
      } while (dataUrl.length > targetBase64Chars);
      
      resolve(dataUrl);
    };
    img.onerror = (e) => reject(e);
  });
}

// --- Core Functions ---
export async function fetchUserStamps(userId: string): Promise<Stamp[]> {
  try {
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

let isSyncing = false;

export async function syncPendingStamps(): Promise<void> {
  if (isSyncing || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  isSyncing = true;
  
  try {
    const pending = await getPendingStamps();
    for (const task of pending) {
      try {
        const res = await fetch("/api/stamps/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: task.userId,
            landmarkId: task.landmarkId,
            photoBase64: task.base64Photo,
          }),
        });

        if (res.ok) {
          // Instead of deleting, mark it as synced so it stays in IndexedDB forever
          task.synced = true;
          await saveToIndexedDB(task);
        }
      } catch (uploadErr) {
        console.error(`Failed to sync stamp ${task.id}:`, uploadErr);
        // Break out of the loop if network is actually down
        if (typeof navigator !== 'undefined' && !navigator.onLine) break;
      }
    }
  } catch (err) {
    console.error("Error syncing pending stamps:", err);
  } finally {
    isSyncing = false;
  }
}

// Automatically sync when internet returns
if (typeof window !== "undefined") {
  window.addEventListener("online", syncPendingStamps);
  // Also try on load
  setTimeout(syncPendingStamps, 1000);
}

export async function uploadStampPhoto(
  userId: string,
  landmarkId: string,
  base64Photo: string
): Promise<Stamp> {
  
  // 1. Compress if over 15MB
  const compressedPhoto = await compressImage(base64Photo, 15);

  // 2. Save to Offline Queue (IndexedDB)
  // By using just userId-landmarkId, a retake automatically OVERWRITES the old photo in IndexedDB!
  const taskId = `${userId}-${landmarkId}`;
  await saveToIndexedDB({
    id: taskId,
    userId,
    landmarkId,
    base64Photo: compressedPhoto,
    timestamp: new Date().toISOString()
  });

  // 3. Trigger sync in background (fire and forget)
  syncPendingStamps();

  // 4. Return fake success instantly for smooth UI
  return {
    id: taskId,
    user_id: userId,
    landmark_id: landmarkId,
    photo_url: compressedPhoto, // Show the local compressed version immediately
    stamped_at: new Date().toISOString()
  } as Stamp;
}
