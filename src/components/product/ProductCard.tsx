'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';

export function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-sm overflow-hidden flex flex-col transition hover:shadow-lg">
      <div className="relative aspect-square w-full bg-[#F4F7FF] overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
        />
        {product.original_price && (
          <span className="absolute top-2 left-2 bg-[#D6252A] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Sale
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">{product.category}</span>
          <h3 className="font-semibold text-gray-900 mt-1 text-sm group-hover:text-[#0A2A6A] transition">
            {product.title}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#0A2A6A]">${Number(product.price).toFixed(2)}</span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">${Number(product.original_price).toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="p-2 bg-[#0A2A6A] text-white hover:bg-[#D6252A] rounded transition"
            title="Quick Add"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}