'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

// In a real app, this would come from a database and passwords would be hashed.
const DUMMY_USER = {
  email: 'admin',
  password: 'wras@dhh',
  name: 'Railway Employee',
};

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Username cannot be empty.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export type FormState = {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      message: 'Invalid form data.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    const sessionData = {
      email: DUMMY_USER.email,
      name: DUMMY_USER.name,
    };
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return redirect('/');
  } else {
    return {
      message: 'Invalid username or password. Please try again.',
    };
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  try {
    // In a real app, you'd want to verify the session against a database or token signature.
    return JSON.parse(sessionCookie.value) as { email: string; name: string };
  } catch {
    return null;
  }
}
