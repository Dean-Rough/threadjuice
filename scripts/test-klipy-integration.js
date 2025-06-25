#!/usr/bin/env node

/**
 * Test Klipy Integration End-to-End
 * Run with: node scripts/test-klipy-integration.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// For now, we'll test the API directly without the TypeScript imports
// import { sentimentAnalyzer } from '../src/lib/sentimentAnalyzer.js';
// import { giphyService } from '../src/lib/klipyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testSentimentToGif() {
  console.log('🔧 Testing Complete Klipy Integration Flow...\n');

  // Test content samples
  const testSections = [
    {
      content:
        'The drama started when someone innocently asked about pineapple on pizza...',
      context: {
        category: 'food-drama',
        sectionType: 'describe-1',
        sectionIndex: 0,
        totalSections: 5,
        contentQuality: 'premium',
      },
    },
    {
      content:
        'Things quickly escalated as the replies turned into an absolute battlefield of culinary opinions!',
      context: {
        category: 'food-drama',
        sectionType: 'describe-2',
        sectionIndex: 2,
        totalSections: 5,
        contentQuality: 'premium',
      },
    },
    {
      content:
        'The chaos reached peak levels when Gordon Ramsay himself joined the conversation with a scathing hot take!',
      context: {
        category: 'food-drama',
        sectionType: 'quotes',
        sectionIndex: 3,
        totalSections: 5,
        contentQuality: 'premium',
      },
    },
  ];

  for (const section of testSections) {
    console.log(
      `\n📝 Testing Section: "${section.content.substring(0, 50)}..."`
    );
    console.log(
      `Context: ${section.context.sectionType} (${section.context.sectionIndex + 1}/${section.context.totalSections})`
    );

    // Step 1: Analyze sentiment
    const emotionalAnalysis = sentimentAnalyzer.analyzeSection(
      section.content,
      section.context
    );
    console.log(`\n🎭 Emotional Analysis:`);
    console.log(`- Emotion: ${emotionalAnalysis.emotion}`);
    console.log(`- Intensity: ${emotionalAnalysis.intensity.toFixed(2)}`);
    console.log(`- Confidence: ${emotionalAnalysis.confidence.toFixed(2)}`);
    console.log(`- Context: ${emotionalAnalysis.context}`);
    console.log(
      `- Search Terms: ${emotionalAnalysis.giffSearchTerms.join(', ')}`
    );

    // Step 2: Search for GIF
    console.log(`\n🔍 Searching for reaction GIF...`);
    const gifResult = await giphyService.searchReactionGif({
      emotion: emotionalAnalysis.emotion,
      searchTerms: emotionalAnalysis.giffSearchTerms,
      context: emotionalAnalysis.context,
      intensity: emotionalAnalysis.intensity,
      safeSearch: true,
    });

    if (gifResult) {
      console.log(`✅ Found GIF!`);
      console.log(`- ID: ${gifResult.id}`);
      console.log(`- Title: ${gifResult.title}`);
      console.log(`- URL: ${gifResult.url}`);
      console.log(`- Preview: ${gifResult.preview || 'N/A'}`);
      console.log(`- Size: ${gifResult.width}x${gifResult.height}`);
      console.log(`- Caption: ${gifResult.caption}`);
    } else {
      console.log(`❌ No GIF found for emotion: ${emotionalAnalysis.emotion}`);
    }

    console.log('\n' + '='.repeat(80));

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Test cache stats
  console.log('\n📊 Cache Statistics:');
  const cacheStats = giphyService.getCacheStats();
  console.log(`- Cached searches: ${cacheStats.size}`);
  console.log(`- Cache keys: ${cacheStats.keys.join(', ')}`);
}

testSentimentToGif().catch(console.error);
