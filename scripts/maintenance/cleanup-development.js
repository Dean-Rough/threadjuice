#!/usr/bin/env node

/**
 * ThreadJuice Development Cleanup
 *
 * Removes development debris and temporary files
 * Prepares codebase for production
 */

import fs from 'fs/promises';
import path from 'path';

const CLEANUP_PATTERNS = {
  // JSON story files (will be moved to database)
  jsonFiles: /^(auto-generated-|first-story-|new-story-|test-short-story)/,

  // Backup files
  backupFiles:
    /(pre-comment-fix-backup|pre-emoji-removal-backup|pre-quiz-removal-backup|backup\.json)$/,

  // Development test scripts
  testScripts: /^(test-|generate-|fix-|remove-|add-|get-|view-)/,

  // Debug files
  debugFiles: /\.(png|jpg|jpeg)$|debug|screenshot/,

  // Temporary files
  tempFiles: /^(new-modular-story|reddit-scraping-plan\.md)$/,
};

/**
 * Scan directory for files to clean up
 */
async function scanForCleanup() {
  try {
    const files = await fs.readdir(process.cwd());
    const toCleanup = {
      jsonFiles: [],
      backupFiles: [],
      testScripts: [],
      debugFiles: [],
      tempFiles: [],
    };

    for (const file of files) {
      const stat = await fs.stat(file);
      if (stat.isFile()) {
        // Categorize files for cleanup
        if (CLEANUP_PATTERNS.jsonFiles.test(file)) {
          toCleanup.jsonFiles.push(file);
        } else if (CLEANUP_PATTERNS.backupFiles.test(file)) {
          toCleanup.backupFiles.push(file);
        } else if (
          CLEANUP_PATTERNS.testScripts.test(file) &&
          file.endsWith('.js')
        ) {
          toCleanup.testScripts.push(file);
        } else if (CLEANUP_PATTERNS.debugFiles.test(file)) {
          toCleanup.debugFiles.push(file);
        } else if (CLEANUP_PATTERNS.tempFiles.test(file)) {
          toCleanup.tempFiles.push(file);
        }
      }
    }

    return toCleanup;
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    throw error;
  }
}

/**
 * Create backup directory for important files
 */
async function createBackupDirectory() {
  const backupDir = path.join(
    process.cwd(),
    'archive',
    'development-cleanup-' + Date.now()
  );
  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

/**
 * Move files to backup before deletion
 */
async function backupFiles(files, backupDir) {
  const backed = [];

  for (const file of files) {
    try {
      const destPath = path.join(backupDir, file);
      await fs.copyFile(file, destPath);
      backed.push(file);
    } catch (error) {
      console.error(`⚠️  Failed to backup ${file}:`, error.message);
    }
  }

  return backed;
}

/**
 * Delete files safely
 */
async function deleteFiles(files) {
  const deleted = [];

  for (const file of files) {
    try {
      await fs.unlink(file);
      deleted.push(file);
    } catch (error) {
      console.error(`⚠️  Failed to delete ${file}:`, error.message);
    }
  }

  return deleted;
}

/**
 * Clean up source backup directory
 */
async function cleanupSrcBackup() {
  const srcBackupPath = 'src-backup-frankensteined';

  try {
    const stat = await fs.stat(srcBackupPath);
    if (stat.isDirectory()) {
      await fs.rm(srcBackupPath, { recursive: true, force: true });
      // console.log('🗑️  Removed src-backup-frankensteined directory');
      return true;
    }
  } catch (error) {
    // Directory doesn't exist, which is fine
    return false;
  }

  return false;
}

/**
 * Clean up test results and reports
 */
async function cleanupTestResults() {
  const dirsToClean = ['test-results', 'coverage', 'playwright-report'];
  let cleaned = 0;

  for (const dir of dirsToClean) {
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) {
        await fs.rm(dir, { recursive: true, force: true });
        // console.log(`🗑️  Removed ${dir} directory`);
        cleaned++;
      }
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  }

  return cleaned;
}

/**
 * Update package.json scripts for production
 */
