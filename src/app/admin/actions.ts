'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper: Upload file to the 'oxcetera-assets' public Supabase storage bucket
async function uploadImageFile(file: File): Promise<string> {
  if (!file || file.size === 0) return '';

  const supabase = await createServerSupabaseClient();
  const fileExt = file.name.split('.').pop() || 'png';
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const fileName = `${Date.now()}-${cleanBaseName}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('oxcetera-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('oxcetera-assets').getPublicUrl(filePath);
  return data.publicUrl;
}

// --- PRODUCTS ---
export async function createProduct(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // If a file was selected, upload it; otherwise use the direct URL text field
  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = (formData.get('image_url') as string) || '';

  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImageFile(imageFile);
  }

  if (!imageUrl) {
    throw new Error('Please upload an image file or provide a direct image URL.');
  }

  const title = (formData.get('title') as string).trim();
  const rawPrice = formData.get('price') as string;
  const rawOriginalPrice = formData.get('original_price') as string;
  const rawStock = formData.get('stock') as string;

  const product = {
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    category: (formData.get('category') as string).trim(),
    price: parseFloat(rawPrice),
    original_price: rawOriginalPrice ? parseFloat(rawOriginalPrice) : null,
    image_url: imageUrl,
    description: (formData.get('description') as string) || null,
    stock: parseInt(rawStock || '0', 10),
    is_featured: formData.get('is_featured') === 'on',
  };

  const { error } = await supabase.from('products').insert([product]);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/shop');
}

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/shop');
}

// --- BLOGS ---
export async function createBlog(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = (formData.get('image_url') as string) || '';

  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImageFile(imageFile);
  }

  if (!imageUrl) {
    throw new Error('Please upload a cover image file or provide a direct image URL.');
  }

  const title = (formData.get('title') as string).trim();

  const blog = {
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    category: (formData.get('category') as string).trim(),
    excerpt: (formData.get('excerpt') as string).trim(),
    content: (formData.get('content') as string).trim(),
    image_url: imageUrl,
    read_time: (formData.get('read_time') as string) || '4 min read',
    published: true,
  };

  const { error } = await supabase.from('blogs').insert([blog]);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/blog');
}

export async function deleteBlog(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/blog');
}

// --- ORDERS ---
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const orderId = formData.get('order_id') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
}