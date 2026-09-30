'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Heart, 
  MapPin, 
  Package, 
  Menu, 
  X, 
  Camera 
} from 'lucide-react';

// Expanded Mega Menu Data Structure for all Beauty Categories[cite: 8]
const categories = [
  {
    name: 'SKINCARE',
    subcategories: [
      {
        title: 'CLEANSERS & TONERS',
        links: ['All Cleansers', 'Foaming Cleansers', 'Toners & Essences', 'Makeup Removers']
      },
      {
        title: 'TREATMENTS',
        links: ['Serums', 'Face Oils', 'Acne Treatments', 'Exfoliators & Peels']
      },
      {
        title: 'MOISTURIZERS',
        links: ['Day Creams', 'Night Creams', 'Eye Creams', 'Face Mists']
      },
      {
        title: 'MASKS',
        links: ['Sheet Masks', 'Clay Masks', 'Overnight Masks']
      }
    ]
  },
  {
    name: 'MAKEUP',
    subcategories: [
      {
        title: 'FACE',
        links: ['Foundation', 'Concealer', 'Powder', 'Blush & Bronzer', 'Primer']
      },
      {
        title: 'EYES',
        links: ['Eyeshadow', 'Mascara', 'Eyeliner', 'Brows']
      },
      {
        title: 'LIPS',
        links: ['Lipstick', 'Lip Gloss', 'Lip Liner', 'Lip Balm']
      }
    ]
  },
  {
    name: 'HAIRCARE',
    subcategories: [
      {
        title: 'WASH & CARE',
        links: ['Shampoo', 'Conditioner', 'Hair Masks', 'Scalp Treatments']
      },
      {
        title: 'STYLING',
        links: ['Hair Oil & Serums', 'Heat Protection', 'Hairspray', 'Dry Shampoo']
      }
    ]
  },
  {
    name: 'BODY & BATH',
    subcategories: [
      {
        title: 'BODY CARE',
        links: ['Body Wash', 'Body Lotions & Oils', 'Body Scrubs', 'Deodorant']
      },
      {
        title: 'BATH & SPA',
        links: ['Bath Bombs', 'Bath Salts', 'Bubble Bath']
      }
    ]
  },
  {
    name: 'FRAGRANCE',
    subcategories: [
      {
        title: 'PERFUME',
        links: ['Eau de Parfum', 'Eau de Toilette', 'Perfume Oils', 'Rollerballs']
      },
      {
        title: 'HOME FRAGRANCE',
        links: ['Candles', 'Diffusers', 'Room Sprays']
      }
    ]
  },
  {
    name: 'TOOLS & BRUSHES',
    subcategories: [
      {
        title: 'MAKEUP TOOLS',
        links: ['Brush Sets', 'Sponges & Applicators', 'Eyelash Curlers']
      },
      {
        title: 'SKIN & HAIR TOOLS',
        links: ['Facial Rollers', 'Cleansing Devices', 'Hair Dryers', 'Styling Irons']
      }
    ]
  },
  { 
    name: 'SALE', 
    highlight: true, 
    subcategories: [
      {
        title: 'OFFERS',
        links: ['All Sale Items', 'Skincare Offers', 'Makeup Offers', 'Last Chance']
      }
    ] 
  },
];

