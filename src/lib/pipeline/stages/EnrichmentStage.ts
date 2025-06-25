/**
 * Enrichment Stage
 *
 * Enriches the story with images, GIFs, and metadata.
 * Uses analysis results to find contextually relevant media.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import {
  PipelineContext,
  ImageResult,
  GifResult,
} from '../core/PipelineContext';
import { pexelsAdapter, klipyAdapter } from '../integrations';

export interface EnrichmentOptions {
  fetchImages?: boolean;
  fetchGifs?: boolean;
  fetchLinkMetadata?: boolean;
  maxGifs?: number;
  imageStrategy?: 'smart' | 'basic' | 'fallback';
}

export class EnrichmentStage extends BasePipelineStage {
  name = 'EnrichmentStage';
  description = 'Enriches content with images, GIFs, and metadata';

  private options: EnrichmentOptions;

  constructor(options: EnrichmentOptions = {}) {
    super();
    this.options = {
      fetchImages: true,
      fetchGifs: true,
      fetchLinkMetadata: true,
      maxGifs: 3,
      imageStrategy: 'smart',
      ...options,
    };
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log('Starting content enrichment');

    const tasks = [];

    if (this.options.fetchImages) {
      tasks.push(this.enrichWithImages(context));
    }

    if (this.options.fetchGifs && context.analysis.sentiment.length > 0) {
      tasks.push(this.enrichWithGifs(context));
    }

    if (this.options.fetchLinkMetadata && context.analysis.links.length > 0) {
      tasks.push(this.enrichWithLinkMetadata(context));
    }

    // Run enrichment tasks in parallel
    await Promise.all(tasks);

    this.log(
      `Enrichment complete: ${context.enrichments.reactionGifs.length} GIFs, image: ${!!context.enrichments.primaryImage}`
    );

    return context;
  }

  private async enrichWithImages(context: PipelineContext): Promise<void> {
    this.log('Finding relevant images');

    try {
      // First, check if we have images from the source
      const sourceImages = context.analysis.links
        .filter(link => link.type === 'image')
        .map(link => link.url);

      if (
        sourceImages.length > 0 &&
        this.options.imageStrategy !== 'fallback'
      ) {
        // Use the first source image
        context.enrichments.primaryImage = {
          url: sourceImages[0],
          alt_text: 'Image from story',
          author: context.source.metadata.author || 'Unknown',
          source_name: context.source.metadata.platform,
          source_url: context.source.metadata.url || '',
          license_type: 'Fair Use',
        };
        return;
      }

      // Otherwise, use intelligent image search
      const title = context.source.rawData.title || '';
      const content = context.source.rawData.content || '';
      const category = context.source.metadata.subreddit || 'general';

      const image = await this.timeOperation('Image search', () =>
        pexelsAdapter.findImage(title, content, category, {
          strategy: this.options.imageStrategy || 'smart',
        })
      );

      if (image) {
        context.enrichments.primaryImage = image;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Image enrichment failed: ${errorMessage}`);
      // Continue without image
    }
  }

  private async enrichWithGifs(context: PipelineContext): Promise<void> {
    this.log('Finding reaction GIFs');

    const sentiments = context.analysis.sentiment.slice(
      0,
      this.options.maxGifs
    );

    try {
      const enhancedGifs = await this.timeOperation('GIF search', () =>
        klipyAdapter.findReactionGifs(sentiments, {
          maxGifs: this.options.maxGifs,
          safeSearch: true,
        })
      );

      // Convert enhanced GIFs back to basic GifResult format for context
      context.enrichments.reactionGifs = enhancedGifs.map(eg => ({
        id: eg.id,
        url: eg.url,
        title: eg.title,
        caption: eg.caption,
        width: eg.width,
        height: eg.height,
        preview: eg.preview,
      }));

      this.log(`Found ${enhancedGifs.length} reaction GIFs`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`GIF enrichment failed: ${errorMessage}`);
      context.enrichments.reactionGifs = [];
    }
  }

  private async enrichWithLinkMetadata(
    context: PipelineContext
  ): Promise<void> {
    this.log('Fetching link metadata');

    // For now, we'll implement basic metadata structure
    // In production, this would fetch actual Open Graph data
    const metadata = context.analysis.links
      .filter(link => link.type === 'article' || link.type === 'social')
      .slice(0, 5) // Limit to 5 links
      .map(link => ({
        url: link.url,
        title: `Content from ${link.domain}`,
        description: 'Linked content from the story',
        siteName: link.domain,
      }));

    context.enrichments.linkMetadata = metadata;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validate(context: PipelineContext): Promise<boolean> {
    // We need analysis results for enrichment
    if (!context.analysis) {
      this.log('No analysis data available');
      return false;
    }

    return true;
  }
}

/**
 * Factory functions for common enrichment configurations
 */
export const FullEnrichment = () =>
  new EnrichmentStage({
    fetchImages: true,
    fetchGifs: true,
    fetchLinkMetadata: true,
    imageStrategy: 'smart',
    maxGifs: 3,
  });

export const MinimalEnrichment = () =>
  new EnrichmentStage({
    fetchImages: true,
    fetchGifs: false,
    fetchLinkMetadata: false,
    imageStrategy: 'basic',
  });

export const GifOnlyEnrichment = () =>
  new EnrichmentStage({
    fetchImages: false,
    fetchGifs: true,
    fetchLinkMetadata: false,
    maxGifs: 5,
  });
