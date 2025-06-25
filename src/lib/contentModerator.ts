/**
 * ThreadJuice Content Moderator
 * Filters political, religious, and racial content to maintain light-hearted platform tone
 */

interface ModerationResult {
  isAllowed: boolean;
  blockedCategories: string[];
  score: number;
  flaggedTerms: string[];
}

interface ModerationConfig {
  strictMode: boolean;
  customBlocklist: string[];
  allowedExceptions: string[];
}

export class ContentModerator {
  private politicalTerms = [
    // Political parties & movements
    'republican', 'democrat', 'conservative', 'liberal', 'progressive', 'libertarian',
    'socialism', 'capitalism', 'communist', 'fascist', 'marxist', 'antifa',
    'maga', 'blm', 'alt-right', 'alt-left', 'gop',
    
    // Politicians (current & recent)
    'trump', 'biden', 'harris', 'obama', 'clinton', 'bush', 'reagan',
    'pelosi', 'mcconnell', 'aoc', 'sanders', 'warren', 'desantis',
    'pence', 'cheney', 'cruz', 'rubio', 'schumer', 'manchin',
    
    // Political concepts
    'election', 'voting', 'ballot', 'congress', 'senate', 'house of representatives',
    'impeachment', 'filibuster', 'gerrymandering', 'voter fraud', 'rigged election',
    'deep state', 'swamp', 'establishment', 'coup', 'insurrection',
    
    // Policy areas
    'immigration', 'border wall', 'deportation', 'sanctuary city',
    'gun control', 'second amendment', 'nra', 'assault weapon',
    'abortion', 'roe v wade', 'pro-life', 'pro-choice',
    'climate change', 'green new deal', 'fossil fuels',
    'healthcare', 'obamacare', 'medicare for all',
    'taxes', 'tax cuts', 'wealthy tax', 'minimum wage'
  ];

  private religiousTerms = [
    // Major religions
    'christian', 'christianity', 'catholic', 'protestant', 'evangelical',
    'muslim', 'islam', 'islamic', 'jewish', 'judaism', 'hindu', 'hinduism',
    'buddhist', 'buddhism', 'sikh', 'mormon', 'scientology',
    
    // Religious figures
    'jesus', 'christ', 'mohammed', 'muhammad', 'allah', 'buddha', 'pope',
    'pastor', 'priest', 'imam', 'rabbi', 'guru', 'prophet',
    
    // Religious concepts
    'bible', 'quran', 'torah', 'scripture', 'prayer', 'worship',
    'salvation', 'heaven', 'hell', 'sin', 'blessed', 'holy',
    'church', 'mosque', 'temple', 'synagogue', 'cathedral',
    'crusade', 'jihad', 'pilgrimage', 'missionary', 'evangelist',
    
    // Religious holidays/events
    'christmas', 'easter', 'ramadan', 'hanukkah', 'diwali', 'passover'
  ];

  private racialTerms = [
    // Racial identifiers
    'race', 'racial', 'racism', 'racist', 'white supremacy', 'black lives matter',
    'ethnic', 'ethnicity', 'minority', 'majority', 'discrimination',
    
    // Controversial terms
    'white privilege', 'systemic racism', 'institutional racism',
    'racial profiling', 'hate crime', 'civil rights',
    'segregation', 'integration', 'apartheid',
    
    // Slurs & offensive terms (detection only - never display)
    // Note: This list should be comprehensive but is truncated for brevity
    'n-word', 'racial slur', 'ethnic slur'
  ];

  private violentTerms = [
    'murder', 'kill', 'death', 'violence', 'assault', 'abuse',
    'terrorist', 'terrorism', 'bomb', 'shooting', 'war', 'genocide'
  ];

  private config: ModerationConfig;

  constructor(config: Partial<ModerationConfig> = {}) {
    this.config = {
      strictMode: true,
      customBlocklist: [],
      allowedExceptions: [],
      ...config
    };
  }

  /**
   * Main moderation function - checks content against all filters
   */
  moderateContent(content: string): ModerationResult {
    const normalizedContent = content.toLowerCase();
    const flaggedTerms: string[] = [];
    const blockedCategories: string[] = [];
    let score = 0;

    // Check political content
    const politicalFlags = this.checkTerms(normalizedContent, this.politicalTerms);
    if (politicalFlags.length > 0) {
      blockedCategories.push('political');
      flaggedTerms.push(...politicalFlags);
      score += politicalFlags.length * 10;
    }

    // Check religious content
    const religiousFlags = this.checkTerms(normalizedContent, this.religiousTerms);
    if (religiousFlags.length > 0) {
      blockedCategories.push('religious');
      flaggedTerms.push(...religiousFlags);
      score += religiousFlags.length * 10;
    }

    // Check racial content
    const racialFlags = this.checkTerms(normalizedContent, this.racialTerms);
    if (racialFlags.length > 0) {
      blockedCategories.push('racial');
      flaggedTerms.push(...racialFlags);
      score += racialFlags.length * 15; // Higher weight for racial content
    }

    // Check violent content
    const violentFlags = this.checkTerms(normalizedContent, this.violentTerms);
    if (violentFlags.length > 0) {
      blockedCategories.push('violent');
      flaggedTerms.push(...violentFlags);
      score += violentFlags.length * 12;
    }

    // Check custom blocklist
    const customFlags = this.checkTerms(normalizedContent, this.config.customBlocklist);
    if (customFlags.length > 0) {
      blockedCategories.push('custom');
      flaggedTerms.push(...customFlags);
      score += customFlags.length * 8;
    }

    // Check exceptions
    const hasException = this.config.allowedExceptions.some(exception => 
      normalizedContent.includes(exception.toLowerCase())
    );

    const isAllowed = this.config.strictMode 
      ? blockedCategories.length === 0 || hasException
      : score < 20 || hasException;

    return {
      isAllowed,
      blockedCategories,
      score,
      flaggedTerms: [...new Set(flaggedTerms)] // Remove duplicates
    };
  }

  /**
   * Quick check for obviously problematic content
   */
  isContentSafe(content: string): boolean {
    return this.moderateContent(content).isAllowed;
  }

  /**
   * Get detailed moderation report
   */
  getModerationReport(content: string): string {
    const result = this.moderateContent(content);
    
    if (result.isAllowed) {
      return '✅ Content approved for ThreadJuice';
    }

    return `❌ Content blocked for ThreadJuice:
Categories: ${result.blockedCategories.join(', ')}
Risk Score: ${result.score}
Flagged Terms: ${result.flaggedTerms.length}
Reason: ThreadJuice maintains a light-hearted, non-political atmosphere`;
  }

  /**
   * Check for specific terms in content
   */
  private checkTerms(content: string, terms: string[]): string[] {
    const found: string[] = [];
    
    for (const term of terms) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(content)) {
        found.push(term);
      }
    }
    
    return found;
  }

  /**
   * Add custom terms to blocklist
   */
  addToBlocklist(terms: string[]): void {
    this.config.customBlocklist.push(...terms);
  }

  /**
   * Add exceptions for borderline content
   */
  addExceptions(terms: string[]): void {
    this.config.allowedExceptions.push(...terms);
  }

  /**
   * Update moderation config
   */
  updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default instance for easy importing
export const contentModerator = new ContentModerator();

// Utility function for quick checks
export const isContentSafe = (content: string): boolean => {
  return contentModerator.isContentSafe(content);
};

// Export types
export type { ModerationResult, ModerationConfig };