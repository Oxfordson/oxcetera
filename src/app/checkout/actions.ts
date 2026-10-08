
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { initializePaystackPayment } from '@/lib/paystack';
import { redirect } from 'next/navigation';

export type CheckoutState = {
  error: string | null;
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string'
    ? value.trim()
    : '';
}

export async function processOrder(
  _previousState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    redirect('/auth/login?redirect=/checkout');
  }

  const address = {
    first_name: field(formData, 'first_name'),
    last_name: field(formData, 'last_name'),
    address: field(formData, 'address'),
    city: field(formData, 'city'),
    country: field(formData, 'country'),
    zip: field(formData, 'zip'),
  };

  if (
    Object.values(address).some(
      (value) => !value || value.length > 250
    )
  ) {
    return {
      error: 'Please complete your shipping address.',
    };
  }

  let items: unknown;

  try {
    items = JSON.parse(field(formData, 'cart_data'));
  } catch {
    return { error: 'Invalid shopping cart.' };
  }

  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 50
  ) {
    return { error: 'Your cart is empty or invalid.' };
  }

  const sanitizedItems = [];

  const seen = new Set<string>();

  for (const item of items) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(item.id) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20 ||
      seen.has(item.id)
    ) {
      return { error: 'Invalid cart item.' };
    }

    seen.add(item.id);

    sanitizedItems.push({
      id: item.id,
      quantity: item.quantity,
    });
  }

  const requestId = field(
    formData,
    'checkout_request_id'
  );

  if (
    !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(requestId)
  ) {
    return {
      error: 'Invalid checkout session. Refresh the page.',
    };
  }

  const { data, error } = await supabase.rpc(
    'create_ngn_checkout_order',
    {
      p_items: sanitizedItems,
      p_address: address,
      p_request_id: requestId,
    }
  );

  if (error) {
    console.error('Order creation:', error);

    if (
      error.message.includes(
        'PRODUCT_NOT_PRICED_IN_NGN'
      )
    ) {
      return {
        error:
          'Some products are awaiting NGN pricing. ' +
          'Please try again after prices are updated.',
      };
    }

    if (error.message.includes('OUT_OF_STOCK')) {
      return {
        error: 'One or more products are out of stock.',
      };
    }

    return {
      error: 'Unable to create your order.',
    };
  }

  const order = Array.isArray(data)
    ? data[0]
    : data;

  if (
    !order?.order_id ||
    !order?.payment_reference ||
    !Number.isSafeInteger(Number(order.total_kobo))
  ) {
    return {
      error: 'Invalid order confirmation.',
    };
  }

  let paymentUrl: string;

  try {
    const payment = await initializePaystackPayment({
      email: user.email,
      amountKobo: Number(order.total_kobo),
      reference: String(order.payment_reference),
    });

    if (
      payment.reference !== order.payment_reference
    ) {
      throw new Error('Payment reference mismatch');
    }

    paymentUrl = payment.authorizationUrl;
  } catch (error) {
    console.error('Paystack initialization:', error);

    return {
      error:
        'Your order was saved, but payment could not ' +
        'start. Please try again.',
    };
  }

  redirect(paymentUrl);
}
