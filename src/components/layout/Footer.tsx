'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Standardizing social icons using exact SVG paths to prevent library missing export issues[cite: 12]
const SocialIcon = ({ type, className }: { type: 'facebook' | 'instagram' | 'snapchat' | 'twitter', className?: string }) => {
  switch (type) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.181a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
        </svg>
      );
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
          <path d="M12.122 0C9.697 0 7.741 1.956 7.741 4.381c0 1.831 1.096 3.42 2.69 4.07.133.055.228.181.228.324 0 .092-.036.18-.1.246l-.59.59c-.58.58-1.52.58-2.1 0l-.58-.58c-.066-.066-.154-.102-.246-.102-.143 0-.27.095-.325.228-.65 1.593-2.239 2.69-4.07 2.69-2.425 0-4.381-1.956-4.381-4.381 0-.194.157-.351.351-.351h2.247c.194 0 .351.157.351.351 0 1.259.99 2.278 2.247 2.278.431 0 .835-.12 1.18-.328.125-.075.281-.07.4.015l1.042.744c.48.343 1.135.343 1.615 0l1.042-.744c.12-.085.275-.09.4-.015.345.208.75.328 1.18.328 1.257 0 2.247-1.02 2.247-2.278 0-.194.157-.351.351-.351h2.247c.194 0 .351.157.351.351 0 2.425-1.956 4.381-4.381 4.381-1.831 0-3.42-1.096-4.07-2.69-.055-.133-.181-.228-.324-.228-.092 0-.18.036-.246.1l-.58.58c-.58.58-1.52.58-2.1 0l-.59-.59c-.066-.066-.154-.102-.246-.102-.143 0-.27.095-.325.228-.65 1.593-2.239 2.69-4.07 2.69-2.425 0-4.381-1.956-4.381-4.381 0-.194.157-.351.351-.351H12.122c.194 0 .351.157.351.351zM11.996 24c-3.14 0-6.103-.984-8.544-2.685-.099-.069-.158-.182-.158-.303V15.71c0-.131.069-.251.181-.32l3.413-2.102c.088-.054.143-.15.143-.254V11.23c0-.194-.157-.351-.351-.351H4.636c-.145 0-.28.089-.335.224-1.127 2.766-3.792 4.673-6.845 4.673-.194 0-.351-.157-.351-.351V13.88c0-.142.085-.27.218-.332C.46 13.064 2.66 11.026 3.197 8.01c.018-.1.082-.182.174-.222L5.8 6.643c.092-.04.154-.129.16-.23.08-1.393.585-2.68 1.405-3.753.073-.095.187-.15.308-.15h8.654c.121 0 .235.055.308.15.82 1.073 1.325 2.36 1.405 3.753.006.101.068.19.16.23l2.429 1.145c.092.04.156.122.174.222.537 3.016 2.737 5.054 5.874 5.538.133.062.218.19.218.332v1.545c0 .194-.157.351-.351.351h-2.044c-.194 0-.351.157-.351.351v1.804c0 .104.055.2.143.254l3.413 2.102c.112.069.181.189.181.32v5.302c0 .121-.059.234-.158.303C18.099 23.016 15.136 24 11.996 24z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="16" height="16">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    default:
      return null;
  }
};

