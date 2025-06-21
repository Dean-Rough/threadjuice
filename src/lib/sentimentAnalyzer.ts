/**
 * Sentiment Analysis for Story Sections
 * Maps emotional content to appropriate GIF reactions
 */

import Sentiment from 'sentiment';
// @ts-ignore
import nlp from 'compromise';

export interface EmotionalAnalysis {
  emotion: EmotionType;
  intensity: number; // 0-1 scale
  giffSearchTerms: string[];
  context: string;
  confidence: number;
}

export type EmotionType = 
  | 'opening_tension'
  | 'escalating_drama' 
  | 'peak_chaos'
  | 'shocked_realization'
  | 'satisfied_resolution'
  | 'awkward_silence'
  | 'collective_cringe'
  | 'here_for_it'
  | 'mild_concern'
  | 'pure_entertainment';

export interface StoryContext {
  category: string;
  sectionType: string;
  sectionIndex: number;
  totalSections: number;
  contentQuality: 'premium' | 'standard' | 'basic';
}

export class SentimentAnalyzer {
  private sentiment: any;
  private emotionKeywords: { [key in EmotionType]: string[] };
  private giffMappings: { [key in EmotionType]: string[] };

  constructor() {
    this.sentiment = new Sentiment();
    
    // Emotional keyword patterns
    this.emotionKeywords = {
      opening_tension: [
        'started', 'began', 'innocent', 'simple', 'thought', 'decided',
        'posted', 'tweeted', 'asked', 'poll', 'question'
      ],
      escalating_drama: [
        'replies', 'quote tweets', 'heated', 'descended', 'battlefield',
        'vultures', 'argue', 'debate', 'angry', 'furious', 'rage'
      ],
      peak_chaos: [
        'meltdown', 'chaos', 'exploded', 'viral', 'trending', 'disaster',
        'complete', 'total', 'absolute', 'nuclear', 'peak', 'maximum'
      ],
      shocked_realization: [
        'turns out', 'realized', 'actually', 'plot twist', 'discovered',
        'revelation', 'suddenly', 'meanwhile', 'however', 'but then'
      ],
      satisfied_resolution: [
        'finally', 'eventually', 'concluded', 'ended', 'aftermath',
        'settled', 'dust', 'moral', 'lesson', 'learned'
      ],
      awkward_silence: [
        'silence', 'quiet', 'nobody', 'crickets', 'uncomfortable',
        'awkward', 'pause', 'moment', 'beat', 'wait'
      ],
      collective_cringe: [
        'cringe', 'secondhand', 'embarrassing', 'painful', 'yikes',
        'oof', 'imagine', 'watching', 'witnessing'
      ],
      here_for_it: [
        'popcorn', 'tea', 'drama', 'entertainment', 'here for',
        'living for', 'obsessed', 'fascinating', 'mesmerizing'
      ],
      mild_concern: [
        'concerning', 'worried', 'troubling', 'problematic', 'red flag',
        'alarm', 'warning', 'careful', 'caution'
      ],
      pure_entertainment: [
        'hilarious', 'brilliant', 'perfect', 'amazing', 'incredible',
        'spectacular', 'beautiful', 'chef kiss', 'magnificent'
      ]
    };

    // GIF search term mappings
    this.giffMappings = {
      opening_tension: [
        'here we go again',
        'brace yourself',
        'oh boy here we go',
        'this should be good',
        'buckle up'
      ],
      escalating_drama: [
        'popcorn eating',
        'drama intensifies',
        'things heating up',
        'oh snap',
        'tea spilling'
      ],
      peak_chaos: [
        'this is fine fire',
        'chaos everywhere',
        'what just happened',
        'absolute madness',
        'world burning'
      ],
      shocked_realization: [
        'plot twist',
        'mind blown',
        'wait what',
        'hold up',
        'record scratch'
      ],
      satisfied_resolution: [
        'mic drop',
        'well that happened',
        'and scene',
        'case closed',
        'dust settling'
      ],
      awkward_silence: [
        'awkward silence',
        'cricket sounds',
        'uncomfortable',
        'yikes',
        'that was awkward'
      ],
      collective_cringe: [
        'secondhand embarrassment',
        'cringe watching',
        'painful to watch',
        'hiding behind hands',
        'oh no'
      ],
      here_for_it: [
        'living for this drama',
        'here for it',
        'absolutely fascinated',
        'can\'t look away',
        'obsessed with this'
      ],
      mild_concern: [
        'side eye',
        'raised eyebrow',
        'concerning behavior',
        'red flag alert',
        'worry face'
      ],
      pure_entertainment: [
        'chef kiss perfection',
        'absolutely brilliant',
        'pure comedy gold',
        'masterpiece',
        'standing ovation'
      ]
    };
  }

  /**
   * Analyze emotional content of a story section
   */
  analyzeSection(content: string, context: StoryContext): EmotionalAnalysis {
    const cleanContent = this.preprocessContent(content);
    const sentimentScore = this.sentiment.analyze(cleanContent);
    
    // Determine emotion based on keywords, sentiment, and story position
    const emotion = this.determineEmotion(cleanContent, sentimentScore, context);
    const intensity = this.calculateIntensity(sentimentScore, emotion, context);
    const giffSearchTerms = this.getGifSearchTerms(emotion, context);
    const emotionContext = this.generateContext(emotion, context);
    const confidence = this.calculateConfidence(cleanContent, emotion, sentimentScore);

    return {
      emotion,
      intensity,
      giffSearchTerms,
      context: emotionContext,
      confidence
    };
  }

