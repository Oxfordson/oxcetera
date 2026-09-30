'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function processOrder(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/checkout');
  }

  const cartDataRaw = formData.get('cart_data') as string;
  const items = JSON.parse(cartDataRaw) as { id: string; price: number; quantity: number }[];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 75 ? 0 : 10;
  const totalAmount = subtotal + shippingFee;

  const shippingAddress = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    address: formData.get('address'),
    city: formData.get('city'),
    country: formData.get('country'),
    zip: formData.get('zip'),
  };

  // 1. Insert Order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([
      {
        user_id: user.id,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'processing',
      },
    ])
    .select()
    .single();

  if (orderErr) throw new Error(orderErr.message);

  // 2. Insert Order Items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) throw new Error(itemsErr.message);

  redirect('/account');
}