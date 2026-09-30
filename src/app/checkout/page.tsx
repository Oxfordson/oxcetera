'use client';

import { useCartStore } from '@/store/useCartStore';
import { processOrder } from './actions';
import { ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const sub = subtotal();
  const shipping = sub >= 75 || sub === 0 ? 0 : 10;
  const total = sub + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#0A2A6A] mb-8">Secure Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <form
            action={async (formData) => {
              formData.append('cart_data', JSON.stringify(items));
              await processOrder(formData);
              clearCart();
            }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Destination</h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="first_name" placeholder="First Name" required className="border p-2.5 rounded text-sm outline-none" />
                <input name="last_name" placeholder="Last Name" required className="border p-2.5 rounded text-sm outline-none" />
                <input name="address" placeholder="Street Address" required className="col-span-2 border p-2.5 rounded text-sm outline-none" />
                <input name="city" placeholder="City" required className="border p-2.5 rounded text-sm outline-none" />
                <input name="zip" placeholder="Postal Code" required className="border p-2.5 rounded text-sm outline-none" />
                <input name="country" placeholder="Country" defaultValue="United States" required className="col-span-2 border p-2.5 rounded text-sm outline-none" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Details</h2>
              <div className="border border-blue-100 bg-[#F4F7FF] p-4 rounded text-xs text-gray-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0A2A6A]" /> Encrypted test checkout environment active
              </div>
            </div>

            <button type="submit" disabled={items.length === 0} className="w-full bg-[#0A2A6A] hover:bg-blue-900 text-white font-medium py-3.5 rounded transition">
              Complete Order • ${total.toFixed(2)}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 bg-gray-50 p-6 rounded border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="divide-y divide-gray-200">
            {items.map((i) => (
              <div key={i.id} className="py-3 flex justify-between text-sm">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-xs text-gray-500">Qty: {i.quantity}</p>
                </div>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-bold text-base text-[#0A2A6A] pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}