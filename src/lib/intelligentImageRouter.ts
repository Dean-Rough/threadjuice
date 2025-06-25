import { z } from 'zod';

// Known entities that should use Wikipedia/Wikimedia
const KNOWN_ENTITIES = {
  celebrities: [
    'kardashian',
    'jenner',
    'swift',
    'beyonce',
    'kanye',
    'kim kardashian',
    'judge judy',
    'oprah',
    'elon musk',
    'bezos',
    'gates',
  ],
  places: [
    'bermuda',
    'switzerland',
    'paris',
    'london',
    'new york',
    'california',
    'tokyo',
    'rome',
    'berlin',
    'amsterdam',
    'barcelona',
  ],
  brands: [
    'google',
    'apple',
    'microsoft',
    'tesla',
    'netflix',
    'amazon',
    'facebook',
    'instagram',
    'tiktok',
    'uber',
    'airbnb',
  ],
  landmarks: [
    'eiffel tower',
    'statue of liberty',
    'big ben',
    'golden gate bridge',
    'mount everest',
    'grand canyon',
    'niagara falls',
  ],
};

interface ContentAnalysis {
  hasKnownEntities: boolean;
  entities: string[];
  visualConcepts: string[];
  setting: string;
  mood: string;
  shouldUseWikipedia: boolean;
}

export class IntelligentImageRouter {
  /**
   * Analyze content to determine image routing strategy
   */
  analyzeContent(
    title: string,
    content: string,
    category: string
  ): ContentAnalysis {
    const fullText = `${title} ${content}`.toLowerCase();

    // Check for known entities
    const foundEntities: string[] = [];

    for (const [type, entities] of Object.entries(KNOWN_ENTITIES)) {
      for (const entity of entities) {
        if (fullText.includes(entity.toLowerCase())) {
          foundEntities.push(entity);
        }
      }
    }

    // Extract visual concepts and setting
    const visualConcepts = this.extractVisualConcepts(title, content, category);
    const setting = this.determineSetting(fullText, category);
    const mood = this.determineMood(fullText, category);

    return {
      hasKnownEntities: foundEntities.length > 0,
      entities: foundEntities,
      visualConcepts,
      setting,
      mood,
      shouldUseWikipedia: foundEntities.length > 0,
    };
  }

  /**
   * Extract specific visual concepts from story content
   */
  private extractVisualConcepts(
    title: string,
    content: string,
    category: string
  ): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const concepts: string[] = [];

    // Common objects and settings mentioned in stories
    const visualKeywords = {
      // Legal/courtroom
      legal: [
        'courtroom',
        'judge',
        'jury',
        'lawyer',
        'gavel',
        'courthouse',
        'legal documents',
      ],

      // Technology
      technology: [
        'computer',
        'phone',
        'app',
        'screen',
        'office',
        'startup',
        'coding',
        'meeting room',
      ],

      // Travel
      travel: [
        'car',
        'road',
        'map',
        'airport',
        'hotel',
        'mountain',
        'parking lot',
        'gps',
        'luggage',
      ],

      // Politics
      politics: [
        'office',
        'meeting',
        'debate',
        'podium',
        'government building',
        'press conference',
      ],

      // Relationships/AITA
      relationships: [
        'home',
        'apartment',
        'kitchen',
        'bedroom',
        'restaurant',
        'couple',
        'family',
      ],

      // Work stories
      'work-stories': [
        'office',
        'desk',
        'meeting room',
        'computer',
        'conference table',
        'workplace',
      ],

      // Food/restaurants
      food: [
        'restaurant',
        'pizza',
        'kitchen',
        'delivery',
        'food',
        'chef',
        'dining',
      ],
    };

    // Get category-specific keywords
    const categoryKeywords =
      visualKeywords[category as keyof typeof visualKeywords] || [];

    // Check for matches
    for (const keyword of categoryKeywords) {
      if (text.includes(keyword)) {
        concepts.push(keyword);
      }
    }

