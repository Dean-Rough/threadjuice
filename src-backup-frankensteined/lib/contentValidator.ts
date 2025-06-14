/**
 * Content validation and safety checks for ThreadJuice
 * Ensures generated content meets quality and safety standards
 */

import { config } from './env';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 quality score
  metadata: {
    wordCount: number;
    readabilityScore: number;
    sentimentScore: number;
    flaggedTerms: string[];
  };
}

export interface ContentValidationOptions {
  checkProfanity?: boolean;
  checkLength?: boolean;
  checkReadability?: boolean;
  checkSentiment?: boolean;
  minWordCount?: number;
  maxWordCount?: number;
  allowedTopics?: string[];
  blockedTopics?: string[];
}

/**
 * Profanity filter with different severity levels
 */
class ProfanityFilter {
  private readonly lowSeverityTerms = ['damn', 'hell', 'crap', 'piss', 'ass'];

  private readonly mediumSeverityTerms = ['shit', 'bitch', 'bastard', 'prick'];

  private readonly highSeverityTerms: string[] = [
    // High severity terms would be defined here
    // Keeping minimal for production safety
  ];

  private readonly contextualExceptions = [
    'asshole', // Common in AITA context
    'fucking', // Often used for emphasis in Reddit content
    'bullshit', // Common in drama/rant contexts
  ];

  checkContent(
    content: string,
    level: 'low' | 'medium' | 'high' = 'medium'
  ): {
    flagged: boolean;
    terms: string[];
    severity: string;
  } {
    const lowerContent = content.toLowerCase();
    const flaggedTerms: string[] = [];
    let maxSeverity = 'none';

    // Check based on configured level
    const termsToCheck = this.getTermsForLevel(level);

    for (const term of termsToCheck) {
      if (lowerContent.includes(term.toLowerCase())) {
        // Check if it's in an acceptable context
        if (!this.isAcceptableContext(content, term)) {
          flaggedTerms.push(term);
          maxSeverity = this.getSeverityLevel(term);
        }
      }
    }

    return {
      flagged: flaggedTerms.length > 0,
      terms: flaggedTerms,
      severity: maxSeverity,
    };
  }

  private getTermsForLevel(level: 'low' | 'medium' | 'high'): string[] {
    switch (level) {
      case 'low':
        return [...this.lowSeverityTerms];
      case 'medium':
        return [...this.lowSeverityTerms, ...this.mediumSeverityTerms];
      case 'high':
        return [
          ...this.lowSeverityTerms,
          ...this.mediumSeverityTerms,
          ...this.highSeverityTerms,
        ];
      default:
        return [];
    }
  }

  private getSeverityLevel(term: string): string {
    if (this.highSeverityTerms.includes(term)) return 'high';
    if (this.mediumSeverityTerms.includes(term)) return 'medium';
    if (this.lowSeverityTerms.includes(term)) return 'low';
    return 'none';
  }

  private isAcceptableContext(content: string, term: string): boolean {
    // Allow contextual exceptions for Reddit content
    if (this.contextualExceptions.includes(term.toLowerCase())) {
      // Check if it's used in a quote or Reddit context
      const termIndex = content.toLowerCase().indexOf(term.toLowerCase());
      const context = content.substring(
        Math.max(0, termIndex - 50),
        termIndex + 50
      );

      // Allow if it's in quotes, Reddit usernames, or subreddit names
      return (
        context.includes('"') ||
        context.includes("'") ||
        context.includes('u/') ||
        context.includes('r/') ||
        context.includes('AITA') ||
        context.includes('TIFU')
      );
    }

    return false;
  }
}

/**
 * Content quality analyzer
 */
class ContentQualityAnalyzer {
  calculateReadabilityScore(content: string): number {
    // Simple readability calculation based on sentence and word length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.estimateSyllables(words);

    // Simplified Flesch Reading Ease formula
    const score =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, score));
  }

  private estimateSyllables(words: string[]): number {
    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word);
    }, 0);

    return totalSyllables / words.length;
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  }

  calculateSentimentScore(content: string): number {
    // Simple sentiment analysis based on positive/negative word counts
    const positiveWords = [
      'amazing',
      'awesome',
      'great',
      'excellent',
      'wonderful',
      'fantastic',
      'love',
      'like',
      'enjoy',
      'happy',
      'good',
      'best',
      'perfect',
      'brilliant',
    ];

    const negativeWords = [
      'terrible',
      'awful',
      'horrible',
      'worst',
      'hate',
      'disgusting',
      'stupid',
      'dumb',
      'ridiculous',
      'pathetic',
      'annoying',
      'frustrating',
    ];

    const words = content.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
      if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0.5; // Neutral

    return positiveCount / totalSentimentWords;
  }
}

/**
 * Main content validator class
 */
export class ContentValidator {
  private profanityFilter = new ProfanityFilter();
  private qualityAnalyzer = new ContentQualityAnalyzer();

