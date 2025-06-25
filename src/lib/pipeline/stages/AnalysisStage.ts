/**
 * Analysis Stage
 *
 * Analyzes content to extract entities, links, keywords, and sentiment.
 * This stage enriches the context with metadata needed for intelligent processing.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import { PipelineContext, ExtractedLink } from '../core/PipelineContext';
import { sentimentAnalyzer } from '@/lib/sentimentAnalyzer';
import { metaphorExtractor } from '@/lib/metaphorExtractor';

export interface AnalysisOptions {
  extractEntities?: boolean;
  extractLinks?: boolean;
  analyzeSentiment?: boolean;
  extractMetaphors?: boolean;
  generateKeywords?: boolean;
}

export class AnalysisStage extends BasePipelineStage {
  name = 'AnalysisStage';
  description = 'Analyzes content for entities, links, sentiment, and keywords';

  private options: AnalysisOptions;

  constructor(options: AnalysisOptions = {}) {
    super();
    this.options = {
      extractEntities: true,
      extractLinks: true,
      analyzeSentiment: true,
      extractMetaphors: true,
      generateKeywords: true,
      ...options,
    };
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log('Starting content analysis');

    // Get content to analyze
    const content = this.getContentForAnalysis(context);
    if (!content) {
      throw new Error('No content available for analysis');
    }

    // Run analysis tasks
    const tasks = [];

    if (this.options.extractLinks) {
      tasks.push(this.extractLinks(content, context));
    }

    if (this.options.extractEntities) {
      tasks.push(this.extractEntities(content, context));
    }

    if (this.options.analyzeSentiment) {
      tasks.push(this.analyzeSentiment(content, context));
    }

    if (this.options.generateKeywords) {
      tasks.push(this.generateKeywords(content, context));
    }

    if (this.options.extractMetaphors) {
      tasks.push(this.extractMetaphors(content, context));
    }

    // Execute all analysis tasks in parallel
    await Promise.all(tasks);

    this.log(
      `Analysis complete: ${context.analysis.entities.length} entities, ${context.analysis.links.length} links`
    );

    return context;
  }

  private getContentForAnalysis(context: PipelineContext): string {
    // Extract content based on source type
    if (context.source.type === 'reddit') {
      const post = context.source.rawData;
      return `${post.title}\n\n${post.content || ''}`;
    } else if (context.source.type === 'ai-generated') {
      // For AI content, we might have it in a different format
      return context.source.rawData.prompt || '';
    }

    return '';
  }

  private async extractLinks(
    content: string,
    context: PipelineContext
  ): Promise<void> {
    this.log('Extracting links from content');

    // Regular expressions for different link types
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const redditMediaRegex =
      /(i\.redd\.it|v\.redd\.it|imgur\.com|gfycat\.com)\/[\w\-\.]+/gi;
    const twitterMediaRegex = /(pic\.twitter\.com|pbs\.twimg\.com)\/[\w]+/gi;

    const links: ExtractedLink[] = [];
    const seenUrls = new Set<string>();

    // Extract standard URLs
    const urlMatches = content.match(urlRegex) || [];
    for (const url of urlMatches) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        links.push(this.categorizeLink(url));
      }
    }

    // Extract Reddit media
    const redditMatches = content.match(redditMediaRegex) || [];
    for (const match of redditMatches) {
      const url = match.startsWith('http') ? match : `https://${match}`;
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        links.push(this.categorizeLink(url));
      }
    }

    context.analysis.links = links;
    context.enrichments.mediaUrls = links
      .filter(link => link.type === 'image' || link.type === 'video')
      .map(link => link.url);
  }

  private categorizeLink(url: string): ExtractedLink {
    const domain = this.extractDomain(url);
    let type: ExtractedLink['type'] = 'other';

    // Categorize by domain and URL patterns
    if (
      url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
      domain.includes('imgur') ||
      url.includes('i.redd.it')
    ) {
      type = 'image';
    } else if (
      url.match(/\.(mp4|webm|mov)$/i) ||
      url.includes('v.redd.it') ||
      domain.includes('gfycat')
    ) {
      type = 'video';
    } else if (
      domain.includes('twitter') ||
      domain.includes('reddit') ||
      domain.includes('facebook')
    ) {
      type = 'social';
    } else if (
      domain.includes('medium') ||
      domain.includes('substack') ||
      url.includes('/article/')
    ) {
      type = 'article';
    }

    return {
      url,
      domain,
      type,
    };
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  private async extractEntities(
    content: string,
    context: PipelineContext
  ): Promise<void> {
    this.log('Extracting entities from content');

    const entities: string[] = [];

    // Product/Brand patterns
    const brandPatterns = [
      /\b(PowerPoint|Excel|Word|Google Slides|Keynote|Prezi)\b/gi,
      /\b(iPhone|Android|Samsung|Apple|Microsoft|Google)\b/gi,
      /\b(Netflix|Spotify|Amazon|Facebook|Instagram|TikTok|Twitter)\b/gi,
      /\b(Uber|Lyft|DoorDash|Grubhub|Airbnb)\b/gi,
    ];

    // Extract brands and products
    for (const pattern of brandPatterns) {
      const matches = content.match(pattern) || [];
      entities.push(...matches.map(m => m.trim()));
    }

    // Extract company names (capitalized words that might be companies)
    const companyPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const potentialCompanies = content.match(companyPattern) || [];

    // Filter to likely company names
    const companyKeywords = ['Inc', 'Corp', 'LLC', 'Ltd', 'Company'];
    for (const potential of potentialCompanies) {
      if (
        companyKeywords.some(kw => potential.includes(kw)) ||
        entities.includes(potential)
      ) {
        entities.push(potential);
      }
    }

    // Remove duplicates and store
    context.analysis.entities = [...new Set(entities)];
  }

  private async analyzeSentiment(
    content: string,
    context: PipelineContext
  ): Promise<void> {
    this.log('Analyzing sentiment');

    // For now, analyze the overall content
    // In a real implementation, we'd analyze each section
    const storyContext = {
      category: context.source.metadata.platform,
      sectionType: 'overall',
      sectionIndex: 0,
      totalSections: 1,
      contentQuality: 'standard' as const,
    };

    const sentiment = sentimentAnalyzer.analyzeSection(content, storyContext);
    context.analysis.sentiment = [sentiment];
  }

  private async generateKeywords(
    content: string,
    context: PipelineContext
  ): Promise<void> {
    this.log('Generating keywords');

    const keywords: string[] = [];

    // Extract key concepts based on content
    const lowerContent = content.toLowerCase();

    // Common viral story keywords
    const viralKeywords = [
      'revenge',
      'karma',
      'justice',
      'exposed',
      'caught',
      'revealed',
      'viral',
      'trending',
      'shocking',
      'unbelievable',
      'dramatic',
      'petty',
      'satisfying',
      'perfect',
      'brilliant',
      'clever',
    ];

    // Category-specific keywords
    const categoryKeywords: Record<string, string[]> = {
      workplace: [
        'boss',
        'manager',
        'office',
        'meeting',
        'email',
        'presentation',
      ],
      family: ['cousin', 'aunt', 'uncle', 'reunion', 'wedding', 'holiday'],
      dating: [
        'tinder',
        'bumble',
        'date',
        'relationship',
        'cheating',
        'ghosted',
      ],
      neighbor: ['HOA', 'noise', 'parking', 'property', 'fence', 'complaint'],
    };

    // Add viral keywords that appear in content
    for (const keyword of viralKeywords) {
      if (lowerContent.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    // Add category keywords
    const category = context.source.metadata.subreddit || 'general';
    if (categoryKeywords[category]) {
      keywords.push(...categoryKeywords[category]);
    }

    // Add extracted entities as keywords
    keywords.push(...context.analysis.entities.map(e => e.toLowerCase()));

    // Remove duplicates
    context.analysis.keywords = [...new Set(keywords)];
  }

  private async extractMetaphors(
    content: string,
    context: PipelineContext
  ): Promise<void> {
    this.log('Extracting metaphors');

    try {
      const title = context.source.rawData.title || '';
      const category = context.source.metadata.subreddit || 'general';
      const emotion = context.analysis.sentiment[0]?.emotion || 'neutral';

      const metaphor = metaphorExtractor.extractMetaphor(
        title,
        content,
        category,
        emotion
      );

      context.analysis.metaphor = metaphor;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log('Failed to extract metaphor: ' + errorMessage);
    }
  }

  async validate(context: PipelineContext): Promise<boolean> {
    // Ensure we have content to analyze
    return !!context.source.rawData;
  }
}