export function Navbar() {
  const router = useRouter();
  const { items, openCart } = useCartStore();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  // SEO-friendly routing handler for search submission
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q');
    
    if (query && query.toString().trim() !== '') {
      router.push(`/shop?q=${encodeURIComponent(query.toString().trim())}`);
      setIsMobileSearchOpen(false); // Close mobile search overlay if open
    }
  };

  return (
    <header className="w-full bg-white flex flex-col z-50 sticky top-0 border-b border-gray-200">
      
      {/* Top Utility Bar[cite: 8] */}
      <div className="hidden lg:flex w-full bg-[#0A2A6A] text-white text-xs font-medium justify-between items-center px-4">
        <div className="flex-1"></div>
        <div className="flex-1 text-center py-1.5 flex items-center justify-center gap-2">
          Complimentary express courier delivery on beauty orders over $75 
          <Link href="/shipping" className="underline hover:text-gray-200">More Info +</Link>
        </div>
        <div className="flex-1 flex justify-end items-center divide-x divide-white/20">
          <Link href="/stores" className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-white/10 transition">
            <MapPin className="w-3.5 h-3.5" /> Store Locator
          </Link>
          <Link href="/track" className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-white/10 transition">
            <Package className="w-3.5 h-3.5" /> Order Tracking
          </Link>
          <Link href="/account" className="flex items-center gap-1.5 pl-4 py-1.5 hover:bg-white/10 transition">
            <User className="w-3.5 h-3.5" /> Account
          </Link>
        </div>
      </div>

      {/* Main Header Row[cite: 8] */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Standard View (Hidden when mobile search is active) */}
        <div className={`items-center justify-between h-20 gap-8 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
          
          {/* Mobile Menu Toggle[cite: 8] */}
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-[#0A2A6A] transition"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo area[cite: 8] */}
          <Link href="/" className="flex flex-shrink-0 items-center" aria-label="Oxcetera Beauty Home">
            <Image 
              src="/images/logo_blue.png" 
              alt="Oxcetera Prestige Botanical Lab Logo" 
              width={220} 
              height={56} 
              priority 
              className="w-auto h-10 md:h-12 object-contain"
            />
          </Link>

          {/* Primary Navigation (Desktop)[cite: 8] */}
          <nav className="hidden lg:flex flex-1 justify-center space-x-6 xl:space-x-8 font-bold text-sm tracking-wide text-[#333333]">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="h-20 flex items-center group cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu(category.name)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link 
                  href={`/shop/${category.name.toLowerCase()}`} 
                  className={`hover:text-[#0A2A6A] transition ${category.highlight ? 'text-[#D6252A]' : ''}`}
                >
                  {category.name}
                </Link>

                {/* Mega Menu Dropdown[cite: 8] */}
                {category.subcategories.length > 0 && activeMegaMenu === category.name && (
                  <div className="absolute top-[calc(100%-1px)] left-0 w-full bg-white border-t border-b border-gray-200 shadow-lg py-8 px-8 flex justify-center gap-12 xl:gap-16 cursor-default">
                    {category.subcategories.map((subGroup) => (
                      <div key={subGroup.title} className="flex flex-col min-w-[160px]">
                        <h3 className="text-xs font-bold text-gray-900 mb-4 tracking-wider">
                          {subGroup.title}
                        </h3>
                        <ul className="space-y-3">
                          {subGroup.links.map((link) => (
                            <li key={link}>
                              <Link 
                                href={`/shop/${link.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-sm font-normal text-gray-600 hover:text-[#0A2A6A] hover:underline"
                              >
                                {link}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Icons & Search[cite: 8] */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Functional Search Bar (Desktop) - Accessible & SEO compliant */}
            <form 
              action="/shop" 
              method="GET" 
              onSubmit={handleSearchSubmit} 
              className="hidden lg:flex items-center bg-gray-100 rounded px-3 py-2 w-52 xl:w-64 border border-transparent focus-within:border-[#0A2A6A] focus-within:bg-white transition-all"
              role="search"
            >
              <button type="submit" aria-label="Submit Search">
                <Search className="w-4 h-4 text-gray-400 mr-2 hover:text-[#0A2A6A] transition-colors" />
              </button>
              <input 
                type="search"
                name="q"
                placeholder="Search products..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                aria-label="Search products"
                required
              />
              <button type="button" aria-label="Visual Search">
                <Camera className="w-4 h-4 text-gray-400 hover:text-[#0A2A6A] ml-2" />
              </button>
            </form>

            {/* Mobile/Tablet Search Icon[cite: 8] */}
            <button 
              className="lg:hidden p-2 text-gray-700 hover:text-[#0A2A6A]" 
              aria-label="Open Search"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-700 hover:text-[#0A2A6A] transition hidden sm:block" aria-label="View Wishlist">
              <Heart className="w-5 h-5" />
            </button>
            
            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-[#0A2A6A] transition"
              aria-label={`View Shopping Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#D6252A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Active State (Replaces header layout dynamically on mobile) */}
        {isMobileSearchOpen && (
          <div className="flex items-center h-20 gap-3 lg:hidden w-full animate-in fade-in zoom-in-95 duration-200">
            <form 
              action="/shop" 
              method="GET" 
              onSubmit={handleSearchSubmit} 
              className="flex-1 flex items-center bg-gray-100 rounded px-3 py-2 border border-transparent focus-within:border-[#0A2A6A] focus-within:bg-white transition-all"
              role="search"
            >
              <button type="submit" aria-label="Submit Search">
                <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              </button>
              <input 
                type="search"
                name="q"
                placeholder="Search beauty products..." 
                className="bg-transparent border-none outline-none text-base w-full text-gray-900"
                aria-label="Search products"
                autoFocus
                required
              />
            </form>
            <button 
              onClick={() => setIsMobileSearchOpen(false)} 
              className="p-2 text-gray-600 hover:text-[#0A2A6A] flex-shrink-0"
              aria-label="Close Search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

      </div>

      {/* Mobile Sidebar Overlay[cite: 8] */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              {/* Mobile Sidebar Logo[cite: 8] */}
              <Image 
                src="/images/logo_blue.png" 
                alt="Oxcetera Logo" 
                width={160} 
                height={40} 
                className="w-auto h-8 object-contain"
              />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-[#0A2A6A]" aria-label="Close Mobile Menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {categories.map((category) => (
                <Link 
                  key={category.name}
                  href={`/shop/${category.name.toLowerCase()}`}
                  className={`block py-3 px-2 text-sm font-bold border-b border-gray-50 ${category.highlight ? 'text-[#D6252A]' : 'text-gray-900'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 bg-gray-50 space-y-4">
              <Link href="/account" className="flex items-center gap-3 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="w-4 h-4" /> My Account
              </Link>
              <Link href="/track" className="flex items-center gap-3 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                <Package className="w-4 h-4" /> Order Tracking
              </Link>
              <Link href="/stores" className="flex items-center gap-3 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                <MapPin className="w-4 h-4" /> Store Locator
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}