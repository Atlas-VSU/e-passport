/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response from server:", text.slice(0, 300));
    return { error: `Server error (${res.status}). Check server logs.` };
  }
}
