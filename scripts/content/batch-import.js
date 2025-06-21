#!/usr/bin/env node

/**
 * ThreadJuice Batch Content Import
 *
 * Import multiple stories to database in batch
 * Handles existing JSON files and generates new content
 */

import { generateStory, saveToDatabase } from './generate-story.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Import existing JSON story files to database
 */
async function importExistingJsonFiles() {
  try {
    // console.log('📂 Scanning for existing story JSON files...');

    const files = await fs.readdir(process.cwd());
    const jsonFiles = files.filter(
      f => f.includes('auto-generated-') && f.endsWith('.json')
    );

    // console.log(`Found ${jsonFiles.length} existing story files`);

    const imported = [];

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(
          path.join(process.cwd(), file),
          'utf8'
        );
        const story = JSON.parse(content);

        // Check if already imported
        const existing = await prisma.post.findUnique({
          where: { slug: story.slug },
        });

        if (existing) {
          // console.log(`⏭️  Skipping ${story.title} - already exists`);
          continue;
        }

        // Ensure persona exists
        if (story.persona) {
          await prisma.persona.upsert({
            where: { id: story.persona.id },
            update: {},
            create: {
              id: story.persona.id,
              name: story.persona.name,
              slug: story.persona.id,
              bio: story.persona.bio,
              tone: story.persona.tone,
              avatar_url: story.persona.avatar,
              story_count: 0,
              rating: 4.5,
            },
          });
        }

        // Import to database
        const savedStory = await prisma.post.create({
          data: {
            title: story.title,
            slug: story.slug,
            excerpt: story.excerpt,
            content: JSON.stringify(story.content),
            image_url: story.imageUrl,
            category: story.category,
            author: story.author,
            persona_id: story.persona?.id || 'down-to-earth-buddy',
            status: 'published',
            view_count:
              story.viewCount || Math.floor(Math.random() * 50000) + 10000,
            upvote_count:
              story.upvoteCount || Math.floor(Math.random() * 5000) + 1000,
            comment_count:
              story.commentCount || Math.floor(Math.random() * 500) + 50,
            share_count:
              story.shareCount || Math.floor(Math.random() * 3000) + 500,
            bookmark_count:
              story.bookmarkCount || Math.floor(Math.random() * 500) + 50,
            trending: story.trending || true,
            featured: story.featured || Math.random() > 0.5,
            subreddit: story.redditSource?.subreddit || 'pettyrevenge',
          },
        });

        imported.push(savedStory);
        // console.log(`✅ Imported: ${story.title}`);
      } catch (error) {
        console.error(`❌ Failed to import ${file}:`, error.message);
      }
    }

    return imported;
  } catch (error) {
    console.error('❌ Batch import failed:', error.message);
    throw error;
  }
}

/**
 * Generate and import new stories in batch
 */
async function generateBatchStories(count = 5) {
  try {
    // console.log(`🎲 Generating ${count} new stories...`);

    const stories = [];
    const scenarios = ['workplace', 'dating', 'neighbor', 'customer', 'family'];

    for (let i = 0; i < count; i++) {
      const scenario = scenarios[i % scenarios.length];
      // console.log(`\n📝 Generating story ${i + 1}/${count} (${scenario})...`);

      const story = await generateStory({ scenario });
      const saved = await saveToDatabase(story);
      stories.push(saved);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return stories;
  } catch (error) {
    console.error('❌ Batch generation failed:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  let importExisting = true;
  let generateNew = 0;

  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--skip-existing') importExisting = false;
    if (args[i] === '--generate') generateNew = parseInt(args[i + 1]) || 3;
    if (args[i] === '--existing-only') generateNew = 0;
  }

  try {
    // console.log('🚀 ThreadJuice Batch Content Import');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let totalImported = 0;

    // Import existing JSON files
    if (importExisting) {
      // console.log('\n📥 Phase 1: Importing existing JSON files');
      const imported = await importExistingJsonFiles();
      totalImported += imported.length;
      // console.log(`✅ Imported ${imported.length} existing stories`);
    }

    // Generate new stories
    if (generateNew > 0) {
      // console.log(`\n🎯 Phase 2: Generating ${generateNew} new stories`);
      const generated = await generateBatchStories(generateNew);
      totalImported += generated.length;
      // console.log(`✅ Generated ${generated.length} new stories`);
    }

    // Final stats
    const totalStories = await prisma.post.count();
    // console.log('\n📊 Import Summary');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log(`📈 Total stories imported this session: ${totalImported}`);
    // console.log(`📚 Total stories in database: ${totalStories}`);
    // console.log(`🌐 View all at: http://localhost:4242/blog`);
  } catch (error) {
    console.error('\n💥 Batch import failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
