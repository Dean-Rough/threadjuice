import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/database';
import { generateSEOData, generateMetaTags } from '@/lib/seo/auto-seo';
import { optimizeForAISearch } from '@/lib/seo/ai-search-optimization';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: post, error } = await getSupabaseClient()
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !post) {
    return {
      title: 'Post Not Found | ThreadJuice',
      description: 'The requested story could not be found.'
    };
  }

  // Generate SEO data
  const seoData = generateSEOData(post);
  
  // Generate meta tags
  const metaTags = generateMetaTags(seoData, post);
  
  // Optimize for AI search
  await optimizeForAISearch(post);
  
  return metaTags;
}

export async function generateStaticParams() {
  const { data: posts } = await getSupabaseClient()
    .from('posts')
    .select('slug')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(100);

  return posts?.map((post: any) => ({
    slug: post.slug,
  })) || [];
}