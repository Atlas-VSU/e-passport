/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Checks whether account login is explicitly enabled via environment variable.
 * Login is disabled by default (returns false) unless ENABLE_LOGIN (or VITE_ENABLE_LOGIN)
 * is explicitly configured to 'true' (case-insensitive).
 */
export function isLoginEnabled(): boolean {
  const envVal = (import.meta as any).env?.ENABLE_LOGIN ?? (import.meta as any).env?.VITE_ENABLE_LOGIN;
  if (!envVal) return false;
  return String(envVal).trim().toLowerCase() === 'true';
}
