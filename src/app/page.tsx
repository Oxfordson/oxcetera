import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Hero } from '@/components/Hero';
import { ProductShowcaseGrid } from '@/components/product/ProductShowcaseGrid';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: featuredProducts, error } = await supabase.from('products').select('*').limit(8);

  console.log("Fetched Products:", featuredProducts); // Check your terminal console logs
  console.log("Supabase Error:", error);

  return (
    <div className="space-y-16">
      <Hero />
      
      {/* Fallback check: Display message if database is empty */}
      {(!featuredProducts || featuredProducts.length === 0) ? (
        <div className="text-center py-12 text-gray-500">
          <p>No products found in database. Add items via the <a href="/admin" className="text-[#0A2A6A] underline font-bold">Admin CMS</a>.</p>
        </div>
      ) : (
        <ProductShowcaseGrid products={featuredProducts} />
      )}
    </div>
  );
}