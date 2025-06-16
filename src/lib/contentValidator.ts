/**
 * Content validation and safety checks for AI-generated content
 */

export interface ContentValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  score: number; // 0-100, higher is better
}

export interface ContentMetrics {
  wordCount: number;
  readabilityScore: number;
  sentimentScore: number;
  hasProblematicContent: boolean;
  qualityIndicators: {
    hasHeadline: boolean;
    hasStructure: boolean;
    hasConclusion: boolean;
    isEngaging: boolean;
  };
}

/**
 * Content safety and quality validator
 */
export class ContentValidator {
  private prohibitedPatterns = [
    // Personal information patterns
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
    
    // Harmful content patterns
    /\b(kill\s+yourself|kys)\b/i,
    /\b(suicide|self-harm)\s+(instructions|methods|how)\b/i,
    /\b(bomb|explosive)\s+(making|instructions|recipe)\b/i,
    
    // Spam patterns
    /\b(click\s+here|buy\s+now|limited\s+time)\b/i,
    /\b(free\s+money|get\s+rich\s+quick)\b/i,
  ];

  private toxicWords = [
    // Hate speech indicators (partial list for safety)
    'nazi', 'fascist', 'terrorist',
    // Extreme profanity (checking for excessive use)
  ];

  private qualityIndicators = {
    minWordCount: 200,
    maxWordCount: 3000,
    minParagraphs: 3,
    maxParagraphs: 20,
  };

  /**
   * Validate content for safety and quality
   */
  validate(content: string, title?: string): ContentValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Basic content checks
    if (!content || content.trim().length < 50) {
      issues.push('Content is too short or empty');
      score -= 50;
    }

    // Safety checks
    const safetyIssues = this.checkSafety(content);
    issues.push(...safetyIssues);
    score -= safetyIssues.length * 20;

    // Quality checks
    const qualityIssues = this.checkQuality(content, title);
    warnings.push(...qualityIssues.warnings);
    issues.push(...qualityIssues.issues);
    score -= qualityIssues.issues.length * 10;
    score -= qualityIssues.warnings.length * 5;

    // Structure checks
    const structureIssues = this.checkStructure(content);
    warnings.push(...structureIssues);
    score -= structureIssues.length * 5;

    // Readability checks
    const readabilityScore = this.calculateReadability(content);
    if (readabilityScore < 60) {
      warnings.push('Content may be difficult to read');
      score -= 10;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      isValid: issues.length === 0 && score >= 60,
      issues,
      warnings,
      score,
    };
  }

  /**
   * Check content for safety issues
   */
  private checkSafety(content: string): string[] {
    const issues: string[] = [];

    // Check for prohibited patterns
    for (const pattern of this.prohibitedPatterns) {
      if (pattern.test(content)) {
        issues.push('Content contains potentially harmful or private information');
        break;
      }
    }

    // Check for excessive toxic language
    const toxicCount = this.toxicWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (toxicCount > 3) {
      issues.push('Content contains excessive toxic language');
    }

    // Check for repetitive content (possible spam)
    const sentences = content.split(/[.!?]+/);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    if (sentences.length > 10 && uniqueSentences.size / sentences.length < 0.7) {
      issues.push('Content appears to be repetitive or spam-like');
    }

    return issues;
  }

  /**
   * Check content quality
   */
  private checkQuality(content: string, title?: string): { issues: string[]; warnings: string[] } {
    const issues: string[] = [];
    const warnings: string[] = [];

    const wordCount = this.getWordCount(content);
    
    // Word count checks
    if (wordCount < this.qualityIndicators.minWordCount) {
      issues.push(`Content is too short (${wordCount} words, minimum ${this.qualityIndicators.minWordCount})`);
    } else if (wordCount > this.qualityIndicators.maxWordCount) {
      warnings.push(`Content is quite long (${wordCount} words, recommended maximum ${this.qualityIndicators.maxWordCount})`);
    }

    // Paragraph count checks
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length < this.qualityIndicators.minParagraphs) {
      warnings.push('Content lacks proper paragraph structure');
    }

    // Title quality check
    if (title) {
      if (title.length < 20) {
        warnings.push('Title may be too short');
      } else if (title.length > 100) {
        warnings.push('Title may be too long');
      }

      // Check for clickbait patterns
      const clickbaitPatterns = [
        /you\s+won't\s+believe/i,
        /shocking/i,
        /this\s+one\s+trick/i,
        /doctors\s+hate/i,
      ];

      if (clickbaitPatterns.some(pattern => pattern.test(title))) {
        warnings.push('Title may be clickbait-y');
      }
    }

    return { issues, warnings };
  }

  /**
   * Check content structure
   */
  private checkStructure(content: string): string[] {
    const warnings: string[] = [];

    // Check for headings/sections
    const hasHeadings = /^#{1,6}\s+/m.test(content) || /<h[1-6]>/i.test(content);
    if (!hasHeadings && content.length > 500) {
      warnings.push('Long content lacks section headings');
    }

    // Check for lists or bullet points
    const hasLists = /^\s*[-*+]\s+/m.test(content) || /^\s*\d+\.\s+/m.test(content);
    if (!hasLists && content.length > 800) {
      warnings.push('Content could benefit from lists or bullet points');
    }

    // Check for conclusion
    const conclusionWords = ['conclusion', 'finally', 'in summary', 'takeaway', 'bottom line'];
    const hasConclusion = conclusionWords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (!hasConclusion && content.length > 600) {
      warnings.push('Content lacks a clear conclusion');
    }

    return warnings;
  }

  /**
   * Calculate readability score (simplified Flesch Reading Ease)
   */
  private calculateReadability(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);

    if (sentences === 0 || words === 0) return 0;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words: string[] = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    return words.reduce((total: number, word: string): number => {
      // Remove silent e
      word = word.replace(/e$/, '');
      
      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g) || [];
      
      // At least 1 syllable per word
      return total + Math.max(1, vowelGroups.length);
    }, 0);
  }

  /**
   * Get word count
   */
  private getWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get content metrics
   */
  getMetrics(content: string, title?: string): ContentMetrics {
    const wordCount = this.getWordCount(content);
    const readabilityScore = this.calculateReadability(content);
    
    // Simple sentiment analysis (positive/negative word counting)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting'];
    
    const positiveCount = positiveWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);
    
    const negativeCount = negativeWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);
    
    const sentimentScore = positiveCount - negativeCount;
    const hasProblematicContent = this.checkSafety(content).length > 0;

    return {
      wordCount,
      readabilityScore,
      sentimentScore,
      hasProblematicContent,
      qualityIndicators: {
        hasHeadline: !!title && title.length > 10,
        hasStructure: content.includes('\n\n') || /^#{1,6}\s+/m.test(content),
        hasConclusion: wordCount > 200 && (
          content.toLowerCase().includes('conclusion') ||
          content.toLowerCase().includes('takeaway') ||
          content.toLowerCase().includes('in summary')
        ),
        isEngaging: readabilityScore > 60 && wordCount >= 200 && wordCount <= 1500,
      },
    };
  }
}

// Export singleton instance
export const contentValidator = new ContentValidator();