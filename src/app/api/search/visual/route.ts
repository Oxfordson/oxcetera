
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const RESULT_LIMIT = 8;
const MAX_RETRIES = 3;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

type IdentifiedProduct = {
  brand: string;
  title: string;
  category: string;
  keywords: string[];
};

type CatalogProduct = {
  id: string | number;
  slug: string | null;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  price: number | string | null;
  [key: string]: unknown;
};

type MatchType =
  | 'direct'
  | 'category'
  | 'catalog'
  | 'none';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

function getErrorCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;

    if (typeof value.status === 'number') {
      return value.status;
    }

    if (typeof value.code === 'number') {
      return value.code;
    }
  }

  try {
    const parsed = JSON.parse(getErrorMessage(error));
    return parsed?.error?.code;
  } catch {
    return undefined;
  }
}

function isRetryableError(error: unknown): boolean {
  const code = getErrorCode(error);
  const message = getErrorMessage(error).toLowerCase();

  return (
    code === 503 ||
    code === 429 ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('resource_exhausted')
  );
}

async function generateWithRetry(
  ai: GoogleGenAI,
  request: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]
) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      if (
        !isRetryableError(error) ||
        attempt === MAX_RETRIES
      ) {
        throw error;
      }

      const delay =
        1000 * Math.pow(2, attempt) +
        Math.floor(Math.random() * 400);

      console.warn(
        `Gemini unavailable. Retrying in ${delay}ms`
      );

      await sleep(delay);
    }
  }

  throw new Error('Gemini request failed');
}

// ------------------------------------------
// TOKENIZATION
// ------------------------------------------

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'this',
  'that',
  'product',
  'beauty',
  'cosmetic',
  'cosmetics',
  'item',
  'a',
  'an',
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 &&
        !STOP_WORDS.has(token)
    );
}

function buildSearchTokens(
  identified: IdentifiedProduct
): string[] {
  const combined = [
    identified.brand,
    identified.title,
    identified.category,
    ...identified.keywords,
  ].join(' ');

  return [...new Set(tokenize(combined))].slice(0, 12);
}

// Escape characters meaningful to PostgREST filters
// and SQL LIKE patterns.
function safeToken(token: string): string {
  return token.replace(/[^a-z0-9]/gi, '');
}

function buildOrFilter(tokens: string[]): string {
  const columns = [
    'title',
    'category',
    'description',
  ];

  return tokens
    .flatMap((token) => {
      const safe = safeToken(token);

      if (!safe) return [];

      return columns.map(
        (column) => `${column}.ilike.%${safe}%`
      );
    })
    .join(',');
}

// ------------------------------------------
// PRODUCT RANKING
// ------------------------------------------

function scoreProduct(
  product: CatalogProduct,
  identified: IdentifiedProduct,
  tokens: string[]
): number {
  const title = String(product.title || '').toLowerCase();
  const category = String(
    product.category || ''
  ).toLowerCase();
  const description = String(
    product.description || ''
  ).toLowerCase();

  const brand = identified.brand.toLowerCase();
  const identifiedTitle = identified.title.toLowerCase();
  const identifiedCategory =
    identified.category.toLowerCase();

  let score = 0;

  if (brand && title.includes(brand)) {
    score += 12;
  }

  if (
    identifiedTitle &&
    title.includes(identifiedTitle)
  ) {
    score += 15;
  }

  if (
    identifiedCategory &&
    category.includes(identifiedCategory)
  ) {
    score += 8;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 5;
    }

    if (category.includes(token)) {
      score += 3;
    }

    if (description.includes(token)) {
      score += 1;
    }
  }

  return score;
}

function uniqueProducts(
  products: CatalogProduct[]
): CatalogProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = String(product.id);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

