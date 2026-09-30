import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        </div>
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase text-[#D6252A] tracking-wider">{product.category}</span>
          <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">{product.title}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-[#0A2A6A]">${Number(product.price).toFixed(2)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">${Number(product.original_price).toFixed(2)}</span>
            )}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
        </div>
      </div>
    </div>
  );
}