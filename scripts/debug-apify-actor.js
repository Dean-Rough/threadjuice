#!/usr/bin/env node

/**
 * Debug script to inspect Apify actor details
 */

import { ApifyClient } from 'apify-client';
import { readFileSync } from 'fs';
import path from 'path';

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

async function inspectActor(actorId) {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

  try {
    console.log(`🔍 Inspecting actor: ${actorId}`);

    // Get actor details
    const actor = await client.actor(actorId).get();

    console.log(`📋 Actor Details:`);
    console.log(`   Name: ${actor.name}`);
    console.log(`   Title: ${actor.title}`);
    console.log(`   Description: ${actor.description?.slice(0, 100)}...`);
    console.log(`   Version: ${actor.defaultRunOptions?.build || 'latest'}`);
    console.log(`   Is Public: ${actor.isPublic}`);
    console.log(`   Is Free: ${!actor.paidUsage}`);

    // Try to get input schema if available
    try {
      const inputSchema = await client
        .actor(actorId)
        .version('latest')
        .inputSchema()
        .get();
      console.log(`\n📝 Input Schema:`);
      console.log(JSON.stringify(inputSchema, null, 2));
    } catch (error) {
      console.log(`\n❌ Could not get input schema: ${error.message}`);

      // Try to get a recent run's input as example
      try {
        const runs = await client.actor(actorId).runs().list({ limit: 1 });
        if (runs.items.length > 0) {
          const lastRun = await client.run(runs.items[0].id).get();
          console.log(`\n💡 Example input from recent run:`);
          console.log(JSON.stringify(lastRun.options?.input || {}, null, 2));
        }
      } catch (e) {
        console.log(`❌ Could not get example input: ${e.message}`);
      }
    }

    // Get recent runs to see what inputs work
    try {
      const runs = await client.actor(actorId).runs().list({ limit: 3 });
      console.log(`\n🏃 Recent Runs (${runs.count} total):`);
      runs.items.forEach((run, i) => {
        console.log(`   Run ${i + 1}: ${run.status} (${run.startedAt})`);
      });
    } catch (error) {
      console.log(`\n❌ Could not get runs: ${error.message}`);
    }
  } catch (error) {
    console.error(`❌ Error inspecting actor ${actorId}:`, error.message);
  }
}

async function findTwitterScrapers() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

  try {
    console.log('\n🐦 Searching for Twitter scrapers...');

    const store = await client.actors().list({
      search: 'twitter scraper',
      limit: 10,
      orderBy: 'relevance',
    });

    console.log(`\n📦 Found ${store.count} Twitter-related actors:`);
    store.items.forEach((actor, i) => {
      const isFree = !actor.paidUsage;
      const freeIcon = isFree ? '🆓' : '💰';
      console.log(`   ${i + 1}. ${freeIcon} ${actor.name} - ${actor.title}`);
      console.log(`      ${actor.description?.slice(0, 80)}...`);
    });
  } catch (error) {
    console.error('❌ Error searching actors:', error.message);
  }
}

async function main() {
  console.log('🔍 APIFY ACTOR DEBUGGING');
  console.log('========================\n');

  // Inspect specific actors
  await inspectActor('quacker/twitter-scraper');
  await inspectActor('trudax/reddit-scraper');

  // Search for alternatives
  await findTwitterScrapers();
}

main().catch(console.error);
