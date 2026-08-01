/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stamp } from "../../../types";
import { safeJson } from "../../../services/api";

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

export async function uploadStampPhoto(
  userId: string,
  landmarkId: string,
  base64Photo: string
): Promise<Stamp> {
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
