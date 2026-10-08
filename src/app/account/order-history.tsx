
import Link from 'next/link';

export type CustomerOrderItem = {
  id: string;
  product_id: string | null;
  price: number;
  quantity: number;
  product: {
    title: string;
    slug: string;
    image_url: string | null;
  } | null;
};

export type CustomerOrder = {
  id: string;
  status: string;
  payment_status: string | null;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: CustomerOrderItem[];
};

function money(value: number, currency: string | null) {
  const code = currency || 'NGN';

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₦${value.toLocaleString('en-NG')}`;
  }
}

function date(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeZone: 'Africa/Lagos',
  }).format(new Date(value));
}

function badge(status: string) {
  const value = status.toLowerCase();

  if (['paid', 'completed', 'delivered'].includes(value)) {
    return 'bg-green-50 text-green-700';
  }

  if (['pending', 'processing'].includes(value)) {
    return 'bg-amber-50 text-amber-700';
  }

  if (['failed', 'cancelled'].includes(value)) {
    return 'bg-red-50 text-red-700';
  }

  return 'bg-gray-100 text-gray-700';
}

export default function OrderHistory({
  orders,
}: {
  orders: CustomerOrder[];
}) {
  return (
    <section id="orders" className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0A2A6A]">
          My Orders
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View your purchases, payment status and order progress.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold">
            No orders yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Your purchases will appear here after checkout.
          </p>

          <Link
            href="/shop"
            className="mt-5 inline-block rounded-xl bg-[#0A2A6A] px-6 py-3 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 bg-gray-50 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order Number
                  </p>

                  <p className="mt-1 break-all font-mono text-sm font-semibold text-[#0A2A6A]">
                    {order.id}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Placed {date(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(
                      order.payment_status || 'pending'
                    )}`}
                  >
                    Payment: {order.payment_status || 'Pending'}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(
                      order.status
                    )}`}
                  >
                    Order: {order.status}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100 px-5">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-5"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {item.product?.image_url ? (
                        // Product images may be hosted on Supabase Storage.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {item.product ? (
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-semibold text-gray-900 hover:text-[#0A2A6A]"
                        >
                          {item.product.title}
                        </Link>
                      ) : (
                        <p className="font-semibold text-gray-900">
                          Product no longer available
                        </p>
                      )}

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Unit price at purchase:{' '}
                        {money(Number(item.price), order.currency)}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-[#0A2A6A]">
                      {money(
                        Number(item.price) * item.quantity,
                        order.currency
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-100 p-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {money(Number(order.subtotal), order.currency)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>
                    {money(Number(order.shipping_fee), order.currency)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
                  <span>Total Paid / Payable</span>
                  <span className="text-[#0A2A6A]">
                    {money(Number(order.total_amount), order.currency)}
                  </span>
                </div>

                {order.paid_at && (
                  <p className="pt-2 text-xs text-gray-500">
                    Payment recorded: {date(order.paid_at)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
