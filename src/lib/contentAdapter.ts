/**
 * Adapter to normalize content structure between different storage formats
 */

export interface NormalizedSection {
  type: string;
  title?: string;
  content: string;
  author?: string;
  metadata?: any;
}

// Helper function to convert snake_case to camelCase
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  const camelObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelObj[camelKey] = snakeToCamel(obj[key]);
  }
  return camelObj;
}

export function normalizeContent(content: any): { sections: NormalizedSection[] } {
  if (!content) {
    return { sections: [] };
  }

  // If content is already in the expected format
  if (content.sections && Array.isArray(content.sections)) {
    // Check if sections use 'text' instead of 'content'
    const normalizedSections = content.sections.map((section: any) => ({
      ...section,
      content: section.content || section.text || '',
      // Remove the 'text' field to avoid confusion
      text: undefined,
      // Convert metadata snake_case to camelCase
      metadata: section.metadata ? snakeToCamel(section.metadata) : undefined
    }));
    return { sections: normalizedSections };
  }

  // If content is a direct array (from Supabase)
  if (Array.isArray(content)) {
    const normalizedSections = content.map((section: any) => ({
      ...section,
      content: section.content || section.text || '',
      // Remove the 'text' field to avoid confusion
      text: undefined,
      // Convert metadata snake_case to camelCase
      metadata: section.metadata ? snakeToCamel(section.metadata) : undefined
    }));
    return { sections: normalizedSections };
  }

  // Fallback for string content
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return normalizeContent(parsed);
    } catch {
      // If it's just a plain string, create a single paragraph section
      return {
        sections: [{
          type: 'paragraph',
          content: content
        }]
      };
    }
  }

  // Fallback
  return { sections: [] };
}