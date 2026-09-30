import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function BlogPage() {
  const supabase = await createServerSupabaseClient();
  const { data: articles } = await supabase.from('blogs').select('*').eq('published', true);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#0A2A6A] mb-8">The Oxcetera Journal</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles?.map((article) => (
          <div key={article.id} className="bg-white border rounded overflow-hidden shadow-xs">
            <img src={article.image_url} alt="" className="h-48 w-full object-cover" />
            <div className="p-6">
              <span className="text-xs font-bold text-[#D6252A] uppercase">{article.category}</span>
              <h2 className="font-serif font-bold text-lg mt-2 text-gray-900">{article.title}</h2>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{article.excerpt}</p>
              <Link href={`/blog/${article.slug}`} className="inline-block mt-4 text-sm font-semibold text-[#0A2A6A]">
                Read Article →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}