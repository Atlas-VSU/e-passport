/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stamp } from "../../../types";

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
  } catch {
    // base64 data is malformed — rejecting here is safer than forwarding
    // corrupted bytes to the server where they'd be stored as a broken image.
    throw new Error("Image data is corrupted. Please retake the photo and try again.");
  }

  const isAlreadyWebp = base64Str.startsWith("data:image/webp");
  if (byteString.length <= maxSizeBytes && isAlreadyWebp) {
    return base64Str; // Already small enough and WebP format
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str.includes("data:image") ? base64Str : `data:image/webp;base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Downscale long edge to max 1200px for optimal stamp quality and minimal size
      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      let quality = 0.80;
      let dataUrl = "";
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      // Target max base64 length for the requested maxSizeMB
      const targetBase64Chars = maxSizeMB * 1024 * 1024 * (4 / 3);

      const MIN_DIMENSION = 100;
      const MAX_ITERATIONS = 20;
      let iterations = 0;

      // Loop until the exported Base64 string is strictly under our limit
      do {
        canvas.width = Math.max(Math.round(width), MIN_DIMENSION);
        canvas.height = Math.max(Math.round(height), MIN_DIMENSION);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL("image/webp", quality);

        if (dataUrl.length > targetBase64Chars) {
          quality = Math.max(0.1, quality - 0.15); // Drop quality to a min of 0.1
          width *= 0.85;   // Shrink dimensions
          height *= 0.85;
        }

        iterations++;

        // Exit early if we've hit both the quality floor and the dimension floor,
        // or if we've exceeded the iteration cap — accept whatever we have.
        const atDimensionFloor = width <= MIN_DIMENSION || height <= MIN_DIMENSION;
        if ((quality <= 0.1 && atDimensionFloor) || iterations >= MAX_ITERATIONS) {
          break;
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
    const data = await res.json();
    if (data?.stamps) {
      return data.stamps;
    }
    return [];
  } catch (err) {
    console.error("Failed to load stamps:", err);
    return [];
  }
}

/**
 * Returns any stamps that are queued in IndexedDB (offline / upload-failed)
 * as proper Stamp objects so the UI can show them immediately after a page
 * reload — before the background sync has had a chance to push them to the server.
 *
 * These are filtered to the given userId so a shared device doesn't bleed state.
 */
export async function fetchPendingStampsAsStamps(userId: string): Promise<Stamp[]> {
  try {
    const pending = await getPendingStamps();
    return pending
      .filter((task) => task.userId === userId)
      .map((task) => ({
        id: task.id,
        user_id: task.userId,
        landmark_id: task.landmarkId,
        // Use the stored base64 thumbnail as the photo URL so the passport
        // page can still render the photo even while offline.
        photo_url: task.base64Photo ?? '',
        stamped_at: task.timestamp ?? new Date().toISOString(),
        // Mark as pending so callers can distinguish it from a synced stamp
        _pending: true,
      } as Stamp & { _pending: boolean }));
  } catch {
    // IndexedDB unavailable (private mode, some browsers) — fail silently
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

  // 1. Compress & downscale photo (target 0.5MB max)
  const compressedPhoto = await compressImage(base64Photo, 0.5);
  const taskId = `${userId}-${landmarkId}`;

  // 2. Try uploading to the server directly (primary path)
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const res = await fetch("/api/stamps/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          landmarkId,
          photoBase64: compressedPhoto,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.stamp) {
        // Save to IndexedDB as a synced local cache entry
        await saveToIndexedDB({
          id: taskId,
          userId,
          landmarkId,
          base64Photo: compressedPhoto,
          timestamp: new Date().toISOString(),
          synced: true,
        });
        return data.stamp as Stamp;
      }

      // Server returned an error response — throw so we fall through to queue
      throw new Error(data?.error || "Server returned an error.");

    } catch (err) {
      console.warn("Online upload failed, queuing to IndexedDB:", err);
      // Fall through to queue below
    }
  }

  // 3. Offline fallback — queue in IndexedDB to sync later
  await saveToIndexedDB({
    id: taskId,
    userId,
    landmarkId,
    base64Photo: compressedPhoto,
    timestamp: new Date().toISOString(),
    synced: false,
  });

  console.log(`Stamp ${taskId} saved offline — will sync when reconnected.`);

  // Return an optimistic stamp so the UI updates immediately
  return {
    id: taskId,
    user_id: userId,
    landmark_id: landmarkId,
    photo_url: compressedPhoto,
    stamped_at: new Date().toISOString()
  } as Stamp;
}
