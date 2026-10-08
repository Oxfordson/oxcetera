
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, User, LogOut, ShoppingBag } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { signOut } from '../auth/actions';

export const dynamic = 'force-dynamic';

function formatMoney(amount: number | string, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return '—';

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function readableStatus(value: string | null | undefined) {
  return (value || 'pending').replaceAll('_', ' ');
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/account');
  }

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        payment_status,
        currency,
        total_amount,
        shipping_fee,
        order_items (
          id,
          quantity,
          price,
          products (
            title
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (profileResult.error) {
    console.error('Account profile query failed', profileResult.error);
  }

  const profile = profileResult.data;
  const orders = ordersResult.data ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">
            My Account
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, {profile?.full_name || user.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="rounded bg-[#0A2A6A] px-4 py-2 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>

          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="rounded border px-4 py-2 text-sm font-semibold"
            >
              Admin Dashboard
            </Link>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <section className="h-fit rounded-lg border border-blue-100 bg-[#F4F7FF] p-6">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-[#0A2A6A]">
            <User className="h-5 w-5" />
            Profile Details
          </h2>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-semibold">
                {profile?.full_name || 'Not provided'}
              </dd>
            </div>

            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="break-all font-semibold">
                {user.email || profile?.email}
              </dd>
            </div>

            <div>
              <dt className="text-gray-500">Account Type</dt>
              <dd className="font-semibold capitalize">
                {profile?.role === 'admin' ? 'Administrator' : 'Customer'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="md:col-span-2">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
            <Package className="h-5 w-5 text-[#0A2A6A]" />
            Order History
          </h2>

          {ordersResult.error ? (
            <p role="alert" className="rounded border border-red-200 p-5 text-sm text-red-700">
              We couldn't load your orders. Please try again.
            </p>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-9 w-9 text-gray-400" />
              <p className="mb-4 text-sm text-gray-600">
                You haven't placed any orders yet.
              </p>
              <Link href="/shop" className="font-semibold text-[#0A2A6A] underline">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const currency = order.currency || 'NGN';

                return (
                  <article
                    key={order.id}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                      <div>
                        <p className="font-bold">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <p className="font-semibold capitalize text-[#0A2A6A]">
                          Payment: {readableStatus(order.payment_status)}
                        </p>
                        <p className="mt-1 capitalize text-gray-600">
                          Order: {readableStatus(order.status)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.order_items?.map((item) => {
                        const product = Array.isArray(item.products)
                          ? item.products[0]
                          : item.products;

                        return (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4 text-sm"
                          >
                            <span className="text-gray-700">
                              {product?.title || 'Product'} × {item.quantity}
                            </span>
                            <span className="shrink-0 font-medium">
                              {formatMoney(
                                Number(item.price) * item.quantity,
                                currency
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex justify-between border-t pt-4 font-bold text-[#0A2A6A]">
                      <span>Total (including shipping)</span>
                      <span>{formatMoney(order.total_amount, currency)}</span>
                    </div>

                    {order.payment_status === 'paid_stock_issue' && (
                      <p className="mt-3 rounded bg-amber-50 p-3 text-xs text-amber-900">
                        Payment received. An item needs inventory review.
                        Our team will contact you about fulfillment or a refund.
                      </p>
                    )}

                    {order.payment_status === 'unpaid' && (
                      <p className="mt-3 text-xs text-gray-500">
                        Payment has not been confirmed for this order.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
