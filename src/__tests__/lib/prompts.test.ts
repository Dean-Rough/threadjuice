import { 
  PERSONA_PROMPTS, 
  getPersonaPrompt, 
  getContentGuidelines, 
  CONTENT_GUIDELINES,
  type PersonaName 
} from '@/lib/prompts';

describe('Persona Prompts', () => {
  describe('PERSONA_PROMPTS constant', () => {
    it('should contain all three personas', () => {
      const expectedPersonas: PersonaName[] = [
        'The Snarky Sage',
        'The Down-to-Earth Buddy', 
        'The Dry Cynic'
      ];

      expectedPersonas.forEach(persona => {
        expect(PERSONA_PROMPTS[persona]).toBeDefined();
      });
    });

    it('should have complete prompt structure for each persona', () => {
      Object.entries(PERSONA_PROMPTS).forEach(([name, prompt]) => {
        expect(prompt.systemPrompt).toBeDefined();
        expect(prompt.systemPrompt.length).toBeGreaterThan(100);
        
        expect(prompt.contentStructure).toBeDefined();
        expect(prompt.contentStructure.length).toBeGreaterThan(100);
        
        expect(prompt.exampleOutput).toBeDefined();
        expect(prompt.exampleOutput.length).toBeGreaterThan(50);
      });
    });

    it('should have unique voice characteristics for each persona', () => {
      const snarkyPrompt = PERSONA_PROMPTS['The Snarky Sage'].systemPrompt;
      const buddyPrompt = PERSONA_PROMPTS['The Down-to-Earth Buddy'].systemPrompt;
      const cynicPrompt = PERSONA_PROMPTS['The Dry Cynic'].systemPrompt;

      // Snarky Sage characteristics
      expect(snarkyPrompt).toContain('sarcastic');
      expect(snarkyPrompt).toContain('witty');
      expect(snarkyPrompt).toContain('No emojis');

      // Down-to-Earth Buddy characteristics  
      expect(buddyPrompt).toContain('friendly');
      expect(buddyPrompt).toContain('conversational');
      expect(buddyPrompt).toContain('emojis');

      // Dry Cynic characteristics
      expect(cynicPrompt).toContain('deadpan');
      expect(cynicPrompt).toContain('skeptical');
      expect(cynicPrompt).toContain('No emojis');
    });

    it('should have appropriate target audiences', () => {
      const snarkyPrompt = PERSONA_PROMPTS['The Snarky Sage'].systemPrompt;
      const buddyPrompt = PERSONA_PROMPTS['The Down-to-Earth Buddy'].systemPrompt;
      const cynicPrompt = PERSONA_PROMPTS['The Dry Cynic'].systemPrompt;

      expect(snarkyPrompt).toContain('Millennials and Gen Z');
      expect(buddyPrompt).toContain('General audience');
      expect(cynicPrompt).toContain('Adults who appreciate dark humor');
    });
  });

  describe('getPersonaPrompt function', () => {
    it('should return correct prompt for each persona', () => {
      const snarkyPrompt = getPersonaPrompt('The Snarky Sage');
      expect(snarkyPrompt.systemPrompt).toContain('Snarky Sage');
      
      const buddyPrompt = getPersonaPrompt('The Down-to-Earth Buddy');
      expect(buddyPrompt.systemPrompt).toContain('Down-to-Earth Buddy');
      
      const cynicPrompt = getPersonaPrompt('The Dry Cynic');
      expect(cynicPrompt.systemPrompt).toContain('Dry Cynic');
    });

    it('should return complete prompt objects', () => {
      const prompt = getPersonaPrompt('The Snarky Sage');
      
      expect(prompt).toHaveProperty('systemPrompt');
      expect(prompt).toHaveProperty('contentStructure');
      expect(prompt).toHaveProperty('exampleOutput');
      
      expect(typeof prompt.systemPrompt).toBe('string');
      expect(typeof prompt.contentStructure).toBe('string');
      expect(typeof prompt.exampleOutput).toBe('string');
    });
  });

  describe('getContentGuidelines function', () => {
    const personas: PersonaName[] = ['The Snarky Sage', 'The Down-to-Earth Buddy', 'The Dry Cynic'];
    const contentTypes = ['article', 'summary', 'quiz_intro'] as const;

    personas.forEach(persona => {
      describe(`${persona} guidelines`, () => {
        contentTypes.forEach(contentType => {
          it(`should generate ${contentType} guidelines`, () => {
            const guidelines = getContentGuidelines(persona, contentType);
            
            expect(guidelines).toContain(persona);
            expect(guidelines.length).toBeGreaterThan(200);
            
            // Should contain base persona prompt
            const basePrompt = PERSONA_PROMPTS[persona].systemPrompt;
            expect(guidelines).toContain(basePrompt);
          });
        });
      });
    });

    it('should include content-type specific requirements', () => {
      const articleGuidelines = getContentGuidelines('The Snarky Sage', 'article');
      const summaryGuidelines = getContentGuidelines('The Snarky Sage', 'summary');
      const quizGuidelines = getContentGuidelines('The Snarky Sage', 'quiz_intro');

      expect(articleGuidelines).toContain('800-1200 words');
      expect(articleGuidelines).toContain('3-5 content blocks');
      
      expect(summaryGuidelines).toContain('200-300 words');
      expect(summaryGuidelines).toContain('condensed form');
      
      expect(quizGuidelines).toContain('100-150 words');
      expect(quizGuidelines).toContain('quiz context');
    });

    it('should maintain persona voice across content types', () => {
      const articleGuidelines = getContentGuidelines('The Snarky Sage', 'article');
      const summaryGuidelines = getContentGuidelines('The Snarky Sage', 'summary');
      
      // Both should contain the base persona characteristics
      expect(articleGuidelines).toContain('sarcastic');
      expect(summaryGuidelines).toContain('sarcastic');
    });
  });

  describe('Content Structure Guidelines', () => {
    it('should have persona-specific content blocks', () => {
      const snarkyStructure = PERSONA_PROMPTS['The Snarky Sage'].contentStructure;
      const buddyStructure = PERSONA_PROMPTS['The Down-to-Earth Buddy'].contentStructure;
      const cynicStructure = PERSONA_PROMPTS['The Dry Cynic'].contentStructure;

      // Snarky Sage blocks
      expect(snarkyStructure).toContain('wisdom_box');
      expect(snarkyStructure).toContain('quote_callout');
      
      // Buddy blocks
      expect(buddyStructure).toContain('relatable_moment');
      expect(buddyStructure).toContain('buddy_advice');
      
      // Cynic blocks
      expect(cynicStructure).toContain('absurdity_callout');
      expect(cynicStructure).toContain('cynic_truth');
    });

    it('should provide clear structural guidance', () => {
      Object.values(PERSONA_PROMPTS).forEach(prompt => {
        const structure = prompt.contentStructure;
        
        expect(structure).toContain('HOOK');
        expect(structure).toContain('paragraph');
        expect(structure).toContain('comment_cluster');
        
        // Should have numbered steps
        expect(structure).toMatch(/1\./);
        expect(structure).toMatch(/2\./);
      });
    });
  });

  describe('Example Outputs', () => {
    it('should have valid JSON examples', () => {
      Object.entries(PERSONA_PROMPTS).forEach(([name, prompt]) => {
        expect(() => {
          JSON.parse(prompt.exampleOutput);
        }).not.toThrow();
      });
    });

    it('should demonstrate persona voice in examples', () => {
      const snarkyExample = JSON.parse(PERSONA_PROMPTS['The Snarky Sage'].exampleOutput);
      const buddyExample = JSON.parse(PERSONA_PROMPTS['The Down-to-Earth Buddy'].exampleOutput);
      const cynicExample = JSON.parse(PERSONA_PROMPTS['The Dry Cynic'].exampleOutput);

      // Snarky should be witty/sarcastic
      expect(snarkyExample.hook).toMatch(/(digital wasteland|common sense.*die)/i);
      
      // Buddy should be warm/relatable
      expect(buddyExample.hook).toMatch(/(you know|we've all|😊)/i);
      
      // Cynic should be deadpan/matter-of-fact
      expect(cynicExample.hook).toMatch(/(episode of|humans will disappoint)/i);
    });

    it('should have proper content structure in examples', () => {
      Object.values(PERSONA_PROMPTS).forEach(prompt => {
        const example = JSON.parse(prompt.exampleOutput);
        
        expect(example).toHaveProperty('hook');
        expect(example).toHaveProperty('content');
        expect(Array.isArray(example.content)).toBe(true);
        expect(example.content.length).toBeGreaterThan(0);
        
        example.content.forEach((block: any) => {
          expect(block).toHaveProperty('type');
          expect(block).toHaveProperty('content');
        });
      });
    });
  });

  describe('CONTENT_GUIDELINES', () => {
    it('should have safety guidelines', () => {
      expect(CONTENT_GUIDELINES.safety).toBeDefined();
      expect(CONTENT_GUIDELINES.safety.prohibited).toBeDefined();
      expect(CONTENT_GUIDELINES.safety.required).toBeDefined();
      
      expect(Array.isArray(CONTENT_GUIDELINES.safety.prohibited)).toBe(true);
      expect(Array.isArray(CONTENT_GUIDELINES.safety.required)).toBe(true);
    });

    it('should have quality guidelines', () => {
      expect(CONTENT_GUIDELINES.quality).toBeDefined();
      expect(CONTENT_GUIDELINES.quality.structure).toBeDefined();
      expect(CONTENT_GUIDELINES.quality.engagement).toBeDefined();
      
      expect(Array.isArray(CONTENT_GUIDELINES.quality.structure)).toBe(true);
      expect(Array.isArray(CONTENT_GUIDELINES.quality.engagement)).toBe(true);
    });

    it('should include comprehensive safety restrictions', () => {
      const prohibited = CONTENT_GUIDELINES.safety.prohibited;
      
      expect(prohibited).toContain('Personal information (real names, addresses, etc.)');
      expect(prohibited).toContain('Harassment or targeted attacks');
      expect(prohibited).toContain('Explicit sexual content');
      expect(prohibited).toContain('Hate speech or discrimination');
    });

    it('should include quality requirements', () => {
      const structure = CONTENT_GUIDELINES.quality.structure;
      const engagement = CONTENT_GUIDELINES.quality.engagement;
      
      expect(structure).toContain('Clear narrative arc');
      expect(structure).toContain('Engaging hook within first 50 words');
      
      expect(engagement).toContain('Include interactive elements (questions, callouts)');
      expect(engagement).toContain('Create shareable moments');
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types', () => {
      // This test ensures the types are working correctly
      const personaNames: PersonaName[] = [
        'The Snarky Sage',
        'The Down-to-Earth Buddy',
        'The Dry Cynic'
      ];

      personaNames.forEach(name => {
        const prompt = getPersonaPrompt(name);
        expect(prompt).toBeDefined();
        
        const guidelines = getContentGuidelines(name, 'article');
        expect(guidelines).toBeDefined();
      });
    });

    it('should enforce persona name constraints', () => {
      // TypeScript should prevent invalid persona names at compile time
      // This test verifies the runtime behavior
      expect(() => {
        // @ts-expect-error - Testing invalid persona name
        getPersonaPrompt('Invalid Persona' as PersonaName);
      }).not.toThrow(); // Runtime doesn't throw, but TypeScript should catch this
    });
  });
}); 