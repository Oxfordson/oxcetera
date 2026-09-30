import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  
  const { data: article } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <span className="text-xs font-bold text-[#D6252A] uppercase tracking-wider">{article.category}</span>
      <h1 className="text-4xl font-serif font-bold text-[#0A2A6A] mt-2 mb-4">{article.title}</h1>
      <p className="text-sm text-gray-400 mb-8">By {article.author} • {article.read_time}</p>
      
      <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
        {article.content}
      </div>
    </article>
  );
}