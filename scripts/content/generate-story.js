#!/usr/bin/env node

/**
 * ThreadJuice Production Story Generator
 *
 * This is now a wrapper that uses the unified story generator
 * Maintained for backward compatibility
 */

import {
  generateStory as generateUnifiedStory,
  generateBulkStories,
  saveToDatabase,
} from './generate-story-unified.js';

// Re-export unified functions for compatibility
export { generateUnifiedStory as generateStory, saveToDatabase };

// Main execution for backward compatibility
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--category') options.category = args[i + 1];
    if (args[i] === '--source') options.source = args[i + 1];
    if (args[i] === '--save') options.save = args[i + 1] !== 'false';
  }

  try {
    console.log('🚀 ThreadJuice Story Generator (using unified system)');
    console.log('━'.repeat(50));

    const story = await generateUnifiedStory(options);

    if (options.save !== false) {
      await saveToDatabase(story);
      console.log(`✅ Saved to database: ${story.slug}`);
    }

    console.log(`\n🎉 Story generation complete!`);
    console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
