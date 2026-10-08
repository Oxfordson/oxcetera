
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('ooxfordson@gmail.com');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage(
        'If this email is registered and awaiting confirmation, a new confirmation email will be sent. Please check your inbox and spam folder.'
      );
    } catch {
      setErrorMessage(
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0A2A6A]">
          Resend Confirmation Email
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          Enter your email address to request a new
          account confirmation link.
        </p>

        <form onSubmit={handleResend} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#0A2A6A]"
            />
          </div>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          {errorMessage && (
            <p role="alert" className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0A2A6A] px-4 py-3 font-semibold text-white hover:bg-[#123E8C] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Confirmation Email'}
          </button>
        </form>

        <a
          href="/auth/login"
          className="mt-6 block text-center text-sm font-medium text-[#0A2A6A] hover:underline"
        >
          Back to Login
        </a>
      </div>
    </main>
  );
}
