import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createProduct, deleteProduct, createBlog, deleteBlog, updateOrderStatus } from './actions';
import { Trash2, Package, BookOpen, ShoppingCart, Users, CheckCircle, UploadCloud } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { data: products }, 
    { data: blogs },
    { data: orders },
    { data: profiles }
  ] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('blogs').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">Oxcetera Operations CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage catalog inventory, editorial releases, orders, and users[cite: 19]</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 1. ORDERS MANAGEMENT[cite: 19] */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-xl font-bold">Order Fulfillment</h2>
          </div>
          
          <div className="divide-y max-h-[500px] overflow-y-auto pr-2">
            {orders?.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Order <span className="font-mono text-xs">#{order.id.split('-')[0]}</span></p>
                  <p className="text-xs text-gray-500">{order.profiles?.full_name || order.profiles?.email} • ${order.total_amount}</p>
                </div>
                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="order_id" value={order.id} />
                  <select name="status" defaultValue={order.status} className="border border-gray-300 p-1.5 rounded text-xs bg-gray-50 font-medium capitalize outline-none">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button type="submit" className="bg-[#0A2A6A] hover:bg-blue-900 text-white p-1.5 rounded" title="Update Status">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
            {!orders?.length && <p className="text-sm text-gray-500 py-4">No orders found.</p>}
          </div>
        </section>

        {/* 2. PROFILES MANAGEMENT[cite: 19] */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-bold">Customer Profiles</h2>
          </div>
          
          <div className="divide-y max-h-[500px] overflow-y-auto pr-2">
            {profiles?.map((profile) => (
              <div key={profile.id} className="py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{profile.full_name || 'Unnamed User'}</p>
                  <p className="text-xs text-gray-500">{profile.email} • {profile.phone || 'No phone'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${profile.role === 'admin' ? 'bg-[#D6252A] text-white' : 'bg-blue-50 text-[#0A2A6A]'}`}>
                  {profile.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. PRODUCTS MANAGEMENT[cite: 19] */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <Package className="w-5 h-5" />
            <h2 className="text-xl font-bold">Product Catalog</h2>
          </div>

          <form action={createProduct} className="space-y-4 mb-8 bg-[#F4F7FF] p-5 rounded border border-blue-100">
            <h3 className="font-semibold text-sm text-gray-800">Add New Beauty Product</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="title" placeholder="Product Title" required className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="category" placeholder="Category (e.g., Skincare)" required className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="price" type="number" step="0.01" placeholder="Price ($)" required className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="original_price" type="number" step="0.01" placeholder="Original Price" className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="stock" type="number" placeholder="Inventory Units" defaultValue="50" className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="image_url" placeholder="Direct Image URL (Optional if uploading)" className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            </div>

            {/* Direct Image File Upload[cite: 19] */}
            <div className="bg-white border border-dashed border-gray-300 rounded p-3 text-center">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="w-5 h-5 text-[#0A2A6A] mb-1" />
                <span className="text-xs font-semibold text-gray-700">Upload Product Image to Supabase Bucket</span>
                <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                <input type="file" name="image_file" accept="image/*" className="mt-2 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0A2A6A] file:text-white hover:file:bg-blue-900 cursor-pointer" />
              </label>
            </div>

            <textarea name="description" placeholder="Product formula details..." rows={2} className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_featured" id="featured" className="cursor-pointer" />
              <label htmlFor="featured" className="text-xs font-medium text-gray-700 cursor-pointer">Feature on Homepage</label>
            </div>
            <button type="submit" className="w-full bg-[#0A2A6A] hover:bg-blue-900 text-white font-medium py-2.5 rounded text-sm transition">
              Save Product
            </button>
          </form>

          <div className="divide-y max-h-96 overflow-y-auto pr-2">
            {products?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image_url} alt="" className="w-10 h-10 object-cover rounded bg-gray-100 border border-gray-200" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">${item.price} • Stock: {item.stock}</p>
                  </div>
                </div>
                <form action={deleteProduct.bind(null, item.id)}>
                  <button className="text-red-500 hover:text-red-700 p-2 transition"><Trash2 className="w-4 h-4" /></button>
                </form>
              </div>
            ))}
          </div>
        </section>

        {/* 4. BLOG CMS[cite: 19] */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-bold">Beauty Journal CMS</h2>
          </div>

          <form action={createBlog} className="space-y-4 mb-8 bg-[#F4F7FF] p-5 rounded border border-blue-100">
            <h3 className="font-semibold text-sm text-gray-800">Publish Editorial</h3>
            <input name="title" placeholder="Article Headline" required className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            <div className="grid grid-cols-2 gap-3">
              <input name="category" placeholder="Topic (e.g., Skincare Science)" required className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
              <input name="read_time" placeholder="Read Time (e.g., 5 min read)" className="border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            </div>
            <input name="image_url" placeholder="Cover Image URL (Optional if uploading)" className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />

            {/* Direct Cover Image File Upload[cite: 19] */}
            <div className="bg-white border border-dashed border-gray-300 rounded p-3 text-center">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="w-5 h-5 text-[#0A2A6A] mb-1" />
                <span className="text-xs font-semibold text-gray-700">Upload Article Cover Image to Supabase Bucket</span>
                <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                <input type="file" name="image_file" accept="image/*" className="mt-2 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0A2A6A] file:text-white hover:file:bg-blue-900 cursor-pointer" />
              </label>
            </div>

            <textarea name="excerpt" placeholder="Short introductory summary..." rows={2} required className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            <textarea name="content" placeholder="Full article Markdown/HTML text..." rows={4} required className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#0A2A6A]" />
            <button type="submit" className="w-full bg-[#0A2A6A] hover:bg-blue-900 text-white font-medium py-2.5 rounded text-sm transition">
              Publish Editorial
            </button>
          </form>

          <div className="divide-y max-h-96 overflow-y-auto pr-2">
            {blogs?.map((blog) => (
              <div key={blog.id} className="py-3 flex items-center justify-between text-sm">
                <div className="pr-4">
                  <p className="font-semibold text-gray-900">{blog.title}</p>
                  <p className="text-xs text-gray-500">{blog.category} • {blog.read_time}</p>
                </div>
                <form action={deleteBlog.bind(null, blog.id)}>
                  <button className="text-red-500 hover:text-red-700 p-2 transition"><Trash2 className="w-4 h-4" /></button>
                </form>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}