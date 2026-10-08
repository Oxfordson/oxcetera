
import { NextRequest, NextResponse } from 'next/server';
import {
  createHmac,
  timingSafeEqual,
} from 'node:crypto';

import { finalizeVerifiedPayment } from '@/lib/paystack-finalize';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  const rawBody = await request.text();

  const signature =
    request.headers.get('x-paystack-signature') || '';

  const expected = createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  const providedBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (
    !/^[a-f0-9]{128}$/i.test(signature) ||
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;

  if (!reference) {
    return NextResponse.json(
      { error: 'Missing reference' },
      { status: 400 }
    );
  }

  try {
    const result = await finalizeVerifiedPayment(
      reference
    );

    if (result === 'not_verified') {
      return NextResponse.json(
        { error: 'Payment not verified' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      received: true,
      result,
    });
  } catch (error) {
    console.error('Paystack webhook:', error);

    // Non-200 response allows Paystack to retry.
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
