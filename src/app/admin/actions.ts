'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- PRODUCTS ---
export async function createProduct(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const product = {
    title: formData.get('title') as string,
    slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string),
    original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
    image_url: formData.get('image_url') as string,
    description: formData.get('description') as string,
    stock: parseInt(formData.get('stock') as string || '0', 10),
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
  const blog = {
    title: formData.get('title') as string,
    slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
    category: formData.get('category') as string,
    excerpt: formData.get('excerpt') as string,
    content: formData.get('content') as string,
    image_url: formData.get('image_url') as string,
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