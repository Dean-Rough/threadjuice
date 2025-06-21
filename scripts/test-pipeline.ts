#!/usr/bin/env tsx

/**
 * Test script for verifying pipeline integration
 */

import { createRedditPipeline, createAIPipeline, createContext, PipelineContext } from '@/lib/pipeline';

async function testRedditPipeline() {
  console.log('\n🧪 Testing Reddit Pipeline...\n');
  
  try {
    const pipeline = createRedditPipeline('tifu', {
      limit: 5,
      minScore: 100
    });
    
    const result = await pipeline.execute(createContext());
    
    console.log('✅ Reddit pipeline executed successfully');
    console.log('📊 Pipeline results:');
    console.log('- Raw content:', result.source.rawData ? 'Loaded' : 'Missing');
    console.log('- Analysis:', result.analysis ? 'Complete' : 'Missing');
    console.log('- Enrichments:', result.enrichments ? 'Added' : 'Missing');
    console.log('- Story output:', result.output.story ? 'Generated' : 'Missing');
    
    if (result.output.story) {
      console.log('\n📖 Story preview:');
      console.log(`Title: ${result.output.story.title}`);
      console.log(`Category: ${result.output.story.category}`);
      console.log(`Author: ${result.output.story.author}`);
    }
    
  } catch (error) {
    console.error('❌ Reddit pipeline failed:', error);
  }
}

async function testAIPipeline() {
  console.log('\n🧪 Testing AI Pipeline...\n');
  
  try {
    const pipeline = createAIPipeline('workplace', 'the-snarky-sage');
    
    const result = await pipeline.execute(createContext());
    
    console.log('✅ AI pipeline executed successfully');
    console.log('📊 Pipeline results:');
    console.log('- AI source:', result.source.type === 'ai-generated' ? 'Created' : 'Missing');
    console.log('- Analysis:', result.analysis ? 'Complete' : 'Missing');
    console.log('- Enrichments:', result.enrichments ? 'Added' : 'Missing');
    console.log('- Story output:', result.output.story ? 'Generated' : 'Missing');
    
  } catch (error) {
    console.error('❌ AI pipeline failed:', error);
  }
}

async function testCustomPipeline() {
  console.log('\n🧪 Testing Custom Pipeline Configuration...\n');
  
  try {
    // Test importing individual components
    const { Pipeline, RedditSource, AnalysisStage, MinimalEnrichment, TransformStage, FileOutput } = await import('@/lib/pipeline');
    
    const pipeline = new Pipeline({ debug: true })
      .pipe(RedditSource('AmItheAsshole', { limit: 3 }))
      .pipe(new AnalysisStage({ analyzeSentiment: true, generateKeywords: true }))
      .pipe(MinimalEnrichment())
      .pipe(new TransformStage({ includeGifs: false }))
      .pipe(FileOutput('./test-output'));
    
    const result = await pipeline.execute(createContext());
    
    console.log('✅ Custom pipeline executed successfully');
    console.log('📁 Story saved to:', result.output.story ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Custom pipeline failed:', error);
  }
}

async function main() {
  console.log('🚀 ThreadJuice Pipeline Integration Test\n');
  
  // Test all pipeline configurations
  await testRedditPipeline();
  await testAIPipeline();
  await testCustomPipeline();
  
  console.log('\n✨ Pipeline testing complete!\n');
}

// Run tests
main().catch(console.error);