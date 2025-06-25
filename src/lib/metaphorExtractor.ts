/**
 * Metaphor Extraction for Terry's Philosophical Commentary
 * Analyzes story content to generate Terry-style cultural insights
 */

export interface MetaphorInsight {
  metaphor: string;
  moral: string;
  terryVoice: string;
  confidence: number;
  triggers: string[];
}

export interface StoryMoral {
  theme: string;
  lesson: string;
  absurdity: string;
  culturalContext: string;
}

export class MetaphorExtractor {
  private commonMetaphors: string[];
  private terryPhrases: string[];
  private moralPatterns: { [key: string]: string[] };

  constructor() {
    this.commonMetaphors = [
      'like watching someone try to fold a fitted sheet while the house burns down',
      'like debating the proper way to sink on the Titanic',
      'like arguing about deck chair arrangements during an earthquake',
      "like critiquing someone's driving while the car is on fire",
      'like discussing interior design in a collapsing building',
      'like rating the band while the ship goes down',
      "like judging someone's table manners during food poisoning",
      'like complaining about the Wi-Fi during a zombie apocalypse',
      'like arguing about parking while being chased by bears',
      'like debating grammar during a hostage situation',
    ];

    this.terryPhrases = [
      'The Terry notes this is',
      "What we're witnessing here is",
      'This perfectly encapsulates',
      "The real story isn't about",
      'Beneath all this chaos lies',
      "Strip away the noise and you'll find",
      'This whole debacle reveals',
      'The beautiful absurdity here is',
      'What makes this fascinating is',
      'The deeper truth emerging is',
    ];

    this.moralPatterns = {
      class_warfare: [
        'just classism with better seasoning',
        'economic anxiety dressed up as taste preferences',
        'privilege disguised as sophistication',
        'social hierarchy with extra steps',
      ],
      gatekeeping: [
        'who gets to decide what constitutes acceptable happiness',
        'the arbitrary nature of cultural superiority',
        'the psychology of manufactured exclusivity',
        'how we use taste to create in-groups and out-groups',
      ],
      internet_psychology: [
        'how the internet turns every preference into a moral battlefield',
        'why we perform sophistication for strangers online',
        'the human need to be right about absolutely everything',
        'how social media weaponizes mundane disagreements',
      ],
      modern_absurdity: [
        'peak internet behavior',
        'the magnificent futility of online discourse',
        "how we've managed to make everything contentious",
        'the beautiful chaos of having opinions about everything',
      ],
      human_nature: [
        'our infinite capacity to miss the point spectacularly',
        'how we turn molehills into mountains for entertainment',
        'the psychology of manufactured outrage',
        'why humans will argue about literally anything',
      ],
    };
  }

  /**
   * Extract philosophical insight from story content
   */
  extractMetaphor(
    title: string,
    content: string,
    category: string,
    emotion: string
  ): MetaphorInsight {
    const moral = this.analyzeMoral(title, content, category);
    const metaphor = this.generateMetaphor(moral, emotion);
    const terryVoice = this.craftTerryCommentary(moral, metaphor);
    const confidence = this.calculateConfidence(content, moral);
    const triggers = this.identifyTriggers(content);

    return {
      metaphor,
      moral: moral.lesson,
      terryVoice,
      confidence,
      triggers,
    };
  }

  /**
   * Analyze the underlying moral/lesson of the story
   */
  private analyzeMoral(
    title: string,
    content: string,
    category: string
  ): StoryMoral {
    const combined = `${title} ${content}`.toLowerCase();

    // Detect themes based on content patterns
    let theme = 'human_nature'; // default
    let lesson = '';
    let absurdity = '';
    let culturalContext = '';

    // Food-related class warfare
    if (
      this.containsPatterns(combined, [
        'privilege',
        'access',
        'afford',
        'class',
        'bougie',
        'sophisticated',
        'proper',
        'authentic',
        'real',
        'wrong way',
        'right way',
      ])
    ) {
      theme = 'class_warfare';
      lesson =
        'Food preferences become proxies for social status and economic access';
      absurdity = 'Adults having passionate debates about condiment choices';
      culturalContext =
        'Late-stage capitalism where everything becomes a status symbol';
    }

    // Gatekeeping behavior
    else if (
      this.containsPatterns(combined, [
        'should',
        "shouldn't",
        'wrong',
        'right',
        'proper',
        'improper',
        'rules',
        'standards',
        'acceptable',
        'unacceptable',
        'taste',
      ])
    ) {
      theme = 'gatekeeping';
      lesson =
        'The arbitrary nature of cultural rules and who gets to enforce them';
      absurdity =
        'Strangers on the internet appointing themselves taste police';
      culturalContext =
        'Social media platforms as modern public squares for moral judgment';
    }

    // Internet psychology patterns
    else if (
      this.containsPatterns(combined, [
        'twitter',
        'viral',
        'trending',
        'ratio',
        'quote tweet',
        'replies',
        'internet',
        'online',
        'discourse',
        'social media',
      ])
    ) {
      theme = 'internet_psychology';
      lesson = 'How digital platforms amplify and distort human behavior';
      absurdity =
        'Turning every opinion into a battle for the soul of civilization';
      culturalContext =
        'The attention economy incentivizing performative outrage';
    }

    // Modern life absurdity
    else if (
      this.containsPatterns(combined, [
        'peak',
        'energy',
        'behavior',
        'absolutely',
        'perfectly',
        'exactly',
        'classic',
        'typical',
        'standard',
      ])
    ) {
      theme = 'modern_absurdity';
      lesson = 'The beautiful chaos of having strong opinions about everything';
      absurdity = 'Making mountains out of molehills for entertainment value';
      culturalContext =
        'Information age overwhelming us with things to have opinions about';
    }

    return { theme, lesson, absurdity, culturalContext };
  }

