// Quick test of the automated content generation pipeline
const {
  contentIngestionService,
} = require('./src/lib/contentIngestionService');

async function testAutomation() {
  // console.log('🚀 Testing ThreadJuice content automation pipeline...\n')

  try {
    // Start content ingestion job
    const job = await contentIngestionService.startIngestionJob({
      subreddits: ['AmItheAsshole'], // Test with just one subreddit
      limit_per_subreddit: 2,
      min_viral_score: 5,
      auto_publish: false, // Keep as draft for testing
    });

    // console.log(`✅ Content ingestion job started: ${job.id}`)
    // console.log(`📋 Job status: ${job.status}`)
    // console.log(`📊 Initial stats: ${job.posts_processed} processed, ${job.posts_created} created`)

    // Monitor job progress
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const status = contentIngestionService.getJobStatus(job.id);
      if (status) {
        // console.log(`\n📈 Progress update [${new Date().toLocaleTimeString()}]:`)
        // console.log(`   Status: ${status.status}`)
        // console.log(`   Posts processed: ${status.posts_processed}`)
        // console.log(`   Posts created: ${status.posts_created}`)

        if (status.logs.length > 0) {
          // console.log(`   Latest log: ${status.logs[status.logs.length - 1]}`)
        }

        if (status.status === 'completed') {
          // console.log('\n🎉 Content automation completed successfully!')
          // console.log(`📚 Final results: ${status.posts_created} new posts created from ${status.posts_processed} processed`)
          break;
        } else if (status.status === 'failed') {
          // console.log('\n❌ Content automation failed:')
          // console.log(`   Error: ${status.error_message}`)
          break;
        }
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      // console.log('\n⏰ Test timeout - job may still be running')
    }
  } catch (error) {
    console.error('\n❌ Automation test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAutomation()
  .then(() => {
    // console.log('\n🔚 Test completed')
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error);
    process.exit(1);
  });
