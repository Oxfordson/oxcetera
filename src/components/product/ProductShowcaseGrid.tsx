'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  slug: string;
  sizes?: string[];
}

interface ProductShowcaseGridProps {
  products: Product[];
  currencySymbol?: string;
}

const defaultSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '10', '11'];

export function ProductShowcaseGrid({ products, currencySymbol = '₦' }: ProductShowcaseGridProps) {
  const addItem = useCartStore((state) => state.addItem);
  
  // Track which product currently has the size selector open on hover/click
  const [activeSizePopup, setActiveSizePopup] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [wishlist, setWishlist] = useState<{ [key: string]: boolean }>({});
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (product: Product, size: string) => {
    addItem({
      id: `${product.id}-${size}`,
      title: `${product.title} (Size: ${size})`,
      price: product.price,
      image_url: product.image_url,
    });

    // Flash success state
    setAddedAnimation(product.id);
    setTimeout(() => {
      setAddedAnimation(null);
      setActiveSizePopup(null);
    }, 1000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => {
          const isWishlisted = wishlist[product.id];
          const isPopupOpen = activeSizePopup === product.id;
          const availableSizes = product.sizes || defaultSizes;

          return (
            <div 
              key={product.id}
              className="group relative bg-white flex flex-col justify-between overflow-hidden transition-all duration-300"
              onMouseLeave={() => setActiveSizePopup(null)}
            >
              {/* Image Container with Hover/Interactive Overlay */}
              <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                <Link href={`/shop/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Wishlist Button (Top Right) */}
                <button
                  onClick={(e) => toggleWishlist(product.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition shadow-sm z-10"
                  aria-label="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D6252A] text-[#D6252A]' : ''}`} />
                </button>

                {/* Quick Add Overlay Popup (Matches reference layout style) */}
                {isPopupOpen && (
                  <div className="absolute inset-x-2 bottom-2 bg-white/95 backdrop-blur-md p-3 shadow-xl rounded border border-gray-200 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-[11px] font-bold text-gray-800 uppercase mb-2 flex items-center justify-between">
                      <span>Add to Bag</span>
                      <span className="text-[10px] text-gray-500 font-normal">Select Size</span>
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleQuickAdd(product, size)}
                          className={`py-1 text-xs font-medium border rounded transition-all text-center ${
                            addedAnimation === product.id
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 hover:border-[#0A2A6A] hover:bg-[#0A2A6A] hover:text-white'
                          }`}
                        >
                          {addedAnimation === product.id ? <Check className="w-3 h-3 mx-auto" /> : size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trigger Button to Open Size Selection Overlay */}
                {!isPopupOpen && (
                  <button
                    onClick={() => setActiveSizePopup(product.id)}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center"
                    aria-label="Open Quick Add"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#0A2A6A]" />
                  </button>
                )}
              </div>

              {/* Product Info / Pricing Row */}
              <div className="pt-3 pb-1 flex flex-col">
                <Link href={`/shop/${product.slug}`} className="text-xs text-gray-600 truncate hover:text-[#0A2A6A] transition">
                  {product.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">
                    {currencySymbol}{product.price.toLocaleString()}
                  </span>
                  {product.original_price && (
                    <span className="text-xs text-gray-400 line-through">
                      {currencySymbol}{product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}