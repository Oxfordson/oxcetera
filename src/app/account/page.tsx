
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AccountDashboard from './account-dashboard';
import OrderHistory, {
  type CustomerOrder,
} from './order-history';

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();

  // 1. Verify the signed-in customer
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/account');
  }

  // 2. Load customer profile, addresses and orders
  const [profileResult, addressResult, orderResult] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single(),

      supabase
        .from('customer_addresses')
        .select(`
          id,
          label,
          recipient_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          is_default
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      supabase
        .from('orders')
        .select(`
          id,
          status,
          payment_status,
          subtotal,
          shipping_fee,
          total_amount,
          currency,
          created_at,
          paid_at,
          order_items (
            id,
            product_id,
            price,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

  // 3. Handle database errors
  if (profileResult.error) {
    throw new Error(
      `Profile error: ${profileResult.error.message}`
    );
  }

  if (addressResult.error) {
    throw new Error(
      `Address error: ${addressResult.error.message}`
    );
  }

  if (orderResult.error) {
    throw new Error(
      `Orders error: ${orderResult.error.message}`
    );
  }

  const profile = profileResult.data;

  // 4. Collect product IDs from the customer's orders
  const productIds = Array.from(
    new Set(
      (orderResult.data ?? []).flatMap((order) =>
        (order.order_items ?? [])
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id))
      )
    )
  );

  // 5. Fetch the relevant products separately
  type ProductSummary = {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
  };

  let products: ProductSummary[] = [];

  if (productIds.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, image_url')
      .in('id', productIds);

    if (error) {
      throw new Error(
        `Products error: ${error.message}`
      );
    }

    products = data ?? [];
  }

  // 6. Build a lookup table for product details
  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  // 7. Convert database records into order-history data
  const orders: CustomerOrder[] =
    (orderResult.data ?? []).map((order) => ({
      id: order.id,
      status: order.status,
      payment_status: order.payment_status,
      subtotal: Number(order.subtotal),
      shipping_fee: Number(order.shipping_fee),
      total_amount: Number(order.total_amount),
      currency: order.currency,
      created_at: order.created_at,
      paid_at: order.paid_at,

      order_items: (order.order_items ?? []).map((item) => {
        const product = item.product_id
          ? productMap.get(item.product_id)
          : undefined;

        return {
          id: item.id,
          product_id: item.product_id,
          price: Number(item.price),
          quantity: item.quantity,
          product: product
            ? {
                title: product.title,
                slug: product.slug,
                image_url: product.image_url,
              }
            : null,
        };
      }),
    }));

  // 8. Render the customer dashboard
  return (
    <div className="space-y-10">
      <AccountDashboard
        profile={{
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
        }}
        addresses={addressResult.data ?? []}
      />

      <OrderHistory orders={orders} />
    </div>
  );
}
