import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createProduct, deleteProduct, createBlog, deleteBlog } from './actions';
import { PlusCircle, Trash2, Package, BookOpen } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: products }, { data: blogs }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('blogs').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">Oxcetera Operations CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage catalog inventory, pricing, and beauty journal releases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* PRODUCTS MANAGEMENT */}
        <section className="bg-white border rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <Package className="w-5 h-5" />
            <h2 className="text-xl font-bold">Product Catalog</h2>
          </div>

          <form action={createProduct} className="space-y-4 mb-8 bg-[#F4F7FF] p-4 rounded border border-blue-100">
            <h3 className="font-semibold text-sm text-gray-800">Add New Beauty Product</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="title" placeholder="Product Title" required className="border p-2 rounded text-sm bg-white" />
              <input name="category" placeholder="Category (e.g., Serum)" required className="border p-2 rounded text-sm bg-white" />
              <input name="price" type="number" step="0.01" placeholder="Price ($)" required className="border p-2 rounded text-sm bg-white" />
              <input name="original_price" type="number" step="0.01" placeholder="Original Price" className="border p-2 rounded text-sm bg-white" />
              <input name="stock" type="number" placeholder="Inventory Units" defaultValue="50" className="border p-2 rounded text-sm bg-white" />
              <input name="image_url" placeholder="Direct Image URL" required className="border p-2 rounded text-sm bg-white" />
            </div>
            <textarea name="description" placeholder="Product formula details..." rows={2} className="w-full border p-2 rounded text-sm bg-white" />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_featured" id="featured" />
              <label htmlFor="featured" className="text-xs font-medium text-gray-700">Feature on Homepage</label>
            </div>
            <button type="submit" className="w-full bg-[#0A2A6A] hover:bg-blue-900 text-white font-medium py-2 rounded text-sm">
              Save Product
            </button>
          </form>

          <div className="divide-y max-h-96 overflow-y-auto">
            {products?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image_url} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">${item.price} • {item.category}</p>
                  </div>
                </div>
                <form action={deleteProduct.bind(null, item.id)}>
                  <button className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                </form>
              </div>
            ))}
          </div>
        </section>

        {/* BLOG CMS */}
        <section className="bg-white border rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6 text-[#0A2A6A]">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-bold">Beauty Journal CMS</h2>
          </div>

          <form action={createBlog} className="space-y-4 mb-8 bg-[#F4F7FF] p-4 rounded border border-blue-100">
            <h3 className="font-semibold text-sm text-gray-800">Publish Editorial</h3>
            <input name="title" placeholder="Article Headline" required className="w-full border p-2 rounded text-sm bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <input name="category" placeholder="Topic (e.g., Skincare Science)" required className="border p-2 rounded text-sm bg-white" />
              <input name="read_time" placeholder="Read Time (e.g., 5 min read)" className="border p-2 rounded text-sm bg-white" />
            </div>
            <input name="image_url" placeholder="Cover Image URL" required className="w-full border p-2 rounded text-sm bg-white" />
            <textarea name="excerpt" placeholder="Short introductory summary..." rows={2} required className="w-full border p-2 rounded text-sm bg-white" />
            <textarea name="content" placeholder="Full article Markdown/HTML text..." rows={4} required className="w-full border p-2 rounded text-sm bg-white" />
            <button type="submit" className="w-full bg-[#0A2A6A] hover:bg-blue-900 text-white font-medium py-2 rounded text-sm">
              Publish Editorial
            </button>
          </form>

          <div className="divide-y max-h-96 overflow-y-auto">
            {blogs?.map((blog) => (
              <div key={blog.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{blog.title}</p>
                  <p className="text-xs text-gray-500">{blog.category} • {blog.read_time}</p>
                </div>
                <form action={deleteBlog.bind(null, blog.id)}>
                  <button className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}