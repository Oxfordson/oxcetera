import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email), order_items(*, products(title))')
    .order('created_at', { ascending: false });

  async function updateStatus(formData: FormData) {
    'use server';
    const orderId = formData.get('order_id') as string;
    const status = formData.get('status') as string;
    const client = await createServerSupabaseClient();
    await client.from('orders').update({ status }).eq('id', orderId);
    revalidatePath('/admin/orders');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#0A2A6A] mb-8">Admin Order Fulfillment</h1>
      <div className="bg-white border rounded shadow-xs overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A2A6A] text-white">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.profiles?.full_name || o.profiles?.email}</td>
                <td className="p-3">{o.order_items?.length} items</td>
                <td className="p-3 font-bold">${o.total_amount}</td>
                <td className="p-3">
                  <span className="capitalize px-2 py-0.5 rounded text-xs bg-gray-100 font-semibold">{o.status}</span>
                </td>
                <td className="p-3">
                  <form action={updateStatus} className="flex gap-2">
                    <input type="hidden" name="order_id" value={o.id} />
                    <select name="status" defaultValue={o.status} className="border text-xs p-1 rounded">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" className="bg-[#0A2A6A] text-white text-xs px-2 py-1 rounded">Update</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}