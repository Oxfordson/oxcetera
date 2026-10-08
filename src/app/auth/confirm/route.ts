
import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (
    !tokenHash ||
    !type ||
    !['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change'].includes(type)
  ) {
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_confirmation', url.origin)
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  if (error) {
    return NextResponse.redirect(
      new URL('/auth/login?error=confirmation_failed', url.origin)
    );
  }

  return NextResponse.redirect(
    new URL('/account', url.origin)
  );
}
