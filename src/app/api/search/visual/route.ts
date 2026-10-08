
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// ==========================================
// CONFIGURATION
// ==========================================

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-3.8-flash';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// ==========================================
// TYPES
// ==========================================

type IdentifiedProduct = {
  brand: string;
  title: string;
  category: string;
  keywords: string[];
};

type GeminiError = {
  code?: number;
  status?: number | string;
  message?: string;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getGeminiError(error: unknown): GeminiError {
  const message = getErrorMessage(error);

  const result: GeminiError = {
    message,
  };

  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    if (typeof obj.status === 'number') {
      result.status = obj.status;
    }

    if (typeof obj.code === 'number') {
      result.code = obj.code;
    }

    if (typeof obj.status === 'string') {
      result.status = obj.status;
    }
  }

  // Gemini may return JSON inside the error message.
  try {
    const parsed = JSON.parse(message);

    if (parsed?.error) {
      const nested = parsed.error;

      result.code = nested.code ?? result.code;
      result.status = nested.status ?? result.status;
      result.message = nested.message ?? message;
    }
  } catch {
    // Error message is not JSON.
  }

  return result;
}

function isRetryableError(error: unknown): boolean {
  const geminiError = getGeminiError(error);

  const message = (
    geminiError.message || ''
  ).toLowerCase();

  return (
    geminiError.code === 503 ||
    geminiError.code === 429 ||
    geminiError.status === 503 ||
    geminiError.status === 429 ||
    geminiError.status === 'UNAVAILABLE' ||
    geminiError.status === 'RESOURCE_EXHAUSTED' ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable')
  );
}

// ==========================================
// GEMINI RETRY FUNCTION
// ==========================================

