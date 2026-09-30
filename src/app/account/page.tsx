import { createServerSupabaseClient } from '@/lib/supabase/server';
import { signOut } from '../auth/actions';
import { Package, User, LogOut } from 'lucide-react';

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('orders').select('*, order_items(*, products(*))').eq('user_id', user?.id).order('created_at', { ascending: false }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">Hello, {profile?.full_name || user?.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-xs font-semibold rounded hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-[#F4F7FF] p-6 rounded border border-blue-50">
          <div className="flex items-center gap-2 text-[#0A2A6A] font-bold mb-4">
            <User className="w-5 h-5" /> Profile Details
          </div>
          <div className="text-sm space-y-2 text-gray-600">
            <p><span className="font-semibold text-gray-900">Name:</span> {profile?.full_name || 'N/A'}</p>
            <p><span className="font-semibold text-gray-900">Email:</span> {profile?.email}</p>
            <p><span className="font-semibold text-gray-900">Role:</span> <span className="uppercase text-xs font-bold text-[#D6252A]">{profile?.role}</span></p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#0A2A6A]" /> Order History
          </h2>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-center text-sm border-b pb-2 mb-3">
                    <div>
                      <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                      <span className="text-gray-400 text-xs ml-2">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0A2A6A]">
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span>{item.products?.title || 'Botanical Formula'} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-3 flex justify-between font-bold text-sm text-[#0A2A6A]">
                    <span>Total Amount</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded text-gray-500 text-sm">
              You haven't placed any orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}