// ------------------------------------------
// MAIN API
// ------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing server configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    // --------------------------------------
    // 1. IMAGE INGESTION
    // --------------------------------------

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const file = formData.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image uploaded' },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format' },
        { status: 400 }
      );
    }

    if (
      file.size === 0 ||
      file.size > MAX_IMAGE_SIZE
    ) {
      return NextResponse.json(
        {
          error: 'Image must be between 1 byte and 10 MB',
        },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(
      await file.arrayBuffer()
    );

    const base64Data = imageBuffer.toString('base64');

    // --------------------------------------
    // 2. GEMINI VISION
    // --------------------------------------

    const ai = new GoogleGenAI({ apiKey });

    let identified: IdentifiedProduct = {
      brand: '',
      title: '',
      category: '',
      keywords: [],
    };

    let analysisError: string | null = null;

    try {
      const response = await generateWithRetry(ai, {
        model: GEMINI_MODEL,

        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: `
Identify the beauty or cosmetic product
shown in this image.

Return:
- brand
- title
- category
- 2 to 3 useful search keywords

Use broad searchable categories such as:
lipstick, foundation, mascara, skincare,
moisturizer, perfume, cleanser, powder,
blush, eyeshadow, or haircare.

Do not invent an exact brand or product name.

If unknown, use empty strings.

Return valid JSON only.
                `,
              },
            ],
          },
        ],

        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'brand',
              'title',
              'category',
              'keywords',
            ],
          },
        },
      });

      const raw = JSON.parse(response.text || '{}');

      identified = {
        brand:
          typeof raw.brand === 'string'
            ? raw.brand.trim()
            : '',
        title:
          typeof raw.title === 'string'
            ? raw.title.trim()
            : '',
        category:
          typeof raw.category === 'string'
            ? raw.category.trim()
            : '',
        keywords: Array.isArray(raw.keywords)
          ? raw.keywords
              .filter(
                (item: unknown): item is string =>
                  typeof item === 'string'
              )
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
      };
    } catch (error) {
      console.error('Gemini analysis failed:', error);

      analysisError = isRetryableError(error)
        ? 'AI identification is temporarily unavailable'
        : 'AI could not identify the image';
    }

    // --------------------------------------
    // 3. TOKEN-BASED SEARCH
    // --------------------------------------

    const tokens = buildSearchTokens(identified);

    console.log('Visual search tokens:', tokens);

    let matchedProducts: CatalogProduct[] = [];
    let matchType: MatchType = 'none';

    if (tokens.length > 0) {
      const filter = buildOrFilter(tokens);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(filter)
        .limit(80);

      if (error) {
        console.error(
          'Token search error:',
          error.message
        );
      } else {
        const candidates =
          (data || []) as CatalogProduct[];

        matchedProducts = candidates
          .map((product) => ({
            product,
            score: scoreProduct(
              product,
              identified,
              tokens
            ),
          }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, RESULT_LIMIT)
          .map((entry) => entry.product);

        if (matchedProducts.length > 0) {
          matchType = 'direct';
        }
      }
    }

    // --------------------------------------
    // 4. CATEGORY FALLBACK
    // --------------------------------------

    if (
      matchedProducts.length < RESULT_LIMIT &&
      identified.category
    ) {
      const categoryTokens = tokenize(
        identified.category
      );

      if (categoryTokens.length > 0) {
        const categoryFilter = buildOrFilter(
          categoryTokens
        );

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(categoryFilter)
          .limit(40);

        if (error) {
          console.error(
            'Category fallback error:',
            error.message
          );
        } else {
          const categoryProducts =
            (data || []) as CatalogProduct[];

          if (
            matchedProducts.length === 0 &&
            categoryProducts.length > 0
          ) {
            matchType = 'category';
          }

          matchedProducts = uniqueProducts([
            ...matchedProducts,
            ...categoryProducts,
          ]).slice(0, RESULT_LIMIT);
        }
      }
    }

    // --------------------------------------
    // 5. GENERAL CATALOG FALLBACK
    // --------------------------------------

    if (matchedProducts.length < RESULT_LIMIT) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(RESULT_LIMIT * 3);

      if (error) {
        console.error(
          'Catalog fallback error:',
          error.message
        );
      } else {
        const catalogProducts =
          (data || []) as CatalogProduct[];

        if (
          matchedProducts.length === 0 &&
          catalogProducts.length > 0
        ) {
          matchType = 'catalog';
        }

        matchedProducts = uniqueProducts([
          ...matchedProducts,
          ...catalogProducts,
        ]).slice(0, RESULT_LIMIT);
      }
    }

    // --------------------------------------
    // 6. RETURN RESULTS
    // --------------------------------------

    return NextResponse.json({
      success: true,
      identified,
      products: matchedProducts,
      matchType,
      searchTokens: tokens,
      analysisError,
      message:
        matchType === 'direct'
          ? 'Products matching your image'
          : matchType === 'category'
          ? 'Related products from this category'
          : matchType === 'catalog'
          ? 'Explore products from our catalog'
          : 'No catalog products available',
    });
  } catch (error: unknown) {
    console.error('Visual search error:', error);

    return NextResponse.json(
      {
        error: 'Visual search failed',
        details:
          process.env.NODE_ENV === 'development'
            ? getErrorMessage(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