  /**
   * Generate appropriate metaphor based on moral and emotion
   */
  private generateMetaphor(moral: StoryMoral, emotion: string): string {
    // Select metaphor based on the absurdity level
    if (emotion === 'peak_chaos' || emotion === 'pure_entertainment') {
      return this.getRandomItem(this.commonMetaphors.slice(0, 5)); // More dramatic metaphors
    } else if (emotion === 'escalating_drama') {
      return this.getRandomItem(this.commonMetaphors.slice(3, 8)); // Mid-level metaphors
    } else {
      return this.getRandomItem(this.commonMetaphors.slice(5)); // Subtler metaphors
    }
  }

  /**
   * Craft Terry's commentary in his distinctive voice
   */
  private craftTerryCommentary(moral: StoryMoral, metaphor: string): string {
    const opener = this.getRandomItem(this.terryPhrases);
    const moralPattern =
      this.moralPatterns[moral.theme] || this.moralPatterns['human_nature'];
    const insight = this.getRandomItem(moralPattern);

    // Different commentary styles based on theme
    switch (moral.theme) {
      case 'class_warfare':
        return `${opener} ${moral.absurdity.toLowerCase()} is ${insight}. ${metaphor} - technically fascinating, ultimately pointless, but absolutely mesmerizing to witness.`;

      case 'gatekeeping':
        return `${opener} really about ${insight}. ${metaphor}, except the deck chairs are condiment preferences and the ocean is human dignity.`;

      case 'internet_psychology':
        return `${opener} ${insight}. ${metaphor}, except we're all voluntarily participating and somehow surprised by the outcome.`;

      case 'modern_absurdity':
        return `${opener} ${insight}. ${metaphor}, and we're all here for it because apparently this is what entertainment looks like now.`;

      default:
        return `${opener} ${insight}. ${metaphor}, which perfectly captures the human condition in the digital age.`;
    }
  }

  /**
   * Calculate confidence in the metaphor extraction
   */
  private calculateConfidence(content: string, moral: StoryMoral): number {
    const contentLength = content.length;
    const themeKeywords = this.getThemeKeywords(moral.theme);

    const keywordMatches = themeKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);

    // Base confidence on content length and keyword matches
    const lengthFactor = Math.min(contentLength / 2000, 1); // Longer content = more confidence
    const keywordFactor = Math.min(keywordMatches / 5, 1); // More matches = more confidence

    return (lengthFactor + keywordFactor) / 2;
  }

  /**
   * Identify content triggers for metaphor generation
   */
  private identifyTriggers(content: string): string[] {
    const triggers: string[] = [];
    const lowerContent = content.toLowerCase();

    const triggerPatterns = {
      class_indicators: [
        'privilege',
        'access',
        'afford',
        'bougie',
        'sophisticated',
      ],
      judgment_language: [
        'should',
        'wrong',
        'proper',
        'acceptable',
        'standards',
      ],
      emotional_escalation: [
        'outrage',
        'angry',
        'furious',
        'chaos',
        'meltdown',
      ],
      internet_culture: ['viral', 'trending', 'ratio', 'discourse', 'twitter'],
      food_culture: ['authentic', 'traditional', 'proper way', 'right way'],
    };

    Object.entries(triggerPatterns).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        triggers.push(category);
      }
    });

    return triggers;
  }

  /**
   * Helper methods
   */
  private containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getThemeKeywords(theme: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      class_warfare: ['privilege', 'access', 'afford', 'bougie', 'class'],
      gatekeeping: ['should', 'proper', 'wrong', 'standards', 'acceptable'],
      internet_psychology: [
        'twitter',
        'viral',
        'online',
        'discourse',
        'social',
      ],
      modern_absurdity: ['peak', 'absolutely', 'perfectly', 'classic'],
      human_nature: ['behavior', 'psychology', 'people', 'human', 'society'],
    };

    return keywordMap[theme] || keywordMap['human_nature'];
  }
}

// Export singleton instance
export const metaphorExtractor = new MetaphorExtractor();
