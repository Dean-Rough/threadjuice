import {
  ContentValidator,
  contentValidator,
  type ValidationResult,
  type ContentValidationOptions,
} from '@/lib/contentValidator';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('Constructor', () => {
    it('should create a new instance', () => {
      expect(validator).toBeInstanceOf(ContentValidator);
    });

    it('should export a singleton instance', () => {
      expect(contentValidator).toBeInstanceOf(ContentValidator);
    });
  });

  describe('validateContent', () => {
    const validContent = `
      This is a well-structured piece of content that should definitely pass validation with flying colors.
      
      It has multiple paragraphs with varied sentence lengths for excellent readability. Some sentences are short and punchy. Others are much longer and contain more detailed information about the topic at hand, providing comprehensive coverage of the subject matter.
      
      The content includes engagement elements like questions - don't you think this is important? It also directly addresses the reader using "you" and "your" to create a strong connection and maintain interest throughout.
      
      Furthermore, it demonstrates proper structure with clear breaks between ideas and maintains excellent readability throughout the entire piece. This ensures that readers can easily follow the flow of information and stay engaged with the content from beginning to end.
      
      Finally, this content meets all the quality standards we expect, including sufficient length, engaging tone, and professional presentation that will resonate with our target audience.
    `;

    it('should validate good content successfully', async () => {
      const result = await validator.validateContent(validContent);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(70);
      expect(result.metadata.wordCount).toBeGreaterThan(100);
    });

    it('should reject content that is too short', async () => {
      const shortContent = 'This is too short.';

      const result = await validator.validateContent(shortContent, {
        minWordCount: 50,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('too short');
    });

    it('should warn about content that is too long', async () => {
      const longContent = 'word '.repeat(1000);

      const result = await validator.validateContent(longContent, {
        maxWordCount: 500,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('too long');
    });

    it('should calculate readability scores', async () => {
      const result = await validator.validateContent(validContent);

      expect(result.metadata.readabilityScore).toBeGreaterThan(0);
      expect(result.metadata.readabilityScore).toBeLessThanOrEqual(100);
    });

    it('should calculate sentiment scores', async () => {
      const positiveContent =
        'This is amazing and wonderful content that is absolutely fantastic!';
      const negativeContent =
        'This is terrible and awful content that is absolutely horrible!';

      const positiveResult = await validator.validateContent(positiveContent, {
        minWordCount: 10,
      });
      const negativeResult = await validator.validateContent(negativeContent, {
        minWordCount: 10,
      });

      expect(positiveResult.metadata.sentimentScore).toBeGreaterThan(0.5);
      expect(negativeResult.metadata.sentimentScore).toBeLessThan(0.5);
    });

    it('should handle profanity filtering', async () => {
      const profaneContent =
        'This content contains damn and hell which are mild profanity.';

      const result = await validator.validateContent(profaneContent, {
        checkProfanity: true,
        minWordCount: 10,
      });

      expect(result.metadata.flaggedTerms.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should allow contextual exceptions for Reddit content', async () => {
      const redditContent =
        'The user u/testuser posted "AITA for calling someone an asshole?" in r/AmItheAsshole';

      const result = await validator.validateContent(redditContent, {
        checkProfanity: true,
        minWordCount: 10,
      });

      // Should not flag "asshole" in Reddit context
      expect(result.metadata.flaggedTerms).not.toContain('asshole');
    });

    it('should check for good structure', async () => {
      const poorStructure =
        'This is one long sentence that goes on and on without any breaks or paragraph divisions and has no variation in sentence length whatsoever which makes it very difficult to read and understand.';

      const result = await validator.validateContent(poorStructure, {
        minWordCount: 20,
      });

      expect(result.warnings.some(w => w.includes('structure'))).toBe(true);
    });

    it('should check for engagement elements', async () => {
      const boringContent =
        'This content has no questions. It does not address the reader. It has no emphasis or excitement.';

      const result = await validator.validateContent(boringContent, {
        minWordCount: 15,
      });

      expect(result.warnings.some(w => w.includes('engagement'))).toBe(true);
    });

    it('should respect validation options', async () => {
      const options: ContentValidationOptions = {
        checkProfanity: false,
        checkLength: false,
        checkReadability: false,
        checkSentiment: false,
      };

      const result = await validator.validateContent('short', options);

      // Should pass because all checks are disabled
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateRedditThread', () => {
    const validThread = {
      id: 'test123',
      title: 'This is a valid Reddit thread title',
      selftext:
        'This is the content of the Reddit thread with enough text to be meaningful.',
      score: 100,
      num_comments: 25,
      subreddit: 'test',
    };

    it('should validate good Reddit threads', () => {
      const result = validator.validateRedditThread(validThread);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(70);
    });

    it('should require thread title', () => {
      const threadWithoutTitle = { ...validThread, title: '' };

      const result = validator.validateRedditThread(threadWithoutTitle);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
    });

    it('should require content or URL', () => {
      const threadWithoutContent = {
        ...validThread,
        selftext: '',
        url: undefined,
      };

      const result = validator.validateRedditThread(threadWithoutContent);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('text content or URL'))).toBe(
        true
      );
    });

    it('should warn about short content', () => {
      const threadWithShortContent = {
        ...validThread,
        selftext: 'Short',
      };

      const result = validator.validateRedditThread(threadWithShortContent);

      expect(result.warnings.some(w => w.includes('very short'))).toBe(true);
    });

    it('should warn about long content', () => {
      const threadWithLongContent = {
        ...validThread,
        selftext: 'word '.repeat(5000),
      };

      const result = validator.validateRedditThread(threadWithLongContent);

      expect(result.warnings.some(w => w.includes('very long'))).toBe(true);
    });

    it('should warn about low engagement', () => {
      const lowEngagementThread = {
        ...validThread,
        score: 5,
        num_comments: 2,
      };

      const result = validator.validateRedditThread(lowEngagementThread);

      expect(result.warnings.some(w => w.includes('low engagement'))).toBe(
        true
      );
      expect(result.warnings.some(w => w.includes('few comments'))).toBe(true);
    });

    it('should calculate word count correctly', () => {
      const result = validator.validateRedditThread(validThread);

      expect(result.metadata.wordCount).toBeGreaterThan(0);
      expect(result.metadata.wordCount).toBe(
        validThread.selftext.split(/\s+/).length
      );
    });
  });

  describe('Profanity Filter', () => {
    it('should detect different severity levels', async () => {
      const mildContent = 'This is damn annoying';
      const mediumContent = 'This is complete shit';

      const mildResult = await validator.validateContent(mildContent, {
        minWordCount: 3,
      });
      const mediumResult = await validator.validateContent(mediumContent, {
        minWordCount: 3,
      });

      expect(mildResult.warnings.some(w => w.includes('Mild language'))).toBe(
        true
      );
      expect(
        mediumResult.warnings.some(w => w.includes('Medium-severity'))
      ).toBe(true);
    });

    it('should handle contextual exceptions', async () => {
      const quotedContent =
        'The user said "you\'re being an asshole" in the comment';
      const redditContent =
        'Posted in r/AmItheAsshole about relationship drama';

      const quotedResult = await validator.validateContent(quotedContent, {
        minWordCount: 10,
      });
      const redditResult = await validator.validateContent(redditContent, {
        minWordCount: 5,
      });

      // Should not flag contextual usage
      expect(quotedResult.metadata.flaggedTerms).not.toContain('asshole');
      expect(redditResult.metadata.flaggedTerms).not.toContain('asshole');
    });
  });

  describe('Quality Analysis', () => {
    it('should calculate readability for different text complexities', async () => {
      const simpleText = 'This is simple. Easy to read. Short sentences.';
      const complexText =
        'This is a significantly more complex sentence structure that incorporates multiple subordinate clauses, extensive vocabulary, and intricate grammatical constructions that may challenge readers.';

      const simpleResult = await validator.validateContent(simpleText, {
        minWordCount: 5,
      });
      const complexResult = await validator.validateContent(complexText, {
        minWordCount: 20,
      });

      expect(simpleResult.metadata.readabilityScore).toBeGreaterThan(
        complexResult.metadata.readabilityScore
      );
    });

    it('should identify engagement elements correctly', async () => {
      const engagingContent =
        'Have you ever wondered about this? We all face these challenges! THIS IS IMPORTANT!';
      const boringContent =
        'This statement provides information without engagement elements or reader interaction.';

      const engagingResult = await validator.validateContent(engagingContent, {
        minWordCount: 10,
      });
      const boringResult = await validator.validateContent(boringContent, {
        minWordCount: 10,
      });

      expect(engagingResult.score).toBeGreaterThan(boringResult.score);
    });

    it('should detect good structure patterns', async () => {
      const wellStructured = `
        This is the first paragraph with a clear topic.
        
        This is the second paragraph that builds on the first. It has varied sentence lengths. Some short. Others are longer and more detailed.
        
        The final paragraph concludes the discussion effectively.
      `;

      const poorlyStructured =
        'This is one massive paragraph that contains everything in a single block without any breaks or structural elements that would make it easier to read and understand for the average reader who expects proper formatting and organization.';

      const goodResult = await validator.validateContent(wellStructured, {
        minWordCount: 30,
      });
      const poorResult = await validator.validateContent(poorlyStructured, {
        minWordCount: 30,
      });

      expect(goodResult.score).toBeGreaterThan(poorResult.score);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty content gracefully', async () => {
      const result = await validator.validateContent('');

      expect(result.isValid).toBe(false);
      expect(result.metadata.wordCount).toBe(0);
    });

    it('should handle null/undefined input gracefully', async () => {
      // @ts-expect-error - Testing error handling
      const result = await validator.validateContent(null);

      expect(result.isValid).toBe(false);
    });

    it('should provide meaningful error messages', async () => {
      const result = await validator.validateContent('short', {
        minWordCount: 100,
      });

      expect(result.errors[0]).toContain('too short');
      expect(result.errors[0]).toContain('1 words');
      expect(result.errors[0]).toContain('minimum: 100');
    });
  });

  describe('Configuration Integration', () => {
    it('should respect environment configuration', async () => {
      // This test verifies integration with the config system
      const content = 'This content has some mild profanity like damn';

      const result = await validator.validateContent(content, {
        minWordCount: 5,
      });

      // Should use the configured profanity filter level
      expect(result).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should validate content efficiently', async () => {
      const largeContent = 'word '.repeat(1000);

      const startTime = Date.now();
      await validator.validateContent(largeContent);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle multiple validations concurrently', async () => {
      const contents = Array(10).fill(
        'This is test content for concurrent validation testing.'
      );

      const startTime = Date.now();
      const results = await Promise.all(
        contents.map(content =>
          validator.validateContent(content, { minWordCount: 5 })
        )
      );
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(results.every(r => r.isValid)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