    // Extract specific nouns and objects
    const objectRegex =
      /(?:a|an|the)\s+([a-z]+(?:\s+[a-z]+)*?)(?:\s+(?:was|is|were|are|in|on|at|with))/g;
    let match;
    while ((match = objectRegex.exec(text)) !== null) {
      const object = match[1].trim();
      if (
        object.length > 2 &&
        !['way', 'time', 'case', 'thing', 'person'].includes(object)
      ) {
        concepts.push(object);
      }
    }

    return Array.from(new Set(concepts)).slice(0, 5); // Remove duplicates, limit to top 5
  }

  /**
   * Determine the setting/environment of the story
   */
  private determineSetting(text: string, category: string): string {
    const settingKeywords = {
      office: ['office', 'workplace', 'desk', 'meeting', 'conference'],
      courtroom: ['court', 'judge', 'jury', 'legal', 'lawsuit'],
      home: ['apartment', 'house', 'kitchen', 'bedroom', 'roommate'],
      restaurant: ['restaurant', 'pizza', 'delivery', 'food', 'dining'],
      outdoor: ['road', 'parking', 'mountain', 'travel', 'car'],
      technology: ['app', 'startup', 'tech', 'computer', 'digital'],
    };

    for (const [setting, keywords] of Object.entries(settingKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return setting;
      }
    }

    // Fallback based on category
    const categoryToSetting = {
      legal: 'courtroom',
      'work-stories': 'office',
      technology: 'technology',
      travel: 'outdoor',
      relationships: 'home',
      politics: 'office',
    };

    return (
      categoryToSetting[category as keyof typeof categoryToSetting] || 'general'
    );
  }

  /**
   * Determine the mood/tone for image selection
   */
  private determineMood(text: string, category: string): string {
    const moodKeywords = {
      dramatic: [
        'chaos',
        'disaster',
        'crisis',
        'drama',
        'explosive',
        'tension',
      ],
      professional: ['business', 'meeting', 'office', 'corporate', 'formal'],
      casual: ['everyday', 'normal', 'regular', 'simple', 'basic'],
      confrontational: ['argument', 'fight', 'conflict', 'vs', 'against'],
      triumphant: ['victory', 'win', 'success', 'justice', 'celebration'],
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return mood;
      }
    }

    return 'general';
  }

  /**
   * Generate smart search keywords for stock images
   */
  generateStockImagePrompt(
    title: string,
    content: string,
    category: string
  ): string {
    const analysis = this.analyzeContent(title, content, category);

    // If it has known entities, let Wikipedia handle it
    if (analysis.shouldUseWikipedia) {
      return ''; // Will use Wikipedia/Wikimedia route
    }

    // Build a contextual prompt for stock images
    const components = [];

    // Add setting
    if (analysis.setting !== 'general') {
      components.push(analysis.setting);
    }

    // Add mood
    if (analysis.mood !== 'general') {
      components.push(analysis.mood);
    }

    // Add top visual concepts
    if (analysis.visualConcepts.length > 0) {
      components.push(...analysis.visualConcepts.slice(0, 2));
    }

    // Add category context
    const categoryModifiers = {
      legal: 'professional legal business',
      technology: 'modern tech business',
      travel: 'journey adventure',
      politics: 'government official',
      relationships: 'people conversation',
      'work-stories': 'office professional',
    };

    if (categoryModifiers[category as keyof typeof categoryModifiers]) {
      components.push(
        categoryModifiers[category as keyof typeof categoryModifiers]
      );
    }

    return components.join(' ');
  }

  /**
   * Generate keywords for story condensation prompt
   */
  generateStoryCondensationPrompt(title: string, content: string): string {
    // Extract the core story for image generation
    const storyExcerpt = content.substring(0, 500); // First 500 chars for context

    return `
    Based on this story: "${title}"
    
    Content preview: "${storyExcerpt}..."
    
    Generate 3-5 specific, visual search terms that would find a relevant stock photo. Focus on:
    - Concrete objects, settings, or people mentioned
    - The main visual environment (office, courtroom, home, etc.)
    - Key props or elements that define the scene
    - Professional or emotional tone
    
    Avoid abstract concepts. Return only search terms separated by commas.
    
    Example: "business meeting, conference room, professional people, discussion"
    `;
  }
}

export const intelligentImageRouter = new IntelligentImageRouter();
