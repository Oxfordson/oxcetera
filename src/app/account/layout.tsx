
import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  UserRound,
  ShoppingBag,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { signOut } from '../auth/actions';

const links = [
  {
    label: 'Account Overview',
    href: '/account',
    icon: LayoutDashboard,
  },
  {
    label: 'My Orders',
    href: '/account#orders',
    icon: Package,
  },
  {
    label: 'Profile Details',
    href: '/account#profile',
    icon: UserRound,
  },
];

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?redirect=/account');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D6252A]">
            Oxcetera Beauty
          </p>

          <h1 className="mt-2 text-3xl font-serif font-bold text-[#0A2A6A]">
            My Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your shopping experience and stay updated on your orders.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-5 border-b px-3 pb-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F7FF]">
                <UserRound className="h-6 w-6 text-[#0A2A6A]" />
              </div>

              <p className="text-sm font-bold text-gray-900">
                My Oxcetera
              </p>

              <p className="mt-1 break-all text-xs text-gray-500">
                {user.email}
              </p>
            </div>

            <nav aria-label="Customer account" className="space-y-1">
              {links.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-[#F4F7FF] hover:text-[#0A2A6A]"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}

              <Link
                href="/shop"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-[#F4F7FF]"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </nav>

            <div className="mt-5 border-t pt-4">
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Secure customer account
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
