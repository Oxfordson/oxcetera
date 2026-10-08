
import { redirect } from 'next/navigation';
import {
  Trash2,
  Package,
  BookOpen,
  ShoppingCart,
  Users,
  CheckCircle,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createProduct,
  deleteProduct,
  createBlog,
  deleteBlog,
  updateOrderStatus,
} from './actions';

export const dynamic = 'force-dynamic';

function formatMoney(
  amount: number | string | null,
  currency = 'NGN'
) {
  const value = Number(amount);

  if (amount === null || !Number.isFinite(value)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function displayStatus(status: string | null | undefined) {
  return (status || 'unknown').replaceAll('_', ' ');
}

const inputClass =
  'w-full rounded border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-[#0A2A6A]';

const sectionClass =
  'rounded-xl border border-gray-200 bg-white p-6 shadow-sm';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin');
  }

  const { data: adminProfile, error: profileError } =
    await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

  if (profileError || adminProfile?.role !== 'admin') {
    redirect('/account');
  }

  const [
    productsResult,
    blogsResult,
    ordersResult,
    profilesResult,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('orders')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const queryError =
    productsResult.error ||
    blogsResult.error ||
    ordersResult.error ||
    profilesResult.error;

  const products = productsResult.data ?? [];
  const blogs = blogsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  const paidOrders = orders.filter(
    (order) => order.payment_status === 'paid'
  );

  const stockIssues = orders.filter(
    (order) => order.payment_status === 'paid_stock_issue'
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1440px] px-4 py-12">
        <header className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">
              Oxcetera Operations CMS
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage products, inventory, paid orders, customers,
              and beauty journal content.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Signed in as {adminProfile.full_name || user.email}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#0A2A6A]">
            <ShieldCheck className="h-5 w-5" />
            Administrator
          </div>
        </header>

        {queryError && (
          <div
            role="alert"
            className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            Some dashboard information could not be loaded.
            Check your Supabase permissions and server logs.
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className={sectionClass}>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Products
            </p>
            <p className="mt-2 text-3xl font-bold text-[#0A2A6A]">
              {products.length}
            </p>
          </div>

          <div className={sectionClass}>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Paid Orders
            </p>
            <p className="mt-2 text-3xl font-bold text-[#0A2A6A]">
              {paidOrders.length}
            </p>
          </div>

          <div className={sectionClass}>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Customer Profiles
            </p>
            <p className="mt-2 text-3xl font-bold text-[#0A2A6A]">
              {profiles.length}
            </p>
          </div>

          <div className={sectionClass}>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Inventory Issues
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {stockIssues.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* ORDER MANAGEMENT */}
          <section className={sectionClass}>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#0A2A6A]">
              <ShoppingCart className="h-5 w-5" />
              Order Fulfillment
            </h2>

            <div className="max-h-[600px] divide-y overflow-y-auto">
              {orders.map((order) => {
                const isPaid = order.payment_status === 'paid';
                const editable =
                  isPaid &&
                  ['processing', 'completed'].includes(order.status);

                const customer = Array.isArray(order.profiles)
                  ? order.profiles[0]
                  : order.profiles;

                return (
                  <article
                    key={order.id}
                    className="space-y-3 py-4 first:pt-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {customer?.full_name ||
                            customer?.email ||
                            'Customer'}
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#0A2A6A]">
                          {formatMoney(
                            order.total_amount,
                            order.currency || 'NGN'
                          )}
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <p
                          className={
                            isPaid
                              ? 'font-semibold text-green-700'
                              : order.payment_status === 'paid_stock_issue'
                              ? 'font-semibold text-amber-700'
                              : 'font-semibold text-gray-600'
                          }
                        >
                          Payment: {displayStatus(order.payment_status)}
                        </p>

                        <p className="mt-1 capitalize text-gray-500">
                          Order: {displayStatus(order.status)}
                        </p>
                      </div>
                    </div>

                    {order.payment_status === 'paid_stock_issue' && (
                      <div className="flex items-start gap-2 rounded bg-amber-50 p-3 text-xs text-amber-900">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Payment received, but inventory needs review.
                        Arrange fulfillment or a refund.
                      </div>
                    )}

                    {editable ? (
                      <form
                        action={updateOrderStatus}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="order_id"
                          value={order.id}
                        />

                        <select
                          name="status"
                          defaultValue={order.status}
                          className={inputClass}
                        >
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button
                          type="submit"
                          title="Update fulfillment status"
                          aria-label="Update fulfillment status"
                          className="rounded bg-[#0A2A6A] p-3 text-white hover:bg-blue-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Fulfillment changes are unavailable for this order.
                      </p>
                    )}
                  </article>
                );
              })}

              {orders.length === 0 && (
                <p className="py-8 text-sm text-gray-500">
                  No orders found.
                </p>
              )}
            </div>
          </section>

          {/* CUSTOMER PROFILES */}
          <section className={sectionClass}>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#0A2A6A]">
              <Users className="h-5 w-5" />
              Customer Profiles
            </h2>

            <div className="max-h-[600px] divide-y overflow-y-auto">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {profile.full_name || 'Unnamed User'}
                    </p>

                    <p className="mt-1 break-all text-xs text-gray-500">
                      {profile.email || 'No email'}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {profile.phone || 'No phone number'}
                    </p>
                  </div>

                  <span
                    className={
                      profile.role === 'admin'
                        ? 'rounded bg-red-50 px-3 py-1 text-xs font-bold uppercase text-red-700'
                        : 'rounded bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-[#0A2A6A]'
                    }
                  >
                    {profile.role || 'customer'}
                  </span>
                </div>
              ))}

              {profiles.length === 0 && (
                <p className="py-8 text-sm text-gray-500">
                  No customer profiles found.
                </p>
              )}
            </div>
          </section>

          {/* PRODUCT CATALOG */}
          <section className={sectionClass}>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#0A2A6A]">
              <Package className="h-5 w-5" />
              Product Catalog
            </h2>

            <form
              action={createProduct}
              className="mb-8 space-y-4 rounded-lg border border-blue-100 bg-[#F4F7FF] p-5"
            >
              <h3 className="text-sm font-bold text-gray-800">
                Add New Beauty Product
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  name="title"
                  placeholder="Product Title"
                  maxLength={200}
                  required
                  className={inputClass}
                />

                <input
                  name="category"
                  placeholder="Category (e.g., SKINCARE)"
                  maxLength={100}
                  required
                  className={inputClass}
                />

                <input
                  name="price"
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  placeholder="Selling Price (₦)"
                  required
                  className={inputClass}
                />

                <input
                  name="original_price"
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  placeholder="Original Price (₦) — optional"
                  className={inputClass}
                />

                <input
                  name="stock"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  defaultValue="0"
                  required
                  placeholder="Inventory Units"
                  className={inputClass}
                />

                <input
                  name="image_url"
                  type="url"
                  placeholder="HTTPS Image URL (optional)"
                  className={inputClass}
                />
              </div>

              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
                <label className="flex flex-col items-center gap-2 text-center">
                  <UploadCloud className="h-6 w-6 text-[#0A2A6A]" />

                  <span className="text-xs font-semibold text-gray-700">
                    Upload Product Image
                  </span>

                  <span className="text-xs text-gray-400">
                    JPG, PNG, or WEBP — maximum 5MB
                  </span>

                  <input
                    type="file"
                    name="image_file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full text-xs"
                  />
                </label>
              </div>

              <textarea
                name="description"
                rows={3}
                placeholder="Product description..."
                className={inputClass}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_featured"
                  className="h-4 w-4"
                />
                Feature on Homepage
              </label>

              <button
                type="submit"
                className="w-full rounded bg-[#0A2A6A] py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Save Product
              </button>
            </form>

            <div className="max-h-[450px] divide-y overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-12 w-12 shrink-0 rounded border object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded bg-gray-100" />
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {product.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatMoney(
                          product.price,
                          product.currency || 'NGN'
                        )}
                        {' · '}
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>

                  <form action={deleteProduct.bind(null, product.id)}>
                    <button
                      type="submit"
                      title="Delete product without order history"
                      aria-label={`Delete ${product.title}`}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}

              {products.length === 0 && (
                <p className="py-8 text-sm text-gray-500">
                  No products available.
                </p>
              )}
            </div>
          </section>

          {/* BEAUTY JOURNAL */}
          <section className={sectionClass}>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#0A2A6A]">
              <BookOpen className="h-5 w-5" />
              Beauty Journal CMS
            </h2>

            <form
              action={createBlog}
              className="mb-8 space-y-4 rounded-lg border border-blue-100 bg-[#F4F7FF] p-5"
            >
              <h3 className="text-sm font-bold text-gray-800">
                Publish Editorial
              </h3>

              <input
                name="title"
                placeholder="Article Headline"
                maxLength={200}
                required
                className={inputClass}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  name="category"
                  placeholder="Topic (e.g., Skincare Science)"
                  maxLength={100}
                  required
                  className={inputClass}
                />

                <input
                  name="read_time"
                  placeholder="Read Time (e.g., 5 min read)"
                  maxLength={50}
                  className={inputClass}
                />
              </div>

              <input
                name="image_url"
                type="url"
                placeholder="HTTPS Cover Image URL (optional)"
                className={inputClass}
              />

              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
                <label className="flex flex-col items-center gap-2 text-center">
                  <UploadCloud className="h-6 w-6 text-[#0A2A6A]" />

                  <span className="text-xs font-semibold text-gray-700">
                    Upload Article Cover Image
                  </span>

                  <span className="text-xs text-gray-400">
                    JPG, PNG, or WEBP — maximum 5MB
                  </span>

                  <input
                    type="file"
                    name="image_file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full text-xs"
                  />
                </label>
              </div>

              <textarea
                name="excerpt"
                rows={3}
                maxLength={1000}
                placeholder="Short article introduction..."
                required
                className={inputClass}
              />

              <textarea
                name="content"
                rows={8}
                placeholder="Full article content..."
                required
                className={inputClass}
              />

              <button
                type="submit"
                className="w-full rounded bg-[#0A2A6A] py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Publish Article
              </button>
            </form>

            <div className="max-h-[450px] divide-y overflow-y-auto">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {blog.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {blog.category} · {blog.read_time}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {blog.published ? 'Published' : 'Unpublished'}
                    </p>
                  </div>

                  {blog.published && (
                    <form action={deleteBlog.bind(null, blog.id)}>
                      <button
                        type="submit"
                        title="Unpublish article"
                        aria-label={`Unpublish ${blog.title}`}
                        className="rounded p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              ))}

              {blogs.length === 0 && (
                <p className="py-8 text-sm text-gray-500">
                  No articles found.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
