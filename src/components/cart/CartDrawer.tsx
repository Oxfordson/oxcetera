'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const total = subtotal();
  const freeShippingThreshold = 75;
  const progress = Math.min((total / freeShippingThreshold) * 100, 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={closeCart} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#0A2A6A]">Your Bag ({items.length})</h2>
            <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-3 bg-[#F4F7FF] border-b border-blue-50">
            <div className="flex justify-between text-xs text-gray-700 mb-1 font-medium">
              <span>{total >= freeShippingThreshold ? '🎉 Free Delivery Unlocked!' : `Add $${(freeShippingThreshold - total).toFixed(2)} for Free Shipping`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#D6252A] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p>Your beauty bag is currently empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm font-bold text-[#0A2A6A] mt-1">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 text-xs">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between text-base font-semibold text-gray-900 mb-4">
                <span>Estimated Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-[#0A2A6A] text-white py-3.5 rounded flex items-center justify-center font-medium hover:bg-blue-900 transition gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}