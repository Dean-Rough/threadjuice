#!/usr/bin/env node

import { generateStory } from './content/generate-story-unified.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

let storyCount = 0;
const INITIAL_BATCH = 20; // Generate 20 stories initially
const MAX_STORIES = 1000; // Stop after 1000 stories to prevent runaway

async function generateSingleStory() {
  try {
    storyCount++;
    console.log(
      `\n🚀 [${new Date().toLocaleTimeString()}] Generating story ${storyCount}...`
    );

    const story = await generateStory();
    console.log(`✅ Generated: "${story.title}"`);
    console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);

    if (storyCount >= MAX_STORIES) {
      console.log(
        `🛑 Reached maximum of ${MAX_STORIES} stories. Stopping automation.`
      );
      process.exit(0);
    }

    return true;
  } catch (error) {
    console.error(
      `❌ [${new Date().toLocaleTimeString()}] Story generation failed:`,
      error.message
    );
    return false;
  }
}

async function generateBatch(count) {
  console.log(`\n📦 Generating batch of ${count} stories...`);
  let successCount = 0;

  for (let i = 0; i < count; i++) {
    const success = await generateSingleStory();
    if (success) successCount++;

    // Add a small delay between stories to be nice to APIs
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
  }

  console.log(
    `\n✅ Batch complete! Generated ${successCount}/${count} stories successfully.`
  );
}

async function startAutomation() {
  console.log('🤖 ThreadJuice Auto-Generator Started');
  console.log(`📦 First generating ${INITIAL_BATCH} stories...`);
  console.log('⏰ Then continuing with 1 story per hour');
  console.log('🛑 Press Ctrl+C to stop\n');

  // Generate initial batch
  await generateBatch(INITIAL_BATCH);

  console.log('\n⏰ Switching to hourly generation mode...');
  console.log('📅 Next story will generate in 1 hour');

  // Then generate every hour (3600000 ms)
  const interval = setInterval(generateSingleStory, 3600000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping auto-generation...');
    clearInterval(interval);
    console.log(`📊 Total stories generated: ${storyCount}`);
    console.log('✅ Auto-generator stopped');
    process.exit(0);
  });
}

startAutomation();
