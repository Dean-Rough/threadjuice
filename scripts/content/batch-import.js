#!/usr/bin/env node

/**
 * ThreadJuice Batch Content Import
 *
 * Import multiple stories to database in batch
 * Now uses the unified story generation system
 */

import {
  generateStory,
  saveToDatabase,
  generateBulkStories,
} from './generate-story-unified.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Import existing JSON story files to database
 */
async function importExistingJsonFiles() {
  try {
    console.log('📂 Scanning for existing story JSON files...');

    const files = await fs.readdir(process.cwd());
    const storyFiles = files.filter(
      f =>
        (f.includes('auto-generated-') || f.includes('generated-')) &&
        f.endsWith('.json')
    );

    console.log(`Found ${storyFiles.length} story files`);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of storyFiles) {
      try {
        const content = await fs.readFile(
          path.join(process.cwd(), file),
          'utf8'
        );
        const story = JSON.parse(content);

        // Check if already exists
        const existing = await prisma.post.findUnique({
          where: { slug: story.slug },
        });

        if (existing) {
          console.log(`⏭️  Skipping "${story.title}" - already exists`);
          skipped++;
          continue;
        }

        // Import using unified save function
        await saveToDatabase(story);
        console.log(`✅ Imported: "${story.title}"`);
        imported++;
      } catch (error) {
        console.error(`❌ Failed to import ${file}:`, error.message);
        failed++;
      }
    }

    return { imported, skipped, failed, total: storyFiles.length };
  } catch (error) {
    console.error('❌ Import scan failed:', error.message);
    throw error;
  }
}

/**
 * Generate and import new stories
 */
async function generateAndImportStories(count = 5) {
  console.log(`\n🎲 Generating ${count} new stories...`);

  const { stories, errors } = await generateBulkStories(count);

  let imported = 0;
  for (const story of stories) {
    try {
      await saveToDatabase(story);
      console.log(`✅ Generated & saved: "${story.title}"`);
      imported++;
    } catch (error) {
      console.error(`❌ Failed to save generated story:`, error.message);
      errors.push(error.message);
    }
  }

  return { generated: stories.length, imported, errors };
}

/**
 * Main batch import function
 */
async function batchImport(options = {}) {
  console.log('🚀 ThreadJuice Batch Import');
  console.log('━'.repeat(50));

  const results = {
    existing: { imported: 0, skipped: 0, failed: 0, total: 0 },
    generated: { generated: 0, imported: 0, errors: [] },
  };

  try {
    // Import existing files if requested
    if (options.importExisting !== false) {
      console.log('\n📥 Phase 1: Import existing files');
      results.existing = await importExistingJsonFiles();
    }

    // Generate new stories if requested
    if (options.generateCount > 0) {
      console.log('\n🎨 Phase 2: Generate new stories');
      results.generated = await generateAndImportStories(options.generateCount);
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('═'.repeat(50));

    if (options.importExisting !== false) {
      console.log('\nExisting Files:');
      console.log(`  Total found: ${results.existing.total}`);
      console.log(`  Imported: ${results.existing.imported}`);
      console.log(`  Skipped: ${results.existing.skipped}`);
      console.log(`  Failed: ${results.existing.failed}`);
    }

    if (options.generateCount > 0) {
      console.log('\nGenerated Stories:');
      console.log(`  Generated: ${results.generated.generated}`);
      console.log(`  Imported: ${results.generated.imported}`);
      console.log(`  Errors: ${results.generated.errors.length}`);
    }

    const totalImported =
      results.existing.imported + results.generated.imported;
    console.log(`\n✅ Total stories imported: ${totalImported}`);
  } catch (error) {
    console.error('\n💥 Batch import failed:', error.message);
    throw error;
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  const options = {
    importExisting: true,
    generateCount: 0,
  };

  try {
    switch (command) {
      case 'all':
        // Import existing and generate 5 new
        options.generateCount = 5;
        break;

      case 'import':
        // Only import existing files
        options.generateCount = 0;
        break;

      case 'generate':
        // Only generate new stories
        options.importExisting = false;
        options.generateCount = parseInt(args[1]) || 5;
        break;

      case 'help':
        console.log(`
ThreadJuice Batch Import

Usage:
  node batch-import.js [command] [options]

Commands:
  all         Import existing files AND generate 5 new stories (default)
  import      Only import existing JSON files
  generate n  Only generate n new stories
  help        Show this help

Examples:
  node batch-import.js                # Import existing + generate 5 new
  node batch-import.js import         # Only import existing files
  node batch-import.js generate 10    # Only generate 10 new stories
        `);
        process.exit(0);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Use "node batch-import.js help" for usage information');
        process.exit(1);
    }

    await batchImport(options);
  } catch (error) {
    console.error('Batch import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for programmatic use
export { batchImport, importExistingJsonFiles, generateAndImportStories };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
