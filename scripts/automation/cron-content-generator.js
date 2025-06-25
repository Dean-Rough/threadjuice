#!/usr/bin/env node

/**
 * ThreadJuice Cron Content Generator
 * Automated story generation for scheduled execution
 * 
 * Usage:
 *   node cron-content-generator.js [options]
 *   
 * Options:
 *   --count <n>        Number of stories to generate (default: 5)
 *   --source <type>    Content source: reddit|twitter (default: reddit)
 *   --dry-run          Preview what would be generated without creating
 *   --force            Skip rate limiting checks
 *   --verbose          Detailed logging
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local:', error.message);
  }
}

loadEnvVars();

// Configuration
const DEFAULT_CONFIG = {
  count: 5,
  source: 'reddit',
  maxConcurrent: 2,
  retryAttempts: 3,
  delayBetweenStories: 5000, // 5 seconds
  rateLimitWindow: 60 * 60 * 1000, // 1 hour
  maxStoriesPerHour: 20,
};

/**
 * Rate limiting check
 */
async function checkRateLimit(force = false) {
  if (force) {
    console.log('⚡ Rate limiting bypassed with --force');
    return true;
  }

  try {
    // Simple file-based rate limiting
    const rateLimitFile = path.join(process.cwd(), '.automation-rate-limit');
    let rateLimitData = { lastReset: Date.now(), count: 0 };
    
    try {
      const data = readFileSync(rateLimitFile, 'utf8');
      rateLimitData = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, use defaults
    }

    const now = Date.now();
    const timeElapsed = now - rateLimitData.lastReset;
    
    // Reset if window has passed
    if (timeElapsed > DEFAULT_CONFIG.rateLimitWindow) {
      rateLimitData = { lastReset: now, count: 0 };
    }
    
    // Check if we're under the limit
    if (rateLimitData.count >= DEFAULT_CONFIG.maxStoriesPerHour) {
      const resetIn = Math.ceil((DEFAULT_CONFIG.rateLimitWindow - timeElapsed) / 1000 / 60);
      console.error(`❌ Rate limit exceeded: ${rateLimitData.count}/${DEFAULT_CONFIG.maxStoriesPerHour} stories this hour`);
      console.error(`⏰ Rate limit resets in ${resetIn} minutes`);
      return false;
    }
    
    console.log(`✅ Rate limit OK: ${rateLimitData.count}/${DEFAULT_CONFIG.maxStoriesPerHour} stories this hour`);
    return true;
  } catch (error) {
    console.warn('⚠️  Rate limit check failed:', error.message);
    return true; // Allow if check fails
  }
}

/**
 * Update rate limit counter
 */
async function updateRateLimit(count) {
  try {
    const rateLimitFile = path.join(process.cwd(), '.automation-rate-limit');
    let rateLimitData = { lastReset: Date.now(), count: 0 };
    
    try {
      const data = readFileSync(rateLimitFile, 'utf8');
      rateLimitData = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet
    }

    const now = Date.now();
    const timeElapsed = now - rateLimitData.lastReset;
    
    // Reset if window has passed
    if (timeElapsed > DEFAULT_CONFIG.rateLimitWindow) {
      rateLimitData = { lastReset: now, count: 0 };
    }
    
    rateLimitData.count += count;
    
    // Write back to file
    const fs = await import('fs/promises');
    await fs.writeFile(rateLimitFile, JSON.stringify(rateLimitData, null, 2));
  } catch (error) {
    console.warn('⚠️  Failed to update rate limit:', error.message);
  }
}

/**
 * Send notification
 */
async function sendNotification(type, data) {
  const webhookUrl = process.env.AUTOMATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = type === 'success' 
      ? `✅ ThreadJuice Automation: Generated ${data.successful}/${data.attempted} stories`
      : `❌ ThreadJuice Automation Failed: ${data.error}`;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        timestamp: new Date().toISOString(),
        details: data,
      }),
    });
  } catch (error) {
    console.warn('⚠️  Failed to send notification:', error.message);
  }
}

/**
 * Generate stories in batches
 */
