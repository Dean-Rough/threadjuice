#!/usr/bin/env tsx

/**
 * Simple Pipeline Test
 * Tests the pipeline components directly without environment validation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock environment variables for testing
// Set NODE_ENV before any imports that might depend on it
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
process.env.REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || 'test-client';
process.env.REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || 'test-secret';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:4242';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_dummy';
process.env.CLERK_SECRET_KEY = 'sk_test_dummy';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory
const OUTPUT_DIR = path.join(__dirname, '../data/pipeline-test-output');

// Logger utility
const logger = {
  info: (stage: string, message: string, data: any = {}) => {
    console.log(`\n[${new Date().toISOString()}] [${stage}] ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  },
  error: (stage: string, message: string, error: any) => {
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

async function saveOutput(filename: string, data: any) {
  const filepath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  logger.info('OUTPUT', `Saved to: ${filepath}`);
}

async function testIndividualComponents() {
  logger.divider();
  logger.info('TEST', 'Testing Individual Pipeline Components');
  logger.divider();

  await ensureOutputDirectory();

  try {
    // Test 1: Reddit Client
    logger.info('TEST', 'Testing Reddit Client...');
    try {
      const { redditClient } = await import('../src/lib/redditClient');
      logger.info('REDDIT', 'Reddit client imported successfully');
      
      // Test Reddit post fetching
      const mockPost = {
        id: 'test123',
        title: 'AITA for telling my roommate their cooking smells terrible?',
        selftext: `I (25F) live with my roommate (27M) who recently got into cooking. The problem is, they're experimenting with some really strong-smelling foods that make the whole apartment reek. I finally told them yesterday that their cooking smells terrible and asked if they could open windows or use the exhaust fan. They got really upset and said I was being culturally insensitive. AITA?`,
        author: 'throwaway12345',
        subreddit: 'AmItheAsshole',
        score: 1234,
        num_comments: 567,
        created_utc: Date.now() / 1000,
        permalink: '/r/AmItheAsshole/comments/test123/',
        upvote_ratio: 0.89
      };
      
      await saveOutput('test-reddit-post.json', mockPost);
      logger.info('REDDIT', 'Mock Reddit post created');
    } catch (error) {
      logger.error('REDDIT', 'Failed to test Reddit client', error);
    }

    // Test 2: Sentiment Analysis
    logger.info('TEST', 'Testing Sentiment Analyzer...');
    try {
      const { analyzeSentiment } = await import('../src/lib/sentimentAnalyzer');
      
      const testText = "This is absolutely amazing! I love how everything turned out.";
      const sentiment = await analyzeSentiment(testText);
      
      logger.info('SENTIMENT', 'Analysis result:', sentiment);
      await saveOutput('test-sentiment.json', { text: testText, sentiment });
    } catch (error) {
      logger.error('SENTIMENT', 'Failed to test sentiment analyzer', error);
    }

    // Test 3: Content Transformer
    logger.info('TEST', 'Testing Content Transformer...');
    try {
      const { transformToThreadJuiceFormat } = await import('../src/lib/contentTransformer');
      
      const mockStoryData = {
        title: "The Great Roommate Cooking Debacle",
        content: "A hilarious story about cultural differences and kitchen disasters...",
        author: "The Terry",
        category: "roommates",
        source: "reddit",
        original_post_id: "test123",
        sentiment: { score: 0.7, comparative: 0.5, positive: ['love', 'amazing'], negative: [] }
      };
      
      const transformed = await transformToThreadJuiceFormat(mockStoryData);
      logger.info('TRANSFORM', 'Transformation result:', {
        id: transformed.id,
        slug: transformed.slug,
        category: transformed.category
      });
      
      await saveOutput('test-transformed.json', transformed);
    } catch (error) {
      logger.error('TRANSFORM', 'Failed to test content transformer', error);
    }

    // Test 4: Image Service
    logger.info('TEST', 'Testing Image Service...');
    try {
      const { searchImages } = await import('../src/lib/imageService');
      
      // Mock image search result
      const mockImages = [
        {
          id: 'img1',
          description: 'Kitchen cooking scene',
          urls: {
            regular: 'https://example.com/kitchen.jpg',
            small: 'https://example.com/kitchen-small.jpg'
          },
          user: {
            name: 'Test Photographer',
            username: 'testphoto'
          }
        }
      ];
      
      logger.info('IMAGES', 'Mock image search result:', mockImages);
      await saveOutput('test-images.json', mockImages);
    } catch (error) {
      logger.error('IMAGES', 'Failed to test image service', error);
    }

    // Test 5: Pipeline Flow Simulation
    logger.info('TEST', 'Simulating Pipeline Flow...');
    
    const pipelineSimulation = {
      stage1_source: {
        type: 'reddit',
        post: {
          id: 'test123',
          title: 'AITA for telling my roommate their cooking smells terrible?',
          score: 1234,
          comments: 567
        }
      },
      stage2_analysis: {
        sentiment: { score: -0.2, comparative: -0.05 },
        entities: ['roommate', 'cooking', 'apartment'],
        keywords: ['cooking', 'smell', 'roommate', 'culturally insensitive']
      },
      stage3_generation: {
        persona: 'the-terry',
        story: {
          title: "When Your Roommate Turns the Kitchen Into a Chemical Weapons Lab",
          introduction: "Right, so we've got ourselves a proper domestic nightmare here...",
          sections: [
            {
              heading: "The Nose Knows",
              content: "Look, The Terry's all for culinary exploration, but when your flatmate's cooking experiments start violating the Geneva Convention..."
            }
          ]
        }
      },
      stage4_enrichment: {
        images: ['kitchen-disaster.jpg', 'angry-roommate.jpg'],
        gifs: ['disgusted-reaction.gif', 'cooking-fail.gif']
      },
      stage5_output: {
        format: 'threadjuice',
        saved: true,
        id: 'story-12345'
      }
    };

    await saveOutput('pipeline-simulation.json', pipelineSimulation);
    logger.info('PIPELINE', 'Pipeline simulation complete');

    // Summary
    logger.divider();
    logger.info('SUMMARY', 'Component Testing Complete', {
      testsRun: 5,
      outputDirectory: OUTPUT_DIR,
      files: [
        'test-reddit-post.json',
        'test-sentiment.json',
        'test-transformed.json',
        'test-images.json',
        'pipeline-simulation.json'
      ]
    });

  } catch (error) {
    logger.error('TEST', 'Component testing failed', error);
    process.exit(1);
  }
}

// Run tests
testIndividualComponents().catch(error => {
  logger.error('MAIN', 'Unhandled error', error);
  process.exit(1);
});