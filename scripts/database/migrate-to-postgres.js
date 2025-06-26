#!/usr/bin/env node

/**
 * Migration script from SQLite to PostgreSQL (Supabase)
 * This preserves all existing data while moving to production database
 */

import { PrismaClient as SqliteClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Initialize SQLite client
const sqliteClient = new SqliteClient({
  datasourceUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db'
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');

  try {
    // 1. Migrate Personas
    console.log('📋 Migrating personas...');
    const personas = await sqliteClient.persona.findMany();
    if (personas.length > 0) {
      const { error: personaError } = await supabase
        .from('personas')
        .upsert(personas, { onConflict: 'slug' });
      
      if (personaError) throw personaError;
      console.log(`✅ Migrated ${personas.length} personas`);
    } else {
      console.log('⚠️  No personas to migrate');
    }

    // 2. Migrate Categories
    console.log('\n📋 Migrating categories...');
    const categories = await sqliteClient.category.findMany();
    if (categories.length > 0) {
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'slug' });
      
      if (categoryError) throw categoryError;
      console.log(`✅ Migrated ${categories.length} categories`);
    } else {
      console.log('⚠️  No categories to migrate');
    }

    // 3. Migrate Posts
    console.log('\n📋 Migrating posts...');
    const posts = await sqliteClient.post.findMany({
      include: {
        images: true,
        postTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (posts.length > 0) {
      // First, migrate the posts without relations
      const postsData = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image_url: post.imageUrl,
        category: post.category,
        author: post.author,
        persona_id: post.personaId,
        status: post.status,
        view_count: post.viewCount,
        upvote_count: post.upvoteCount,
        comment_count: post.commentCount,
        share_count: post.shareCount,
        bookmark_count: post.bookmarkCount,
        trending: post.trending,
        featured: post.featured,
        reddit_thread_id: post.redditThreadId,
        subreddit: post.subreddit,
        created_at: post.createdAt,
        updated_at: post.updatedAt
      }));

      const { error: postError } = await supabase
        .from('posts')
        .upsert(postsData, { onConflict: 'slug' });
      
      if (postError) throw postError;
      console.log(`✅ Migrated ${posts.length} posts`);

      // 4. Migrate Images
      console.log('\n📋 Migrating images...');
      const allImages = posts.flatMap(post => 
        post.images.map(img => ({
          id: img.id,
          post_id: img.postId,
          url: img.url,
          alt_text: img.altText,
          caption: img.caption,
          license_type: img.licenseType,
          author: img.author,
          source_name: img.sourceName,
          source_url: img.sourceUrl,
          width: img.width,
          height: img.height,
          file_size: img.fileSize,
          position: img.position,
          created_at: img.createdAt
        }))
      );

      if (allImages.length > 0) {
        const { error: imageError } = await supabase
          .from('images')
          .upsert(allImages);
        
        if (imageError) throw imageError;
        console.log(`✅ Migrated ${allImages.length} images`);
      }

      // 5. Migrate Tags
      console.log('\n📋 Migrating tags...');
      const uniqueTags = new Map();
      posts.forEach(post => {
        post.postTags.forEach(pt => {
          if (!uniqueTags.has(pt.tag.id)) {
            uniqueTags.set(pt.tag.id, {
              id: pt.tag.id,
              name: pt.tag.name,
              slug: pt.tag.slug,
              usage_count: pt.tag.usageCount,
              created_at: pt.tag.createdAt
            });
          }
        });
      });

      const tagsData = Array.from(uniqueTags.values());
      if (tagsData.length > 0) {
        const { error: tagError } = await supabase
          .from('tags')
          .upsert(tagsData, { onConflict: 'slug' });
        
        if (tagError) throw tagError;
        console.log(`✅ Migrated ${tagsData.length} tags`);

        // Migrate PostTags relations
        const postTagsData = posts.flatMap(post =>
          post.postTags.map(pt => ({
            post_id: pt.postId,
            tag_id: pt.tagId
          }))
        );

        if (postTagsData.length > 0) {
          const { error: postTagError } = await supabase
            .from('post_tags')
            .upsert(postTagsData);
          
          if (postTagError) throw postTagError;
          console.log(`✅ Migrated ${postTagsData.length} post-tag relations`);
        }
      }
    } else {
      console.log('⚠️  No posts to migrate');
    }

    // 6. Migrate Comments
    console.log('\n📋 Migrating comments...');
    const comments = await sqliteClient.comment.findMany();
    if (comments.length > 0) {
      const commentsData = comments.map(comment => ({
        id: comment.id,
        post_id: comment.postId,
        parent_id: comment.parentId,
        user_id: comment.userId,
        author_name: comment.authorName,
        content: comment.content,
        upvote_count: comment.upvoteCount,
        downvote_count: comment.downvoteCount,
        is_reddit_excerpt: comment.isRedditExcerpt,
        reddit_comment_id: comment.redditCommentId,
        reddit_score: comment.redditScore,
        status: comment.status,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt
      }));

      const { error: commentError } = await supabase
        .from('comments')
        .upsert(commentsData);
      
      if (commentError) throw commentError;
      console.log(`✅ Migrated ${comments.length} comments`);
    }

    // 7. Migrate User Interactions
    console.log('\n📋 Migrating user interactions...');
    const interactions = await sqliteClient.userInteraction.findMany();
    if (interactions.length > 0) {
      const interactionsData = interactions.map(int => ({
        id: int.id,
        user_id: int.userId,
        post_id: int.postId,
        interaction_type: int.interactionType,
        metadata: int.metadata,
        ip_address: int.ipAddress,
        user_agent: int.userAgent,
        created_at: int.createdAt
      }));

      const { error: interactionError } = await supabase
        .from('user_interactions')
        .upsert(interactionsData);
      
      if (interactionError) throw interactionError;
      console.log(`✅ Migrated ${interactions.length} user interactions`);
    }

    // 8. Migrate Analytics Events
    console.log('\n📋 Migrating analytics events...');
    const events = await sqliteClient.analyticsEvent.findMany();
    if (events.length > 0) {
      const eventsData = events.map(event => ({
        id: event.id,
        event_type: event.eventType,
        entity_type: event.entityType,
        entity_id: event.entityId,
        user_id: event.userId,
        session_id: event.sessionId,
        metadata: event.metadata,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        referrer: event.referrer,
        created_at: event.createdAt
      }));

      const { error: eventError } = await supabase
        .from('analytics_events')
        .upsert(eventsData);
      
      if (eventError) throw eventError;
      console.log(`✅ Migrated ${events.length} analytics events`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update DATABASE_URL in .env.local to point to Supabase');
    console.log('2. Replace schema.prisma with schema.postgres.prisma');
    console.log('3. Run: npx prisma generate');
    console.log('4. Update all API routes to use the new database');
    console.log('5. Test thoroughly before deploying');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
  }
}

// Run migration
migrateData();