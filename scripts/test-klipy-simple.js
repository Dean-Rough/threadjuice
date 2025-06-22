#!/usr/bin/env node

/**
 * Simple Klipy API Test
 * Run with: node scripts/test-klipy-simple.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY || process.env.KLIPY_API_KEY;
const BASE_URL = 'https://api.klipy.co/api/v1';
const CUSTOMER_ID = 'threadjuice-user-001';

// Emotion to GIF search term mappings (from sentimentAnalyzer)
const emotionSearchTerms = {
  opening_tension: ['here we go again', 'brace yourself', 'oh boy here we go'],
  escalating_drama: ['popcorn eating', 'drama intensifies', 'things heating up'],
  peak_chaos: ['this is fine fire', 'chaos everywhere', 'what just happened'],
  shocked_realization: ['plot twist', 'mind blown', 'wait what'],
  satisfied_resolution: ['mic drop', 'well that happened', 'and scene']
};

async function searchGif(searchTerm, emotion) {
  const url = `${BASE_URL}/${API_KEY}/gifs/search`;
  const params = new URLSearchParams({
    q: searchTerm,
    customer_id: CUSTOMER_ID,
    per_page: '3',
    content_filter: 'medium'
  });

  console.log(`\n🎭 Emotion: ${emotion}`);
  console.log(`🔍 Searching for: "${searchTerm}"`);

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.result && data.data && data.data.data && data.data.data.length > 0) {
      const gif = data.data.data[0];
      const gifUrl = gif.file?.hd?.gif?.url || gif.file?.md?.gif?.url || '';
      
      console.log(`✅ Found GIF: ${gif.title}`);
      console.log(`   URL: ${gifUrl}`);
      console.log(`   Size: ${gif.file?.hd?.gif?.width || '?'}x${gif.file?.hd?.gif?.height || '?'}`);
      
      return {
        id: gif.id,
        title: gif.title,
        url: gifUrl,
        emotion: emotion
      };
    } else {
      console.log('❌ No GIFs found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testEmotionGifs() {
  console.log('🔧 Testing Klipy GIF Search for Story Emotions...');
  console.log('API Key:', API_KEY ? `${API_KEY.slice(0, 10)}...` : 'NOT FOUND');
  console.log('=' .repeat(60));

  const results = [];

  for (const [emotion, searchTerms] of Object.entries(emotionSearchTerms)) {
    // Test the first search term for each emotion
    const searchTerm = searchTerms[0];
    const result = await searchGif(searchTerm, emotion);
    
    if (result) {
      results.push(result);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log(`Found ${results.length} out of ${Object.keys(emotionSearchTerms).length} emotions`);
  
  console.log('\n🎬 Sample Story Section Integration:');
  console.log('When someone sees the drama unfolding:');
  const dramaGif = results.find(r => r.emotion === 'escalating_drama');
  if (dramaGif) {
    console.log(`\n[GIF: ${dramaGif.title}]`);
    console.log(`Caption: "Everyone watching this unfold:"`);
    console.log(`URL: ${dramaGif.url}`);
  }
}

testEmotionGifs().catch(console.error);