#!/usr/bin/env node

/**
 * Viral Content Orchestrator
 * Coordinates discovery and scraping across Reddit and Twitter
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvVars();

/**
 * Run command and return success status
 */
function runCommand(command, description) {
  try {
    console.log(`\n🚀 ${description}`);
    console.log(`💻 Running: ${command}`);

    execSync(command, {
      stdio: 'inherit',
      env: process.env,
    });

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

/**
 * Discover viral content from all platforms
 */
async function discoverAllContent(options = {}) {
  const {
    redditTimeframe = 'day',
    redditLimit = 15,
    twitterLimit = 10,
    dryRun = false,
  } = options;

  console.log('🔍 VIRAL CONTENT DISCOVERY ORCHESTRATOR');
  console.log('=====================================');
  console.log(`📊 Reddit: ${redditTimeframe} timeframe, ${redditLimit} posts`);
  console.log(`🐦 Twitter: ${twitterLimit} items`);
  console.log(`🧪 Dry run: ${dryRun}`);

  const results = {
    reddit: false,
    twitter: false,
    totalSuccess: 0,
    totalAttempts: 2,
  };

  // Reddit Discovery
  console.log('\n📖 REDDIT VIRAL DISCOVERY');
  console.log('=========================');

  const redditCommand = `npm run discover:reddit discover ${redditTimeframe} ${redditLimit}${dryRun ? ' --dry-run' : ''}`;
  results.reddit = runCommand(redditCommand, 'Reddit viral content discovery');
  if (results.reddit) results.totalSuccess++;

  // Wait between platforms to avoid rate limits
  console.log('\n⏱️ Waiting 5 seconds before Twitter discovery...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Twitter Discovery
  console.log('\n🐦 TWITTER VIRAL DISCOVERY');
  console.log('==========================');

  const twitterCommand = `npm run discover:twitter discover ${twitterLimit}${dryRun ? ' --dry-run' : ''}`;
  results.twitter = runCommand(
    twitterCommand,
    'Twitter viral content discovery'
  );
  if (results.twitter) results.totalSuccess++;

  // Summary
  console.log('\n📊 DISCOVERY SUMMARY');
  console.log('====================');
  console.log(
    `✅ Successful platforms: ${results.totalSuccess}/${results.totalAttempts}`
  );
  console.log(`📖 Reddit: ${results.reddit ? 'SUCCESS' : 'FAILED'}`);
  console.log(`🐦 Twitter: ${results.twitter ? 'SUCCESS' : 'FAILED'}`);

  if (results.totalSuccess === 0) {
    console.log(
      '\n❌ All discovery attempts failed. Check your API credentials and network connection.'
    );
    process.exit(1);
  }

  if (!dryRun) {
    console.log('\n🎉 Content discovery and import completed!');
    console.log('🔗 Visit http://localhost:4242 to see new viral content');
  }

  return results;
}

/**
 * Monitor viral content continuously
 */
async function monitorContent(options = {}) {
  const {
    interval = 30, // minutes
    redditLimit = 5,
    twitterLimit = 5,
  } = options;

  console.log('👁️ CONTINUOUS VIRAL MONITORING');
  console.log('===============================');
  console.log(`⏰ Interval: ${interval} minutes`);
  console.log(`📊 Limits: Reddit ${redditLimit}, Twitter ${twitterLimit}`);

  const monitor = async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n🕐 MONITORING CYCLE - ${timestamp}`);
    console.log('='.repeat(50));

    try {
      await discoverAllContent({
        redditTimeframe: 'hour',
        redditLimit,
        twitterLimit,
        dryRun: false,
      });
    } catch (error) {
      console.error('❌ Monitoring cycle failed:', error.message);
    }

    console.log(`\n💤 Next cycle in ${interval} minutes...`);
    console.log('='.repeat(50));
  };

  // Run immediately
  await monitor();

  // Then run on interval
  setInterval(monitor, interval * 60 * 1000);
}

/**
 * Trending content discovery
 */
async function discoverTrending() {
  console.log('📈 TRENDING CONTENT DISCOVERY');
  console.log('=============================');

  const results = {
    redditHot: false,
    twitterTrending: false,
  };

  // Reddit hot posts
  results.redditHot = runCommand(
    'npm run discover:reddit discover hour 10',
    'Reddit trending (hot posts)'
  );

  // Wait between calls
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Twitter trending topics
  results.twitterTrending = runCommand(
    'npm run discover:twitter trending',
    'Twitter trending topics'
  );

  console.log('\n📊 TRENDING SUMMARY');
  console.log('===================');
  console.log(`📖 Reddit hot: ${results.redditHot ? 'SUCCESS' : 'FAILED'}`);
  console.log(
    `🐦 Twitter trending: ${results.twitterTrending ? 'SUCCESS' : 'FAILED'}`
  );

  return results;
}

/**
 * Emergency viral content grab (fast, high-engagement only)
 */
async function emergencyGrab() {
  console.log('🚨 EMERGENCY VIRAL CONTENT GRAB');
  console.log('===============================');

  const results = await discoverAllContent({
    redditTimeframe: 'hour',
    redditLimit: 3,
    twitterLimit: 3,
    dryRun: false,
  });

  console.log('\n🚨 Emergency grab completed!');
  return results;
}

/**
 * Quality check - scrape specific URLs
 */
async function scrapeSpecific(urls) {
  console.log('🎯 SPECIFIC URL SCRAPING');
  console.log('========================');

  for (const url of urls) {
    if (url.includes('reddit.com')) {
      runCommand(
        `npm run scrape:reddit "${url}"`,
        `Scraping Reddit: ${url.slice(0, 50)}...`
      );
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      // Determine if it's a thread or single tweet
      const mode = url.includes('/status/') ? 'thread' : 'drama';
      runCommand(
        `npm run scrape:twitter ${mode} "${url}"`,
        `Scraping Twitter ${mode}: ${url.slice(0, 50)}...`
      );
    } else {
      console.log(`⚠️ Unsupported URL: ${url}`);
    }

    // Small delay between scrapes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'discover';

  try {
    if (command === 'discover') {
      // Standard discovery
      const timeframe = args[1] || 'day';
      const redditLimit = parseInt(args[2]) || 15;
      const twitterLimit = parseInt(args[3]) || 10;
      const dryRun = args.includes('--dry-run');

      await discoverAllContent({
        redditTimeframe: timeframe,
        redditLimit,
        twitterLimit,
        dryRun,
      });
    } else if (command === 'monitor') {
      // Continuous monitoring
      const interval = parseInt(args[1]) || 30;
      const redditLimit = parseInt(args[2]) || 5;
      const twitterLimit = parseInt(args[3]) || 5;

      await monitorContent({
        interval,
        redditLimit,
        twitterLimit,
      });
    } else if (command === 'trending') {
      // Trending content
      await discoverTrending();
    } else if (command === 'emergency') {
      // Emergency content grab
      await emergencyGrab();
    } else if (command === 'scrape') {
      // Scrape specific URLs
      const urls = args.slice(1);
      if (urls.length === 0) {
        console.error('❌ Please provide URLs to scrape');
        process.exit(1);
      }

      await scrapeSpecific(urls);
    } else {
      console.log('🔍 ThreadJuice Viral Content Orchestrator');
      console.log('=========================================');
      console.log('');
      console.log('Usage:');
      console.log(
        '  npm run discover discover [timeframe] [reddit-limit] [twitter-limit] [--dry-run]'
      );
      console.log(
        '  npm run discover monitor [interval-minutes] [reddit-limit] [twitter-limit]'
      );
      console.log('  npm run discover trending');
      console.log('  npm run discover emergency');
      console.log('  npm run discover scrape <url1> <url2> ...');
      console.log('');
      console.log('Examples:');
      console.log('  npm run discover discover week 20 15 --dry-run');
      console.log('  npm run discover monitor 60 10 8');
      console.log('  npm run discover emergency');
      console.log(
        '  npm run discover scrape "https://reddit.com/r/AmItheAsshole/comments/abc123"'
      );
      console.log('');
      console.log('Timeframes: hour, day, week, month, year, all');
    }
  } catch (error) {
    console.error('❌ Orchestrator failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
