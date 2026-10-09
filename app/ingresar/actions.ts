'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { InvalidNameError, registerUser } from '@/lib/data';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';

export type SignInState = { error: string | null; name: string };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const name = String(formData.get('name') ?? '');

  let userId: string;
  try {
    // registerUser sanitizes (D-07) and never duplicates an existing name (D-06).
    const user = await registerUser(name);
    userId = user.id;
  } catch (error) {
    if (error instanceof InvalidNameError) return { error: error.message, name };
    throw error;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    path: '/',
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
  });

  // redirect throws: it must stay outside the try/catch.
  redirect('/');
}
