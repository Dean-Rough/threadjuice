#!/usr/bin/env tsx

/**
 * Pipeline Test Runner
 * Tests the ThreadJuice content pipeline with real Reddit data
 */

import {
  createRedditPipeline,
  runExamplePipeline,
} from '../src/lib/pipeline/integrations/ExamplePipelines';
import { PipelineContext } from '../src/lib/pipeline/core/PipelineContext';
import { initializeServices } from '../src/lib/pipeline/integrations';
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

// Logger utility
const logger = {
  info: (stage: string, message: string, data: any = {}) => {
    console.log(`\n[${new Date().toISOString()}] [${stage}] ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  },
  error: (stage: string, message: string, error: any) => {
    console.error(
      `\n[${new Date().toISOString()}] [${stage}] ERROR: ${message}`
    );
    if (error) {
      console.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  },
  divider: () => {
    console.log('\n' + '='.repeat(80) + '\n');
  },
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

async function testPipeline() {
  logger.divider();
  logger.info('PIPELINE', 'Starting ThreadJuice Pipeline Test');
  logger.divider();

  try {
    // Ensure output directory exists
    await ensureOutputDirectory();

    // Initialize services first
    logger.info('INIT', 'Initializing services...');
    const services = await initializeServices();

    logger.info('INIT', 'Service availability:', {
      reddit: services.reddit.available,
      openai: services.openai.available,
      twitter: services.twitter.available,
      pexels: services.pexels.available,
      klipy: services.klipy.available,
      giphy: services.giphy.available,
    });

    if (!services.reddit.available) {
      throw new Error(
        'Reddit service not available. Check REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET'
      );
    }
    if (!services.openai.available) {
      throw new Error('OpenAI service not available. Check OPENAI_API_KEY');
    }

    // Create Reddit pipeline
    logger.divider();
    logger.info('PIPELINE', 'Creating Reddit pipeline...');

    const pipeline = createRedditPipeline({
      subreddit: 'AmItheAsshole',
      personaId: 'the-terry',
      minScore: 100,
      includeComments: true,
    });

    // Create initial context
    const context = new PipelineContext('reddit', {
      debug: true,
      saveIntermediateResults: true,
    });

    // Execute pipeline
    logger.divider();
    logger.info('PIPELINE', 'Executing pipeline...');

    const result = await pipeline.execute(context);

    // Log results
    logger.divider();
    logger.info('RESULTS', 'Pipeline execution completed!');

    if (result.output.story) {
      const story = result.output.story;

      logger.info('STORY', 'Generated story:', {
        id: story.id,
        title: story.title,
        author: story.author,
        category: story.category,
        sections: story.content.sections.length,
        totalLength: story.content.sections.reduce(
          (acc, s) => acc + s.content.length,
          0
        ),
        hasIntro: !!story.content.introduction,
        hasConclusion: !!story.content.conclusion,
        personaId: story.personaId,
      });

      await saveOutput('final-story.json', story);
    }

    if (result.source.posts && result.source.posts.length > 0) {
      logger.info('SOURCE', 'Reddit posts fetched:', {
        count: result.source.posts.length,
        topPost: {
          title: result.source.posts[0].title,
          score: result.source.posts[0].score,
          author: result.source.posts[0].author,
          num_comments: result.source.posts[0].num_comments,
        },
      });

      await saveOutput('reddit-posts.json', result.source.posts);
    }

    if (result.analysis) {
      logger.info('ANALYSIS', 'Content analysis:', {
        sentiment: result.analysis.sentiment,
        entities: result.analysis.entities?.length || 0,
        keywords: result.analysis.keywords?.length || 0,
        metaphors: result.analysis.metaphors?.length || 0,
      });

      await saveOutput('analysis-results.json', result.analysis);
    }

    if (result.enrichments) {
      logger.info('ENRICHMENT', 'Media enrichment:', {
        primaryImage: !!result.enrichments.primaryImage,
        additionalImages: result.enrichments.additionalImages?.length || 0,
        reactionGifs: result.enrichments.reactionGifs?.length || 0,
        totalMedia:
          (result.enrichments.additionalImages?.length || 0) +
          (result.enrichments.reactionGifs?.length || 0) +
          (result.enrichments.primaryImage ? 1 : 0),
      });

      await saveOutput('enrichment-results.json', result.enrichments);
    }

    // Save full pipeline result
    await saveOutput('complete-pipeline-result.json', result);

    logger.divider();
    logger.info('SUMMARY', 'Test completed successfully!', {
      outputDirectory: OUTPUT_DIR,
      filesCreated: [
        'final-story.json',
        'reddit-posts.json',
        'analysis-results.json',
        'enrichment-results.json',
        'complete-pipeline-result.json',
      ],
    });
  } catch (error: any) {
    logger.error('PIPELINE', 'Pipeline execution failed', error);

    // Save error details
    await saveOutput('pipeline-error.json', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    process.exit(1);
  }
}

// Alternative: Run the example pipeline
async function runExample() {
  try {
    logger.divider();
    logger.info('EXAMPLE', 'Running example pipeline...');

    const result = await runExamplePipeline();

    await ensureOutputDirectory();
    await saveOutput('example-pipeline-result.json', result);

    logger.info('EXAMPLE', 'Example pipeline completed successfully!');
  } catch (error: any) {
    logger.error('EXAMPLE', 'Example pipeline failed', error);
    process.exit(1);
  }
}

// Determine which test to run
const args = process.argv.slice(2);
const testMode = args[0] || 'full';

if (testMode === 'example') {
  runExample().catch(error => {
    logger.error('MAIN', 'Unhandled error', error);
    process.exit(1);
  });
} else {
  testPipeline().catch(error => {
    logger.error('MAIN', 'Unhandled error', error);
    process.exit(1);
  });
}
