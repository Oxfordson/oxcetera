import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: featuredProducts }, { data: recentArticles }] = await Promise.all([
    supabase.from('products').select('*').limit(8),
    supabase.from('blogs').select('*').limit(3),
  ]);

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <Hero />

      {/* CORE VALUE PILLARS (Modernized replacement of Bootstrap features block) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-gray-100">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-[#0A2A6A]" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Lab-Certified</h4>
              <p className="text-xs text-gray-500">100% Dermatologist tested</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Truck className="w-8 h-8 text-[#0A2A6A]" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Swift Delivery</h4>
              <p className="text-xs text-gray-500">Tracked priority air courier</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-[#0A2A6A]" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Ethical Source</h4>
              <p className="text-xs text-gray-500">Cruelty-free & sustainably harvested</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RefreshCw className="w-8 h-8 text-[#0A2A6A]" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900">Guaranteed Results</h4>
              <p className="text-xs text-gray-500">30-day efficacy refund guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#0A2A6A]">Curated Essentials</h2>
            <p className="text-gray-500 text-sm mt-1">High-potency skin repair formulations</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#0A2A6A] hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* JOURNAL / BLOG SECTION */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#0A2A6A]">The Oxcetera Journal</h2>
            <p className="text-gray-500 text-sm mt-2">Dermatological discoveries and clean beauty science</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentArticles?.map((article) => (
              <div key={article.id} className="bg-white rounded overflow-hidden shadow-xs border border-gray-100 flex flex-col">
                <img src={article.image_url} alt="" className="h-48 w-full object-cover" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-[#D6252A] uppercase">{article.category}</span>
                    <h3 className="font-serif font-bold text-gray-900 mt-2 text-lg">{article.title}</h3>
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{article.excerpt}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                    <span>{article.read_time}</span>
                    <Link href={`/blog/${article.slug}`} className="font-semibold text-[#0A2A6A]">Read More →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}