// Helper to convert a 2-letter country code into a flag emoji[cite: 12]
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function Footer() {
  const [location, setLocation] = useState({ country: 'Nigeria', code: 'NG' });
  const [isLoading, setIsLoading] = useState(true);

  // Real Country Detector using a free IP geolocation API[cite: 12]
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data.country_name && data.country_code) {
          setLocation({ country: data.country_name, code: data.country_code });
        }
      })
      .catch((err) => {
        console.error("Country detection blocked or failed, falling back to default.", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Static list of international sites for the grid[cite: 12]
  const internationalSites = ['ES', 'DE', 'AU', 'FR', 'DK', 'IT', 'NL', 'PL', 'US', 'SE'];

  return (
    <footer className="w-full bg-black text-[#cccccc] font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        
        {/* Top Logo Row[cite: 12] */}
        <div className="mb-12">
          <Link href="/" className="inline-block" aria-label="Oxcetera Home">
            <Image 
              src="/images/logo.png" 
              alt="Oxcetera Logo" 
              width={180} 
              height={60} 
              className="w-auto h-12 md:h-16 object-contain"
            />
          </Link>
        </div>

        {/* 4-Column Grid Links Area[cite: 12] */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          
          {/* Column 1 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Help & Information
            </h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-sm hover:text-white hover:underline transition">Help</Link></li>
              <li><Link href="/track" className="text-sm hover:text-white hover:underline transition">Track order</Link></li>
              <li><Link href="/delivery-returns" className="text-sm hover:text-white hover:underline transition">Delivery & returns</Link></li>
              <li><Link href="/sitemap" className="text-sm hover:text-white hover:underline transition">Sitemap</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              About Oxcetera
            </h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm hover:text-white hover:underline transition">About us</Link></li>
              <li><Link href="/careers" className="text-sm hover:text-white hover:underline transition">Careers at Oxcetera</Link></li>
              <li><Link href="/corporate-responsibility" className="text-sm hover:text-white hover:underline transition">Corporate responsibility</Link></li>
              <li><Link href="/investors" className="text-sm hover:text-white hover:underline transition">Investors' site</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              More From Oxcetera
            </h3>
            <ul className="space-y-3">
              <li><Link href="/mobile-app" className="text-sm hover:text-white hover:underline transition">Mobile and Oxcetera apps</Link></li>
              <li><Link href="/gift-vouchers" className="text-sm hover:text-white hover:underline transition">Gift vouchers</Link></li>
              <li><Link href="/black-friday" className="text-sm hover:text-white hover:underline transition">Black Friday</Link></li>
            </ul>
          </div>

          {/* Column 4: Location Detector[cite: 12] */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Shopping From:
            </h3>
            <div className="flex items-center text-sm mb-6">
              <span className="mr-2">You're in</span>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <span className="text-lg leading-none mr-2" aria-label={`Country flag for ${location.country}`}>
                  {getFlagEmoji(location.code)}
                </span>
              )}
              <span className="mx-2 text-[#666]">|</span>
              <button className="font-bold text-white hover:underline uppercase tracking-wider text-xs">
                Change
              </button>
            </div>
            
            <p className="text-sm mb-3">Some of our international sites:</p>
            <div className="flex flex-wrap gap-3">
              {internationalSites.map((code) => (
                <button key={code} className="text-xl hover:opacity-80 transition" aria-label={`Shop from ${code}`}>
                  {getFlagEmoji(code)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social & Payment Centered Row[cite: 12] */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-8">
          {/* Social Icons - Now using native SVG to avoid Lucide version conflicts[cite: 12] */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition" aria-label="X (Twitter)">
              <SocialIcon type="twitter" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition" aria-label="Facebook">
              <SocialIcon type="facebook" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-80 transition" aria-label="Instagram">
              <SocialIcon type="instagram" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#FFFC00] text-black flex items-center justify-center hover:opacity-80 transition" aria-label="Snapchat">
              <SocialIcon type="snapchat" />
            </a>
          </div>

          {/* Vertical Divider[cite: 12] */}
          <div className="hidden md:block w-px h-8 bg-[#444444]"></div>

          {/* Payment Icons[cite: 12] */}
          <div className="flex items-center gap-2">
            <div className="bg-white text-[#1A1F71] px-2 py-1 rounded text-[10px] font-bold tracking-wider w-12 text-center h-7 flex items-center justify-center">VISA</div>
            <div className="bg-white text-[#EB001B] px-2 py-1 rounded text-[10px] font-bold tracking-wider w-12 text-center h-7 flex items-center justify-center">MC</div>
            <div className="bg-white text-[#003087] px-2 py-1 rounded text-[10px] font-bold tracking-wider w-12 text-center h-7 flex items-center justify-center">PayPal</div>
            <div className="bg-white text-[#2E77BC] px-2 py-1 rounded text-[10px] font-bold tracking-wider w-12 text-center h-7 flex items-center justify-center">AMEX</div>
            <div className="bg-white text-[#1A1F71] px-2 py-1 rounded text-[10px] font-bold tracking-wider w-12 text-center h-7 flex items-center justify-center leading-tight">VISA<br/><span className="text-[6px]">Electron</span></div>
          </div>
        </div>

      </div>

      {/* Bottom Bar[cite: 12] */}
      <div className="bg-[#eeeeee] text-[#666666] py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} OXCETERA. Built by Dooxdigital.</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-black hover:underline">Privacy & Cookies</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-black hover:underline">Ts&Cs</Link>
            <span>|</span>
            <Link href="/accessibility" className="hover:text-black hover:underline">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}