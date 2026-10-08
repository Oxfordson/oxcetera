
import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BookOpen,
  Store,
  UserRound,
  ShieldCheck,
  Menu,
} from 'lucide-react';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const navigation = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Orders',
    href: '/admin#orders',
    icon: ShoppingCart,
  },
  {
    label: 'Products & Inventory',
    href: '/admin#products',
    icon: Package,
  },
  {
    label: 'Customers',
    href: '/admin#customers',
    icon: Users,
  },
  {
    label: 'Beauty Journal',
    href: '/admin#journal',
    icon: BookOpen,
  },
];

function NavigationLinks() {
  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {navigation.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    redirect('/account');
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#081D46] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-7">
          <Link href="/admin" className="text-2xl font-serif font-bold">
            Oxcetera
          </Link>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Operations
          </p>
        </div>

        <div className="flex-1 px-3 py-6">
          <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <NavigationLinks />
        </div>

        <div className="space-y-2 border-t border-white/10 p-4">
          <Link
            href="/shop"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Store className="h-4 w-4" />
            View Storefront
          </Link>

          <Link
            href="/account"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <UserRound className="h-4 w-4" />
            My Account
          </Link>

          <div className="flex items-center gap-2 border-t border-white/10 px-4 pt-4 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Authorized administrator
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile navigation */}
        <div className="border-b bg-[#081D46] text-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/admin" className="font-serif text-xl font-bold">
              Oxcetera Admin
            </Link>
            <Menu className="h-5 w-5" />
          </div>

          <details className="border-t border-white/10">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
              Open Management Menu
            </summary>

            <div className="px-3 pb-4">
              <NavigationLinks />
              <Link
                href="/account"
                className="block px-4 py-3 text-sm text-slate-300"
              >
                My Account
              </Link>
            </div>
          </details>
        </div>

        <div className="border-b bg-white px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Operations Workspace
              </p>
              <p className="text-sm font-semibold text-[#0A2A6A]">
                Welcome, {profile.full_name || user.email}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0A2A6A]">
              Administrator
            </span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
