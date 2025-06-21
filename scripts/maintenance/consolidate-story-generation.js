#!/usr/bin/env node

/**
 * Consolidate Story Generation Scripts
 * 
 * This script helps migrate from multiple scattered story generation scripts
 * to the new unified system
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

// Scripts to be deprecated/archived
const SCRIPTS_TO_ARCHIVE = [
  // Root level scripts
  'generate-full-automated-story.js',
  'import-story-to-supabase.js',
  'delete-story.js',
  'cleanup-tech-ceo-stories.js',
  
  // Scripts directory
  'scripts/storygen-1.js',
  'scripts/fix-images.js',
  'scripts/test-quality-gate.js',
  'scripts/test-twitter-drama.js',
  
  // Deprecated scripts (already in deprecated folder)
  'scripts/deprecated/generate-dynamic-story.js',
  'scripts/deprecated/generate-enhanced-story.js',
  'scripts/deprecated/generate-intelligent-story.js',
  'scripts/deprecated/generate-polished-story.js',
  'scripts/deprecated/generate-real-story.js',
  'scripts/deprecated/generate-sample-story.js',
  'scripts/deprecated/generate-story-supabase.js',
  'scripts/deprecated/generate-story.js',
  'scripts/deprecated/simulate-live-twitter-story.js',
];

// Files to update references in
const FILES_TO_UPDATE = [
  'package.json',
  'docs/README.md',
  'docs/ROADMAP.md',
  'CLAUDE.md',
];

async function archiveScript(scriptPath) {
  try {
    const fullPath = path.join(rootDir, scriptPath);
    const archivePath = path.join(rootDir, 'archive', 'story-generation-scripts', scriptPath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      console.log(`⏭️  Skipping ${scriptPath} - not found`);
      return;
    }
    
    // Create archive directory
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    
    // Move file
    await fs.rename(fullPath, archivePath);
    console.log(`📦 Archived: ${scriptPath}`);
  } catch (error) {
    console.error(`❌ Failed to archive ${scriptPath}:`, error.message);
  }
}

async function updateReferences() {
  console.log('\n📝 Updating references in documentation...\n');
  
  for (const file of FILES_TO_UPDATE) {
    try {
      const fullPath = path.join(rootDir, file);
      let content = await fs.readFile(fullPath, 'utf8');
      let updated = false;
      
      // Replace old script references with new unified script
      const replacements = [
        ['generate-full-automated-story.js', 'scripts/content/generate-story-unified.js'],
        ['scripts/storygen-1.js', 'scripts/content/generate-story-unified.js'],
        ['scripts/content/generate-story.js', 'scripts/content/generate-story-unified.js'],
      ];
      
      for (const [oldRef, newRef] of replacements) {
        if (content.includes(oldRef)) {
          content = content.replace(new RegExp(oldRef, 'g'), newRef);
          updated = true;
        }
      }
      
      if (updated) {
        await fs.writeFile(fullPath, content);
        console.log(`✅ Updated references in ${file}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update ${file}:`, error.message);
    }
  }
}

async function createMigrationGuide() {
  const guide = `# Story Generation Migration Guide

## Overview
All story generation functionality has been consolidated into a single unified script.

## New Unified Script
\`scripts/content/generate-story-unified.js\`

## Usage

### Generate a single story:
\`\`\`bash
node scripts/content/generate-story-unified.js
\`\`\`

### Generate with options:
\`\`\`bash
node scripts/content/generate-story-unified.js generate --category workplace --source reddit
\`\`\`

### Generate multiple stories:
\`\`\`bash
node scripts/content/generate-story-unified.js bulk 10
\`\`\`

### Save to file instead of database:
\`\`\`bash
node scripts/content/generate-story-unified.js generate --save-file --no-db
\`\`\`

## Deprecated Scripts
The following scripts have been archived:
- generate-full-automated-story.js
- scripts/storygen-1.js
- scripts/content/generate-story.js (old version)
- All scripts in scripts/deprecated/

## API Integration
The API routes now use the unified story generation service:
- \`/api/admin/generate\` - Generate stories via API
- \`src/lib/storyIngestion.ts\` - TypeScript service layer

## Benefits
1. Single source of truth for story generation
2. Consistent configuration across all generation methods
3. Easier maintenance and updates
4. Better error handling and logging
5. Support for both CLI and API usage

## Migration Steps
1. Update any scripts or cron jobs to use the new unified script
2. Update environment variables if needed
3. Test generation with the new script
4. Remove references to old scripts
`;

  await fs.writeFile(path.join(rootDir, 'docs', 'STORY_GENERATION_MIGRATION.md'), guide);
  console.log('\n📚 Created migration guide: docs/STORY_GENERATION_MIGRATION.md');
}

async function updatePackageJson() {
  console.log('\n📦 Updating package.json scripts...\n');
  
  try {
    const packagePath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    
    // Update or add story generation scripts
    pkg.scripts = pkg.scripts || {};
    
    // Remove old scripts
    delete pkg.scripts['generate:story'];
    delete pkg.scripts['story:generate'];
    delete pkg.scripts['content:generate'];
    
    // Add new unified scripts
    pkg.scripts['story:generate'] = 'node scripts/content/generate-story-unified.js';
    pkg.scripts['story:bulk'] = 'node scripts/content/generate-story-unified.js bulk';
    pkg.scripts['story:help'] = 'node scripts/content/generate-story-unified.js help';
    
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('✅ Updated package.json scripts');
  } catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
  }
}

async function cleanupDeprecatedFolder() {
  console.log('\n🧹 Cleaning up deprecated folder...\n');
  
  try {
    const deprecatedPath = path.join(rootDir, 'scripts', 'deprecated');
    const files = await fs.readdir(deprecatedPath);
    
    for (const file of files) {
      if (file.includes('generate') && file.endsWith('.js')) {
        const oldPath = path.join(deprecatedPath, file);
        const archivePath = path.join(rootDir, 'archive', 'story-generation-scripts', 'deprecated', file);
        
        await fs.mkdir(path.dirname(archivePath), { recursive: true });
        await fs.rename(oldPath, archivePath);
        console.log(`📦 Archived deprecated: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to cleanup deprecated folder:', error.message);
  }
}

async function main() {
  console.log('🔧 Consolidating Story Generation Scripts');
  console.log('=' .repeat(50));
  
  // Create archive directory
  await fs.mkdir(path.join(rootDir, 'archive', 'story-generation-scripts'), { recursive: true });
  
  // Archive old scripts
  console.log('\n📦 Archiving old scripts...\n');
  for (const script of SCRIPTS_TO_ARCHIVE) {
    await archiveScript(script);
  }
  
  // Update references
  await updateReferences();
  
  // Update package.json
  await updatePackageJson();
  
  // Cleanup deprecated folder
  await cleanupDeprecatedFolder();
  
  // Create migration guide
  await createMigrationGuide();
  
  console.log('\n✅ Consolidation complete!');
  console.log('\n📚 Next steps:');
  console.log('1. Review docs/STORY_GENERATION_MIGRATION.md');
  console.log('2. Test the new unified script: npm run story:generate');
  console.log('3. Update any external scripts or cron jobs');
  console.log('4. Commit the changes');
}

main().catch(console.error);