#!/usr/bin/env tsx

/**
 * Batch Story Ingestion Script - Direct Version
 * Processes 10 stories from mixed sources without strict env validation
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local file explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set NODE_ENV before importing prisma to ensure proper environment
if (!process.env.NODE_ENV) {
  // Use type assertion to bypass readonly restriction only when necessary
  (process.env as any).NODE_ENV = 'development';
}

import { prisma } from '../src/lib/prisma';

interface IngestionResult {
  source: string;
  success: boolean;
  title?: string;
  error?: string;
}

async function batchIngestStories() {
  console.log('🚀 Starting batch ingestion of 10 stories from mixed sources...\n');
  
  const results: IngestionResult[] = [];
  let totalProcessed = 0;
  const targetStories = 10;
  
  try {
    // Check API configurations
    console.log('🔍 Checking API configurations...');
    console.log(`  - OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  - Reddit: ${process.env.REDDIT_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  - Twitter: ${process.env.TWITTER_BEARER_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`  - Pexels: ${process.env.PEXELS_API_KEY ? '✅ Configured' : '❌ Not configured'}\n`);
    
    // Source 1: Reddit Content (5 stories)
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      console.log('📱 Processing Reddit content...');
      try {
        const { contentIngestionService } = await import('../src/lib/contentIngestionService');
        
        const redditJob = await contentIngestionService.startIngestionJob({
          subreddits: ['tifu', 'AmItheAsshole', 'relationships', 'AskReddit', 'pettyrevenge'],
          limit_per_subreddit: 1,
          min_viral_score: 4,
          max_age_hours: 72,
          auto_publish: true
        });
        
        // Wait for Reddit job to complete
        let redditCompleted = false;
        let attempts = 0;
        while (!redditCompleted && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
          const status = contentIngestionService.getJobStatus(redditJob.id);
          if (status && (status.status === 'completed' || status.status === 'failed')) {
            redditCompleted = true;
            if (status.status === 'completed') {
              console.log(`✅ Reddit: Created ${status.posts_created} posts`);
              totalProcessed += status.posts_created;
              for (let i = 0; i < status.posts_created; i++) {
                results.push({ source: 'Reddit', success: true });
              }
            } else {
              console.log(`❌ Reddit job failed: ${status.error_message}`);
              results.push({ source: 'Reddit', success: false, error: status.error_message });
            }
          }
          attempts++;
        }
      } catch (error) {
        console.error('❌ Reddit ingestion error:', error);
        results.push({ source: 'Reddit', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    } else {
      console.log('⚠️  Skipping Reddit - API not configured');
    }
    
    // Source 2: AI-Generated Stories (3 stories)
    if (process.env.OPENAI_API_KEY && totalProcessed < targetStories) {
      console.log('\n🤖 Generating AI stories...');
      const aiStoriesToGenerate = Math.min(3, targetStories - totalProcessed);
      
      const { contentTransformer } = await import('../src/lib/contentTransformer');
      const { imageService } = await import('../src/lib/imageService');
      
      for (let i = 0; i < aiStoriesToGenerate; i++) {
        try {
          // Generate trending topics
          const topics = [
            'tech billionaire drama at exclusive conference',
            'viral workplace malicious compliance story',
            'dating app disaster turns into unexpected friendship',
            'neighborhood HOA karen gets instant karma',
            'entitled parent meets their match at theme park'
          ];
          
          const topic = topics[Math.floor(Math.random() * topics.length)];
          console.log(`  - Generating story about: ${topic}`);
          
          // Create a mock Reddit post structure for the transformer
          const mockPost = {
            id: `ai_${Date.now()}_${i}`,
            title: topic,
            selftext: `Generate an engaging story about: ${topic}`,
            author: 'AI_Generated',
            score: 10000 + Math.floor(Math.random() * 5000),
            num_comments: 500 + Math.floor(Math.random() * 500),
            created_utc: Date.now() / 1000,
            subreddit: 'ThreadJuice_AI',
            url: `https://threadjuice.com/ai/${Date.now()}`,
            permalink: `/ai/${Date.now()}`
          };
          
          // Transform with AI
          const transformed = await contentTransformer.transformContent(mockPost as any, []);
          
          if (transformed && contentTransformer.validateContent(transformed)) {
            // Get image - extract text content from sections for image search
            const contentText = transformed.content?.sections
              .map(section => section.content)
              .join(' ')
              .slice(0, 500) || transformed.excerpt;
              
            const imageResult = await imageService.findBestImageIntelligent(
              transformed.title,
              contentText,
              transformed.category
            );
            const processedImage = await imageService.processImageForStorage(imageResult);
            
            // Get persona
            const persona = await prisma.persona.findFirst({
              where: { slug: transformed.persona }
            });
            
            // Create post
            const post = await prisma.post.create({
              data: {
                title: transformed.title,
                slug: transformed.slug,
                excerpt: transformed.excerpt,
                content: transformed.content,
                imageUrl: processedImage.processed_url,
                category: transformed.category,
                author: persona?.name || 'ThreadJuice AI',
                personaId: persona?.id,
                status: 'published',
                trending: transformed.viral_score >= 7,
                featured: transformed.viral_score >= 8,
                viewCount: Math.floor(Math.random() * 5000) + 1000,
                upvoteCount: Math.floor(Math.random() * 500) + 100,
                commentCount: Math.floor(Math.random() * 100) + 20,
                shareCount: Math.floor(Math.random() * 50) + 10,
                bookmarkCount: Math.floor(Math.random() * 30) + 5
              }
            });
            
            console.log(`  ✅ Created: "${transformed.title}"`);
            results.push({ source: 'AI Generated', success: true, title: transformed.title });
            totalProcessed++;
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error('  ❌ AI generation error:', error);
          results.push({ source: 'AI Generated', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    } else if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  Skipping AI generation - OpenAI API not configured');
    }
    
    // Source 3: Twitter Drama (2 stories)
    if (totalProcessed < targetStories && (process.env.TWITTER_BEARER_TOKEN || true)) {
      console.log('\n🎭 Checking for Twitter drama...');
      try {
        const { socialDramaAggregator } = await import('../src/lib/socialDramaAggregator');
        const { twitterToStoryConverter } = await import('../src/lib/twitterToStoryConverter');
        const { imageService } = await import('../src/lib/imageService');
        
        const { dramas, source_used } = await socialDramaAggregator.smartDramaDetection();
        console.log(`  - Found ${dramas.length} drama threads via ${source_used}`);
        
        const twitterStoriesToProcess = Math.min(2, targetStories - totalProcessed, dramas.length);
        
        for (let i = 0; i < twitterStoriesToProcess; i++) {
          try {
            const drama = dramas[i];
            console.log(`  - Converting drama: "${drama.original_tweet.text.slice(0, 50)}..."`);
            
            // Convert to story
            const story = await twitterToStoryConverter.convertDramaToStory(drama);
            
            if (story) {
              // Get image
              const imageResult = await imageService.findBestImageIntelligent(
                story.title,
                story.excerpt,
                story.category
              );
              const processedImage = await imageService.processImageForStorage(imageResult);
              
              // Get persona
              const persona = await prisma.persona.findFirst({
                where: { slug: story.author }
              });
              
              // Create post
              const post = await prisma.post.create({
                data: {
                  title: story.title,
                  slug: story.slug,
                  excerpt: story.excerpt,
                  content: story.excerpt,
                  imageUrl: processedImage.processed_url,
                  category: story.category,
                  author: persona?.name || 'ThreadJuice',
                  personaId: persona?.id,
                  status: 'published',
                  trending: drama.drama_score >= 80,
                  featured: drama.drama_score >= 90,
                  viewCount: Math.floor((drama.original_tweet.metrics.retweets + drama.original_tweet.metrics.likes + drama.original_tweet.metrics.replies) * 0.1),
                  upvoteCount: Math.floor((drama.original_tweet.metrics.retweets + drama.original_tweet.metrics.likes + drama.original_tweet.metrics.replies) * 0.05),
                  commentCount: drama.replies.length,
                  shareCount: Math.floor((drama.original_tweet.metrics.retweets + drama.original_tweet.metrics.likes + drama.original_tweet.metrics.replies) * 0.02),
                  bookmarkCount: Math.floor((drama.original_tweet.metrics.retweets + drama.original_tweet.metrics.likes + drama.original_tweet.metrics.replies) * 0.01)
                }
              });
              
              console.log(`  ✅ Created: "${story.title}"`);
              results.push({ source: 'Twitter Drama', success: true, title: story.title });
              totalProcessed++;
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error('  ❌ Twitter conversion error:', error);
            results.push({ source: 'Twitter Drama', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
      } catch (error) {
        console.error('❌ Twitter drama detection error:', error);
        results.push({ source: 'Twitter Drama', success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    // Summary
    console.log('\n📊 Batch Ingestion Summary');
    console.log('═'.repeat(50));
    console.log(`Total stories processed: ${totalProcessed}`);
    console.log(`Success rate: ${results.filter(r => r.success).length}/${results.length}`);
    
    // Group by source
    const sourceBreakdown = results.reduce((acc, r) => {
      if (!acc[r.source]) acc[r.source] = { success: 0, failed: 0 };
      if (r.success) acc[r.source].success++;
      else acc[r.source].failed++;
      return acc;
    }, {} as Record<string, { success: number; failed: number }>);
    
    console.log('\nBreakdown by source:');
    Object.entries(sourceBreakdown).forEach(([source, counts]) => {
      console.log(`  - ${source}: ${counts.success} success, ${counts.failed} failed`);
    });
    
    // List successful stories
    console.log('\n✅ Successfully created stories:');
    results.filter(r => r.success && r.title).forEach(r => {
      console.log(`  - [${r.source}] ${r.title}`);
    });
    
    // List errors
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(r => {
        console.log(`  - [${r.source}] ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during batch ingestion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the batch ingestion
batchIngestStories();