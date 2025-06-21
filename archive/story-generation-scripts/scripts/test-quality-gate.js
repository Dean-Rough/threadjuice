#!/usr/bin/env node

/**
 * Test Quality Gate System
 * Creates a deliberately low-quality story to test improvement suggestions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a deliberately low-quality story for testing
function createLowQualityStory() {
  const story = {
    id: `test-quality-${Date.now()}`,
    title: "Person Does Thing",  // Boring title with no emotional hooks
    slug: "person-does-thing",
    excerpt: "A thing happened.",  // Minimal excerpt
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
    category: "General",
    author: "test-author",
    persona: {
      name: "Test Author",
      avatar: "/assets/img/personas/test.svg",
      description: "Test description"
    },
    viewCount: 100,
    upvoteCount: 5,
    commentCount: 2,
    shareCount: 1,
    bookmarkCount: 0,
    readingTime: 2,
    createdAt: new Date().toISOString(),
    tags: ["test"],
    viral_score: 30,
    content: {
      sections: [
        {
          type: "describe-1",
          title: "What Happened",
          content: "Something happened. It was a thing. The person did it."  // Minimal content, no Terry voice
        },
        {
          type: "describe-2", 
          title: "More Details",
          content: "There were more details. They were details about the thing."  // Very basic content
        }
        // Missing quotes, discussion, and outro sections
      ]
    }
  };

  return story;
}

// Test the quality analysis
function testQualityGate() {
  const story = createLowQualityStory();
  
  console.log('🧪 TESTING QUALITY GATE SYSTEM');
  console.log('==============================');
  console.log(`📰 Title: ${story.title}`);
  console.log(`📁 Category: ${story.category}`);
  console.log('');
  
  // Analyze quality
  console.log('🔍 Analyzing story quality...');
  const qualityCheck = analyzeStoryQuality(story);
  console.log(`📊 Quality Score: ${Math.round(qualityCheck.overallQuality * 100)}%`);
  console.log(`🎯 Publishing Threshold: 70%`);
  
  if (qualityCheck.overallQuality >= 0.70) {
    console.log('✅ QUALITY GATE PASSED - Story ready for publishing!');
  } else {
    console.log('❌ QUALITY GATE FAILED - Story needs improvement');
    console.log(`📉 Gap: Need ${Math.round((0.70 - qualityCheck.overallQuality) * 100)}% more for publishing`);
    console.log('');
    console.log('🔄 IMPROVEMENT SUGGESTIONS:');
    
    qualityCheck.suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion.category.toUpperCase()}: ${suggestion.issue}`);
      console.log(`     → ${suggestion.suggestion}`);
      console.log(`     Priority: ${suggestion.priority.toUpperCase()}`);
      console.log('');
    });
    
    console.log('🛠️  Auto-rewriting story with improvements...');
    const improvedStory = applyQualityImprovements(story, qualityCheck.suggestions);
    
    // Re-analyze
    const improvedAnalysis = analyzeStoryQuality(improvedStory);
    console.log(`📈 Improved Quality Score: ${Math.round(improvedAnalysis.overallQuality * 100)}%`);
    
    if (improvedAnalysis.overallQuality >= 0.70) {
      console.log('✅ REWRITE SUCCESSFUL - Story now meets quality standards!');
      
      // Save the improved story
      const dataDir = path.join(__dirname, '..', 'data', 'generated-stories');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filename = `${improvedStory.slug}.json`;
      const filepath = path.join(dataDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(improvedStory, null, 2));
      
      console.log('');
      console.log('🎉 IMPROVED STORY SAVED');
      console.log('======================');
      console.log(`📄 Title: ${improvedStory.title}`);
      console.log(`📂 Saved: ${filepath}`);
      console.log(`🔗 Test URL: http://localhost:4242/blog/${improvedStory.slug}`);
      
    } else {
      console.log('⚠️  Story still below threshold after rewrite');
      console.log('Further improvements needed');
    }
  }
}

// Simple quality analysis
function analyzeStoryQuality(story) {
  const content = story.content.sections.map(s => s.content).join('\n\n');
  let score = 0.2; // Very low base score
  
  // Check for Terry voice indicators
  const terryWords = ['properly', 'mental', 'peak', 'dystopian', 'artificial', 'The Terry'];
  const terryCount = terryWords.reduce((count, word) => {
    return count + (content.match(new RegExp(word, 'gi')) || []).length;
  }, 0);
  
  if (terryCount >= 3) score += 0.15;
  else if (terryCount >= 1) score += 0.05;
  
  // Check for emotional hooks in title
  const emotionalWords = ['shocking', 'unbelievable', 'devastating', 'absolutely', 'disaster', 'mental', 'genius'];
  const emotionCount = emotionalWords.reduce((count, word) => {
    return count + (story.title.match(new RegExp(word, 'gi')) || []).length;
  }, 0);
  
  if (emotionCount >= 1) score += 0.1;
  
  // Check for structural elements
  const hasQuotes = story.content.sections.some(s => s.type === 'quotes');
  const hasDiscussion = story.content.sections.some(s => s.type === 'discussion');
  const hasOutro = story.content.sections.some(s => s.type === 'outro');
  const hasSocialAnalysis = content.includes('bigger picture') || content.includes('reveals something');
  
  if (hasQuotes) score += 0.1;
  if (hasDiscussion) score += 0.1;
  if (hasOutro) score += 0.05;
  if (hasSocialAnalysis) score += 0.1;
  
  // Check content depth
  const avgSectionLength = story.content.sections.reduce((acc, s) => acc + s.content.length, 0) / story.content.sections.length;
  if (avgSectionLength > 200) score += 0.1;
  else if (avgSectionLength < 50) score -= 0.1;
  
  // Generate improvement suggestions
  const suggestions = [];
  
  if (terryCount < 3) {
    suggestions.push({
      category: 'terry_voice',
      issue: 'Missing Terry\'s signature cynical commentary',
      suggestion: 'Add Terry-style observations like "properly mental," "peak behavior," and sardonic takes on modern life',
      priority: 'high'
    });
  }
  
  if (emotionCount === 0) {
    suggestions.push({
      category: 'engagement',
      issue: 'Title lacks emotional impact',
      suggestion: 'Add emotional keywords like "Absolutely Mental," "Shocking," or "Devastating" to increase viral potential',
      priority: 'high'
    });
  }
  
  if (!hasQuotes) {
    suggestions.push({
      category: 'narrative',
      issue: 'Missing dramatic quotes or key moments',
      suggestion: 'Add a powerful quote section that captures the peak moment of drama or revelation',
      priority: 'high'
    });
  }
  
  if (!hasDiscussion) {
    suggestions.push({
      category: 'narrative',
      issue: 'Missing deeper social commentary',
      suggestion: 'Add a "bigger picture" section exploring what this reveals about society or human nature',
      priority: 'medium'
    });
  }
  
  if (!hasOutro) {
    suggestions.push({
      category: 'narrative',
      issue: 'Missing conclusion section',
      suggestion: 'Add an outro section that wraps up the story with resolution or aftermath',
      priority: 'medium'
    });
  }
  
  if (avgSectionLength < 100) {
    suggestions.push({
      category: 'readability',
      issue: 'Content sections too brief',
      suggestion: 'Expand sections with more specific details, character motivations, and consequences',
      priority: 'medium'
    });
  }
  
  return {
    overallQuality: Math.min(score, 1),
    suggestions
  };
}

// Apply improvements to story
function applyQualityImprovements(story, suggestions) {
  const improvedStory = JSON.parse(JSON.stringify(story)); // Deep clone
  
  suggestions.forEach(suggestion => {
    switch (suggestion.category) {
      case 'engagement':
        // Enhance title with emotional hooks
        if (!improvedStory.title.includes('Absolutely') && !improvedStory.title.includes('Mental')) {
          improvedStory.title = 'Absolutely Mental: ' + improvedStory.title;
          improvedStory.slug = improvedStory.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
        }
        break;
        
      case 'terry_voice':
        // Add Terry voice to content sections
        improvedStory.content.sections = improvedStory.content.sections.map(section => {
          if (['describe-1', 'describe-2'].includes(section.type)) {
            let content = section.content;
            content = content.replace(/thing/g, 'properly mental thing');
            content = content.replace(/happened/g, 'unfolded in peak internet fashion');
            content = content.replace(/person/g, 'artificial person');
            content += '\n\nThe Terry observes this dystopian behavior reveals the absurd nature of modern existence.';
            section.content = content;
          }
          return section;
        });
        break;
        
      case 'narrative':
        if (suggestion.issue.includes('quotes')) {
          // Add quotes section
          improvedStory.content.sections.push({
            type: 'quotes',
            content: 'The audacity of some people never ceases to amaze me.',
            metadata: {
              attribution: 'The moment everything clicked',
              context: 'When reality hit'
            }
          });
        }
        
        if (suggestion.issue.includes('social commentary') || suggestion.issue.includes('bigger picture')) {
          // Add discussion section
          improvedStory.content.sections.push({
            type: 'discussion',
            title: 'The Bigger Picture',
            content: 'This isn\'t just about one incident—it\'s a window into the artificial nature of modern social dynamics. The Terry notes this phenomenon reveals how we\'ve created systems where basic human interactions become performative theater.\n\nWhen everyday situations become content for viral entertainment, we\'ve crossed into properly dystopian territory.'
          });
        }
        
        if (suggestion.issue.includes('conclusion')) {
          // Add outro section
          improvedStory.content.sections.push({
            type: 'outro',
            title: 'The Takeaway',
            content: 'In the end, life continued with slightly more awareness of the absurd. Sometimes the most ordinary things reveal the most extraordinary truths about human nature.'
          });
        }
        break;
        
      case 'readability':
        // Expand content sections
        improvedStory.content.sections = improvedStory.content.sections.map(section => {
          if (section.content.length < 100) {
            section.content += '\n\nThe situation escalated beyond anyone\'s expectations, revealing layers of complexity that nobody saw coming. What started as a simple interaction transformed into a case study of modern human behavior, complete with all the artificial drama and genuine consequences that define our digital age.';
          }
          return section;
        });
        break;
    }
  });
  
  return improvedStory;
}

// Run the test
testQualityGate();