/**
 * Content Quality Assessment System
 * Analyzes content quality to determine if length restrictions should be relaxed
 */

export interface ContentQualityMetrics {
  readabilityScore: number;
  engagementPotential: number;
  narrativeStructure: number;
  originalityScore: number;
  socialProofScore: number;
  overallQuality: number;
  recommendedAction: 'expand' | 'standard' | 'shorten';
  qualityTier: 'premium' | 'standard' | 'basic';
  improvementSuggestions: ImprovementSuggestion[];
  passesPublishingThreshold: boolean;
}

export interface ImprovementSuggestion {
  category: 'readability' | 'engagement' | 'narrative' | 'originality' | 'terry_voice';
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  targetScore: number;
}

export interface ContentAnalysisInput {
  title: string;
  content: string;
  sections?: any[];
  socialMetrics?: {
    viewCount?: number;
    upvoteCount?: number;
    commentCount?: number;
    shareCount?: number;
    bookmarkCount?: number;
  };
  source?: string;
  category?: string;
}

export class ContentQualityChecker {
  private readonly QUALITY_THRESHOLDS = {
    publishing: 0.70, // Minimum threshold to publish
    premium: 0.85,    // Excellence tier
    rewrite: 0.70     // Below this = needs rewrite
  };

  private readonly LENGTH_LIMITS = {
    premium: {
      minSections: 3,
      maxSections: 12,
      avgSectionLength: 800
    },
    standard: {
      minSections: 3,
      maxSections: 8,
      avgSectionLength: 500
    },
    basic: {
      minSections: 2,
      maxSections: 6,
      avgSectionLength: 300
    }
  };

  /**
   * Analyze content quality and provide recommendations
   */
  analyzeContent(input: ContentAnalysisInput): ContentQualityMetrics {
    const readabilityScore = this.assessReadability(input.content, input.title);
    const engagementPotential = this.assessEngagementPotential(input);
    const narrativeStructure = this.assessNarrativeStructure(input);
    const originalityScore = this.assessOriginality(input);
    const socialProofScore = this.assessSocialProof(input.socialMetrics);

    // Weighted overall quality score
    const overallQuality = (
      readabilityScore * 0.25 +
      engagementPotential * 0.3 +
      narrativeStructure * 0.2 +
      originalityScore * 0.15 +
      socialProofScore * 0.1
    );

    const qualityTier = this.determineQualityTier(overallQuality);
    const recommendedAction = this.determineRecommendedAction(
      overallQuality,
      input.content.length,
      input.sections?.length || 0
    );

    const improvementSuggestions = this.generateImprovementSuggestions({
      readabilityScore,
      engagementPotential,
      narrativeStructure,
      originalityScore,
      socialProofScore,
      overallQuality
    }, input);

    const passesPublishingThreshold = overallQuality >= this.QUALITY_THRESHOLDS.publishing;

    return {
      readabilityScore,
      engagementPotential,
      narrativeStructure,
      originalityScore,
      socialProofScore,
      overallQuality,
      recommendedAction,
      qualityTier,
      improvementSuggestions,
      passesPublishingThreshold
    };
  }

  /**
   * Check if content should be allowed longer format
   */
  shouldAllowExtendedLength(input: ContentAnalysisInput): boolean {
    const quality = this.analyzeContent(input);
    return quality.qualityTier === 'premium' || 
           (quality.qualityTier === 'standard' && quality.overallQuality > 0.65);
  }

  /**
   * Get recommended content structure based on quality
   */
  getRecommendedStructure(input: ContentAnalysisInput): {
    minSections: number;
    maxSections: number;
    recommendedSections: string[];
    avgSectionLength: number;
  } {
    const quality = this.analyzeContent(input);
    const limits = this.LENGTH_LIMITS[quality.qualityTier];

    const recommendedSections = this.getRecommendedSectionTypes(quality);

    return {
      ...limits,
      recommendedSections
    };
  }

  /**
   * Assess readability using various metrics
   */
  private assessReadability(content: string, title: string): number {
    let score = 0;

    // Sentence length analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((acc, s) => acc + s.split(' ').length, 0) / sentences.length;
    
    // Optimal sentence length is 15-20 words
    if (avgSentenceLength >= 15 && avgSentenceLength <= 20) {
      score += 0.3;
    } else if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
      score += 0.2;
    } else {
      score += 0.1;
    }

    // Paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const avgParagraphLength = paragraphs.reduce((acc, p) => acc + p.length, 0) / paragraphs.length;
    
