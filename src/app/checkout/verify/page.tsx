
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { finalizeVerifiedPayment } from '@/lib/paystack-finalize';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string;
  }>;
}) {
  const { reference } = await searchParams;

  if (
    !reference ||
    !/^[a-zA-Z0-9._=-]{1,100}$/.test(reference)
  ) {
    return <PaymentMessage message="Invalid payment reference." />;
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      '/auth/login?redirect=' +
      encodeURIComponent(
        `/checkout/verify?reference=${reference}`
      )
    );
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id,payment_status')
    .eq('payment_reference', reference)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!order) {
    return <PaymentMessage message="Order not found." />;
  }

  let status = order.payment_status;

  try {
    status = await finalizeVerifiedPayment(reference);
  } catch (error) {
    console.error('Payment verification:', error);
  }

  if (status === 'paid') {
    return (
      <PaymentMessage
        success
        message="Payment confirmed! Your order has been received."
      />
    );
  }

  if (status === 'paid_stock_issue') {
    return (
      <PaymentMessage message="Your payment was received, but an item is unavailable. Please contact support for a refund or alternative." />
    );
  }

  return (
    <PaymentMessage message="Your payment has not been confirmed yet. Please check your order again shortly." />
  );
}

function PaymentMessage({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">
        {success ? 'Payment Successful' : 'Payment Status'}
      </h1>

      <p className="text-gray-600 mt-4">
        {message}
      </p>

      <Link
        href="/account"
        className="inline-block mt-8 px-6 py-3 bg-[#0A2A6A] text-white rounded-lg"
      >
        View My Orders
      </Link>
    </main>
  );
}
