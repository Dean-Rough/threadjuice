import React from 'react';
import HoverLink from '@/components/ui/HoverLink';

interface LinkData {
  text: string;
  href: string;
  preview?: {
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
}

// Define common links that should be converted to hyperlinks
const LINK_PATTERNS: { [key: string]: LinkData } = {
  'BuzzFeed': {
    text: 'BuzzFeed',
    href: 'https://buzzfeed.com',
    preview: {
      title: "17 Pizza Reheating Methods That Will Change Your Life",
      description: "From the obvious to the absolutely ridiculous, these pizza reheating methods will revolutionize your leftover game.",
      domain: "BuzzFeed"
    }
  },
  'The New York Times': {
    text: 'The New York Times',
    href: 'https://nytimes.com',
    preview: {
      title: "The Science of Reheating: A Thermal Analysis",
      description: "Food science meets kitchen practicality in this comprehensive guide to optimal food reheating techniques.",
      domain: "The New York Times"
    }
  },
  'Food Network': {
    text: 'Food Network',
    href: 'https://foodnetwork.com',
    preview: {
      title: "Reheat Masters: New Show Coming This Fall", 
      description: "Professional chefs compete to create the most innovative leftover transformation techniques.",
      domain: "Food Network"
    }
  },
  'TikTok': {
    text: 'TikTok',
    href: 'https://tiktok.com',
    preview: {
      title: "Pizza Reheating Personality Quiz",
      description: "Find out what your pizza reheating method says about your personality in this viral quiz.",
      domain: "TikTok"
    }
  },
  '"definitive guides"': {
    text: '"definitive guides"',
    href: 'https://example.com/pizza-guides',
    preview: {
      title: "The Ultimate Guide to Leftover Pizza",
      description: "Complete with step-by-step photos and affiliate links to pizza stones.",
      domain: "Food Blogs"
    }
  },
  '"Pizza Reheating Personality Quiz"': {
    text: '"Pizza Reheating Personality Quiz"',
    href: 'https://tiktok.com',
    preview: {
      title: "Pizza Reheating Personality Quiz",
      description: "Find out what your pizza reheating method says about your personality in this viral quiz.",
      domain: "TikTok"
    }
  },
  '"17 Pizza Reheating Methods That Will Change Your Life"': {
    text: '"17 Pizza Reheating Methods That Will Change Your Life"',
    href: 'https://buzzfeed.com',
    preview: {
      title: "17 Pizza Reheating Methods That Will Change Your Life",
      description: "From the obvious to the absolutely ridiculous, these pizza reheating methods will revolutionize your leftover game.",
      domain: "BuzzFeed"
    }
  },
  '"Reheat Masters"': {
    text: '"Reheat Masters"',
    href: 'https://foodnetwork.com',
    preview: {
      title: "Reheat Masters: New Show Coming This Fall",
      description: "Professional chefs compete to create the most innovative leftover transformation techniques.",
      domain: "Food Network"
    }
  }
};

/**
 * Parse content and convert specified text to hyperlinks with hover previews
 */
export function parseContentLinks(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remainingContent = content;
  let keyIndex = 0;

  // Sort patterns by length (longest first) to avoid partial matches
  const sortedPatterns = Object.entries(LINK_PATTERNS).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [pattern, linkData] of sortedPatterns) {
    const parts: React.ReactNode[] = [];
    const splitContent = remainingContent.split(pattern);
    
    if (splitContent.length > 1) {
      // Found the pattern, replace it
      for (let i = 0; i < splitContent.length; i++) {
        if (i > 0) {
          // Add the link
          parts.push(
            <HoverLink
              key={`link-${keyIndex++}`}
              href={linkData.href}
              preview={linkData.preview}
              external={true}
            >
              {linkData.text}
            </HoverLink>
          );
        }
        
        if (splitContent[i]) {
          // Process remaining content recursively for nested patterns
          const processedPart = parseContentLinks(splitContent[i]);
          parts.push(...processedPart);
        }
      }
      
      return parts;
    }
  }

  // No patterns found, return the content as text
  return [remainingContent];
}

/**
 * Render content with parsed links
 */
export function renderContentWithLinks(content: string): React.ReactNode {
  const parsed = parseContentLinks(content);
  
  // If only one part and it's a string, return it directly
  if (parsed.length === 1 && typeof parsed[0] === 'string') {
    return parsed[0];
  }
  
  // Return wrapped in a fragment
  return <>{parsed}</>;
}