    // Good paragraph length: 100-300 characters
    if (avgParagraphLength >= 100 && avgParagraphLength <= 300) {
      score += 0.25;
    } else if (avgParagraphLength >= 50 && avgParagraphLength <= 400) {
      score += 0.15;
    }

    // Title clarity and appeal
    const titleWords = title.split(' ').length;
    if (titleWords >= 6 && titleWords <= 12) {
      score += 0.2;
    } else if (titleWords >= 4 && titleWords <= 15) {
      score += 0.1;
    }

    // Content flow indicators
    const transitionWords = [
      'however', 'meanwhile', 'furthermore', 'additionally', 'consequently',
      'therefore', 'nevertheless', 'ultimately', 'initially', 'subsequently'
    ];
    const transitionCount = transitionWords.reduce((count, word) => {
      return count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    if (transitionCount >= 3) {
      score += 0.25;
    } else if (transitionCount >= 1) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  /**
   * Assess potential for viral engagement
   */
  private assessEngagementPotential(input: ContentAnalysisInput): number {
    let score = 0;

    // Emotional hooks in title
    const emotionalKeywords = [
      'shocking', 'unbelievable', 'hilarious', 'devastating', 'outrageous',
      'genius', 'epic', 'disaster', 'perfect', 'insane', 'brilliant',
      'discovers', 'mandatory', 'literally', 'artisanal', 'spends'
    ];
    const titleLower = input.title.toLowerCase();
    const emotionalWords = emotionalKeywords.filter(word => titleLower.includes(word));
    score += Math.min(emotionalWords.length * 0.15, 0.3);

    // Controversy and drama indicators
    const controversyKeywords = [
      'drama', 'controversy', 'war', 'battle', 'fight', 'clash', 'debate',
      'outrage', 'backlash', 'scandal', 'meltdown', 'chaos'
    ];
    const controversyWords = controversyKeywords.filter(word => 
      input.title.toLowerCase().includes(word) || input.content.toLowerCase().includes(word)
    );
    score += Math.min(controversyWords.length * 0.1, 0.25);

    // Social media context
    if (input.source === 'twitter_drama' || input.source === 'reddit') {
      score += 0.2;
    }

    // Category engagement potential
    const highEngagementCategories = [
      'Food Wars', 'Relationship Drama', 'Workplace Drama', 'Family Drama',
      'Internet Drama', 'Celebrity Drama', 'Tech Drama'
    ];
    if (highEngagementCategories.includes(input.category || '')) {
      score += 0.15;
    }

    // Content length vs engagement (sweet spot analysis)
    const contentLength = input.content.length;
    if (contentLength >= 1500 && contentLength <= 4000) {
      score += 0.1; // Good length for sharing
    }

    return Math.min(score, 1);
  }

  /**
   * Assess narrative structure and story flow
   */
  private assessNarrativeStructure(input: ContentAnalysisInput): number {
    let score = 0;

    // Section variety and structure
    if (input.sections && input.sections.length > 0) {
      const sectionTypes = new Set(input.sections.map(s => s.type));
      
      // Good variety of section types
      if (sectionTypes.size >= 4) {
        score += 0.3;
      } else if (sectionTypes.size >= 3) {
        score += 0.2;
      }

      // Presence of key narrative elements
      const hasQuotes = sectionTypes.has('quotes') || sectionTypes.has('twitter-quote');
      const hasComments = sectionTypes.has('comments-1') || sectionTypes.has('comments-2');
      const hasDiscussion = sectionTypes.has('discussion');
      const hasOutro = sectionTypes.has('outro');

      if (hasQuotes) score += 0.15;
      if (hasComments) score += 0.15;
      if (hasDiscussion) score += 0.1;
      if (hasOutro) score += 0.1;

      // Good section distribution
      const descriptionSections = input.sections.filter(s => 
        s.type.startsWith('describe')
      ).length;
      
      if (descriptionSections >= 2 && descriptionSections <= 4) {
        score += 0.2;
      }
    }

    return Math.min(score, 1);
  }

  /**
   * Assess content originality and uniqueness
   */
  private assessOriginality(input: ContentAnalysisInput): number {
    let score = 0.5; // Base score

    // Personal commentary and analysis
    const commentaryIndicators = [
      'The Terry', 'notes', 'observes', 'analysis', 'fascinating',
      'properly', 'brilliant', 'mental', 'peak internet', 'honestly',
      'literally', 'exactly', 'perfect', 'dystopian', 'absurd',
      'artificial', 'reveals', 'phenomenon', 'suggests', 'fundamentally',
      'accidentally', 'metaphor', 'camaraderie'
    ];
    
    const commentaryCount = commentaryIndicators.reduce((count, phrase) => {
      return count + (input.content.match(new RegExp(phrase, 'gi')) || []).length;
    }, 0);
    
    score += Math.min(commentaryCount * 0.1, 0.3);

    // Unique angle or perspective
    const perspectiveIndicators = [
      'what really happened', 'the real story', 'here\'s what actually',
      'the thing is', 'plot twist', 'turns out', 'the bigger picture',
      'reveals something deeper', 'isn\'t just', 'that\'s not just'
    ];
    
    const perspectiveCount = perspectiveIndicators.reduce((count, phrase) => {
      return count + (input.content.toLowerCase().match(new RegExp(phrase, 'g')) || []).length;
    }, 0);
    
    if (perspectiveCount > 0) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Assess social proof through metrics
   */
  private assessSocialProof(metrics?: ContentAnalysisInput['socialMetrics']): number {
    if (!metrics) return 0.3; // Base score for new content

    let score = 0;

    // View count assessment
    const views = metrics.viewCount || 0;
    if (views > 5000) score += 0.3;
    else if (views > 1000) score += 0.2;
    else if (views > 500) score += 0.1;

    // Engagement rate calculation
    const totalEngagement = (metrics.upvoteCount || 0) + 
                           (metrics.commentCount || 0) + 
                           (metrics.shareCount || 0) + 
                           (metrics.bookmarkCount || 0);
    
    const engagementRate = views > 0 ? totalEngagement / views : 0;
    
    if (engagementRate > 0.1) score += 0.3;
    else if (engagementRate > 0.05) score += 0.2;
    else if (engagementRate > 0.02) score += 0.1;

    // Share/bookmark ratio (indicates quality)
    const shareBookmarkRatio = views > 0 ? 
      ((metrics.shareCount || 0) + (metrics.bookmarkCount || 0)) / views : 0;
    
    if (shareBookmarkRatio > 0.05) score += 0.2;
    else if (shareBookmarkRatio > 0.02) score += 0.1;

    // Comment engagement (indicates discussion value)
    const commentRate = views > 0 ? (metrics.commentCount || 0) / views : 0;
    if (commentRate > 0.03) score += 0.2;
    else if (commentRate > 0.01) score += 0.1;

    return Math.min(score, 1);
  }

  /**
   * Determine quality tier based on overall score
   */
  private determineQualityTier(overallQuality: number): 'premium' | 'standard' | 'basic' {
    if (overallQuality >= this.QUALITY_THRESHOLDS.premium) {
      return 'premium';
    } else if (overallQuality >= this.QUALITY_THRESHOLDS.publishing) {
      return 'standard';
    } else {
      return 'basic';
    }
  }

  /**
   * Determine recommended action for content
   */
  private determineRecommendedAction(
    quality: number, 
    contentLength: number, 
    sectionCount: number
  ): 'expand' | 'standard' | 'shorten' {
    if (quality >= 0.8 && sectionCount < 6) {
      return 'expand';
    } else if (quality < 0.5 && contentLength > 2000) {
      return 'shorten';
    } else {
      return 'standard';
    }
  }

  /**
   * Get recommended section types based on quality
   */
  private getRecommendedSectionTypes(quality: ContentQualityMetrics): string[] {
    const baseSections = ['describe-1', 'quotes', 'describe-2', 'outro'];
    
    if (quality.qualityTier === 'premium') {
      return [
        ...baseSections,
        'image',
        'twitter-quote',
        'comments-1',
        'discussion',
        'comments-2'
      ];
    } else if (quality.qualityTier === 'standard') {
      return [
        ...baseSections,
        'comments-1',
        'discussion'
      ];
    } else {
      return baseSections;
    }
  }

  /**
   * Generate specific improvement suggestions based on quality analysis
   */
  private generateImprovementSuggestions(
    scores: {
      readabilityScore: number;
      engagementPotential: number;
      narrativeStructure: number;
      originalityScore: number;
      socialProofScore: number;
      overallQuality: number;
    },
    input: ContentAnalysisInput
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Readability improvements
    if (scores.readabilityScore < 0.75) {
      if (scores.readabilityScore < 0.5) {
        suggestions.push({
          category: 'readability',
          issue: 'Poor sentence structure and flow',
          suggestion: 'Rewrite with shorter, punchier sentences (15-20 words). Add transition words like "meanwhile," "however," "ultimately" to improve flow. Break up long paragraphs.',
          priority: 'high',
          targetScore: 0.8
        });
      } else {
        suggestions.push({
          category: 'readability',
          issue: 'Text flow could be smoother',
          suggestion: 'Add more transition words between paragraphs. Vary sentence length for better rhythm. Aim for 100-300 character paragraphs.',
          priority: 'medium',
          targetScore: 0.8
        });
      }
    }

    // Engagement improvements
    if (scores.engagementPotential < 0.75) {
      if (scores.engagementPotential < 0.5) {
        suggestions.push({
          category: 'engagement',
          issue: 'Low viral potential and emotional hooks',
          suggestion: 'Add emotional keywords like "shocking," "unbelievable," "genius," "disaster." Include more controversy and drama. Build tension around character flaws and social dynamics.',
          priority: 'high',
          targetScore: 0.8
        });
      } else {
        suggestions.push({
          category: 'engagement',
          issue: 'Needs stronger emotional hooks',
          suggestion: 'Amplify the drama and stakes. Add more specific details that reveal character motivations. Include social media context or broader cultural implications.',
          priority: 'medium',
          targetScore: 0.8
        });
      }
    }

    // Narrative structure improvements
    if (scores.narrativeStructure < 0.75) {
      if (input.sections && input.sections.length > 0) {
        const hasQuotes = input.sections.some(s => s.type === 'quotes' || s.type === 'twitter-quote');
        const hasComments = input.sections.some(s => s.type.includes('comments'));
        const hasDiscussion = input.sections.some(s => s.type === 'discussion');

        if (!hasQuotes) {
          suggestions.push({
            category: 'narrative',
            issue: 'Missing dramatic quotes or key moments',
            suggestion: 'Add a powerful quote section that captures the peak moment of drama. Use quotation marks around the most shocking or revealing statement.',
            priority: 'high',
            targetScore: 0.8
          });
        }

        if (!hasComments) {
          suggestions.push({
            category: 'narrative',
            issue: 'Missing social proof and reactions',
            suggestion: 'Add a comments or Twitter conversation section showing how people reacted. Include mix of outrage, support, and witty observations.',
            priority: 'medium',
            targetScore: 0.8
          });
        }

        if (!hasDiscussion) {
          suggestions.push({
            category: 'narrative',
            issue: 'Needs deeper analysis section',
            suggestion: 'Add a "bigger picture" discussion section that explores what this story reveals about society, human nature, or modern life.',
            priority: 'medium',
            targetScore: 0.8
          });
        }
      } else {
        suggestions.push({
          category: 'narrative',
          issue: 'Poor story structure',
          suggestion: 'Restructure with clear sections: Setup → Drama Unfolds → Peak Moment (with quotes) → Social Reactions → Bigger Picture → Resolution.',
          priority: 'high',
          targetScore: 0.8
        });
      }
    }

    // Originality improvements (Terry voice)
    if (scores.originalityScore < 0.75) {
      if (scores.originalityScore < 0.5) {
        suggestions.push({
          category: 'terry_voice',
          issue: 'Missing Terry\'s signature cynical commentary',
          suggestion: 'Add more Terry-style observations: "properly mental," "peak internet behavior," "dystopian," "artificial." Include sardonic takes on modern life and social dynamics.',
          priority: 'high',
          targetScore: 0.8
        });
      } else {
        suggestions.push({
          category: 'terry_voice',
          issue: 'Needs stronger unique perspective',
          suggestion: 'Amplify Terry\'s voice with more specific observations about the absurdity. Add metaphors comparing the situation to broader social phenomena.',
          priority: 'medium',
          targetScore: 0.8
        });
      }

      // Check for specific Terry voice indicators
      const terryIndicators = ['The Terry', 'properly', 'mental', 'peak internet', 'dystopian', 'artificial'];
      const terryCount = terryIndicators.reduce((count, phrase) => {
        return count + (input.content.match(new RegExp(phrase, 'gi')) || []).length;
      }, 0);

      if (terryCount < 3) {
        suggestions.push({
          category: 'terry_voice',
          issue: 'Insufficient Terry personality markers',
          suggestion: 'Include more Terry-specific phrases: "properly mental," "peak [something]," references to "artificial" behavior, "dystopian" elements. Make observations about social hierarchy and human absurdity.',
          priority: 'high',
          targetScore: 0.8
        });
      }
    }

    // Overall quality guidance
    if (scores.overallQuality < this.QUALITY_THRESHOLDS.publishing) {
      suggestions.push({
        category: 'originality',
        issue: `Overall quality too low (${Math.round(scores.overallQuality * 100)}%) for publishing`,
        suggestion: 'Focus on the highest priority improvements above. Consider adding a dramatic revelation or plot twist. Ensure the story has clear stakes and consequences.',
        priority: 'high',
        targetScore: this.QUALITY_THRESHOLDS.publishing
      });
    }

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// Export singleton instance
export const contentQualityChecker = new ContentQualityChecker();