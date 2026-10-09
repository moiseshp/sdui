import { cookies } from 'next/headers';

/**
 * [DEMO] Session = sanitized id in a cookie. No real auth (out of scope).
 * Native equivalent: UserDefaults / SharedPreferences.
 *
 * Reading the cookie makes the page dynamic: it is never cached (D-19).
 */
export const SESSION_COOKIE = 'bdui_demo';

/** One week: enough for rehearsals and the presentation. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
