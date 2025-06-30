import { MetadataRoute } from 'next';
import { getSupabaseClient } from '@/lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://threadjuice.com';

  // Get all published posts from database
  const { data: posts } = await getSupabaseClient()
    .from('posts')
    .select('slug, updated_at, category')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Get unique categories
  const categories = [...new Set(posts?.map((p: any) => p.category).filter(Boolean))];

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/personas`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Dynamic post pages
  const postPages = posts?.map((post: any) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  })) || [];

  // Category pages
  const categoryPages = categories.map((category: any) => ({
    url: `${baseUrl}/category/${category.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Author pages from posts
  const { data: authorPosts } = await getSupabaseClient()
    .from('posts')
    .select('author')
    .not('author', 'is', null)
    .limit(50);
    
  const authors = [...new Set(authorPosts?.map((p: any) => p.author).filter(Boolean))];
  const authorPages = authors.map((author: any) => ({
    url: `${baseUrl}/author/${encodeURIComponent(author)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...authorPages];
}
