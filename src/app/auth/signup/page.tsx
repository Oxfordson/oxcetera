
'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, LockKeyhole } from 'lucide-react';

import { signUp } from '../actions';
import { initialAuthState } from '../auth-state';

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialAuthState
  );

  return (
    <main className="min-h-screen bg-[#F8FAFD] px-4 py-14">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-3xl font-bold text-[#0A2A6A]"
          >
            Oxcetera
          </Link>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join Oxcetera to shop and track your beauty orders.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-semibold"
              >
                Full Name
              </label>

              <div className="relative">
                <UserPlus className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-[#0A2A6A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-[#0A2A6A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  placeholder="At least 12 characters"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-[#0A2A6A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm Password
              </label>

              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                placeholder="Repeat your password"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-[#0A2A6A] focus:outline-none"
              />
            </div>

            {state.error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {state.error}
              </p>
            )}

            {state.success && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                {state.success}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[#0A2A6A] py-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-60"
            >
              {pending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-[#0A2A6A] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
