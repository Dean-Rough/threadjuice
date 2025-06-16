import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories } from '@/data/mockPosts';
import { getAllPersonas } from '@/data/personas';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://threadjuice.com';

  // Get all posts, categories, and personas
  const posts = getAllPosts();
  const categories = getAllCategories();
  const personas = getAllPersonas();

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
  const postPages = posts.map(post => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Category pages
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // Persona pages
  const personaPages = personas.map(persona => ({
    url: `${baseUrl}/personas/${persona.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...categoryPages, ...personaPages];
}
