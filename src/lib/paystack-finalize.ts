
import 'server-only';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { verifyPaystackPayment } from '@/lib/paystack';

export async function finalizeVerifiedPayment(
  reference: string
): Promise<string> {
  const payment = await verifyPaystackPayment(reference);

  if (
    !payment ||
    payment.status !== 'success' ||
    payment.reference !== reference ||
    payment.currency !== 'NGN' ||
    !Number.isSafeInteger(payment.amount) ||
    payment.amount <= 0
  ) {
    return 'not_verified';
  }

  const supabase = createAdminSupabaseClient();

  const { data: order, error: orderError } =
    await supabase
      .from('orders')
      .select(
        'id,user_id,total_amount,currency,payment_status'
      )
      .eq('payment_reference', reference)
      .maybeSingle();

  if (orderError || !order) {
    throw new Error('Order lookup failed');
  }

  const expectedKobo = Math.round(
    Number(order.total_amount) * 100
  );

  if (
    !Number.isSafeInteger(expectedKobo) ||
    expectedKobo !== payment.amount ||
    order.currency !== 'NGN'
  ) {
    throw new Error('Payment amount mismatch');
  }

  const { data: result, error } = await supabase.rpc(
    'finalize_ngn_payment',
    {
      p_reference: reference,
      p_amount_kobo: payment.amount,
      p_currency: payment.currency,
    }
  );

  if (error) {
    console.error('Payment finalization:', error);
    throw new Error('Unable to finalize payment');
  }

  return String(result);
}
