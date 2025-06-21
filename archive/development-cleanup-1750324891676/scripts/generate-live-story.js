// Generate a real story from live Reddit data with all modular sections
const fs = require('fs');

// Since we're running in Node, let's create a simplified version
// that works with the existing Reddit API without imports
const fetch = require('node-fetch') || global.fetch;

async function generateLiveStory() {
  // console.log('🔴 LIVE REDDIT STORY GENERATION')
  // console.log('===============================\n')

  try {
    // 1. Fetch trending posts from AITA (best for drama)
    // console.log('📡 Fetching hot posts from r/AmItheAsshole...')
    const { posts } = await redditClient.getHotPosts('AmItheAsshole', {
      limit: 10,
      timeframe: 'day',
    });

    if (posts.length === 0) {
      throw new Error('No posts found in r/AmItheAsshole');
    }

    // console.log(`✅ Found ${posts.length} potential posts`)

    // 2. Filter for viral potential
    const viralPosts = redditClient.filterViralPosts(posts);
    // console.log(`🔥 ${viralPosts.length} posts have viral potential`)

    if (viralPosts.length === 0) {
      throw new Error('No viral posts found');
    }

    // 3. Select the top post
    const selectedPost = viralPosts[0];
    // console.log(`\n🎯 SELECTED POST:`)
    // console.log(`   Title: ${selectedPost.title}`)
    // console.log(`   Author: u/${selectedPost.author}`)
    // console.log(`   Score: ${selectedPost.score} upvotes`)
    // console.log(`   Comments: ${selectedPost.num_comments}`)
    // console.log(`   Age: ${Math.round((Date.now()/1000 - selectedPost.created_utc) / 3600)} hours`)

    // 4. Fetch comments
    // console.log(`\n💬 Fetching comments for post...`)
    const comments = await redditClient.getComments(
      'AmItheAsshole',
      selectedPost.id,
      {
        limit: 20,
        sort: 'top',
      }
    );

    // console.log(`✅ Retrieved ${comments.length} quality comments`)

    if (comments.length === 0) {
      throw new Error('No comments found for post');
    }

    // Show top comments
    // console.log('\n🏆 TOP COMMENTS:')
    comments.slice(0, 3).forEach((comment, index) => {
      // console.log(`   ${index + 1}. u/${comment.author} (${comment.score} pts)`)
      // console.log(`      "${comment.body.slice(0, 100)}..."`)
    });

    // 5. Transform to ThreadJuice content using modular system
    // console.log('\n🎭 Transforming to ThreadJuice story with ALL modular sections...')
    // console.log('   🖼️  IMAGE section')
    // console.log('   📝 DESCRIBE-1 section')
    // console.log('   📝 DESCRIBE-2 section')
    // console.log('   💬 COMMENTS-1 section')
    // console.log('   💬 COMMENTS-2 section')
    // console.log('   🎙️  DISCUSSION section')
    // console.log('   🎯 OUTRO section')
    // console.log('   🧠 QUIZ section')

    const transformedStory = await contentTransformer.transformContent(
      selectedPost,
      comments
    );

    // console.log('\n✅ STORY TRANSFORMATION COMPLETE!')
    // console.log(`   📰 Title: "${transformedStory.title}"`)
    // console.log(`   🎭 Persona: ${transformedStory.persona}`)
    // console.log(`   📊 Viral Score: ${transformedStory.viral_score}/10`)
    // console.log(`   📝 Sections: ${transformedStory.content.sections.length}`)
    // console.log(`   🏷️  Tags: ${transformedStory.tags.join(', ')}`)

    // 6. Verify all sections are present
    const sectionTypes = transformedStory.content.sections.map(s => s.type);
    const requiredSections = [
      'image',
      'describe-1',
      'describe-2',
      'comments-1',
      'comments-2',
      'discussion',
      'outro',
      'quiz',
    ];

    // console.log('\n📋 SECTION VERIFICATION:')
    requiredSections.forEach((required, index) => {
      const actual = sectionTypes[index];
      const present = actual === required;
      // console.log(`   ${index + 1}. ${required}: ${present ? '✅' : '❌'} ${actual || 'MISSING'}`)
    });

    const allSectionsPresent = requiredSections.every(
      (section, index) => sectionTypes[index] === section
    );
    // console.log(`\n🎯 Complete Structure: ${allSectionsPresent ? '✅ YES' : '❌ NO'}`)

    // 7. Add Reddit source metadata
    const enhancedStory = {
      ...transformedStory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      trending: true,
      featured: transformedStory.viral_score >= 8,
      redditSource: {
        postId: selectedPost.id,
        subreddit: selectedPost.subreddit,
        originalTitle: selectedPost.title,
        originalAuthor: selectedPost.author,
        redditUrl: `https://reddit.com${selectedPost.permalink}`,
        score: selectedPost.score,
        numComments: selectedPost.num_comments,
        createdUtc: selectedPost.created_utc,
      },
      imageUrl: '/assets/img/blog/blog01.jpg', // Default for now
      viewCount: Math.floor(Math.random() * 1000) + 500,
      upvoteCount: Math.floor(selectedPost.score * 0.8),
      commentCount: Math.floor(selectedPost.num_comments * 0.6),
      shareCount: Math.floor(Math.random() * 200) + 50,
      bookmarkCount: Math.floor(Math.random() * 100) + 25,
      readingTime: Math.max(
        1,
        Math.ceil(
          transformedStory.content.sections
            .map(section => section.content.split(' ').length)
            .reduce((total, count) => total + count, 0) / 200
        )
      ),
    };

    // 8. Save the story
    const filename = `live-story-${enhancedStory.slug}.json`;
    fs.writeFileSync(filename, JSON.stringify(enhancedStory, null, 2));

    // console.log('\n💾 STORY SAVED!')
    // console.log(`   📁 File: ${filename}`)
    // console.log(`   📖 Reading Time: ${enhancedStory.readingTime} minutes`)
    // console.log(`   🔗 Reddit Source: ${enhancedStory.redditSource.redditUrl}`)

    // 9. Show sample content
    if (enhancedStory.content.sections[0]) {
      // console.log('\n📖 SAMPLE CONTENT (First section):')
      // console.log(`"${enhancedStory.content.sections[0].content.slice(0, 200)}..."`)
    }

    if (enhancedStory.excerpt) {
      // console.log('\n🎣 STORY HOOK:')
      // console.log(`"${enhancedStory.excerpt}"`)
    }

    // console.log('\n🎉 LIVE STORY GENERATION COMPLETE!')
    // console.log('🚀 Ready to add to ThreadJuice site!')
    // console.log(`📱 URL will be: /blog/${enhancedStory.slug}`)

    return enhancedStory;
  } catch (error) {
    console.error('\n❌ Live story generation failed:', error.message);
    console.error('Stack:', error.stack);

    if (error.message.includes('Reddit API')) {
      // console.log('\n💡 Reddit API tips:')
      // console.log('   • Check your user agent is set')
      // console.log('   • Verify rate limiting (1 request per second)')
      // console.log('   • Consider adding Reddit OAuth credentials')
    }

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateLiveStory()
    .then(story => {
      // console.log('\n✅ SUCCESS!')
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 FAILED!');
      process.exit(1);
    });
}

module.exports = { generateLiveStory };
