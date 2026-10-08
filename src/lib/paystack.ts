
import 'server-only';

const PAYSTACK_API = 'https://api.paystack.co';

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is missing');
  }

  return key;
}

export type PaystackTransaction = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer?: {
    email?: string;
  };
};

export async function initializePaystackPayment({
  email,
  amountKobo,
  reference,
}: {
  email: string;
  amountKobo: number;
  reference: string;
}) {
  if (
    !Number.isSafeInteger(amountKobo) ||
    amountKobo <= 0
  ) {
    throw new Error('Invalid payment amount');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is missing');
  }

  const response = await fetch(
    `${PAYSTACK_API}/transaction/initialize`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: String(amountKobo),
        currency: 'NGN',
        reference,
        callback_url:
          `${siteUrl}/checkout/verify`,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    }
  );

  const result = await response.json();

  if (
    !response.ok ||
    !result.status ||
    !result.data?.authorization_url
  ) {
    throw new Error(
      result.message || 'Unable to initialize payment'
    );
  }

  const url = new URL(result.data.authorization_url);

  if (
    url.protocol !== 'https:' ||
    !(
      url.hostname === 'paystack.com' ||
      url.hostname.endsWith('.paystack.com')
    )
  ) {
    throw new Error('Invalid Paystack checkout URL');
  }

  return {
    authorizationUrl: url.toString(),
    reference: String(result.data.reference),
  };
}

export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackTransaction | null> {
  if (!/^[a-zA-Z0-9._=-]{1,100}$/.test(reference)) {
    return null;
  }

  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();

  if (!result.status || !result.data) {
    return null;
  }

  return {
    reference: result.data.reference,
    status: result.data.status,
    amount: result.data.amount,
    currency: result.data.currency,
    customer: result.data.customer,
  };
}