async function updatePackageScripts() {
  try {
    const packagePath = 'package.json';
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);

    // Add production scripts
    const productionScripts = {
      // Content management
      'content:generate': 'node scripts/content/generate-story.js',
      'content:batch': 'node scripts/content/batch-import.js',
      'content:import': 'node scripts/content/batch-import.js --existing-only',

      // Maintenance
      'maintenance:cleanup': 'node scripts/maintenance/cleanup-development.js',
      'maintenance:optimize': 'node scripts/maintenance/optimize-images.js',

      // Production deployment
      'deploy:check': 'node scripts/deployment/environment-check.js',
      'deploy:build': 'next build && next export',

      // Database
      'db:setup': 'prisma generate && prisma migrate deploy',
      'db:seed': 'node scripts/content/seed-database.js',
    };

    packageJson.scripts = {
      ...packageJson.scripts,
      ...productionScripts,
    };

    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
    // console.log('📝 Updated package.json with production scripts');

    return true;
  } catch (error) {
    console.error('⚠️  Failed to update package.json:', error.message);
    return false;
  }
}

/**
 * Main cleanup execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipBackup = args.includes('--skip-backup');

  try {
    // console.log('🧹 ThreadJuice Development Cleanup');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (dryRun) {
      // console.log('🔍 DRY RUN MODE - No files will be deleted');
    }

    // Scan for cleanup targets
    // console.log('\n📊 Scanning for cleanup targets...');
    const toCleanup = await scanForCleanup();

    // Display cleanup summary
    const totalFiles = Object.values(toCleanup).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    // console.log(`\n📋 Cleanup Summary:`);
    // console.log(`   📄 JSON story files: ${toCleanup.jsonFiles.length}`);
    // console.log(`   💾 Backup files: ${toCleanup.backupFiles.length}`);
    // console.log(`   🧪 Test scripts: ${toCleanup.testScripts.length}`);
    // console.log(`   🖼️  Debug files: ${toCleanup.debugFiles.length}`);
    // console.log(`   📝 Temp files: ${toCleanup.tempFiles.length}`);
    // console.log(`   📊 Total files: ${totalFiles}`);

    if (totalFiles === 0) {
      // console.log('\n✨ No cleanup needed - codebase is already clean!');
      return;
    }

    if (dryRun) {
      // console.log('\n📋 Files that would be cleaned:');
      Object.entries(toCleanup).forEach(([category, files]) => {
        if (files.length > 0) {
          // console.log(`\n${category}:`);
          files.forEach(file => {
            // console.log(`  - ${file}`);
          });
        }
      });
      return;
    }

    // Create backup if requested
    let backupDir;
    if (!skipBackup) {
      // console.log('\n💾 Creating backup of files to be deleted...');
      backupDir = await createBackupDirectory();

      const allFiles = Object.values(toCleanup).flat();
      const backedUp = await backupFiles(allFiles, backupDir);
      // console.log(`✅ Backed up ${backedUp.length} files to: ${backupDir}`);
    }

    // Delete files by category
    let totalDeleted = 0;

    // console.log('\n🗑️  Cleaning up development debris...');

    for (const [category, files] of Object.entries(toCleanup)) {
      if (files.length > 0) {
        // console.log(`\n${category}: ${files.length} files`);
        const deleted = await deleteFiles(files);
        totalDeleted += deleted.length;

        deleted.forEach(file => {
          // console.log(`  ✅ Deleted: ${file}`);
        });
      }
    }

    // Clean up directories
    // console.log('\n🗂️  Cleaning up directories...');
    const srcBackupCleaned = await cleanupSrcBackup();
    const testDirsCleaned = await cleanupTestResults();

    // Update package.json
    // console.log('\n📦 Updating package.json scripts...');
    await updatePackageScripts();

    // Final summary
    // console.log('\n🎉 Cleanup Complete!');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // console.log(`📊 Files deleted: ${totalDeleted}`);
    // console.log(`📁 Directories cleaned: ${testDirsCleaned + (srcBackupCleaned ? 1 : 0)}`);
    if (backupDir) {
      // console.log(`💾 Backup location: ${backupDir}`);
    }
    // console.log('\n🚀 Your codebase is now production-ready!');
    // console.log('📋 Next steps:');
    // console.log('   1. Run: npm run content:import (import existing stories to DB)');
    // console.log('   2. Run: npm run content:generate (create new stories)');
    // console.log('   3. Run: npm run deploy:check (verify production setup)');
  } catch (error) {
    console.error('\n💥 Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
