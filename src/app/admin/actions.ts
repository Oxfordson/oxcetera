
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BUCKET = 'oxcetera-assets';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type SupabaseClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

async function requireAdmin(): Promise<SupabaseClient> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Please sign in as an administrator.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Administrator access required.');
  }

  return supabase;
}

function requiredText(
  formData: FormData,
  field: string,
  maxLength = 200
): string {
  const value = formData.get(field);

  if (typeof value !== 'string') {
    throw new Error(`${field} is required.`);
  }

  const text = value.trim();

  if (!text || text.length > maxLength) {
    throw new Error(`Enter a valid ${field.replaceAll('_', ' ')}.`);
  }

  return text;
}

function optionalText(
  formData: FormData,
  field: string,
  maxLength = 10000
): string | null {
  const value = formData.get(field);

  if (typeof value !== 'string') return null;

  const text = value.trim();

  if (text.length > maxLength) {
    throw new Error(`${field} is too long.`);
  }

  return text || null;
}

function parseMoney(
  value: FormDataEntryValue | null,
  label: string,
  optional = false
): number | null {
  if (
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    if (optional) return null;
    throw new Error(`${label} is required.`);
  }

  if (
    typeof value !== 'string' ||
    !/^\d+(?:\.\d{1,2})?$/.test(value.trim())
  ) {
    throw new Error(`${label} must be a valid NGN amount.`);
  }

  const amount = Number(value);

  if (
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    amount <= 0 ||
    amount > 100000000
  ) {
    throw new Error(`Invalid ${label}.`);
  }

  return amount;
}

function parseStock(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    throw new Error('Stock must be a whole number.');
  }

  const stock = Number(value);

  if (!Number.isSafeInteger(stock) || stock > 1000000) {
    throw new Error('Invalid stock quantity.');
  }

  return stock;
}

function makeSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    throw new Error('Title must contain letters or numbers.');
  }

  return slug;
}

function validateImageUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid image URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Image URLs must use HTTPS.');
  }

  if (url.username || url.password) {
    throw new Error('Invalid image URL.');
  }

  return url.toString();
}

async function uploadImageFile(
  supabase: SupabaseClient,
  file: File
): Promise<{ url: string; path: string }> {
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be between 1 byte and 5MB.');
  }

  const signatures: Record<string, {
    ext: string;
    valid: (bytes: Uint8Array) => boolean;
  }> = {
    'image/jpeg': {
      ext: 'jpg',
      valid: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    },
    'image/png': {
      ext: 'png',
      valid: b =>
        b[0] === 0x89 &&
        b[1] === 0x50 &&
        b[2] === 0x4e &&
        b[3] === 0x47 &&
        b[4] === 0x0d &&
        b[5] === 0x0a &&
        b[6] === 0x1a &&
        b[7] === 0x0a,
    },
    'image/webp': {
      ext: 'webp',
      valid: b =>
        String.fromCharCode(...b.slice(0, 4)) === 'RIFF' &&
        String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
    },
  };

  const format = signatures[file.type];

  if (!format) {
    throw new Error('Only JPG, PNG, and WEBP images are allowed.');
  }

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (!format.valid(bytes)) {
    throw new Error('Image file contents do not match its type.');
  }

  const path = `uploads/${crypto.randomUUID()}.${format.ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

async function resolveImage(
  supabase: SupabaseClient,
  formData: FormData
): Promise<{ url: string; path: string | null }> {
  const file = formData.get('image_file');

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadImageFile(supabase, file);

    return {
      url: uploaded.url,
      path: uploaded.path,
    };
  }

  const rawUrl = optionalText(formData, 'image_url', 2000);

  if (!rawUrl) {
    throw new Error('Upload an image or provide an image URL.');
  }

  return {
    url: validateImageUrl(rawUrl),
    path: null,
  };
}

async function cleanupUpload(
  supabase: SupabaseClient,
  path: string | null
) {
  if (!path) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    console.error('Unable to clean up uploaded image:', error);
  }
}

function refreshCatalog() {
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/shop');
}

function assertUuid(id: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new Error('Invalid record ID.');
  }
}

// PRODUCTS

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();

  // Validate before uploading files.
  const title = requiredText(formData, 'title');
  const category = requiredText(formData, 'category', 100);
  const price = parseMoney(formData.get('price'), 'Price');
  const originalPrice = parseMoney(
    formData.get('original_price'),
    'Original price',
    true
  );
  const stock = parseStock(formData.get('stock') ?? '0');
  const description = optionalText(formData, 'description');
  const slug = makeSlug(title);

  if (originalPrice !== null && originalPrice <= (price ?? 0)) {
    throw new Error('Original price must be greater than selling price.');
  }

  const image = await resolveImage(supabase, formData);

  try {
    const { error } = await supabase.from('products').insert({
      title,
      slug,
      category,
      price,
      original_price: originalPrice,
      currency: 'NGN',
      stock,
      description,
      image_url: image.url,
      is_featured: formData.get('is_featured') === 'on',
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    await cleanupUpload(supabase, image.path);
    throw error;
  }

  refreshCatalog();
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  assertUuid(id);

  // Preserve products referenced by historical orders.
  const { count, error: referenceError } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  if (referenceError) {
    throw new Error(
      `Unable to check product order history: ${referenceError.message}`
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      'This product has order history and cannot be deleted. ' +
      'Archive it instead.'
    );
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  refreshCatalog();
}

// BLOGS

export async function createBlog(formData: FormData) {
  const supabase = await requireAdmin();

  const title = requiredText(formData, 'title');
  const category = requiredText(formData, 'category', 100);
  const excerpt = requiredText(formData, 'excerpt', 1000);
  const content = requiredText(formData, 'content', 100000);
  const readTime =
    optionalText(formData, 'read_time', 50) || '4 min read';

  const image = await resolveImage(supabase, formData);

  try {
    const { error } = await supabase.from('blogs').insert({
      title,
      slug: makeSlug(title),
      category,
      excerpt,
      content,
      read_time: readTime,
      image_url: image.url,
      published: true,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    await cleanupUpload(supabase, image.path);
    throw error;
  }

  revalidatePath('/admin');
  revalidatePath('/blog');
}

// Preserve history by unpublishing rather than deleting.
export async function deleteBlog(id: string) {
  const supabase = await requireAdmin();
  assertUuid(id);

  const { error } = await supabase
    .from('blogs')
    .update({ published: false })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/blog');
}

// ORDERS

export async function updateOrderStatus(formData: FormData) {
  const supabase = await requireAdmin();

  const orderId = String(formData.get('order_id') || '');
  const status = String(formData.get('status') || '');

  assertUuid(orderId);

  if (!['processing', 'completed'].includes(status)) {
    throw new Error('Invalid fulfillment status.');
  }

  const { data: order, error: readError } = await supabase
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .single();

  if (readError || !order) {
    throw new Error('Order not found.');
  }

  if (order.payment_status !== 'paid') {
    throw new Error(
      'Only verified paid orders can be fulfilled.'
    );
  }

  if (order.status === 'completed' && status !== 'completed') {
    throw new Error('Completed orders cannot be reopened.');
  }

  if (!['processing', 'completed'].includes(order.status)) {
    throw new Error('This order cannot be updated from its current state.');
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('payment_status', 'paid')
    .eq('status', order.status)
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!updated) {
    throw new Error('Order changed. Refresh and try again.');
  }

  revalidatePath('/admin');
  revalidatePath('/account');
}
