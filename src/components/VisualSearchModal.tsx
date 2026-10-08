
'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Camera,
  X,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface IdentifiedProduct {
  brand: string;
  title: string;
  category: string;
  keywords: string[];
}

interface CatalogProduct {
  id: string | number;
  slug: string | null;
  title: string;
  category?: string | null;
  image_url?: string | null;
  price?: number | string | null;
}

type MatchType =
  | 'direct'
  | 'category'
  | 'catalog'
  | 'none';

interface VisualSearchResponse {
  success?: boolean;
  identified?: IdentifiedProduct;
  products?: CatalogProduct[];
  matchType?: MatchType;
  message?: string;
  analysisError?: string | null;
  error?: string;
}

export function VisualSearchModal({
  isOpen,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<
    string | null
  >(null);

  const [results, setResults] = useState<
    CatalogProduct[]
  >([]);

  const [detected, setDetected] = useState<
    IdentifiedProduct | null
  >(null);

  const [matchType, setMatchType] =
    useState<MatchType>('none');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const requestRef =
    useRef<AbortController | null>(null);

  const previewRef = useRef<string | null>(null);

  // Clean up when component unmounts.
  useEffect(() => {
    return () => {
      requestRef.current?.abort();

      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const resetSearch = () => {
    requestRef.current?.abort();

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setPreview(null);
    setResults([]);
    setDetected(null);
    setMatchType('none');
    setMessage('');
    setError('');
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetSearch();
    onClose();
  };

  const handleCapture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    requestRef.current?.abort();

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    previewRef.current = previewUrl;
    setPreview(previewUrl);

    setLoading(true);
    setResults([]);
    setDetected(null);
    setMatchType('none');
    setMessage('');
    setError('');

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
        '/api/search/visual',
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );

      const data =
        (await response.json()) as VisualSearchResponse;

      if (!response.ok) {
        throw new Error(
          data.error || 'Visual search failed'
        );
      }

      if (controller.signal.aborted) return;

      setDetected(data.identified || null);
      setResults(data.products || []);
      setMatchType(data.matchType || 'none');
      setMessage(data.message || '');

      if (data.analysisError) {
        setError(data.analysisError);
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;

      console.error('Visual search error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete visual search'
      );
    } finally {
      if (requestRef.current === controller) {
        setLoading(false);
        requestRef.current = null;
      }
    }
  };

  if (!isOpen) return null;

  const detectedText = detected
    ? [
        detected.brand,
        detected.title,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  const catalogSearchTerm =
    detected?.category ||
    detected?.title ||
    detected?.brand ||
    '';

  const heading =
    matchType === 'direct'
      ? 'Matched Products'
      : matchType === 'category'
      ? 'Similar Products'
      : matchType === 'catalog'
      ? 'Explore Our Products'
      : 'Search Results';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close visual search"
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Visual Product Search
        </h3>

        <p className="text-xs text-gray-500 mb-4">
          Snap a photo or upload an image to find
          matching and similar beauty products.
        </p>

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        {/* Upload area */}
        {!preview && (
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2A6A] hover:bg-gray-50 transition w-full"
          >
            <Camera className="w-10 h-10 text-gray-400 mb-2" />

            <span className="text-sm font-medium text-gray-700">
              Take a photo or upload file
            </span>

            <span className="text-xs text-gray-400 mt-1">
              Supports JPG, PNG and WebP
            </span>
          </button>
        )}

        {/* Image preview */}
        {preview && (
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-200 mb-3">
              <Image
                src={preview}
                alt="Uploaded product preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="text-xs text-[#0A2A6A] underline mb-4"
            >
              Choose another photo
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A2A6A] mb-2" />

            <p className="text-xs text-gray-500">
              Analyzing your product and searching
              our catalog...
            </p>
          </div>
        )}

        {/* Error message */}
        {!loading && error && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-4"
          >
            {error}
          </div>
        )}

        {/* Identified item */}
        {!loading && detected && (
          <div className="bg-gray-50 p-3 rounded text-xs mb-4 border border-gray-200">
            <div className="font-semibold text-gray-700 mb-1">
              Identified Item:
            </div>

            <div className="text-gray-900 font-medium">
              {detectedText || 'Beauty product'}

              {detected.category &&
                ` (${detected.category})`}
            </div>

            {catalogSearchTerm && (
              <Link
                href={`/shop?q=${encodeURIComponent(catalogSearchTerm)}`}
                onClick={handleClose}
                className="mt-2 inline-flex items-center gap-1 text-[#0A2A6A] font-semibold hover:underline"
              >
                Search catalog for "
                {catalogSearchTerm}"
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}

        {/* Product results */}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {heading}
              </h4>

              {message && (
                <p className="text-xs text-gray-500 mt-1">
                  {message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={
                    product.slug
                      ? `/shop/${product.slug}`
                      : '/shop'
                  }
                  onClick={handleClose}
                  className="p-2 border border-gray-200 rounded-lg hover:border-[#0A2A6A] transition flex flex-col group"
                >
                  {product.image_url ? (
                    <div className="relative w-full h-24 mb-2 rounded overflow-hidden bg-gray-50">
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 rounded bg-gray-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  <span className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                    {product.title}
                  </span>

                  {product.price != null && (
                    <span className="text-xs text-[#D6252A] font-bold mt-auto">
                      $
                      {Number(product.price).toFixed(2)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading &&
          preview &&
          results.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500 mb-3">
                No products are currently available.
              </p>

              <Link
                href="/shop"
                onClick={handleClose}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A2A6A] underline"
              >
                Browse all products
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

        {/* Retry button */}
        {!loading && preview && (
          <button
            type="button"
            onClick={resetSearch}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#0A2A6A]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start new search
          </button>
        )}
      </div>
    </div>
  );
}
