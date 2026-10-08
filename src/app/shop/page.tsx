
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;
const MAX_SEARCH_TOKENS = 8;

interface ShopPageProps {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    category?: string | string[];
  }>;
}

type Product = {
  id: string | number;
  title: string;
  category: string | null;
  description: string | null;
  slug: string;
  price: number | string | null;
  image_url: string | null;
  [key: string]: unknown;
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'product',
  'beauty',
  'cosmetic',
  'cosmetics',
]);

function firstValue(
  value?: string | string[]
): string {
  return Array.isArray(value)
    ? value[0] || ''
    : value || '';
}

function tokenizeSearch(value: string): string[] {
  return [
    ...new Set(
      value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(
          (token) =>
            token.length >= 2 &&
            !STOP_WORDS.has(token)
        )
    ),
  ].slice(0, MAX_SEARCH_TOKENS);
}

function buildSearchFilter(tokens: string[]) {
  return tokens
    .flatMap((token) => [
      `title.ilike.%${token}%`,
      `category.ilike.%${token}%`,
      `description.ilike.%${token}%`,
    ])
    .join(',');
}

function scoreProduct(
  product: Product,
  tokens: string[],
  originalQuery: string
): number {
  const title = String(product.title || '').toLowerCase();
  const category = String(
    product.category || ''
  ).toLowerCase();
  const description = String(
    product.description || ''
  ).toLowerCase();

  let score = 0;

  if (
    originalQuery &&
    title.includes(originalQuery.toLowerCase())
  ) {
    score += 30;
  }

  for (const token of tokens) {
    if (title.includes(token)) score += 6;
    if (category.includes(token)) score += 4;
    if (description.includes(token)) score += 1;
  }

  return score;
}

function buildShopUrl(
  query: string,
  category: string,
  page: number
): string {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));

  const search = params.toString();

  return search ? `/shop?${search}` : '/shop';
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const searchTerm = firstValue(params.q)
    .trim()
    .slice(0, 120);

  const category = firstValue(params.category)
    .trim()
    .slice(0, 80);

  const rawPage = Number(firstValue(params.page));

  const currentPage =
    Number.isSafeInteger(rawPage) && rawPage > 0
      ? rawPage
      : 1;

  const supabase = await createServerSupabaseClient();

  const tokens = tokenizeSearch(searchTerm);

  let products: Product[] = [];
  let totalCount = 0;
  let errorMessage = '';
  let isFallback = false;

  try {
    let dbQuery = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (tokens.length > 0) {
      dbQuery = dbQuery.or(
        buildSearchFilter(tokens)
      );
    } else if (searchTerm) {
      dbQuery = dbQuery.ilike(
        'title',
        `%${searchTerm.replace(/[%_\\]/g, '')}%`
      );
    }

    if (category) {
      const safeCategory = category.replace(
        /[%_\\]/g,
        ''
      );

      dbQuery = dbQuery.ilike(
        'category',
        `%${safeCategory}%`
      );
    }

    // For text searches, fetch a bounded candidate set
    // and rank it before paginating.
    if (tokens.length > 0) {
      const { data, error } = await dbQuery.limit(200);

      if (error) throw error;

      const ranked = ((data || []) as Product[])
        .map((product) => ({
          product,
          score: scoreProduct(
            product,
            tokens,
            searchTerm
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);

      totalCount = ranked.length;

      const start = (currentPage - 1) * PAGE_SIZE;

      products = ranked.slice(
        start,
        start + PAGE_SIZE
      );
    } else {
      const start = (currentPage - 1) * PAGE_SIZE;

      const {
        data,
        count,
        error,
      } = await dbQuery
        .order('title', { ascending: true })
        .range(start, start + PAGE_SIZE - 1);

      if (error) throw error;

      products = (data || []) as Product[];
      totalCount = count || 0;
    }

    // If no exact/search matches exist, show
    // related category items or general products.
    if (
      products.length === 0 &&
      currentPage === 1 &&
      (searchTerm || category)
    ) {
      let fallbackQuery = supabase
        .from('products')
        .select('*');

      if (category) {
        fallbackQuery = fallbackQuery.ilike(
          'category',
          `%${category.replace(/[%_\\]/g, '')}%`
        );
      }

      const fallback = await fallbackQuery
        .order('title', { ascending: true })
        .limit(PAGE_SIZE);

      if (!fallback.error && fallback.data?.length) {
        products = fallback.data as Product[];
        isFallback = true;
      } else if (category) {
        const general = await supabase
          .from('products')
          .select('*')
          .order('title', { ascending: true })
          .limit(PAGE_SIZE);

        if (!general.error && general.data) {
          products = general.data as Product[];
          isFallback = true;
        }
      }
    }
  } catch (error) {
    console.error('Shop catalog error:', error);

    errorMessage =
      'We could not load products right now. Please try again.';
  }

  const totalPages = Math.ceil(
    totalCount / PAGE_SIZE
  );

  const hasPrevious = currentPage > 1;

  const hasNext =
    currentPage < totalPages && !isFallback;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">
          Beauty Catalog
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Discover beauty, skincare, makeup and more.
        </p>
      </div>

      {/* Search form */}
      <form
        action="/shop"
        method="GET"
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <input
          type="search"
          name="q"
          defaultValue={searchTerm}
          placeholder="Search products, brands, categories..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A2A6A]"
        />

        {category && (
          <input
            type="hidden"
            name="category"
            value={category}
          />
        )}

        <button
          type="submit"
          className="rounded-lg bg-[#0A2A6A] text-white px-6 py-3 text-sm font-semibold hover:bg-[#123C85] transition"
        >
          Search Products
        </button>
      </form>

      {/* Search information */}
      {(searchTerm || category) && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {searchTerm
              ? `Search results for "${searchTerm}"`
              : `Category: ${category}`}
          </p>

          <Link
            href="/shop"
            className="text-xs font-semibold text-[#0A2A6A] hover:underline"
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 mb-6 text-sm"
        >
          {errorMessage}
        </div>
      )}

      {/* Fallback information */}
      {isFallback && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            We couldn't find an exact match.
            Here are other products you might like.
          </p>
        </div>
      )}

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        !errorMessage && (
          <div className="text-center py-16 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              No products found
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Try searching with fewer keywords
              or browse our catalog.
            </p>

            <Link
              href="/shop"
              className="inline-block mt-4 text-sm font-semibold text-[#0A2A6A] hover:underline"
            >
              Browse all products
            </Link>
          </div>
        )
      )}

      {/* Pagination */}
      {!isFallback &&
        !errorMessage &&
        totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            {hasPrevious ? (
              <Link
                href={buildShopUrl(
                  searchTerm,
                  category,
                  currentPage - 1
                )}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Previous
              </Link>
            ) : (
              <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400">
                Previous
              </span>
            )}

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            {hasNext ? (
              <Link
                href={buildShopUrl(
                  searchTerm,
                  category,
                  currentPage + 1
                )}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Next
              </Link>
            ) : (
              <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400">
                Next
              </span>
            )}
          </div>
        )}
    </main>
  );
}
