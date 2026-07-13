/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  consent_given: boolean;
  consent_timestamp: string | null;
  created_at: string;
}

export interface Stamp {
  id: string;
  user_id: string;
  landmark_id: string;
  photo_url: string;
  stamped_at: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  label?: string; // e.g. "Landmark 01"
  photoUrl?: string; // default showcase photo
}
