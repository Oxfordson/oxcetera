'use client';

import { useActionState } from 'react';
import { signUp } from '../actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full border border-gray-100 p-8 shadow-xs rounded bg-white">
        <h2 className="text-2xl font-serif font-bold text-[#0A2A6A] text-center mb-2">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Join Oxcetera for botanical skincare benefits</p>

        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
            <input 
              name="full_name" 
              type="text" 
              required 
              className="w-full border border-gray-300 p-2.5 rounded text-sm focus:border-[#0A2A6A] outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full border border-gray-300 p-2.5 rounded text-sm focus:border-[#0A2A6A] outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full border border-gray-300 p-2.5 rounded text-sm focus:border-[#0A2A6A] outline-none" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#0A2A6A] hover:bg-blue-900 disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition"
          >
            {isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#0A2A6A] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}