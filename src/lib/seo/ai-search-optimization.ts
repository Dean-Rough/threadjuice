import { Post } from '@/types/post';

interface AISearchData {
  perplexityOptimized: boolean;
  openAIOptimized: boolean;
  claudeOptimized: boolean;
  structuredData: any[];
}

export async function optimizeForAISearch(post: Post): Promise<AISearchData> {
  const perplexityData = await optimizeForPerplexity(post);
  const openAIData = optimizeForOpenAI(post);
  const claudeData = optimizeForClaude(post);
  
  return {
    perplexityOptimized: true,
    openAIOptimized: true,
    claudeOptimized: true,
    structuredData: [
      ...perplexityData,
      ...openAIData,
      ...claudeData
    ]
  };
}

async function optimizeForPerplexity(post: Post): Promise<any[]> {
  const data = [];
  
  // Product schema for Perplexity Merchant Program
  if (post.category === 'technology' || post.category === 'lifestyle') {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: post.title,
      description: post.excerpt,
      image: extractLifestyleImages(post),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: calculateViralScore(post),
        ratingCount: post.viewCount || 1,
        bestRating: 10
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '0',
        availability: 'https://schema.org/InStock'
      }
    });
  }
  
  // FAQ schema for better snippets
  const faqs = extractFAQs(post);
  if (faqs.length > 0) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }
  
  // Submit to Perplexity if API available
  if (process.env.PERPLEXITY_API_KEY) {
    await submitToPerplexity(post);
  }
  
  return data;
}

function optimizeForOpenAI(post: Post): any[] {
  const data = [];
  
  // HowTo schema for instructional content
  if (post.content?.sections?.some(s => s.type === 'steps')) {
    const steps = extractSteps(post);
    data.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: post.title,
      description: post.excerpt,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        name: `Step ${index + 1}`,
        text: step
      }))
    });
  }
  
  // BreadcrumbList for better context
  data.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://threadjuice.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.category,
        item: `https://threadjuice.com/category/${post.category?.toLowerCase()}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://threadjuice.com/posts/${post.slug}`
      }
    ]
  });
  
  return data;
}

function optimizeForClaude(post: Post): any[] {
  const data = [];
  
  // DiscussionForumPosting for Reddit content
  if (post.sourceUrl?.includes('reddit.com')) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'DiscussionForumPosting',
      headline: post.title,
      articleBody: extractPlainText(post),
      author: {
        '@type': 'Person',
        name: post.redditAuthor || 'Reddit User'
      },
      datePublished: post.publishedAt,
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: post.upvoteCount || 0
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/CommentAction',
          userInteractionCount: post.commentCount || 0
        }
      ]
    });
  }
  
  // ClaimReview for controversial content
  if (post.tags?.includes('controversy') || post.tags?.includes('drama')) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'ClaimReview',
      url: `https://threadjuice.com/posts/${post.slug}`,
      claimReviewed: post.title,
      itemReviewed: {
        '@type': 'CreativeWork',
        author: {
          '@type': 'Organization',
          name: 'Internet Community'
        }
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: calculateCredibilityScore(post),
        bestRating: 5,
        worstRating: 1
      }
    });
  }
  
  return data;
}

function extractLifestyleImages(post: Post): string[] {
  const images = [];
  const sections = post.content?.sections || [];
  
  sections.forEach(section => {
    if (section.type === 'image' && section.url) {
      images.push(section.url);
    }
    if (section.type === 'gallery' && section.images) {
      images.push(...section.images.map(img => img.url));
    }
  });
  
  return images.slice(0, 4); // Perplexity prefers multiple images
}

function calculateViralScore(post: Post): number {
  const views = post.viewCount || 0;
  const upvotes = post.upvoteCount || 0;
  const shares = post.shareCount || 0;
  const comments = post.commentCount || 0;
  
  const score = (views * 0.1 + upvotes * 3 + shares * 5 + comments * 2) / 1000;
  return Math.min(Math.max(score, 1), 10); // Score between 1-10
}

function extractFAQs(post: Post): Array<{question: string, answer: string}> {
  const faqs = [];
  const sections = post.content?.sections || [];
  
  // Look for Q&A sections
  sections.forEach(section => {
    if (section.type === 'faq' || section.type === 'qa') {
      faqs.push(...section.items);
    }
    
    // Extract from comments
    if (section.type === 'comments-1' && section.comments) {
      section.comments.slice(0, 3).forEach(comment => {
        if (comment.content?.includes('?')) {
          faqs.push({
            question: comment.content.split('?')[0] + '?',
            answer: comment.replies?.[0]?.content || 'Community discussion in progress.'
          });
        }
      });
    }
  });
  
  return faqs.slice(0, 5); // Limit to 5 FAQs
}

function extractSteps(post: Post): string[] {
  const steps = [];
  const sections = post.content?.sections || [];
  
  sections.forEach(section => {
    if (section.type === 'steps' || section.type === 'list') {
      steps.push(...section.items);
    }
  });
  
  return steps;
}

function extractPlainText(post: Post): string {
  const texts = [];
  const sections = post.content?.sections || [];
  
  sections.forEach(section => {
    if (section.type === 'text' && section.content) {
      texts.push(section.content.replace(/<[^>]*>/g, ''));
    }
  });
  
  return texts.join(' ');
}

function calculateCredibilityScore(post: Post): number {
  let score = 3; // Neutral start
  
  // Higher score for more engagement
  if (post.upvoteCount > 1000) score += 1;
  if (post.commentCount > 100) score += 0.5;
  
  // Lower score for controversial tags
  if (post.tags?.includes('unverified')) score -= 1;
  if (post.tags?.includes('rumor')) score -= 0.5;
  
  return Math.min(Math.max(score, 1), 5);
}

async function submitToPerplexity(post: Post) {
  // Placeholder for Perplexity API submission
  // Would implement when API becomes available
  try {
    // const response = await fetch('https://api.perplexity.ai/submit', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     url: `https://threadjuice.com/posts/${post.slug}`,
    //     type: 'article',
    //     category: post.category
    //   })
    // });
    console.log(`Would submit ${post.slug} to Perplexity`);
  } catch (error) {
    console.error('Perplexity submission failed:', error);
  }
}

// Auto-detect AI crawler user agents
export function isAICrawler(userAgent: string): boolean {
  const aiCrawlers = [
    'GPTBot', // OpenAI
    'ChatGPT-User', // ChatGPT
    'CCBot', // Common Crawl (used by many AI)
    'anthropic-ai', // Claude
    'claude-web', // Claude
    'PerplexityBot' // Perplexity
  ];
  
  return aiCrawlers.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

// Generate AI-friendly robots meta
export function generateAIRobotsMeta(): any {
  return {
    'ai-generated': 'mixed', // Human-curated AI-enhanced content
    'ai-crawlers': 'all',
    'openai-gptbot': 'all',
    'anthropic-ai': 'all',
    'perplexity-bot': 'all'
  };
}