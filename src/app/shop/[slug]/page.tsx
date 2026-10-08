
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type Product = {
  id: string | number;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  price: number | string | null;
  original_price?: number | string | null;
  [key: string]: unknown;
};

function formatPrice(
  value: number | string | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function cleanSlug(slug: string): string {
  return slug.trim().slice(0, 200);
}

async function getProduct(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Product lookup error:', error);
    throw new Error('Unable to load product');
  }

  return data as Product | null;
}

// ------------------------------------------
// DYNAMIC SEO METADATA
// ------------------------------------------

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProduct(
    cleanSlug(slug)
  );

  if (!product) {
    return {
      title: 'Product Not Found | Oxcetera',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${product.title} | Oxcetera`,

    description:
      product.description?.slice(0, 155) ||
      `Shop ${product.title} at Oxcetera.`,

    openGraph: {
      title: product.title,

      description:
        product.description ||
        `Discover ${product.title} at Oxcetera.`,

      images: product.image_url
        ? [{ url: product.image_url }]
        : [],
    },
  };
}

// ------------------------------------------
// PRODUCT DETAIL PAGE
// ------------------------------------------

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  if (!slug || slug.length > 200) {
    notFound();
  }

  const product = await getProduct(
    cleanSlug(slug)
  );

  if (!product) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  let relatedProducts: Product[] = [];

  if (product.category) {
    const safeCategory = product.category.replace(
      /[%_\\]/g,
      ''
    );

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', `%${safeCategory}%`)
      .neq('id', product.id)
      .limit(4);

    if (error) {
      console.error(
        'Related products error:',
        error
      );
    } else {
      relatedProducts = (data || []) as Product[];
    }
  }

  const price = formatPrice(product.price);

  const originalPrice = formatPrice(
    product.original_price
  );

  const hasDiscount =
    product.original_price != null &&
    product.price != null &&
    Number(product.original_price) >
      Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.original_price) -
          Number(product.price)) /
          Number(product.original_price)) *
          100
      )
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-gray-500 mb-8"
      >
        <Link
          href="/shop"
          className="hover:text-[#0A2A6A]"
        >
          Beauty Catalog
        </Link>

        <span>/</span>

        <span className="text-gray-900 truncate">
          {product.title}
        </span>
      </nav>

      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Product image */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <span className="text-sm">
                Product image unavailable
              </span>
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="space-y-6">

          {/* Category */}
          {product.category && (
            <Link
              href={`/shop?category=${encodeURIComponent(
                product.category
              )}`}
              className="inline-block text-xs font-bold uppercase text-[#D6252A] tracking-wider hover:underline"
            >
              {product.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0A2A6A] leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-bold text-[#0A2A6A]">
                {price || 'Price unavailable'}
              </span>

              {hasDiscount && originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="inline-block bg-red-50 text-[#D6252A] text-xs font-semibold px-3 py-1 rounded-full">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Description */}
          {product.description ? (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Product Description
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No description is currently available
              for this product.
            </p>
          )}

          {/* Navigation */}
          <div className="border-t border-gray-200 pt-6">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-[#0A2A6A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#123C85] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-gray-200 pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#0A2A6A]">
              You May Also Like
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Discover more products in this category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
