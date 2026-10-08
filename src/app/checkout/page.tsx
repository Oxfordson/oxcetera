
'use client';

import {
  useActionState,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { processOrder } from './actions';
import {
  Loader2,
  Lock,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

const formatNGN = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore();

  const [ready, setReady] = useState(false);
  const [requestId, setRequestId] = useState('');

  const [state, action, pending] = useActionState(
    processOrder,
    { error: null }
  );

  useEffect(() => {
    setReady(true);

    const key = 'oxcetera_checkout_request_id';
    let id = sessionStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }

    setRequestId(id);
  }, []);

  const sub = subtotal();

  // These are preview figures only.
  // Supabase calculates the authoritative total.
  const shipping = sub >= 75000 || sub === 0
    ? 0
    : 3000;

  const total = sub + shipping;

  if (!ready) {
    return (
      <div className="p-16 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
        <h1 className="text-2xl font-bold mt-4">
          Your cart is empty
        </h1>
        <Link
          href="/shop"
          className="inline-block mt-6 bg-[#0A2A6A] text-white px-6 py-3 rounded-lg"
        >
          Shop Products
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#0A2A6A] mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-7">
          <form action={action} className="space-y-6">
            <input
              type="hidden"
              name="checkout_request_id"
              value={requestId}
            />

            <input
              type="hidden"
              name="cart_data"
              value={JSON.stringify(
                items.map((item) => ({
                  id: item.id,
                  quantity: item.quantity,
                }))
              )}
            />

            <h2 className="font-bold text-lg">
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="first_name"
                placeholder="First Name"
                autoComplete="given-name"
                required
                maxLength={80}
                className="border rounded-lg p-3"
              />
              <input
                name="last_name"
                placeholder="Last Name"
                autoComplete="family-name"
                required
                maxLength={80}
                className="border rounded-lg p-3"
              />
              <input
                name="address"
                placeholder="Street Address"
                autoComplete="street-address"
                required
                maxLength={250}
                className="border rounded-lg p-3 sm:col-span-2"
              />
              <input
                name="city"
                placeholder="City"
                autoComplete="address-level2"
                required
                maxLength={100}
                className="border rounded-lg p-3"
              />
              <input
                name="zip"
                placeholder="Postal Code"
                autoComplete="postal-code"
                required
                maxLength={30}
                className="border rounded-lg p-3"
              />
              <input
                name="country"
                defaultValue="Nigeria"
                placeholder="Country"
                required
                maxLength={100}
                className="border rounded-lg p-3 sm:col-span-2"
              />
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex items-center gap-3 text-sm">
              <Lock className="w-5 h-5 text-[#0A2A6A]" />
              You'll be redirected to Paystack to complete payment securely.
            </div>

            {state.error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{state.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !requestId}
              className="w-full flex justify-center items-center gap-2 bg-[#0A2A6A] hover:bg-blue-900 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing Payment...
                </>
              ) : (
                <>Pay with Paystack • {formatNGN(total)}</>
              )}
            </button>

            <p className="text-xs text-gray-500">
              Your final amount is calculated from current
              Supabase product prices before payment.
            </p>
          </form>
        </section>

        <aside className="lg:col-span-5 bg-gray-50 border rounded-xl p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">
            Order Summary
          </h2>

          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-3 flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Qty: {item.quantity}
                  </p>
                </div>

                <span>
                  {formatNGN(
                    item.price * item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatNGN(sub)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shipping === 0
                  ? 'Free'
                  : formatNGN(shipping)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 font-bold text-lg text-[#0A2A6A]">
              <span>Estimated Total</span>
              <span>{formatNGN(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
