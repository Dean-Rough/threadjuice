#!/usr/bin/env tsx

/**
 * Mock Pipeline Test Runner
 * Tests the full pipeline with mock data to show how it works
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock environment for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'mock-key';
process.env.REDDIT_CLIENT_ID = 'mock-client';
process.env.REDDIT_CLIENT_SECRET = 'mock-secret';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:4242';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.CLERK_SECRET_KEY = 'sk_test_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../data/pipeline-test-output');

// Logger
const logger = {
  stage: (stage: string, message: string, data?: any) => {
    console.log(`\n[${stage}] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  divider: () => console.log('\n' + '='.repeat(80) + '\n')
};

// Mock data generators
const mockRedditPost = {
  id: '1abc2de',
  title: "AITA for refusing to attend my sister's wedding because she scheduled it during Comic-Con?",
  selftext: `So here's the situation. My (28M) sister (26F) just announced her wedding date, and it's the EXACT same weekend as San Diego Comic-Con. I've been going to SDCC for 10 years straight - it's basically my Christmas, New Year's, and birthday rolled into one glorious nerdy weekend.

I already have my 4-day pass (which I fought tooth and nail to get when they went on sale), hotel booked, and I'm part of a group cosplay that we've been planning for months. We're doing the entire Fellowship of the Ring and I'm Aragorn.

When I told my sister I couldn't make it, she completely lost it. She said I'm choosing "stupid comics" over family. I tried to explain that:
1. I've had these plans for months
2. SDCC tickets are non-refundable and impossible to get
3. She KNOWS how important this is to me

She could have picked literally any other weekend in the summer. Now my whole family is calling me selfish and my mom is threatening to disown me. But here's the kicker - my sister has NEVER supported my interests. She's called my hobby "childish" more times than I can count.

AITA for standing my ground here?

Edit: For those asking, she announced the date 3 months before the wedding. She claims the venue only had that date available, but I find that hard to believe.

Edit 2: Yes, I realize family is important. But so is mental health and having things that bring you joy in life.`,
  author: 'ComicConflicted',
  subreddit: 'AmItheAsshole',
  subreddit_name_prefixed: 'r/AmItheAsshole',
  score: 15234,
  upvote_ratio: 0.76,
  num_comments: 3421,
  created_utc: Date.now() / 1000 - 86400, // Yesterday
  permalink: '/r/AmItheAsshole/comments/1abc2de/',
  url: 'https://reddit.com/r/AmItheAsshole/comments/1abc2de/',
  is_self: true,
  stickied: false,
  over_18: false
};

const mockComments = [
  {
    author: 'NerdyAndIKnowIt',
    body: "NTA. Your sister knew exactly what she was doing. Anyone who's into nerd culture knows SDCC dates are sacred.",
    score: 5432
  },
  {
    author: 'WeddingPlannerPro',
    body: "YTA. It's her WEDDING. You can go to Comic-Con next year. You can't redo being at your sister's wedding.",
    score: 3210
  },
  {
    author: 'CosplayQueen92',
    body: "INFO: Has your sister ever shown ANY interest in your hobbies? Because this sounds like a power play to me.",
    score: 2105
  }
];

const mockAnalysis = {
  sentiment: {
    score: -0.3,
    comparative: -0.05,
    positive: ['important', 'joy', 'glorious'],
    negative: ['lost', 'selfish', 'threatening', 'childish']
  },
  entities: [
    { text: 'sister', type: 'PERSON', salience: 0.9 },
    { text: 'Comic-Con', type: 'EVENT', salience: 0.85 },
    { text: 'San Diego', type: 'LOCATION', salience: 0.3 },
    { text: 'Fellowship of the Ring', type: 'WORK_OF_ART', salience: 0.4 }
  ],
  keywords: ['wedding', 'Comic-Con', 'family', 'conflict', 'priorities', 'hobby'],
  metaphors: [
    { phrase: "Christmas, New Year's, and birthday rolled into one", type: 'hyperbole' }
  ]
};

const mockGeneratedStory = {
  title: "When Aragorn Must Choose: The Wedding or the Fellowship",
  introduction: "Right, gather 'round for what The Terry considers the ultimate first-world problem with a delicious side of family drama. We've got ourselves a proper clash of the titans here: sacred nerd pilgrimage versus family obligations.",
  sections: [
    {
      heading: "The Sacred Pilgrimage Under Threat",
      content: "Look, The Terry understands the sanctity of Comic-Con. It's not just a convention - it's a bloody religious experience for those who worship at the altar of pop culture. Our protagonist here has been making this hajj for a decade, and now suddenly sister dearest decides to schedule her nuptials during the high holy days of nerdom? That's either weapons-grade ignorance or calculated emotional warfare."
    },
    {
      heading: "The Fellowship Cannot Be Broken",
      content: "Can we just appreciate the beautiful tragedy of having to choose between being Aragorn at Comic-Con and attending a wedding? The man's got a commitment to his Fellowship! You can't just replace Aragorn with some random bloke from Craigslist. That's like replacing the groom at the wedding - technically possible, but defeats the entire purpose."
    },
    {
      heading: "Family Dynamics: A Critical Analysis",
      content: "Here's where The Terry's cynicism meter starts pinging like a metal detector at a cutlery convention. Sister who's spent years mocking his interests suddenly can't understand why he won't drop everything for her big day? The same sister who called his hobbies 'childish'? That's rich enough to fund a small nation's economy."
    },
    {
      heading: "The Verdict from Mount Doom",
      content: "The Terry's going with NTA, but with a caveat. Yes, family is important. Yes, weddings are once-in-a-lifetime events (theoretically). But respect is a two-way street, and you can't spend years dismissing someone's passions then act shocked when they prioritize those passions over your event. If she wanted Aragorn at her wedding, she should have treated him like the King of Gondor all along, not like some basement-dwelling orc."
    }
  ],
  conclusion: "Sometimes the real asshole is the family dynamics we endured along the way. May the Force be with you, you beautiful nerdy bastard.",
  personaId: "the-terry",
  category: "family-drama"
};

const mockEnrichment = {
  primaryImage: {
    id: 'sdcc2024',
    description: 'Crowded Comic-Con convention floor with cosplayers',
    urls: {
      regular: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe',
      small: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400'
    },
    user: {
      name: 'Bearded Texan',
      username: 'thebeardedtexan'
    }
  },
  additionalImages: [
    {
      id: 'wedding1',
      description: 'Outdoor wedding ceremony setup',
      urls: {
        regular: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
        small: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
      }
    }
  ],
  reactionGifs: [
    {
      id: 'tough-choice',
      title: 'Sweating superhero choosing between two buttons',
      images: {
        fixed_height: {
          url: 'https://media.giphy.com/media/3o7aCRloybJlXpNjSU/giphy.gif'
        }
      }
    },
    {
      id: 'aragorn-crown',
      title: 'Aragorn "My friends you bow to no one" scene',
      images: {
        fixed_height: {
          url: 'https://media.giphy.com/media/3oFzlZzyoQqOOmWIj6/giphy.gif'
        }
      }
    }
  ]
};

// Main test function
async function runMockPipeline() {
  logger.divider();
  logger.stage('INIT', 'ThreadJuice Pipeline Mock Test');
  logger.divider();

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  logger.stage('SETUP', `Output directory: ${OUTPUT_DIR}`);

  // Stage 1: Source Acquisition
  logger.divider();
  logger.stage('SOURCE', 'Fetching Reddit post...');
  await fs.writeFile(
    path.join(OUTPUT_DIR, '1-reddit-post.json'),
    JSON.stringify(mockRedditPost, null, 2)
  );
  logger.stage('SOURCE', 'Post fetched:', {
    title: mockRedditPost.title,
    score: mockRedditPost.score,
    comments: mockRedditPost.num_comments
  });

  // Stage 2: Analysis
  logger.divider();
  logger.stage('ANALYSIS', 'Analyzing content...');
  await fs.writeFile(
    path.join(OUTPUT_DIR, '2-analysis.json'),
    JSON.stringify(mockAnalysis, null, 2)
  );
  logger.stage('ANALYSIS', 'Analysis complete:', {
    sentiment: mockAnalysis.sentiment.score,
    entities: mockAnalysis.entities.length,
    keywords: mockAnalysis.keywords.length
  });

  // Stage 3: Story Generation
  logger.divider();
  logger.stage('GENERATION', 'Generating story with The Terry persona...');
  await fs.writeFile(
    path.join(OUTPUT_DIR, '3-generated-story.json'),
    JSON.stringify(mockGeneratedStory, null, 2)
  );
  logger.stage('GENERATION', 'Story generated:', {
    title: mockGeneratedStory.title,
    sections: mockGeneratedStory.sections.length,
    wordCount: mockGeneratedStory.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0)
  });

  // Stage 4: Enrichment
  logger.divider();
  logger.stage('ENRICHMENT', 'Adding images and GIFs...');
  await fs.writeFile(
    path.join(OUTPUT_DIR, '4-enrichment.json'),
    JSON.stringify(mockEnrichment, null, 2)
  );
  logger.stage('ENRICHMENT', 'Media added:', {
    primaryImage: mockEnrichment.primaryImage.description,
    additionalImages: mockEnrichment.additionalImages.length,
    gifs: mockEnrichment.reactionGifs.length
  });

  // Stage 5: Final Output
  logger.divider();
  logger.stage('TRANSFORM', 'Creating final ThreadJuice story...');
  
  const finalStory = {
    id: `story-${Date.now()}`,
    slug: 'aragorn-must-choose-wedding-or-fellowship',
    title: mockGeneratedStory.title,
    content: {
      introduction: mockGeneratedStory.introduction,
      sections: mockGeneratedStory.sections,
      conclusion: mockGeneratedStory.conclusion
    },
    author: 'The Terry',
    personaId: 'the-terry',
    category: 'family-drama',
    source: 'reddit',
    sourceData: {
      postId: mockRedditPost.id,
      subreddit: mockRedditPost.subreddit,
      author: mockRedditPost.author,
      score: mockRedditPost.score,
      comments: mockComments
    },
    analysis: mockAnalysis,
    media: {
      hero: mockEnrichment.primaryImage,
      images: mockEnrichment.additionalImages,
      gifs: mockEnrichment.reactionGifs
    },
    engagement: {
      score: mockRedditPost.score,
      comments: mockRedditPost.num_comments,
      sentiment: mockAnalysis.sentiment.score
    },
    metadata: {
      processedAt: new Date().toISOString(),
      pipeline_version: '1.0.0',
      stages_completed: ['source', 'analysis', 'generation', 'enrichment', 'transform']
    }
  };

  await fs.writeFile(
    path.join(OUTPUT_DIR, '5-final-story.json'),
    JSON.stringify(finalStory, null, 2)
  );

  logger.stage('TRANSFORM', 'Story ready for ThreadJuice!');

  // Summary
  logger.divider();
  logger.stage('COMPLETE', '✅ Pipeline test completed successfully!');
  logger.stage('SUMMARY', 'Results:', {
    storyId: finalStory.id,
    title: finalStory.title,
    wordCount: finalStory.content.sections.reduce((acc, s) => acc + s.content.split(' ').length, 0),
    mediaAssets: finalStory.media.images.length + finalStory.media.gifs.length + 1,
    outputFiles: [
      '1-reddit-post.json',
      '2-analysis.json',
      '3-generated-story.json',
      '4-enrichment.json',
      '5-final-story.json'
    ]
  });
  
  logger.divider();
  console.log(`📁 View results in: ${OUTPUT_DIR}`);
  logger.divider();
}

// Run the mock pipeline
runMockPipeline().catch(error => {
  console.error('Pipeline test failed:', error);
  process.exit(1);
});