#!/usr/bin/env tsx

/**
 * Delete All Posts Script
 * Safely removes all posts and related data from the database
 */

import { prisma } from '../src/lib/prisma';

async function deleteAllPosts() {
  console.log('🗑️  Starting content deletion...\n');

  try {
    // Count existing posts
    const postCount = await prisma.post.count();
    console.log(`📊 Found ${postCount} posts in database`);

    if (postCount === 0) {
      console.log('✅ Database is already empty!');
      return;
    }

    // Delete in correct order due to foreign key constraints
    console.log('\n🔧 Deleting related data...');

    // Delete interactions
    const interactionsDeleted = await prisma.userInteraction.deleteMany({});
    console.log(`  - Deleted ${interactionsDeleted.count} user interactions`);

    // Delete comments
    const commentsDeleted = await prisma.comment.deleteMany({});
    console.log(`  - Deleted ${commentsDeleted.count} comments`);

    // Delete post tags
    const postTagsDeleted = await prisma.postTag.deleteMany({});
    console.log(`  - Deleted ${postTagsDeleted.count} post-tag relationships`);

    // Delete images
    const imagesDeleted = await prisma.image.deleteMany({});
    console.log(`  - Deleted ${imagesDeleted.count} images`);

    // Finally delete all posts
    console.log('\n🗑️  Deleting all posts...');
    const postsDeleted = await prisma.post.deleteMany({});
    console.log(`✅ Successfully deleted ${postsDeleted.count} posts`);

    // Reset tag usage counts
    console.log('\n🏷️  Resetting tag usage counts...');
    await prisma.tag.updateMany({
      data: { usageCount: 0 },
    });

    // Reset persona story counts
    console.log('👤 Resetting persona story counts...');
    await prisma.persona.updateMany({
      data: { storyCount: 0 },
    });

    console.log('\n✅ Database cleanup complete!');
  } catch (error) {
    console.error('\n❌ Error deleting posts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllPosts();