  async validateContent(
    content: string,
    options: ContentValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Default options
    const opts = {
      checkProfanity: true,
      checkLength: true,
      checkReadability: true,
      checkSentiment: true,
      minWordCount: 100,
      maxWordCount: 2000,
      ...options,
    };

    // Word count analysis
    if (!content || typeof content !== 'string') {
      return {
        isValid: false,
        errors: ['Content must be a non-empty string'],
        warnings: [],
        score: 0,
        metadata: {
          wordCount: 0,
          readabilityScore: 0,
          sentimentScore: 0.5,
          flaggedTerms: [],
        },
      };
    }

    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Length validation
    if (opts.checkLength) {
      if (wordCount < opts.minWordCount!) {
        errors.push(
          `Content too short: ${wordCount} words (minimum: ${opts.minWordCount})`
        );
        score -= 20;
      }

      if (wordCount > opts.maxWordCount!) {
        warnings.push(
          `Content may be too long: ${wordCount} words (maximum: ${opts.maxWordCount})`
        );
        score -= 10;
      }
    }

    // Profanity check
    const flaggedTerms: string[] = [];
    if (opts.checkProfanity) {
      const profanityResult = this.profanityFilter.checkContent(
        content,
        config?.features?.profanityFilterLevel || 'medium'
      );

      if (profanityResult.flagged) {
        flaggedTerms.push(...profanityResult.terms);

        if (profanityResult.severity === 'high') {
          errors.push(
            `High-severity profanity detected: ${profanityResult.terms.join(', ')}`
          );
          score -= 30;
        } else if (profanityResult.severity === 'medium') {
          warnings.push(
            `Medium-severity language detected: ${profanityResult.terms.join(', ')}`
          );
          score -= 15;
        } else {
          warnings.push(
            `Mild language detected: ${profanityResult.terms.join(', ')}`
          );
          score -= 5;
        }
      }
    }

    // Readability check
    let readabilityScore = 0;
    if (opts.checkReadability) {
      readabilityScore =
        this.qualityAnalyzer.calculateReadabilityScore(content);

      if (readabilityScore < 30) {
        warnings.push('Content may be difficult to read');
        score -= 10;
      } else if (readabilityScore > 90) {
        warnings.push('Content may be too simple');
        score -= 5;
      }
    }

    // Sentiment analysis
    let sentimentScore = 0.5;
    if (opts.checkSentiment) {
      sentimentScore = this.qualityAnalyzer.calculateSentimentScore(content);

      // Extreme sentiment might indicate bias
      if (sentimentScore < 0.1 || sentimentScore > 0.9) {
        warnings.push('Content has extreme sentiment bias');
        score -= 5;
      }
    }

    // Content structure validation
    if (!this.hasGoodStructure(content)) {
      warnings.push('Content lacks clear structure (paragraphs, headings)');
      score -= 10;
    }

    // Engagement validation
    if (!this.hasEngagementElements(content)) {
      warnings.push('Content lacks engagement elements (questions, callouts)');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      metadata: {
        wordCount,
        readabilityScore,
        sentimentScore,
        flaggedTerms,
      },
    };
  }

  private hasGoodStructure(content: string): boolean {
    // Check for paragraph breaks
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    // Should have multiple paragraphs for longer content
    if (content.length > 500 && paragraphs.length < 2) {
      return false;
    }

    // Check for varied sentence lengths
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    // Good structure has varied sentence lengths
    const lengthVariation =
      sentences.some(s => s.length < avgSentenceLength * 0.7) &&
      sentences.some(s => s.length > avgSentenceLength * 1.3);

    return lengthVariation;
  }

  private hasEngagementElements(content: string): boolean {
    // Check for questions
    const hasQuestions = /\?/.test(content);

    // Check for direct address to reader
    const hasDirectAddress = /(you|your|we|us|our)/i.test(content);

    // Check for emphasis (caps, exclamation)
    const hasEmphasis = /[A-Z]{2,}|!/.test(content);

    return hasQuestions || hasDirectAddress || hasEmphasis;
  }

  /**
   * Validate Reddit thread data before processing
   */
  validateRedditThread(threadData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required fields
    if (!threadData.title) {
      errors.push('Thread title is required');
      score -= 25;
    }

    if (!threadData.selftext && !threadData.url) {
      errors.push('Thread must have either text content or URL');
      score -= 25;
    }

    // Content quality checks
    if (threadData.selftext) {
      const textLength = threadData.selftext.length;
      if (textLength < 50) {
        warnings.push('Thread content is very short');
        score -= 10;
      }

      if (textLength > 10000) {
        warnings.push('Thread content is very long');
        score -= 5;
      }
    }

    // Engagement metrics
    if (threadData.score < 10) {
      warnings.push('Thread has low engagement score');
      score -= 10;
    }

    if (threadData.num_comments < 5) {
      warnings.push('Thread has few comments');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
      metadata: {
        wordCount: threadData.selftext
          ? threadData.selftext.split(/\s+/).length
          : 0,
        readabilityScore: 0,
        sentimentScore: 0.5,
        flaggedTerms: [],
      },
    };
  }
}

// Export singleton instance
export const contentValidator = new ContentValidator();
