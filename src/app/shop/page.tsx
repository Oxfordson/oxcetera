import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';

export default async function ShopPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = await searchParams;
  const searchTerm = query?.q;
  
  const supabase = await createServerSupabaseClient();
  let dbQuery = supabase.from('products').select('*');

  if (searchTerm) {
    dbQuery = dbQuery.ilike('title', `%${searchTerm}%`);
  }

  const { data: products } = await dbQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0A2A6A]">Beauty Catalog</h1>
        {searchTerm && <p className="text-sm text-gray-500 mt-1">Showing search results for "{searchTerm}"</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}