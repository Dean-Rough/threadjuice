import { Post } from '@/types/post';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  jsonLd: any;
}

export function generateSEOData(post: Post, baseUrl: string = 'https://threadjuice.com'): SEOData {
  // Auto-generate optimized title
  const title = optimizeTitle(post.title);
  
  // Extract description from content
  const description = extractDescription(post.content);
  
  // Generate keywords from content
  const keywords = extractKeywords(post);
  
  // Select best image for Open Graph
  const ogImage = selectOGImage(post);
  
  // Generate canonical URL
  const canonicalUrl = `${baseUrl}/posts/${post.slug}`;
  
  // Generate structured data
  const jsonLd = generateStructuredData(post, baseUrl);
  
  return {
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    jsonLd
  };
}

function optimizeTitle(originalTitle: string): string {
  // Add viral patterns while keeping under 60 chars
  const patterns = [
    `${originalTitle} - The Internet Is Shook`,
    `${originalTitle} | ThreadJuice`,
    `VIRAL: ${originalTitle}`,
    `${originalTitle} - You Won't Believe What Happened`
  ];
  
  // Find the best pattern that fits
  for (const pattern of patterns) {
    if (pattern.length <= 60) {
      return pattern;
    }
  }
  
  // Fallback: truncate and add suffix
  if (originalTitle.length > 50) {
    return `${originalTitle.substring(0, 47)}... | ThreadJuice`;
  }
  
  return `${originalTitle} | ThreadJuice`;
}

function extractDescription(content: any): string {
  // Extract first meaningful text from content sections
  const sections = content?.sections || [];
  
  for (const section of sections) {
    if (section.type === 'text' && section.content) {
      // Clean and truncate to 155 chars
      const cleaned = section.content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleaned.length > 155) {
        return cleaned.substring(0, 152) + '...';
      }
      
      return cleaned;
    }
  }
  
  return 'Discover the latest viral stories, internet drama, and trending content on ThreadJuice.';
}

function extractKeywords(post: Post): string[] {
  const keywords = new Set<string>();
  
  // Add category
  if (post.category) {
    keywords.add(post.category.toLowerCase());
  }
  
  // Add tags
  if (post.tags) {
    post.tags.forEach(tag => keywords.add(tag.toLowerCase()));
  }
  
  // Extract from title
  const titleWords = post.title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  titleWords.forEach(word => keywords.add(word));
  
  // Add platform keywords
  keywords.add('viral');
  keywords.add('reddit');
  keywords.add('threadjuice');
  keywords.add('trending');
  
  // Add category-specific keywords
  const categoryKeywords: Record<string, string[]> = {
    'relationships': ['dating', 'romance', 'breakup', 'love'],
    'technology': ['tech', 'ai', 'software', 'startup'],
    'work': ['career', 'job', 'workplace', 'boss'],
    'social': ['twitter', 'social media', 'influencer'],
    'wholesome': ['heartwarming', 'feel good', 'happy'],
    'drama': ['controversy', 'scandal', 'tea', 'gossip']
  };
  
  const catKeywords = categoryKeywords[post.category?.toLowerCase()] || [];
  catKeywords.forEach(kw => keywords.add(kw));
  
  return Array.from(keywords).slice(0, 10);
}

function selectOGImage(post: Post): string {
  // Try to find the best image from content
  const sections = post.content?.sections || [];
  
  for (const section of sections) {
    if (section.type === 'image' && section.url) {
      return section.url;
    }
    
    if (section.type === 'hero' && section.backgroundImage) {
      return section.backgroundImage;
    }
  }
  
  // Fallback to featured image or default
  return post.featuredImage || '/og-default.jpg';
}

function generateStructuredData(post: Post, baseUrl: string): any {
  const publishDate = post.publishedAt || new Date().toISOString();
  const modifiedDate = post.updatedAt || publishDate;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: extractDescription(post.content),
    image: selectOGImage(post),
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: post.author || 'ThreadJuice Editorial'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ThreadJuice',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/posts/${post.slug}`
    },
    keywords: extractKeywords(post).join(', '),
    articleSection: post.category,
    inLanguage: 'en-US',
    // AI Search Optimization
    about: {
      '@type': 'Thing',
      name: post.category,
      description: `Viral ${post.category} content from Reddit and Twitter`
    },
    mentions: extractMentions(post),
    citation: post.sourceUrl ? [{
      '@type': 'WebPage',
      url: post.sourceUrl
    }] : []
  };
}

function extractMentions(post: Post): any[] {
  const mentions = [];
  
  // Extract Reddit mentions
  if (post.sourceUrl?.includes('reddit.com')) {
    mentions.push({
      '@type': 'WebSite',
      name: 'Reddit',
      url: 'https://reddit.com'
    });
  }
  
  // Extract Twitter mentions
  if (post.sourceUrl?.includes('twitter.com') || post.sourceUrl?.includes('x.com')) {
    mentions.push({
      '@type': 'WebSite',
      name: 'Twitter/X',
      url: 'https://x.com'
    });
  }
  
  return mentions;
}

// Generate meta tags for Next.js
export function generateMetaTags(seoData: SEOData, post: Post): any {
  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      url: seoData.canonicalUrl,
      siteName: 'ThreadJuice',
      images: [
        {
          url: seoData.ogImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author || 'ThreadJuice'],
      tags: seoData.keywords
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [seoData.ogImage],
      creator: '@threadjuice'
    },
    alternates: {
      canonical: seoData.canonicalUrl
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}