async function generateWithRetry(
  ai: GoogleGenAI,
  request: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]
) {
  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `Gemini request attempt ${attempt + 1}/${MAX_RETRIES + 1}`
      );

      const response =
        await ai.models.generateContent(request);

      return response;
    } catch (error: unknown) {
      const geminiError = getGeminiError(error);

      console.error(
        `Gemini attempt ${attempt + 1} failed:`,
        geminiError
      );

      if (
        !isRetryableError(error) ||
        attempt === MAX_RETRIES
      ) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay =
        INITIAL_RETRY_DELAY *
          Math.pow(2, attempt) +
        Math.floor(Math.random() * 500);

      console.warn(
        `Gemini busy. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    'Gemini failed after maximum retry attempts'
  );
}

// ==========================================
// MAIN VISUAL SEARCH API
// ==========================================

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------
    // STEP 1: Validate environment variables
    // --------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey || !supabaseUrl || !supabaseKey) {
      console.error(
        'Missing Gemini or Supabase environment variables'
      );

      return NextResponse.json(
        {
          error: 'Server configuration is incomplete',
        },
        { status: 500 }
      );
    }

    // --------------------------------------
    // STEP 2: Receive uploaded image
    // --------------------------------------

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid multipart form data',
        },
        { status: 400 }
      );
    }

    const file = formData.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'No image uploaded',
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // STEP 3: Validate image type
    // --------------------------------------

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            'Unsupported image type. Use JPEG, PNG, WebP, HEIC or HEIF.',
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // STEP 4: Validate image size
    // --------------------------------------

    if (
      file.size === 0 ||
      file.size > MAX_IMAGE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            'Image must be non-empty and no larger than 10 MB',
        },
        { status: 400 }
      );
    }

    // --------------------------------------
    // STEP 5: Convert image to Base64
    // --------------------------------------

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const base64Data = buffer.toString('base64');

    // --------------------------------------
    // STEP 6: Initialize Gemini
    // --------------------------------------

    const ai = new GoogleGenAI({
      apiKey,
    });

    // --------------------------------------
    // STEP 7: Analyze image with retries
    // --------------------------------------

    let response;

    try {
      response = await generateWithRetry(ai, {
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
                  Analyze this image carefully.

                  Identify the beauty or cosmetic
                  product shown.

                  Extract:

                  1. Brand name
                  2. Product title
                  3. Product category
                  4. Two or three searchable keywords

                  Important rules:

                  - Do not invent brand names.
                  - Do not invent product names.
                  - Use empty strings for unknown fields.
                  - Use an empty array if no keywords
                    can be identified.
                  - Return structured JSON only.
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
              brand: {
                type: Type.STRING,
              },

              title: {
                type: Type.STRING,
              },

              category: {
                type: Type.STRING,
              },

              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
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
    } catch (error: unknown) {
      const geminiError = getGeminiError(error);

      console.error(
        'Gemini analysis failed:',
        geminiError
      );

      const unavailable = isRetryableError(error);

      return NextResponse.json(
        {
          error: unavailable
            ? 'Gemini is temporarily unavailable'
            : 'Gemini image analysis failed',

          details:
            process.env.NODE_ENV === 'development'
              ? geminiError.message
              : undefined,

          retryable: unavailable,
        },
        {
          status: unavailable ? 503 : 502,
          headers: unavailable
            ? { 'Retry-After': '15' }
            : {},
        }
      );
    }

    // --------------------------------------
    // STEP 8: Validate Gemini response
    // --------------------------------------

    if (!response.text) {
      return NextResponse.json(
        {
          error: 'AI could not identify the product',
        },
        { status: 422 }
      );
    }

    // --------------------------------------
    // STEP 9: Parse Gemini JSON
    // --------------------------------------

    let raw: unknown;

    try {
      raw = JSON.parse(response.text);
    } catch {
      console.error(
        'Invalid Gemini JSON:',
        response.text
      );

      return NextResponse.json(
        {
          error: 'AI returned invalid JSON',
        },
        { status: 502 }
      );
    }

    if (
      !raw ||
      typeof raw !== 'object' ||
      Array.isArray(raw)
    ) {
      return NextResponse.json(
        {
          error:
            'AI returned an invalid product description',
        },
        { status: 502 }
      );
    }

    // --------------------------------------
    // STEP 10: Normalize extracted data
    // --------------------------------------

    const result = raw as Record<
      string,
      unknown
    >;

    const asString = (
      value: unknown
    ): string =>
      typeof value === 'string'
        ? value.trim()
        : '';

    const parsed: IdentifiedProduct = {
      brand: asString(result.brand),

      title: asString(result.title),

      category: asString(result.category),

      keywords: Array.isArray(result.keywords)
        ? result.keywords
            .filter(
              (item): item is string =>
                typeof item === 'string'
            )
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    // --------------------------------------
    // STEP 11: Build product search query
    // --------------------------------------

    const queryTerm = [
      parsed.brand,
      parsed.title,
      ...parsed.keywords,
      parsed.category,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    console.log(
      'Visual search query:',
      queryTerm
    );

    if (!queryTerm) {
      return NextResponse.json({
        identified: parsed,
        products: [],
        message:
          'No searchable product information found',
      });
    }

    // --------------------------------------
    // STEP 12: Initialize Supabase
    // --------------------------------------

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    // --------------------------------------
    // STEP 13: Search matching products
    // --------------------------------------

    const {
      data: products,
      error: supabaseError,
    } = await supabase.rpc(
      'search_products_visual',
      {
        query_text: queryTerm,
        match_limit: 8,
      }
    );

    if (supabaseError) {
      console.error(
        'Supabase query error:',
        supabaseError
      );

      return NextResponse.json(
        {
          error: 'Product search failed',

          details:
            process.env.NODE_ENV === 'development'
              ? supabaseError.message
              : undefined,
        },
        { status: 500 }
      );
    }

    // --------------------------------------
    // STEP 14: Return successful response
    // --------------------------------------

    return NextResponse.json(
      {
        identified: parsed,
        products: products ?? [],
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // --------------------------------------
    // GLOBAL ERROR HANDLER
    // --------------------------------------

    console.error(
      '=== VISUAL SEARCH ERROR ==='
    );

    console.error(error);

    const message = getErrorMessage(error);

    return NextResponse.json(
      {
        error: 'Image analysis failed',

        details:
          process.env.NODE_ENV === 'development'
            ? message
            : undefined,
      },
      { status: 500 }
    );
  }
}
