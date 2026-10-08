
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_code', requestUrl.origin)
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback error:', error.message);

    return NextResponse.redirect(
      new URL('/auth/login?error=confirmation_failed', requestUrl.origin)
    );
  }

  return NextResponse.redirect(
    new URL('/account', requestUrl.origin)
  );
}
