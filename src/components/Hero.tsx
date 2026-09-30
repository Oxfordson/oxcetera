'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';

// Slide data tailored for Oxcetera's beauty catalog
const slides = [
  {
    id: 1,
    // Left: Product/Texture Close-up
    leftImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1200', 
    // Right: Editorial Model Shot
    rightImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1200', 
    tagline: 'New Formulation',
    headline: 'Bio-Active Radiance',
    ctaText: 'Discover the Serum',
    ctaLink: '/shop/skincare'
  },
  {
    id: 2,
    leftImage: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=1200',
    rightImage: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1200',
    tagline: 'Editor\'s Pick',
    headline: 'Cellular Hydration',
    ctaText: 'Shop Moisturizers',
    ctaLink: '/shop/moisturizers'
  },
  {
    id: 3,
    leftImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=1200',
    rightImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1200',
    tagline: 'Pure Minerals',
    headline: 'Flawless Base Finish',
    ctaText: 'Explore Makeup',
    ctaLink: '/shop/makeup'
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <section className="relative w-full h-[600px] lg:h-[750px] overflow-hidden bg-[#F4F7FF] group">
      
      {/* Carousel Track */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full flex flex-col md:flex-row">
            
            {/* Left Panel: Context & CTA[cite: 13] */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
              <Image
                src={slide.leftImage}
                alt={slide.headline}
                fill
                className="object-cover"
                priority={slide.id === 1}
              />
              {/* Dark gradient overlay for text readability[cite: 13] */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Bottom-left content overlay[cite: 13] */}
              <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white z-10">
                <p className="text-xs md:text-sm font-semibold tracking-wider uppercase mb-2 drop-shadow-sm">
                  {slide.tagline}
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 drop-shadow-md">
                  {slide.headline}
                </h2>
                <Link
                  href={slide.ctaLink}
                  className="inline-block bg-white text-[#0A2A6A] px-6 py-3 text-sm md:text-base font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {slide.ctaText}
                </Link>
              </div>
            </div>

            {/* Right Panel: Editorial & Brand Identity[cite: 13] */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden hidden md:block">
              <Image
                src={slide.rightImage}
                alt="Editorial Beauty Shot"
                fill
                className="object-cover"
                priority={slide.id === 1}
              />
              
              {/* Centered Brand Overlay[cite: 13] */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <div className="text-center mix-blend-overlay text-white/90 drop-shadow-lg">
                  <h1 className="text-5xl lg:text-7xl font-serif font-bold tracking-tight">
                    OXCETERA
                  </h1>
                  <p className="text-sm lg:text-base tracking-[0.3em] font-semibold uppercase mt-2">
                    Prestige Botanical Lab
                  </p>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Navigation Controls: Outer Edge Arrows[cite: 13] */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white hover:scale-105 transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white hover:scale-105 transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Bottom Right UI: Pagination & Play/Pause[cite: 13] */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-4 z-20">
        
        {/* Slide Counter[cite: 13] */}
        <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest shadow-sm">
          {currentSlide + 1} / {slides.length}
        </div>
        
        {/* Play/Pause Toggle[cite: 13] */}
        <button 
          onClick={togglePlay}
          className="w-8 h-8 rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 hover:border-white transition-all shadow-sm"
          aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </div>

    </section>
  );
}