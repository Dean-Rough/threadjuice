#!/usr/bin/env node

import { generateStory } from './content/generate-story-unified.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

let storyCount = 0;
const MAX_STORIES = 100; // Stop after 100 stories to prevent runaway

async function generateSingleStory() {
  try {
    storyCount++;
    console.log(`\n🚀 [${new Date().toLocaleTimeString()}] Generating story ${storyCount}...`);
    
    const story = await generateStory();
    console.log(`✅ Generated: "${story.title}"`);
    console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);
    
    if (storyCount >= MAX_STORIES) {
      console.log(`🛑 Reached maximum of ${MAX_STORIES} stories. Stopping automation.`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Story generation failed:`, error.message);
  }
}

function startAutomation() {
  console.log('🤖 ThreadJuice Auto-Generator Started');
  console.log('📅 Generating new story every 30 minutes');
  console.log('🛑 Press Ctrl+C to stop\n');
  
  // Generate first story immediately
  generateSingleStory();
  
  // Then generate every 30 minutes (1800000 ms)
  const interval = setInterval(generateSingleStory, 1800000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping auto-generation...');
    clearInterval(interval);
    console.log('✅ Auto-generator stopped');
    process.exit(0);
  });
}

startAutomation();