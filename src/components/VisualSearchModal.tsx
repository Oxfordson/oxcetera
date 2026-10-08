'use client';

import React, { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualSearchModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [detected, setDetected] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResults([]);
    setDetected(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/search/visual', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setDetected(data.identified);
      setResults(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Visual Product Search</h3>
        <p className="text-xs text-gray-500 mb-4">Snap a photo or upload an image to identify the item.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        {!preview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2A6A] hover:bg-gray-50 transition"
          >
            <Camera className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Take a photo or upload file</span>
            <span className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP</span>
          </div>
        )}

        {preview && (
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-200 mb-3">
              <Image src={preview} alt="Upload preview" fill className="object-cover" />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#0A2A6A] underline mb-4"
            >
              Choose another photo
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A2A6A] mb-2" />
            <p className="text-xs text-gray-500">Analyzing product with AI...</p>
          </div>
        )}

        {detected && (
          <div className="bg-gray-50 p-3 rounded text-xs mb-4">
            <span className="font-semibold text-gray-700">Identified:</span>{' '}
            {[detected.brand, detected.title].filter(Boolean).join(' ')} 
            {detected.category && ` (${detected.category})`}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Matched Products</h4>
            <div className="grid grid-cols-2 gap-3">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="p-2 border border-gray-150 rounded-lg hover:border-[#0A2A6A] transition flex flex-col group"
                >
                  {product.image_url && (
                    <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-50">
                      <Image 
                        src={product.image_url} 
                        alt={product.title} 
                        fill 
                        className="object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{product.title}</span>
                  <span className="text-xs text-[#D6252A] font-bold mt-auto">${Number(product.price).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && preview && results.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-4">No matching products found in stock.</p>
        )}
      </div>
    </div>
  );
}