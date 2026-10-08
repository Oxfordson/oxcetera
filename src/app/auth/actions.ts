
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AuthActionState } from './auth-state';

function safeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return '/account';

  // Allow only internal paths, never external URLs.
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\r\n]/.test(value)
  ) {
    return '/account';
  }

  return value;
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();

  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return {
      error: 'Enter your email and password.',
      success: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Invalid login details or unconfirmed email.',
      success: null,
    };
  }

  revalidatePath('/', 'layout');

  redirect(safeRedirect(formData.get('redirect')));
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fullName = String(formData.get('full_name') || '').trim();
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();

  const password = String(formData.get('password') || '');
  const confirmPassword = String(
    formData.get('confirm_password') || ''
  );

  if (fullName.length < 2 || fullName.length > 100) {
    return {
      error: 'Enter your full name (2–100 characters).',
      success: null,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return {
      error: 'Enter a valid email address.',
      success: null,
    };
  }

  if (password.length < 12) {
    return {
      error: 'Password must contain at least 12 characters.',
      success: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: 'Your passwords do not match.',
      success: null,
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
      success: null,
    };
  }

  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/account');
  }

  return {
    error: null,
    success:
      'Registration received. Check your email for the confirmation link, then sign in.',
  };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/auth/login');
}
