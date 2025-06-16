import {
  generateArticleStructuredData,
  generatePersonaStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  generateFAQStructuredData,
  injectStructuredData,
  generateCanonicalUrl,
  generateAlternateLanguages,
} from '../seo';

// Mock data
const mockPost = {
  id: 'post-1',
  title: 'Test Article Title',
  slug: 'test-article-title',
  excerpt: 'This is a test article excerpt',
  content: 'This is the full content of the test article. '.repeat(50),
  featuredImage: 'https://example.com/image.jpg',
  publishedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  category: 'Technology',
  tags: ['JavaScript', 'React', 'Next.js'],
  readTime: 5,
  persona: {
    id: 'persona-1',
    name: 'Tech Guru',
    bio: 'Expert in modern web development',
  },
  redditMetrics: {
    originalTitle: 'Original Reddit Title',
    originalAuthor: 'reddit_user',
    sourceUrl: 'https://reddit.com/r/test/comments/123',
    upvotes: 1500,
    comments: 200,
  },
};

const mockPersona = {
  id: 'persona-1',
  name: 'The Tech Expert',
  bio: 'A knowledgeable AI persona specializing in technology',
  avatar: 'https://example.com/avatar.jpg',
  specialty: 'Technology',
};

describe('SEO Utilities', () => {
  describe('generateArticleStructuredData', () => {
    it('should generate valid Article structured data', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Article');
      expect(result.headline).toBe(mockPost.title);
      expect(result.description).toBe(mockPost.excerpt);
      expect(result.image).toEqual([mockPost.featuredImage]);
      expect(result.datePublished).toBe(mockPost.publishedAt);
      expect(result.dateModified).toBe(mockPost.updatedAt);
    });

    it('should include author information', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result.author).toEqual({
        '@type': 'Person',
        name: mockPost.persona.name,
        description: mockPost.persona.bio,
        url: `https://threadjuice.com/personas/${mockPost.persona.id}`,
      });
    });

    it('should include publisher information', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result.publisher).toEqual({
        '@type': 'Organization',
        name: 'ThreadJuice',
        logo: {
          '@type': 'ImageObject',
          url: 'https://threadjuice.com/logo.png',
          width: 600,
          height: 60,
        },
      });
    });

    it('should include Reddit source attribution', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result.isBasedOn).toEqual({
        '@type': 'CreativeWork',
        name: `Reddit Thread: ${mockPost.redditMetrics.originalTitle}`,
        url: mockPost.redditMetrics.sourceUrl,
        author: {
          '@type': 'Person',
          name: mockPost.redditMetrics.originalAuthor,
        },
      });
    });

    it('should include article metadata', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result.articleSection).toBe(mockPost.category);
      expect(result.keywords).toBe(mockPost.tags.join(', '));
      expect(result.wordCount).toBe(mockPost.content.length);
      expect(result.timeRequired).toBe(`PT${mockPost.readTime}M`);
      expect(result.inLanguage).toBe('en-US');
    });

    it('should include mentions for tags', () => {
      const result = generateArticleStructuredData(mockPost as any);
      
      expect(result.mentions).toHaveLength(mockPost.tags.length);
      expect(result.mentions[0]).toEqual({
        '@type': 'Thing',
        name: mockPost.tags[0],
      });
    });

    it('should handle missing updatedAt by using publishedAt', () => {
      const postWithoutUpdate = { ...mockPost };
      delete (postWithoutUpdate as any).updatedAt;
      
      const result = generateArticleStructuredData(postWithoutUpdate as any);
      
      expect(result.dateModified).toBe(mockPost.publishedAt);
    });
  });

  describe('generatePersonaStructuredData', () => {
    it('should generate valid Person structured data', () => {
      const result = generatePersonaStructuredData(mockPersona as any);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Person');
      expect(result.name).toBe(mockPersona.name);
      expect(result.description).toBe(mockPersona.bio);
      expect(result.image).toBe(mockPersona.avatar);
      expect(result.url).toBe(`https://threadjuice.com/personas/${mockPersona.id}`);
    });

    it('should include job and organization information', () => {
      const result = generatePersonaStructuredData(mockPersona as any);
      
      expect(result.jobTitle).toBe('AI Content Writer');
      expect(result.worksFor).toEqual({
        '@type': 'Organization',
        name: 'ThreadJuice',
        url: 'https://threadjuice.com',
      });
    });

    it('should include knowledge areas', () => {
      const result = generatePersonaStructuredData(mockPersona as any);
      
      expect(result.knowsAbout).toEqual([
        mockPersona.specialty,
        'Content Writing',
        'Reddit Analysis',
      ]);
    });
  });

  describe('generateBreadcrumbStructuredData', () => {
    it('should generate valid BreadcrumbList structured data', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Blog', url: 'https://example.com/blog' },
        { name: 'Article', url: 'https://example.com/blog/article' },
      ];
      
      const result = generateBreadcrumbStructuredData(breadcrumbs);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);
    });

    it('should correctly position breadcrumb items', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Blog', url: 'https://example.com/blog' },
      ];
      
      const result = generateBreadcrumbStructuredData(breadcrumbs);
      
      expect(result.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });
      
      expect(result.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://example.com/blog',
      });
    });

    it('should handle empty breadcrumbs', () => {
      const result = generateBreadcrumbStructuredData([]);
      
      expect(result.itemListElement).toHaveLength(0);
    });
  });

  describe('generateWebsiteStructuredData', () => {
    it('should generate valid WebSite structured data', () => {
      const result = generateWebsiteStructuredData();
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebSite');
      expect(result.name).toBe('ThreadJuice');
      expect(result.url).toBe('https://threadjuice.com');
    });

    it('should include search action', () => {
      const result = generateWebsiteStructuredData();
      
      expect(result.potentialAction).toEqual({
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://threadjuice.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      });
    });

    it('should include organization information', () => {
      const result = generateWebsiteStructuredData();
      
      expect(result.publisher).toEqual({
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
      });
    });
  });

  describe('generateOrganizationStructuredData', () => {
    it('should generate valid Organization structured data', () => {
      const result = generateOrganizationStructuredData();
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('ThreadJuice');
      expect(result.description).toBe('AI-Powered Reddit Content Engine');
    });

    it('should include contact information', () => {
      const result = generateOrganizationStructuredData();
      
      expect(result.contactPoint).toEqual({
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@threadjuice.com',
      });
    });

    it('should include business information', () => {
      const result = generateOrganizationStructuredData();
      
      expect(result.foundingDate).toBe('2024');
      expect(result.category).toBe('Technology');
      expect(result.industry).toBe('Content Technology');
      expect(result.keywords).toBe('Reddit, AI, Content Generation, Viral Content, Social Media');
    });
  });

  describe('generateFAQStructuredData', () => {
    it('should generate valid FAQPage structured data', () => {
      const faqs = [
        { question: 'What is ThreadJuice?', answer: 'ThreadJuice is an AI-powered content platform.' },
        { question: 'How does it work?', answer: 'It transforms Reddit content into engaging stories.' },
      ];
      
      const result = generateFAQStructuredData(faqs);
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
      expect(result.mainEntity).toHaveLength(2);
    });

    it('should format FAQ items correctly', () => {
      const faqs = [
        { question: 'Test question?', answer: 'Test answer.' },
      ];
      
      const result = generateFAQStructuredData(faqs);
      
      expect(result.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'Test question?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Test answer.',
        },
      });
    });

    it('should handle empty FAQ list', () => {
      const result = generateFAQStructuredData([]);
      
      expect(result.mainEntity).toHaveLength(0);
    });
  });

  describe('injectStructuredData', () => {
    it('should inject structured data as JSON-LD script', () => {
      const data = { '@type': 'Article', name: 'Test' };
      const result = injectStructuredData(data);
      
      expect(result).toContain('<script type="application/ld+json">');
      expect(result).toContain('"@type": "Article"');
      expect(result).toContain('"name": "Test"');
      expect(result).toContain('</script>');
    });

    it('should format JSON with proper indentation', () => {
      const data = { nested: { property: 'value' } };
      const result = injectStructuredData(data);
      
      expect(result).toContain('  "nested": {\n    "property": "value"\n  }');
    });
  });

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL with base domain', () => {
      const result = generateCanonicalUrl('/blog/test-article');
      
      expect(result).toBe('https://threadjuice.com/blog/test-article');
    });

    it('should handle root path', () => {
      const result = generateCanonicalUrl('/');
      
      expect(result).toBe('https://threadjuice.com/');
    });

    it('should handle paths without leading slash', () => {
      const result = generateCanonicalUrl('blog/article');
      
      expect(result).toBe('https://threadjuice.comblog/article');
    });
  });

  describe('generateAlternateLanguages', () => {
    it('should generate alternate language URLs', () => {
      const result = generateAlternateLanguages('/blog/article');
      
      expect(result).toEqual({
        'en-US': 'https://threadjuice.com/blog/article',
        'x-default': 'https://threadjuice.com/blog/article',
      });
    });

    it('should handle root path', () => {
      const result = generateAlternateLanguages('/');
      
      expect(result).toEqual({
        'en-US': 'https://threadjuice.com/',
        'x-default': 'https://threadjuice.com/',
      });
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle undefined values gracefully', () => {
      const postWithUndefined = {
        ...mockPost,
        updatedAt: undefined,
        tags: [],
        redditMetrics: {
          ...mockPost.redditMetrics,
          originalAuthor: undefined,
        },
      };
      
      expect(() => {
        generateArticleStructuredData(postWithUndefined as any);
      }).not.toThrow();
    });

    it('should handle empty strings', () => {
      const postWithEmpty = {
        ...mockPost,
        title: '',
        excerpt: '',
        content: '',
      };
      
      const result = generateArticleStructuredData(postWithEmpty as any);
      
      expect(result.headline).toBe('');
      expect(result.description).toBe('');
      expect(result.wordCount).toBe(0);
    });

    it('should handle special characters in content', () => {
      const postWithSpecialChars = {
        ...mockPost,
        title: 'Test "Quotes" & <Tags>',
        content: 'Content with "quotes" & <html> tags',
      };
      
      const result = generateArticleStructuredData(postWithSpecialChars as any);
      const injected = injectStructuredData(result);
      
      expect(injected).toContain('Test \\"Quotes\\" & <Tags>');
      // Should not crash when parsing
      expect(() => {
        const scriptContent = injected.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];
        if (scriptContent) {
          JSON.parse(scriptContent);
        }
      }).not.toThrow();
    });
  });
});