  /**
   * Clean and prepare content for analysis
   */
  private preprocessContent(content: string): string {
    // Remove quotes and attribution metadata
    const cleaned = content
      .replace(/—\s*@\w+/g, '') // Remove Twitter attributions
      .replace(/"\s*$/g, '') // Remove trailing quotes
      .replace(/^\s*"/g, '') // Remove leading quotes
      .toLowerCase();
    
    return cleaned;
  }

  /**
   * Determine primary emotion based on content analysis
   */
  private determineEmotion(
    content: string, 
    sentimentScore: any, 
    context: StoryContext
  ): EmotionType {
    const { sectionIndex, totalSections, sectionType } = context;
    
    // Story position influences emotion
    const storyPosition = sectionIndex / (totalSections - 1);
    
    // Check for explicit emotional keywords
    const emotionScores: { [key in EmotionType]: number } = {} as any;
    
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        return count + (content.match(regex) || []).length;
      }, 0);
      
      emotionScores[emotion as EmotionType] = matchCount;
    });

    // Position-based emotion weighting
    if (storyPosition < 0.2) {
      emotionScores.opening_tension *= 3;
    } else if (storyPosition < 0.4) {
      emotionScores.escalating_drama *= 2;
    } else if (storyPosition < 0.7) {
      emotionScores.peak_chaos *= 2;
      emotionScores.shocked_realization *= 2;
    } else {
      emotionScores.satisfied_resolution *= 2;
      emotionScores.pure_entertainment *= 1.5;
    }

    // Section type adjustments
    if (sectionType === 'quotes') {
      emotionScores.here_for_it *= 2;
      emotionScores.collective_cringe *= 1.5;
    } else if (sectionType === 'comments-1' || sectionType === 'comments-2') {
      emotionScores.escalating_drama *= 1.5;
      emotionScores.peak_chaos *= 1.5;
    } else if (sectionType === 'outro') {
      emotionScores.satisfied_resolution *= 2;
      emotionScores.pure_entertainment *= 1.5;
    }

    // Sentiment score adjustments
    if (sentimentScore.score > 3) {
      emotionScores.pure_entertainment *= 1.5;
      emotionScores.here_for_it *= 1.3;
    } else if (sentimentScore.score < -3) {
      emotionScores.peak_chaos *= 1.5;
      emotionScores.collective_cringe *= 1.3;
    }

    // Find highest scoring emotion
    const topEmotion = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)[0][0] as EmotionType;

    // Fallback based on story position if no clear emotion
    if (emotionScores[topEmotion] === 0) {
      if (storyPosition < 0.3) return 'opening_tension';
      if (storyPosition < 0.6) return 'escalating_drama';
      if (storyPosition < 0.8) return 'peak_chaos';
      return 'satisfied_resolution';
    }

    return topEmotion;
  }

  /**
   * Calculate emotional intensity
   */
  private calculateIntensity(
    sentimentScore: any, 
    emotion: EmotionType, 
    context: StoryContext
  ): number {
    let baseIntensity = Math.min(Math.abs(sentimentScore.score) / 10, 1);
    
    // High-intensity emotions
    const highIntensityEmotions: EmotionType[] = [
      'peak_chaos', 'shocked_realization', 'pure_entertainment'
    ];
    
    if (highIntensityEmotions.includes(emotion)) {
      baseIntensity = Math.max(baseIntensity, 0.7);
    }

    // Premium content gets higher intensity
    if (context.contentQuality === 'premium') {
      baseIntensity *= 1.2;
    }

    return Math.min(baseIntensity, 1);
  }

  /**
   * Get appropriate GIF search terms for emotion
   */
  private getGifSearchTerms(emotion: EmotionType, context: StoryContext): string[] {
    const baseTerms = this.giffMappings[emotion];
    
    // Add context-specific terms for food drama
    if (context.category === 'Food Wars') {
      const foodSpecific = {
        opening_tension: ['innocent food question'],
        escalating_drama: ['food fight', 'kitchen drama'],
        peak_chaos: ['cooking disaster', 'chef meltdown'],
        pure_entertainment: ['chef kiss', 'delicious drama']
      };
      
      if (foodSpecific[emotion as keyof typeof foodSpecific]) {
        return [...baseTerms, ...foodSpecific[emotion as keyof typeof foodSpecific]];
      }
    }

    return baseTerms;
  }

  /**
   * Generate contextual description for the emotion
   */
  private generateContext(emotion: EmotionType, context: StoryContext): string {
    const contextMap: { [key in EmotionType]: string } = {
      opening_tension: "Everyone sensing something's about to go down:",
      escalating_drama: "Viewers watching this unfold:",
      peak_chaos: "The internet right now:",
      shocked_realization: "Everyone when the plot twist hits:",
      satisfied_resolution: "Readers after that conclusion:",
      awkward_silence: "The collective reaction:",
      collective_cringe: "All of us watching this:",
      here_for_it: "The audience absolutely living for this:",
      mild_concern: "Everyone's internal reaction:",
      pure_entertainment: "The unanimous response:"
    };

    return contextMap[emotion];
  }

  /**
   * Calculate confidence in emotion detection
   */
  private calculateConfidence(
    content: string, 
    emotion: EmotionType, 
    sentimentScore: any
  ): number {
    const keywordMatches = this.emotionKeywords[emotion].reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);

    const keywordConfidence = Math.min(keywordMatches / 3, 1);
    const sentimentConfidence = Math.min(Math.abs(sentimentScore.score) / 5, 1);
    
    return (keywordConfidence + sentimentConfidence) / 2;
  }
}

// Export singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();