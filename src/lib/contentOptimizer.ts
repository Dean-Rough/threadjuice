/**
 * Content Optimization Utilities
 * Applies quality-based optimizations to story content
 */

import {
  contentQualityChecker,
  ContentAnalysisInput,
  ContentQualityMetrics,
} from './contentQualityChecker';

export interface ContentOptimizationResult {
  originalContent: any;
  optimizedContent: any;
  qualityMetrics: ContentQualityMetrics;
  optimizationApplied: string[];
  recommendations: string[];
}

export interface StoryOptimizationConfig {
  enableQualityBasedLength: boolean;
  enableStructureOptimization: boolean;
  enableEngagementOptimization: boolean;
  targetReadingTime?: number; // in minutes
}

export class ContentOptimizer {
  private config: StoryOptimizationConfig = {
    enableQualityBasedLength: true,
    enableStructureOptimization: true,
    enableEngagementOptimization: true,
    targetReadingTime: 7,
  };

  constructor(config?: Partial<StoryOptimizationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Optimize story content based on quality assessment
   */
  optimizeStoryContent(story: any): ContentOptimizationResult {
    const analysisInput: ContentAnalysisInput = {
      title: story.title,
      content: this.extractTextContent(story.content),
      sections: story.content?.sections || [],
      socialMetrics: {
        viewCount: story.viewCount,
        upvoteCount: story.upvoteCount,
        commentCount: story.commentCount,
        shareCount: story.shareCount,
        bookmarkCount: story.bookmarkCount,
      },
      source: story.source,
      category: story.category,
    };

    const qualityMetrics = contentQualityChecker.analyzeContent(analysisInput);
    const optimizationApplied: string[] = [];
    const recommendations: string[] = [];
    let optimizedContent = JSON.parse(JSON.stringify(story.content));

    // Apply quality-based length optimization
    if (this.config.enableQualityBasedLength) {
      const lengthOptimization = this.applyLengthOptimization(
        optimizedContent,
        qualityMetrics,
        analysisInput
      );
      optimizedContent = lengthOptimization.content;
      optimizationApplied.push(...lengthOptimization.applied);
      recommendations.push(...lengthOptimization.recommendations);
    }

    // Apply structure optimization
    if (this.config.enableStructureOptimization) {
      const structureOptimization = this.applyStructureOptimization(
        optimizedContent,
        qualityMetrics
      );
      optimizedContent = structureOptimization.content;
      optimizationApplied.push(...structureOptimization.applied);
      recommendations.push(...structureOptimization.recommendations);
    }

    // Apply engagement optimization
    if (this.config.enableEngagementOptimization) {
      const engagementOptimization = this.applyEngagementOptimization(
        optimizedContent,
        qualityMetrics
      );
      optimizedContent = engagementOptimization.content;
      optimizationApplied.push(...engagementOptimization.applied);
      recommendations.push(...engagementOptimization.recommendations);
    }

    return {
      originalContent: story.content,
      optimizedContent,
      qualityMetrics,
      optimizationApplied,
      recommendations,
    };
  }

  /**
   * Apply length optimization based on content quality
   */
  private applyLengthOptimization(
    content: any,
    quality: ContentQualityMetrics,
    input: ContentAnalysisInput
  ): { content: any; applied: string[]; recommendations: string[] } {
    const applied: string[] = [];
    const recommendations: string[] = [];
    const recommendedStructure =
      contentQualityChecker.getRecommendedStructure(input);

    // Adjust reading time based on quality
    let targetReadingTime = this.config.targetReadingTime || 7;

    if (
      quality.qualityTier === 'premium' &&
      quality.recommendedAction === 'expand'
    ) {
      targetReadingTime = Math.min(targetReadingTime + 3, 12); // Max 12 minutes
      applied.push('Extended reading time for premium content');
      recommendations.push('Consider adding more detailed analysis sections');
    } else if (
      quality.qualityTier === 'basic' &&
      quality.recommendedAction === 'shorten'
    ) {
      targetReadingTime = Math.max(targetReadingTime - 2, 3); // Min 3 minutes
      applied.push('Reduced reading time for basic content');
      recommendations.push('Focus on key points and remove verbose sections');
    }

    // Adjust section count based on quality
    const currentSections = content.sections?.length || 0;

    if (
      quality.qualityTier === 'premium' &&
      currentSections < recommendedStructure.minSections
    ) {
      recommendations.push(
        `Consider adding ${recommendedStructure.minSections - currentSections} more sections for better narrative flow`
      );
    } else if (
      quality.qualityTier === 'basic' &&
      currentSections > recommendedStructure.maxSections
    ) {
      recommendations.push(
        `Consider consolidating content into ${recommendedStructure.maxSections} sections or fewer`
      );
    }

    return { content, applied, recommendations };
  }

  /**
   * Apply structure optimization
   */
  private applyStructureOptimization(
    content: any,
    quality: ContentQualityMetrics
  ): { content: any; applied: string[]; recommendations: string[] } {
    const applied: string[] = [];
    const recommendations: string[] = [];

    if (!content.sections) return { content, applied, recommendations };

    // Ensure good opening and closing
    const hasGoodOpening = content.sections.some(
      (s: any) => s.type === 'describe-1'
    );
    const hasGoodClosing = content.sections.some(
      (s: any) => s.type === 'outro'
    );

    if (!hasGoodOpening) {
      recommendations.push('Add a strong opening section to hook readers');
    }

    if (!hasGoodClosing) {
      recommendations.push('Add a conclusion section to wrap up the story');
    }

    // Check for engagement elements
    const hasQuotes = content.sections.some(
      (s: any) => s.type === 'quotes' || s.type === 'twitter-quote'
    );
    const hasComments = content.sections.some((s: any) =>
      s.type.includes('comments')
    );

    if (!hasQuotes && quality.qualityTier !== 'basic') {
      recommendations.push(
        'Consider adding memorable quotes to increase engagement'
      );
    }

    if (!hasComments && quality.qualityTier === 'premium') {
      recommendations.push('Add comment sections to show community response');
    }

    // Optimize section order
    const optimizedSections = this.optimizeSectionOrder(content.sections);
    if (
      JSON.stringify(optimizedSections) !== JSON.stringify(content.sections)
    ) {
      content.sections = optimizedSections;
      applied.push('Optimized section order for better flow');
    }

    return { content, applied, recommendations };
  }

  /**
   * Apply engagement optimization
   */
  private applyEngagementOptimization(
    content: any,
    quality: ContentQualityMetrics
  ): { content: any; applied: string[]; recommendations: string[] } {
    const applied: string[] = [];
    const recommendations: string[] = [];

    // Add engagement hooks for high-quality content
    if (quality.engagementPotential > 0.7) {
      recommendations.push(
        'Consider adding interactive elements like polls or questions'
      );
      recommendations.push('Optimize for social sharing with quotable moments');
    }

    // Suggest viral elements for premium content
    if (quality.qualityTier === 'premium') {
      recommendations.push('Consider creating shareable graphics or memes');
      recommendations.push('Add discussion prompts to encourage comments');
    }

    return { content, applied, recommendations };
  }

  /**
   * Optimize section order for better narrative flow
   */
  private optimizeSectionOrder(sections: any[]): any[] {
    // Ideal flow: describe-1 -> image -> quotes -> describe-2 -> comments -> discussion -> outro
    const sectionPriority: { [key: string]: number } = {
      'describe-1': 1,
      image: 2,
      quotes: 3,
      'twitter-quote': 3,
      'describe-2': 4,
      'comments-1': 5,
      discussion: 6,
      'comments-2': 7,
      outro: 8,
    };

    return [...sections].sort((a, b) => {
      const aPriority = sectionPriority[a.type] || 5;
      const bPriority = sectionPriority[b.type] || 5;
      return aPriority - bPriority;
    });
  }

  /**
   * Extract text content from structured content
   */
  private extractTextContent(content: any): string {
    if (!content || !content.sections) return '';

    return content.sections
      .filter((section: any) => section.content)
      .map((section: any) => section.content)
      .join(' ');
  }

  /**
   * Calculate optimal reading time based on content and quality
   */
  calculateOptimalReadingTime(
    content: any,
    quality: ContentQualityMetrics
  ): number {
    const textContent = this.extractTextContent(content);
    const wordCount = textContent.split(' ').length;
    const baseReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

    // Adjust based on quality
    let multiplier = 1;
    if (quality.qualityTier === 'premium') {
      multiplier = 1.2; // Allow 20% longer for premium content
    } else if (quality.qualityTier === 'basic') {
      multiplier = 0.8; // 20% shorter for basic content
    }

    return Math.round(baseReadingTime * multiplier);
  }
}

// Export configured instance
export const contentOptimizer = new ContentOptimizer();
