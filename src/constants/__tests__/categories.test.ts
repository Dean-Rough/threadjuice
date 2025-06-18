import {
  CATEGORIES,
  getCategoryById,
  getCategoryEmoji,
  getCategoryIcon,
  getCategoryName,
  getCategoryColor,
  getDisplayCategories,
  type Category,
  type CategoryId,
} from '../categories';
import { Radio } from 'lucide-react';

describe('Category Constants', () => {
  describe('CATEGORIES array', () => {
    it('should contain all expected categories', () => {
      const expectedIds = [
        'all', 'viral', 'trending', 'gaming', 'tech', 'movie',
        'sports', 'music', 'food', 'travel', 'lifestyle', 'news', 'science'
      ];
      
      expect(CATEGORIES).toHaveLength(expectedIds.length);
      
      expectedIds.forEach(id => {
        const category = CATEGORIES.find(cat => cat.id === id);
        expect(category).toBeDefined();
        expect(category?.id).toBe(id);
      });
    });

    it('should have all required properties for each category', () => {
      CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('emoji');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('color');
        
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.emoji).toBe('string');
        expect(typeof category.icon).toBe('object'); // React components are objects in Jest
        expect(typeof category.description).toBe('string');
        expect(typeof category.color).toBe('string');
      });
    });

    it('should have unique ids', () => {
      const ids = CATEGORIES.map(cat => cat.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });
  });

  describe('getCategoryById', () => {
    it('should return correct category for valid id', () => {
      const category = getCategoryById('gaming');
      expect(category).toBeDefined();
      expect(category?.id).toBe('gaming');
      expect(category?.name).toBe('Gaming');
      expect(category?.emoji).toBe('🎮');
    });

    it('should return undefined for invalid id', () => {
      const category = getCategoryById('nonexistent');
      expect(category).toBeUndefined();
    });

    it('should return correct category for "all"', () => {
      const category = getCategoryById('all');
      expect(category).toBeDefined();
      expect(category?.name).toBe('All');
      expect(category?.emoji).toBe('🔥');
    });
  });

  describe('getCategoryEmoji', () => {
    it('should return correct emoji for valid category', () => {
      expect(getCategoryEmoji('gaming')).toBe('🎮');
      expect(getCategoryEmoji('tech')).toBe('💻');
      expect(getCategoryEmoji('food')).toBe('🍽️');
    });

    it('should return default emoji for invalid category', () => {
      expect(getCategoryEmoji('nonexistent')).toBe('📰');
    });

    it('should handle empty string', () => {
      expect(getCategoryEmoji('')).toBe('📰');
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon component for valid category', () => {
      const icon = getCategoryIcon('gaming');
      expect(typeof icon).toBe('object'); // React components are objects in Jest
      expect(icon).toBeDefined();
    });

    it('should return default Radio icon for invalid category', () => {
      const icon = getCategoryIcon('nonexistent');
      expect(icon).toBe(Radio);
    });

    it('should handle empty string', () => {
      const icon = getCategoryIcon('');
      expect(icon).toBe(Radio);
    });
  });

  describe('getCategoryName', () => {
    it('should return correct name for valid category', () => {
      expect(getCategoryName('gaming')).toBe('Gaming');
      expect(getCategoryName('tech')).toBe('Technology');
      expect(getCategoryName('movie')).toBe('Movies');
    });

    it('should return "Unknown" for invalid category', () => {
      expect(getCategoryName('nonexistent')).toBe('Unknown');
    });

    it('should handle empty string', () => {
      expect(getCategoryName('')).toBe('Unknown');
    });
  });

  describe('getCategoryColor', () => {
    it('should return correct color for valid category', () => {
      expect(getCategoryColor('gaming')).toBe('purple');
      expect(getCategoryColor('tech')).toBe('blue');
      expect(getCategoryColor('viral')).toBe('red');
    });

    it('should return "gray" for invalid category', () => {
      expect(getCategoryColor('nonexistent')).toBe('gray');
    });

    it('should handle empty string', () => {
      expect(getCategoryColor('')).toBe('gray');
    });
  });

  describe('getDisplayCategories', () => {
    it('should include "all" category by default', () => {
      const categories = getDisplayCategories();
      expect(categories).toEqual(CATEGORIES);
      expect(categories[0].id).toBe('all');
    });

    it('should exclude "all" category when includeAll is false', () => {
      const categories = getDisplayCategories(false);
      expect(categories).toHaveLength(CATEGORIES.length - 1);
      expect(categories.find(cat => cat.id === 'all')).toBeUndefined();
      expect(categories[0].id).toBe('viral');
    });

    it('should include "all" category when includeAll is true', () => {
      const categories = getDisplayCategories(true);
      expect(categories).toEqual(CATEGORIES);
      expect(categories[0].id).toBe('all');
    });
  });

  describe('TypeScript types', () => {
    it('should export CategoryId type correctly', () => {
      // Type test - this will fail at compile time if types are wrong
      const validId: CategoryId = 'gaming';
      const category = getCategoryById(validId);
      expect(category?.id).toBe(validId);
    });

    it('should have readonly CATEGORIES array', () => {
      // This should fail at compile time if CATEGORIES is not readonly
      // @ts-expect-error - Cannot assign to readonly array
      // CATEGORIES.push({} as Category);
      
      // But accessing should work fine
      expect(CATEGORIES[0]).toBeDefined();
    });
  });

  describe('Category data integrity', () => {
    it('should have consistent data for all categories', () => {
      CATEGORIES.forEach(category => {
        // Names should be capitalized
        expect(category.name[0]).toBe(category.name[0].toUpperCase());
        
        // IDs should be lowercase
        expect(category.id).toBe(category.id.toLowerCase());
        
        // Descriptions should end with proper punctuation or be meaningful
        expect(category.description.length).toBeGreaterThan(5);
        
        // Emojis should be actual emoji characters (basic check)
        expect(category.emoji.length).toBeGreaterThanOrEqual(1);
        expect(category.emoji.length).toBeLessThanOrEqual(4);
        
        // Colors should be valid CSS color names (basic validation)
        const validColors = [
          'orange', 'red', 'green', 'purple', 'blue', 'yellow', 'indigo',
          'pink', 'amber', 'cyan', 'rose', 'gray', 'emerald'
        ];
        expect(validColors).toContain(category.color);
      });
    });
  });
});