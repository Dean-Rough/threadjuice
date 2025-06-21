// Simple script to fetch real Reddit data and create modular story
const https = require('https');
const fs = require('fs');

// Simple fetch function for Reddit's public API
function fetchReddit(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'ThreadJuice/1.0 (https://threadjuice.com)',
      },
    };

    https
      .get(url, options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            // console.log('Response preview:', data.slice(0, 200))
            reject(new Error(`Invalid JSON response: ${e.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function generateRealStory() {
  // console.log('🔴 FETCHING REAL REDDIT STORY')
  // console.log('=============================\n')

  try {
    // 1. Fetch hot posts from AITA
    // console.log('📡 Getting hot AITA posts...')
    const postsData = await fetchReddit(
      'https://www.reddit.com/r/AmItheAsshole/hot.json?limit=10'
    );

    const posts = postsData.data.children
      .map(child => child.data)
      .filter(
        post =>
          !post.stickied &&
          !post.over_18 &&
          post.is_self &&
          post.num_comments > 50 &&
          post.score > 500 &&
          post.selftext &&
          post.selftext.length > 200
      );

    if (posts.length === 0) {
      throw new Error('No suitable posts found');
    }

    const selectedPost = posts[0];
    // console.log(`✅ Selected: "${selectedPost.title}"`)
    // console.log(`   📊 ${selectedPost.score} upvotes, ${selectedPost.num_comments} comments`)

    // 2. Fetch comments
    // console.log('\n💬 Fetching comments...')
    const commentsUrl = `https://www.reddit.com/r/AmItheAsshole/comments/${selectedPost.id}.json?limit=20&sort=top`;
    const commentsData = await fetchReddit(commentsUrl);

    const comments = [];
    if (
      commentsData[1] &&
      commentsData[1].data &&
      commentsData[1].data.children
    ) {
      commentsData[1].data.children.forEach(child => {
        if (
          child.data &&
          child.data.body &&
          child.data.body !== '[deleted]' &&
          child.data.score > 10
        ) {
          comments.push({
            author: child.data.author,
            body: child.data.body,
            score: child.data.score,
          });
        }
      });
    }

    // console.log(`✅ Found ${comments.length} quality comments`)

    // 3. Create modular story structure
    // console.log('\n🎭 Creating modular story structure...')

    const story = {
      id: Date.now().toString(),
      title: `🚨 ${selectedPost.title.replace('AITA', 'AITA:')}`,
      slug: selectedPost.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80),
      excerpt: `A wild Reddit drama that has everyone picking sides. You won't believe what happened next.`,
      category: 'aita',
      status: 'published',
      trending: true,
      featured: selectedPost.score > 2000,
      author: 'The Snarky Sage',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: {
        id: 'snarky-sage',
        name: 'The Snarky Sage',
        bio: "Professional chaos observer and part-time life coach for people who probably shouldn't take advice.",
        avatar: '/assets/img/personas/snarky-sage.png',
        tone: 'Sarcastic and deadpan with a love for chaos',
      },
      content: {
        sections: [
          {
            type: 'image',
            content:
              'A dramatic scene capturing the essence of this Reddit AITA story that has everyone talking',
            metadata: {
              image_prompt:
                'reddit drama aita conflict family friends argument',
            },
          },
          {
            type: 'describe-1',
            title: 'The Setup',
            content: `Oh, Reddit. You beautiful, chaotic mess. Just when I think I've seen it all, along comes a story that makes me question humanity's collective decision-making skills. Today's gem comes from our favorite digital courthouse, r/AmItheAsshole, where someone decided to air their dirty laundry for the internet to judge.\n\n${selectedPost.selftext.slice(0, 400)}...`,
          },
          {
            type: 'describe-2',
            title: 'The Drama Unfolds',
            content: `Now, here's where things get spicy. Because if there's one thing Reddit loves more than cats and cryptocurrency, it's a good old-fashioned moral dilemma with enough plot twists to make a soap opera writer jealous.\n\nThe audacity levels in this story are truly astronomical. We're talking about the kind of confidence that makes you wonder if some people were just born without that little voice in their head that says "maybe this isn't such a great idea."`,
          },
          {
            type: 'comments-1',
            title: "Reddit's Verdict",
            content:
              'The comments section absolutely erupted, and honestly, the reactions were more entertaining than the original post. Here are the top responses that had everyone hitting that upvote button:',
            metadata: {
              comments: comments.slice(0, 3).map(c => ({
                author: c.author,
                content:
                  c.body.length > 200 ? c.body.slice(0, 200) + '...' : c.body,
                score: c.score,
                replies: Math.floor(Math.random() * 50) + 10,
              })),
            },
          },
          {
            type: 'comments-2',
            title: 'More Reddit Reactions',
            content:
              "But wait, there's more! Because apparently everyone on Reddit has strong opinions about this situation (shocking, I know). The thread kept delivering gems:",
            metadata: {
              comments: comments.slice(3, 6).map(c => ({
                author: c.author,
                content:
                  c.body.length > 200 ? c.body.slice(0, 200) + '...' : c.body,
                score: c.score,
                replies: Math.floor(Math.random() * 30) + 5,
              })),
            },
          },
          {
            type: 'discussion',
            title: 'ThreadJuice Discussion',
            content: `Let's break this down, shall we? Because this story hits all the classic Reddit drama checkpoints: family dynamics, questionable decision-making, and that special brand of confidence that only comes from being completely oblivious to social norms.\n\nWhat fascinates me about stories like this is how they expose the fascinating psychology of human conflict. Everyone becomes an expert in interpersonal relationships when they're safely behind a keyboard, ready to dispense wisdom to strangers on the internet.\n\nThe real question isn't who's right or wrong here. It's how we got to a point where airing our personal drama online feels like a perfectly reasonable way to resolve conflicts.`,
          },
          {
            type: 'outro',
            title: 'The Bottom Line',
            content: `Look, I'm not here to tell you who's right or wrong in this mess. That's what the Reddit jury is for, and they've clearly made their verdict known with thousands of upvotes and awards.\n\nWhat I will say is this: if your life choices are generating this much drama, maybe it's time to step back and ask yourself some hard questions. Or don't. Keep the entertainment coming.\n\nWhat do you think about this situation? Are you team OP or team "you've lost your mind"? Let us know in the comments, and try not to start any family feuds in the process.`,
          },
          {
            type: 'quiz',
            title: 'Test Your AITA Knowledge',
            content:
              "Think you understand the situation? Let's see how well you were paying attention:",
            metadata: {
              quiz_data: {
                question:
                  "What's the most important lesson from this Reddit drama?",
                options: [
                  'Always consult Reddit before making major decisions',
                  'Some conflicts are better resolved offline',
                  'The internet always knows best',
                  'Drama is inevitable in every family',
                ],
                correct_answer: 1,
                explanation:
                  'While Reddit can offer perspectives, real-life conflicts usually need real-life solutions, not internet jury trials!',
              },
            },
          },
        ],
        story_flow: 'buildup',
      },
      tags: [
        'aita',
        'reddit-drama',
        'family-conflict',
        'viral',
        'relationships',
      ],
      viral_score: Math.min(10, Math.floor(selectedPost.score / 200) + 6),
      image_keywords: ['reddit', 'drama', 'conflict', 'family', 'argument'],
      imageUrl: '/assets/img/blog/blog01.jpg',
      viewCount: Math.floor(Math.random() * 2000) + 1000,
      upvoteCount: Math.floor(selectedPost.score * 0.8),
      commentCount: Math.floor(selectedPost.num_comments * 0.6),
      shareCount: Math.floor(Math.random() * 300) + 100,
      bookmarkCount: Math.floor(Math.random() * 150) + 50,
      redditSource: {
        subreddit: selectedPost.subreddit,
        originalPost: selectedPost.title,
        threadUrl: `https://reddit.com${selectedPost.permalink}`,
        score: selectedPost.score,
        numComments: selectedPost.num_comments,
        originalAuthor: selectedPost.author,
      },
      readingTime: 4,
      entities: [
        {
          name: 'Reddit',
          type: 'company',
          confidence: 0.98,
          wikipedia_title: 'Reddit',
        },
        {
          name: 'AmItheAsshole',
          type: 'community',
          confidence: 0.95,
        },
      ],
    };

    // 4. Save the story
    const filename = `real-story-${story.slug}.json`;
    fs.writeFileSync(filename, JSON.stringify(story, null, 2));

    // console.log('\n✅ MODULAR STORY CREATED!')
    // console.log(`   📰 Title: "${story.title}"`)
    // console.log(`   📝 Sections: ${story.content.sections.length}`)
    // console.log(`   🎯 Viral Score: ${story.viral_score}/10`)
    // console.log(`   💾 Saved: ${filename}`)
    // console.log(`   🔗 Reddit: ${story.redditSource.threadUrl}`)

    // 5. Verify all sections
    const sectionTypes = story.content.sections.map(s => s.type);
    const expected = [
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
    expected.forEach((type, index) => {
      const actual = sectionTypes[index];
      // console.log(`   ${index + 1}. ${type}: ${actual === type ? '✅' : '❌'}`)
    });

    // console.log('\n🎉 READY FOR THREADJUICE!')
    // console.log(`📱 Preview URL: http://localhost:4242/blog/${story.slug}`)

    return story;
  } catch (error) {
    console.error('\n❌ Error generating story:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateRealStory()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { generateRealStory };
