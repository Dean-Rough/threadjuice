#!/usr/bin/env node

// Since we're dealing with TypeScript, let me use the existing services
import { redditClient } from '../src/lib/redditClient.js';
import { sentimentAnalyzer } from '../src/lib/sentimentAnalyzer.js';
import { imageService } from '../src/lib/imageService.js';
import { contentTransformer } from '../src/lib/contentTransformer.js';
import { database } from '../src/lib/database.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory
const OUTPUT_DIR = path.join(__dirname, '../data/pipeline-test-output');

// Test configuration
const TEST_CONFIG = {
  subreddit: 'AmItheAsshole',
  postLimit: 1,
  enrichment: {
    enableImages: true,
    enableGifs: true,
    maxImagesPerStory: 3,
    maxGifsPerStory: 2
  },
  analysis: {
    enableSentiment: true,
    enableEntities: true,
    enableKeywords: true
  }
};

// Logger utility
const logger = {
  info: (stage, message, data = {}) => {
    console.log(`\n[${new Date().toISOString()}] [${stage}] ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  },
  error: (stage, message, error) => {
    console.error(`\n[${new Date().toISOString()}] [${stage}] ERROR: ${message}`);
    if (error) {
      console.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  },
  divider: () => {
    console.log('\n' + '='.repeat(80) + '\n');
  }
};

async function ensureOutputDirectory() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    logger.info('SETUP', `Output directory created: ${OUTPUT_DIR}`);
  } catch (error) {
    logger.error('SETUP', 'Failed to create output directory', error);
    throw error;
  }
}

async function saveOutput(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  logger.info('OUTPUT', `Saved to: ${filepath}`);
}

async function testPipeline() {
  logger.divider();
  logger.info('PIPELINE', 'Starting Reddit Pipeline Test', TEST_CONFIG);
  logger.divider();

  try {
    // Ensure output directory exists
    await ensureOutputDirectory();

    // Create pipeline instance
    logger.info('PIPELINE', 'Creating pipeline instance...');
    const pipeline = createRedditPipeline();

    // Stage 1: Source Acquisition
    logger.divider();
    logger.info('SOURCE', `Fetching posts from r/${TEST_CONFIG.subreddit}...`);
    
    const redditPosts = await pipeline.source.fetchPosts({
      subreddit: TEST_CONFIG.subreddit,
      limit: TEST_CONFIG.postLimit,
      timeFilter: 'week',
      sortBy: 'hot'
    });

    if (!redditPosts || redditPosts.length === 0) {
      throw new Error('No posts fetched from Reddit');
    }

    logger.info('SOURCE', `Fetched ${redditPosts.length} post(s)`);
    const post = redditPosts[0];
    
    logger.info('SOURCE', 'Post details:', {
      id: post.id,
      title: post.title,
      author: post.author,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: new Date(post.created_utc * 1000).toISOString(),
      contentLength: post.selftext?.length || 0
    });

    await saveOutput('1-source-reddit-post.json', post);

    // Stage 2: Analysis
    logger.divider();
    logger.info('ANALYSIS', 'Analyzing post content...');

    const analysisResults = {};

    // Extract entities
    if (TEST_CONFIG.analysis.enableEntities) {
      logger.info('ANALYSIS', 'Extracting entities...');
      const entities = await pipeline.analysis.extractEntities(post.selftext || post.title);
      analysisResults.entities = entities;
      logger.info('ANALYSIS', `Found ${entities.length} entities:`, 
        entities.map(e => ({ text: e.text, type: e.type, salience: e.salience }))
      );
    }

    // Analyze sentiment
    if (TEST_CONFIG.analysis.enableSentiment) {
      logger.info('ANALYSIS', 'Analyzing sentiment...');
      const sentiment = await pipeline.analysis.analyzeSentiment(post.selftext || post.title);
      analysisResults.sentiment = sentiment;
      logger.info('ANALYSIS', 'Sentiment analysis:', sentiment);
    }

    // Extract keywords
    if (TEST_CONFIG.analysis.enableKeywords) {
      logger.info('ANALYSIS', 'Extracting keywords...');
      const keywords = await pipeline.analysis.extractKeywords(post.selftext || post.title);
      analysisResults.keywords = keywords;
      logger.info('ANALYSIS', `Found ${keywords.length} keywords:`, keywords);
    }

    await saveOutput('2-analysis-results.json', analysisResults);

    // Stage 3: Enrichment
    logger.divider();
    logger.info('ENRICHMENT', 'Enriching content...');

    const enrichmentResults = {
      images: [],
      gifs: []
    };

    // Search for relevant images
    if (TEST_CONFIG.enrichment.enableImages && analysisResults.keywords?.length > 0) {
      logger.info('ENRICHMENT', 'Searching for images...');
      const searchQuery = analysisResults.keywords.slice(0, 3).join(' ');
      
      try {
        const images = await pipeline.enrichment.searchImages(
          searchQuery,
          TEST_CONFIG.enrichment.maxImagesPerStory
        );
        enrichmentResults.images = images;
        logger.info('ENRICHMENT', `Found ${images.length} images:`, 
          images.map(img => ({ 
            description: img.description, 
            url: img.urls?.regular,
            photographer: img.user?.name 
          }))
        );
      } catch (error) {
        logger.error('ENRICHMENT', 'Failed to fetch images', error);
      }
    }

    // Search for relevant GIFs
    if (TEST_CONFIG.enrichment.enableGifs) {
      logger.info('ENRICHMENT', 'Searching for GIFs...');
      
      // Determine reaction type based on sentiment
      const reactionType = analysisResults.sentiment?.score > 0.3 ? 'happy' : 
                          analysisResults.sentiment?.score < -0.3 ? 'angry' : 'surprised';
      
      try {
        const gifs = await pipeline.enrichment.searchGifs(
          reactionType,
          TEST_CONFIG.enrichment.maxGifsPerStory
        );
        enrichmentResults.gifs = gifs;
        logger.info('ENRICHMENT', `Found ${gifs.length} GIFs:`, 
          gifs.map(gif => ({ 
            title: gif.title, 
            url: gif.images?.fixed_height?.url 
          }))
        );
      } catch (error) {
        logger.error('ENRICHMENT', 'Failed to fetch GIFs', error);
      }
    }

    await saveOutput('3-enrichment-results.json', enrichmentResults);

    // Stage 4: Transformation
    logger.divider();
    logger.info('TRANSFORM', 'Transforming to ThreadJuice format...');

    const transformedStory = await pipeline.transform.toThreadJuiceFormat({
      source: 'reddit',
      originalData: post,
      analysis: analysisResults,
      enrichment: enrichmentResults,
      metadata: {
        pipeline_version: '1.0.0',
        processed_at: new Date().toISOString()
      }
    });

    logger.info('TRANSFORM', 'Story transformed:', {
      id: transformedStory.id,
      title: transformedStory.title,
      slug: transformedStory.slug,
      author: transformedStory.author,
      category: transformedStory.category,
      contentLength: transformedStory.content.length,
      hasImages: transformedStory.images?.length > 0,
      hasGifs: transformedStory.gifs?.length > 0,
      sentiment: transformedStory.sentiment,
      engagementScore: transformedStory.engagement_score
    });

    await saveOutput('4-transformed-story.json', transformedStory);

    // Stage 5: Output
    logger.divider();
    logger.info('OUTPUT', 'Saving to database...');

    try {
      const savedStory = await pipeline.output.save(transformedStory);
      logger.info('OUTPUT', 'Story saved to database:', {
        id: savedStory.id,
        created_at: savedStory.created_at
      });
      await saveOutput('5-saved-story.json', savedStory);
    } catch (error) {
      logger.error('OUTPUT', 'Failed to save to database', error);
      logger.info('OUTPUT', 'Falling back to file output...');
      
      const filename = `story-${transformedStory.slug}-${Date.now()}.json`;
      await saveOutput(filename, transformedStory);
    }

    // Final summary
    logger.divider();
    logger.info('PIPELINE', 'Pipeline execution completed successfully!');
    logger.info('PIPELINE', 'Summary:', {
      source: 'Reddit',
      subreddit: TEST_CONFIG.subreddit,
      postId: post.id,
      title: post.title,
      stagesCompleted: ['source', 'analysis', 'enrichment', 'transform', 'output'],
      outputDirectory: OUTPUT_DIR
    });
    logger.divider();

  } catch (error) {
    logger.error('PIPELINE', 'Pipeline execution failed', error);
    process.exit(1);
  }
}

// Run test
testPipeline().catch(error => {
  logger.error('MAIN', 'Unhandled error', error);
  process.exit(1);
});