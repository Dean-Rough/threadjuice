import { Post } from '@/types/post';
import { Persona } from '@/types/persona';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export function generateArticleStructuredData(post: Post): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.featuredImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.persona.name,
      description: post.persona.bio,
      url: `https://threadjuice.com/personas/${post.persona.id}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ThreadJuice',
      logo: {
        '@type': 'ImageObject',
        url: 'https://threadjuice.com/logo.png',
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://threadjuice.com/posts/${post.slug}`,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: post.content.length,
    timeRequired: `PT${post.readTime}M`,
    inLanguage: 'en-US',
    isBasedOn: {
      '@type': 'CreativeWork',
      name: `Reddit Thread: ${post.redditMetrics.originalTitle}`,
      url: post.redditMetrics.sourceUrl,
      author: {
        '@type': 'Person',
        name: post.redditMetrics.originalAuthor,
      },
    },
    mentions: post.tags.map(tag => ({
      '@type': 'Thing',
      name: tag,
    })),
  };
}

export function generatePersonaStructuredData(
  persona: Persona
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: persona.name,
    description: persona.bio,
    image: persona.avatar,
    url: `https://threadjuice.com/personas/${persona.id}`,
    jobTitle: 'AI Content Writer',
    worksFor: {
      '@type': 'Organization',
      name: 'ThreadJuice',
      url: 'https://threadjuice.com',
    },
    knowsAbout: [persona.specialty, 'Content Writing', 'Reddit Analysis'],
    sameAs: [`https://threadjuice.com/personas/${persona.id}`],
  };
}

export function generateBreadcrumbStructuredData(
  items: { name: string; url: string }[]
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ThreadJuice',
    description:
      'AI-Powered Reddit Content Engine - Discover viral threads transformed into engaging stories',
    url: 'https://threadjuice.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://threadjuice.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ThreadJuice',
      url: 'https://threadjuice.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://threadjuice.com/logo.png',
        width: 600,
        height: 60,
      },
      sameAs: [
        'https://twitter.com/threadjuice',
        'https://github.com/threadjuice',
      ],
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'ThreadJuice',
      description:
        'We transform viral Reddit threads into engaging stories using AI personas',
      foundingDate: '2024',
      category: 'Content Platform',
      knowsAbout: [
        'Reddit',
        'AI Content Generation',
        'Viral Content',
        'Social Media Analysis',
      ],
    },
  };
}

export function generateOrganizationStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ThreadJuice',
    description: 'AI-Powered Reddit Content Engine',
    url: 'https://threadjuice.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://threadjuice.com/logo.png',
      width: 600,
      height: 60,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@threadjuice.com',
    },
    sameAs: [
      'https://twitter.com/threadjuice',
      'https://github.com/threadjuice',
    ],
    foundingDate: '2024',
    category: 'Technology',
    industry: 'Content Technology',
    keywords: 'Reddit, AI, Content Generation, Viral Content, Social Media',
  };
}

export function generateFAQStructuredData(
  faqs: { question: string; answer: string }[]
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function injectStructuredData(data: StructuredData): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}

export function generateCanonicalUrl(pathname: string): string {
  const baseUrl = 'https://threadjuice.com';
  return `${baseUrl}${pathname}`;
}

export function generateAlternateLanguages(pathname: string): {
  [key: string]: string;
} {
  const baseUrl = 'https://threadjuice.com';
  return {
    'en-US': `${baseUrl}${pathname}`,
    'x-default': `${baseUrl}${pathname}`,
  };
}
