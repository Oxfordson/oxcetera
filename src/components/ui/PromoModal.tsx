'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, Copy } from 'lucide-react';

const CATEGORY_PREFERENCES = [
  'Skincare',
  'Makeup',
  'Haircare',
  'Fragrance',
  'Bath & Body',
];

export function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState('Skincare');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only display if the customer hasn't dismissed or signed up already
    const isDismissed = localStorage.getItem('oxcetera_promo_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // Trigger 2.5 seconds after page load

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('oxcetera_promo_dismissed', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Optional: send to your backend / newsletter list here
    setSubmitted(true);
    localStorage.setItem('oxcetera_promo_dismissed', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('OXCETERA10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white p-8 md:p-10 shadow-2xl z-10 text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black transition"
          aria-label="Close promotion dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo Header */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo_blue.png"
            alt="Oxcetera"
            width={160}
            height={42}
            className="w-auto h-8 object-contain"
          />
        </div>

        {!submitted ? (
          <>
            <p className="text-[11px] font-bold tracking-widest text-[#0A2A6A] uppercase mb-1">
              Unlock Your Welcome Offer
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-black uppercase tracking-tight mb-2">
              EXTRA 10% OFF
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Just enter your email address to claim your exclusive discount code
            </p>

            {/* Preference Chips */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Choose Your Preferences:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {CATEGORY_PREFERENCES.map((pref) => {
                  const isActive = selectedPreference === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setSelectedPreference(pref)}
                      className={`text-xs px-3 py-1 font-semibold border transition ${
                        isActive
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-300 focus:border-black outline-none transition text-center"
              />

              {/* Checkbox Disclaimer */}
              <label className="flex items-start text-left gap-2 text-[10px] text-gray-500 cursor-pointer leading-tight">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-black focus:ring-0 cursor-pointer"
                />
                <span>
                  Yes! Sign me up to receive email notifications regarding new botanical drops,
                  promotions, and beauty journal updates.
                </span>
              </label>

              {/* Action Buttons */}
              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 text-xs uppercase tracking-widest transition shadow-sm"
              >
                I Love Saving Money!
              </button>
            </form>

            <button
              onClick={handleClose}
              className="mt-4 text-[11px] text-gray-400 hover:text-black underline transition"
            >
              I Will Pay Full Price
            </button>
          </>
        ) : (
          /* Success Screen */
          <div className="py-6 space-y-4 animate-in fade-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-[#0A2A6A] mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900 uppercase">You're On The List!</h3>
            <p className="text-xs text-gray-600">
              Apply this promotional code during checkout for 10% off your entire order:
            </p>
            <div className="flex items-center justify-between border-2 border-dashed border-[#0A2A6A] bg-[#F4F7FF] p-3 rounded">
              <span className="font-mono font-bold text-lg tracking-widest text-[#0A2A6A]">
                OXCETERA10
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-bold bg-[#0A2A6A] hover:bg-blue-900 text-white px-3 py-1.5 rounded transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-black text-white font-bold py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}