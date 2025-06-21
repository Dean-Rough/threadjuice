import { NextResponse } from 'next/server.js';
import { contentTransformer } from '@/lib/contentTransformer';

// Mock Reddit post for testing story generation
const mockRedditPost = {
  id: 'test123',
  title:
    'AITA for telling my sister that her boyfriend looks like discount Ryan Gosling?',
  selftext: `So my (26F) sister (24F) has been dating this guy Mark (28M) for about 6 months. She's always posting photos of them together on Instagram and Facebook, always talking about how handsome he is.

The thing is... he really does look like a budget version of Ryan Gosling. Like if you ordered Ryan Gosling from Wish. Same hair, similar face structure, but just... off somehow.

Last week at family dinner, she was showing everyone photos again and going on about how people say he looks like a movie star. My mom was nodding politely, my dad was just trying to eat his mashed potatoes in peace.

Then she directly asked me: "Don't you think Mark looks just like Ryan Gosling?"

I couldn't help myself. I said: "Yeah, if Ryan Gosling was ordered from Wish and arrived slightly damaged."

The whole table went silent. My sister's face went red and she started crying. She called me jealous and bitter and said I was just upset because I'm single. She grabbed her purse and left.

Now my whole family is texting me saying I was out of line and that I hurt her feelings unnecessarily. My mom said I should apologize.

But honestly? She asked for my opinion! And it's not like I said he was ugly - discount Ryan Gosling is still pretty good looking, right?

AITA?`,
  author: 'throwaway_sister_drama',
  subreddit: 'AmItheAsshole',
  score: 2847,
  num_comments: 428,
  upvote_ratio: 0.89,
  created_utc: Math.floor(Date.now() / 1000) - 7200,
  permalink: '/r/AmItheAsshole/test123',
  url: 'https://reddit.com/r/AmItheAsshole/test123',
  is_self: true,
  stickied: false,
  over_18: false,
};

const mockComments = [
  {
    id: 'comment1',
    author: 'judgmental_judy',
    body: 'YTA. You could have just said "he seems nice" or something neutral. No need to roast the poor guy.',
    score: 1542,
    created_utc: Math.floor(Date.now() / 1000) - 6000,
    parent_id: 'test123',
    depth: 0,
  },
  {
    id: 'comment2',
    author: 'honest_abe_lincoln',
    body: 'NTA. She literally asked for your opinion! Play stupid games, win stupid prizes. Also "discount Ryan Gosling" is actually hilarious.',
    score: 2103,
    created_utc: Math.floor(Date.now() / 1000) - 5800,
    parent_id: 'test123',
    depth: 0,
  },
  {
    id: 'comment3',
    author: 'family_therapist_karen',
    body: "ESH. She shouldn't have put you on the spot, but you definitely could have been kinder. Family dynamics are complicated.",
    score: 876,
    created_utc: Math.floor(Date.now() / 1000) - 5200,
    parent_id: 'test123',
    depth: 0,
  },
  {
    id: 'comment4',
    author: 'ryan_gosling_fan',
    body: 'I\'m dying at "ordered from Wish and arrived slightly damaged" 😭 That\'s brutal but so specific',
    score: 3401,
    created_utc: Math.floor(Date.now() / 1000) - 4800,
    parent_id: 'test123',
    depth: 0,
  },
];

export async function POST() {
  try {
    // console.log('🎭 Testing story generation with modular prompts...')

    const startTime = Date.now();

    // Transform the mock content using our enhanced system
    const transformedContent = await contentTransformer.transformContent(
      mockRedditPost as any,
      mockComments as any
    );

    const duration = Date.now() - startTime;

    // console.log('✅ Story transformation completed')
    // console.log(`⏱️ Duration: ${duration}ms`)
    // console.log(`🎭 Persona: ${transformedContent.persona}`)
    // console.log(`📊 Viral Score: ${transformedContent.viral_score}`)
    // console.log(`🏷️ Entities Found: ${transformedContent.entities?.length || 0}`)

    if (transformedContent.entities && transformedContent.entities.length > 0) {
      transformedContent.entities.forEach(entity => {
        // console.log(`   - ${entity.name} (${entity.type}, confidence: ${entity.confidence})`)
      });
    }

    return NextResponse.json({
      success: true,
      story: transformedContent,
      meta: {
        generation_time_ms: duration,
        persona_selected: transformedContent.persona,
        entities_detected: transformedContent.entities?.length || 0,
        viral_score: transformedContent.viral_score,
        test_story: 'AITA discount Ryan Gosling',
      },
      message: 'Story generated successfully with modular prompts!',
    });
  } catch (error) {
    console.error('Story generation test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'STORY_GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        test_story: 'AITA discount Ryan Gosling',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Story generation test endpoint',
    usage: 'POST to test story generation with modular prompts',
    test_story: 'Mock AITA story about discount Ryan Gosling comment',
    expected_features: [
      'Entity recognition (Ryan Gosling, Wish, Instagram, Facebook)',
      'Snarky Sage persona voice',
      'Natural grammar without em dashes',
      'Viral headline with emoji',
      'Engaging story structure',
    ],
  });
}