async function generateStories(options) {
  const { count, source, dryRun, verbose } = options;
  
  console.log('🤖 THREADJUICE AUTOMATED CONTENT GENERATION');
  console.log('==========================================');
  console.log(`📊 Target: ${count} stories from ${source}`);
  console.log(`🔄 Mode: ${dryRun ? 'DRY RUN' : 'LIVE GENERATION'}`);
  console.log(`📝 Logging: ${verbose ? 'VERBOSE' : 'STANDARD'}`);
  console.log('');

  if (dryRun) {
    console.log('🎭 DRY RUN: Simulating story generation...');
    
    for (let i = 1; i <= count; i++) {
      console.log(`📝 [${i}/${count}] Would generate story from ${source}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Dry run completed successfully');
    return { attempted: count, successful: count, failed: 0, stories: [], errors: [] };
  }

  // Real generation
  const results = {
    attempted: 0,
    successful: 0,
    failed: 0,
    stories: [],
    errors: [],
  };

  try {
    // Dynamic import to avoid loading heavy modules in dry-run
    const { generateStoryWithMedia, saveToDatabase } = await import('../content/generate-story-unified.js');
    
    // Generate stories in batches
    const batchSize = DEFAULT_CONFIG.maxConcurrent;
    const batches = [];
    
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && (i + j) < count; j++) {
        batch.push(i + j);
      }
      batches.push(batch);
    }

    console.log(`🚀 Generating ${count} stories in ${batches.length} batches of up to ${batchSize}...`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} stories):`);

      const batchPromises = batch.map(async (storyIndex) => {
        const storyNumber = storyIndex + 1;
        results.attempted++;
        
        try {
          if (verbose) {
            console.log(`  🔄 [${storyNumber}/${count}] Starting generation...`);
          }

          const story = await generateStoryWithMedia({ source });
          
          // Save to database
          const savedStory = await saveToDatabase(story);
          
          results.successful++;
          results.stories.push(savedStory.id);
          
          console.log(`  ✅ [${storyNumber}/${count}] "${story.title.slice(0, 50)}..." (ID: ${savedStory.id})`);
          
          return savedStory;
        } catch (error) {
          results.failed++;
          results.errors.push(error.message);
          
          console.error(`  ❌ [${storyNumber}/${count}] Failed: ${error.message}`);
          
          if (verbose) {
            console.error(`    Stack: ${error.stack?.slice(0, 200)}...`);
          }
          
          return null;
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Brief pause between batches
      if (batchIndex < batches.length - 1) {
        console.log(`  ⏳ Pausing ${DEFAULT_CONFIG.delayBetweenStories}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.delayBetweenStories));
      }
    }

  } catch (error) {
    console.error('❌ Critical error during generation:', error.message);
    results.errors.push(`Critical: ${error.message}`);
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    count: DEFAULT_CONFIG.count,
    source: DEFAULT_CONFIG.source,
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
  };

  // Parse --count
  const countIndex = args.indexOf('--count');
  if (countIndex !== -1 && args[countIndex + 1]) {
    options.count = parseInt(args[countIndex + 1]) || DEFAULT_CONFIG.count;
  }

  // Parse --source
  const sourceIndex = args.indexOf('--source');
  if (sourceIndex !== -1 && args[sourceIndex + 1]) {
    const source = args[sourceIndex + 1];
    if (['reddit', 'twitter'].includes(source)) {
      options.source = source;
    }
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
ThreadJuice Automated Content Generator

Usage:
  node cron-content-generator.js [options]

Options:
  --count <n>        Number of stories to generate (default: ${DEFAULT_CONFIG.count})
  --source <type>    Content source: reddit|twitter (default: ${DEFAULT_CONFIG.source})
  --dry-run          Preview what would be generated without creating
  --force            Skip rate limiting checks
  --verbose          Detailed logging
  --help, -h         Show this help

Examples:
  node cron-content-generator.js --count 3 --source reddit
  node cron-content-generator.js --dry-run --verbose
  node cron-content-generator.js --count 10 --force

Rate Limiting:
  - Maximum ${DEFAULT_CONFIG.maxStoriesPerHour} stories per hour
  - Use --force to bypass (use carefully)
  
Environment Variables:
  AUTOMATION_WEBHOOK_URL    Webhook for success/failure notifications
    `);
    return;
  }

  const startTime = new Date();
  
  try {
    // Rate limiting check
    if (!options.dryRun) {
      const canProceed = await checkRateLimit(options.force);
      if (!canProceed) {
        process.exit(1);
      }
    }

    // Generate stories
    const results = await generateStories(options);
    
    // Update rate limit
    if (!options.dryRun && results.successful > 0) {
      await updateRateLimit(results.successful);
    }

    // Summary
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);
    console.log('\n📊 GENERATION SUMMARY');
    console.log('====================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📝 Attempted: ${results.attempted}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log(`\n🚨 Errors:`);
      results.errors.slice(0, 3).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (results.errors.length > 3) {
        console.log(`   ... and ${results.errors.length - 3} more`);
      }
    }

    // Send notification
    if (!options.dryRun) {
      await sendNotification(results.failed === 0 ? 'success' : 'failure', {
        ...results,
        duration,
        source: options.source,
      });
    }

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    
    if (options.verbose) {
      console.error('Stack:', error.stack);
    }
    
    // Send failure notification
    await sendNotification('failure', {
      error: error.message,
      attempted: 0,
      successful: 0,
      failed: 1,
    });
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received interrupt signal, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received termination signal, shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}