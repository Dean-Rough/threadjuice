#!/usr/bin/env node

/**
 * ThreadJuice Production Story Generator
 *
 * Clean, production-ready story generation system
 * Replaces all scattered automation scripts
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs/promises';

// Load environment variables manually
import { readFileSync } from 'fs';
try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (error) {
  // console.log('⚠️  No .env.local file found, using existing environment variables');
}

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Production configuration
const CONFIG = {
  models: {
    primary: 'gpt-4o',
    fallback: 'gpt-4o-mini',
  },
  personas: [
    {
      name: 'The Terry',
      slug: 'the-terry',
      bio: 'Acerbic, witty, and emotionally intelligent. Weaponises irritation for comedy while staying baffled by modern life.',
      avatar: '/assets/img/personas/the-terry.svg',
      tone: `Acerbic, funny, witty, overstimulated but emotionally intelligent. Hates things in a smart way—irritation weaponised for comedy. World-weary, hyper-observant, baffled by modern life. Mix sentence lengths like stand-up: Short. Clipped. Then suddenly long, winding, overflowing with rage or joy. Then a fragment. For punch. Use specificity for laughs, meta-commentary, sudden zoom-outs from minor gripes to society crumbling. Juxtaposition of formal phrasing with dumb topics. Occasionally refers to himself in third person as "The Terry" but use VERY sparingly.`,
    },
  ],
  // Broad content categories - any viral story type
  categories: {
    politics:
      'Political drama, government scandals, election controversies, policy debates',
    sports:
      'Athletic drama, team scandals, player controversies, fan incidents, competition drama',
    technology:
      'Tech failures, app disasters, AI mishaps, startup drama, cyber incidents',
    celebrity:
      'Celebrity scandals, social media drama, award show incidents, PR disasters',
    business:
      'Corporate scandals, startup failures, workplace drama, economic incidents',
    relationships:
      'Dating disasters, marriage drama, family conflicts, friendship betrayals',
    workplace:
      'Office politics, boss conflicts, coworker drama, career incidents',
    education:
      'School drama, university scandals, academic controversies, student incidents',
    travel:
      'Travel disasters, vacation drama, cultural incidents, transportation chaos',
    food: 'Restaurant drama, cooking disasters, food trends, culinary controversies',
    parenting:
      'Parenting fails, school conflicts, child-related drama, family chaos',
    social:
      'Social media drama, viral trends, community conflicts, cultural incidents',
    health:
      'Medical drama, fitness controversies, wellness scandals, health scares',
    environment:
      'Climate incidents, conservation drama, environmental scandals',
    gaming:
      'Gaming controversies, esports drama, streamer incidents, community conflicts',
    legal:
      'Court drama, legal battles, justice incidents, law enforcement controversies',
    housing:
      'Neighbor disputes, landlord drama, property conflicts, community issues',
    money:
      'Financial scandals, investment drama, economic incidents, money conflicts',
  },
  contentSources: {
    reddit: {
      trending: 'Reddit Hot/Trending posts from this week',
      allTime: 'Reddit Top All-Time legendary posts',
      updates:
        'Best of Redditor Updates - multi-part sagas with updates over time',
      description:
        'Long-form stories with detailed setups and community discussion',
    },
    tiktok: {
      series: 'Multi-part TikTok story series',
      description:
        'Viral TikTok story threads that span multiple videos, often more dramatic and fast-paced',
    },
  },
  imageLibrary: [
    // Lifestyle & Personal
    {
      path: '/assets/img/lifestyle/life_style01.jpg',
      description: 'Person working on laptop in cafe',
      keywords: ['laptop', 'work', 'cafe', 'computer', 'online', 'typing'],
    },
    {
      path: '/assets/img/lifestyle/life_style02.jpg',
      description: 'Person looking stressed while checking phone',
      keywords: [
        'phone',
        'stressed',
        'mobile',
        'text',
        'messaging',
        'upset',
        'worried',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style03.jpg',
      description: 'Group of people having animated discussion',
      keywords: [
        'discussion',
        'argument',
        'meeting',
        'group',
        'conversation',
        'friends',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style04.jpg',
      description: 'Woman smiling while using phone',
      keywords: [
        'happy',
        'phone',
        'smiling',
        'success',
        'victory',
        'celebration',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style05.jpg',
      description: 'Person looking contemplative outdoors',
      keywords: [
        'thinking',
        'contemplative',
        'decision',
        'outdoor',
        'reflection',
      ],
    },

    // Dating & Relationships
    {
      path: '/assets/img/lifestyle/life_style06.jpg',
      description: 'Couple having serious conversation',
      keywords: [
        'couple',
        'relationship',
        'serious',
        'dating',
        'confrontation',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style07.jpg',
      description: 'Person looking disappointed at restaurant',
      keywords: ['restaurant', 'date', 'disappointed', 'dining', 'food'],
    },

    // Work & Office
    {
      path: '/assets/img/blog/blog01.jpg',
      description: 'Professional meeting room scene',
      keywords: [
        'office',
        'meeting',
        'professional',
        'work',
        'business',
        'corporate',
      ],
    },
    {
      path: '/assets/img/blog/blog02.jpg',
      description: 'Person working late at office',
      keywords: ['office', 'late', 'overtime', 'work', 'tired', 'computer'],
    },
    {
      path: '/assets/img/blog/blog03.jpg',
      description: 'Frustrated person at desk',
      keywords: ['frustrated', 'work', 'stress', 'office', 'boss', 'annoyed'],
    },

    // Home & Living
    {
      path: '/assets/img/interior/interior_01.jpg',
      description: 'Modern apartment living space',
      keywords: [
        'apartment',
        'home',
        'living',
        'roommate',
        'neighbor',
        'domestic',
      ],
    },
    {
      path: '/assets/img/interior/interior_02.jpg',
      description: 'Kitchen cooking scene',
      keywords: ['kitchen', 'cooking', 'food', 'home', 'meal', 'family'],
    },
    {
      path: '/assets/img/interior/interior_03.jpg',
      description: 'Bedroom with personal items',
      keywords: ['bedroom', 'personal', 'private', 'intimate', 'family'],
    },

    // Conflict & Drama
    {
      path: '/assets/img/blog/blog04.jpg',
      description: 'Person with head in hands looking defeated',
      keywords: ['defeated', 'sad', 'overwhelmed', 'betrayed', 'emotional'],
    },
    {
      path: '/assets/img/lifestyle/life_style08.jpg',
      description: 'Two people in heated discussion',
      keywords: ['argument', 'conflict', 'heated', 'confrontation', 'anger'],
    },

    // Victory & Justice
    {
      path: '/assets/img/lifestyle/life_style09.jpg',
      description: 'Person celebrating with raised fists',
      keywords: [
        'victory',
        'celebration',
        'justice',
        'win',
        'success',
        'revenge',
      ],
    },
    {
      path: '/assets/img/blog/blog05.jpg',
      description: 'Confident person standing tall',
      keywords: ['confident', 'strong', 'justice', 'victory', 'empowered'],
    },
  ],
};

/**
 * Check if this should be an all-time favorite story (every 5th story)
 */
async function shouldGenerateAllTimeFavorite() {
  try {
    const totalStories = await prisma.post.count();
    const isAllTimeFavorite = (totalStories + 1) % 5 === 0;
    return isAllTimeFavorite;
  } catch (error) {
    console.error('❌ Failed to check story count:', error.message);
    return false;
  }
}

/**
 * Check if this should be a Best of Updates saga (every 10th story)
 */
async function shouldGenerateBestOfUpdates() {
  try {
    const totalStories = await prisma.post.count();
    const isBestOfUpdates = (totalStories + 1) % 10 === 0;
    return isBestOfUpdates;
  } catch (error) {
    console.error(
      '❌ Failed to check story count for Best of Updates:',
      error.message
    );
    return false;
  }
}

/**
 * Check for story title/concept duplicates
 */
async function checkForDuplicates(title, category) {
  try {
    // Check for exact title matches
    const existingTitle = await prisma.post.findFirst({
      where: { title },
    });

    if (existingTitle) {
      // console.log('⚠️  Duplicate title detected, regenerating...');
      return true;
    }

    // Check for similar concepts in same category (last 20 stories)
    const recentSimilar = await prisma.post.findMany({
      where: {
        category: category,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // Simple similarity check on title keywords
    const titleWords = title
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3);
    const similarityThreshold = 3; // Number of matching keywords that suggests similarity

    for (const existing of recentSimilar) {
      const existingWords = existing.title
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 3);
      const matchingWords = titleWords.filter(word =>
        existingWords.includes(word)
      );

      if (matchingWords.length >= similarityThreshold) {
        // console.log(`⚠️  Similar story detected: "${existing.title}" - regenerating...`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Duplicate check failed:', error.message);
    return false;
  }
}

/**
 * Generate a complete viral story
 */
async function generateStory(options = {}) {
  try {
    // console.log('🚀 ThreadJuice Production Story Generator');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Determine content source and type
    const totalStories = await prisma.post.count();
    const isBestOfUpdates =
      options.source === 'updates' || (await shouldGenerateBestOfUpdates());
    const isTikTokStory =
      !isBestOfUpdates && (options.source === 'tiktok' || Math.random() < 0.15); // 15% chance for TikTok stories
    const isAllTimeFavorite =
      !isBestOfUpdates &&
      !isTikTokStory &&
      (await shouldGenerateAllTimeFavorite());

    let sourceInfo;
    if (isBestOfUpdates) {
      sourceInfo = {
        platform: 'reddit',
        type: 'updates',
        description: 'Best of Redditor Updates - multi-part saga',
      };
    } else if (isTikTokStory) {
      sourceInfo = {
        platform: 'tiktok',
        type: 'series',
        description: 'Multi-part TikTok viral story series',
      };
    } else if (isAllTimeFavorite) {
      sourceInfo = {
        platform: 'reddit',
        type: 'alltime',
        description: 'Reddit Top All-Time legendary post',
      };
    } else {
      sourceInfo = {
        platform: 'reddit',
        type: 'trending',
        description: 'Reddit Hot/Trending this week',
      };
    }

    // console.log(`📊 Story #${totalStories + 1} ${isBestOfUpdates ? '(📚 BEST OF UPDATES)' : isTikTokStory ? '(📱 TIKTOK SERIES)' : isAllTimeFavorite ? '(🏆 ALL-TIME FAVORITE)' : '(📈 TRENDING)'}`);

    // Select random category and persona
    const categories = Object.keys(CONFIG.categories);
    const category =
      options.category ||
      categories[Math.floor(Math.random() * categories.length)];
    const persona =
      options.persona ||
      CONFIG.personas[Math.floor(Math.random() * CONFIG.personas.length)];

    // console.log(`📝 Category: ${category}`);
    // console.log(`🎭 Persona: ${persona.name}`);
    // console.log(`🎯 Source: ${sourceInfo.description}`);

    // Generate story content with retry loop for duplicates
    let storyData;
    let attempts = 0;
    const maxAttempts = 3;

    do {
      attempts++;
      // console.log(`🎲 Generation attempt ${attempts}...`);

      const storyPrompt = `
Create a viral ${sourceInfo.platform.toUpperCase()}-style story for ThreadJuice. Focus on ${CONFIG.categories[category]}

${
  isTikTokStory
    ? 'IMPORTANT: This should be inspired by multi-part TikTok story series - dramatic, fast-paced stories that unfold across several videos. Think explosive reveals, cliffhangers, and the kind of dramatic storytelling that makes people binge-watch the entire series.'
    : isAllTimeFavorite
      ? "IMPORTANT: This should be inspired by Reddit's ALL-TIME TOP posts - the legendary, classic stories that have stood the test of time. Think of the most memorable, frequently referenced stories that have become internet folklore."
      : "IMPORTANT: This should be inspired by Reddit's HOT/TRENDING posts from this week - fresh, current stories that are gaining viral momentum right now."
}

Writer persona: ${persona.name} - ${persona.tone}

CRITICAL WRITING STYLE REQUIREMENTS:
- Write in THIRD PERSON throughout - never use "I", "me", "my"
- Refer to the story author using varied terms: "the author", "OP", "our protagonist", "the writer", "the user", "the poster", "[username]", "the original poster", "they", "this person"
- Rotate these references naturally throughout the story to avoid repetition
- Write as if you're a journalist/blogger covering someone else's viral Reddit post

THE TERRY SPECIFIC WRITING STYLE:
- Acerbic, funny, witty, overstimulated but emotionally intelligent
- Hates things in a smart way—irritation weaponised for comedy
- World-weary, hyper-observant, baffled by modern life but trying to keep it together
- Mix sentence lengths like stand-up: Short. Clipped. Then suddenly long, winding, overflowing with rage or joy. Then a fragment. For punch.
- Use specificity for laughs: not "a weird meal" but "wet pasta, three grapes, and a single sad Babybel"
- Meta-commentary: admit when something is stupid or if you're being dramatic
- Sudden zoom-outs: go from minor gripe to society crumbling in two lines
- Juxtaposition: pair formal phrasing with dumb topics
- Use parentheses for inner thoughts (or sudden tangents)
- No hedging. Say what you mean. Loudly. Wrong is fine if it's funny.
- Start in the middle of a thought like picking up a rant midstream
- Occasionally refer to yourself as "The Terry" but use VERY sparingly

Story Requirements:
- TONGUE-IN-CHEEK CLICKBAIT title that's self-aware about being clickbait - use classic clickbait formulas but with Terry's wit and irony
- Examples: "This Absolutely Deranged [Thing] Will Restore Your Faith in Human Stupidity" or "Number 4 Will Make You Question the Very Fabric of Reality (It's Actually Just Someone Being Slightly Rude)"
- More Terry examples: "Scientists Hate This One Weird Trick (The Trick Is Basic Human Decency)" or "You Won't Believe What Happened Next (Spoiler: Exactly What You'd Expect)" or "This Local [Person] Discovered One Simple Life Hack That Ruined Everything"
- Use clickbait structure but undercut it with Terry's world-weary realism and specificity
- Compelling story with clear setup, conflict, and satisfying resolution
- Realistic dialogue and situations from the original poster
- Dramatic quotes that capture key moments
- Viral potential with shareable elements  
- 800-1200 words total
- Modular structure with clear sections

Format as JSON with this exact structure (follow this pattern exactly):
{
  "title": "Self-aware clickbait title with Terry's tongue-in-cheek wit",
  "excerpt": "2-sentence teaser that hooks readers",
  "content": {
    "sections": [
      {
        "type": "describe-1",
        "title": "The Setup",
        "content": "Opening section that sets the scene and introduces the main characters..."
      },
      {
        "type": "describe-2", 
        "title": "The Situation Unfolds",
        "content": "More details about what happened, building tension..."
      },
      {
        "type": "quotes",
        "content": "First memorable quote from the story",
        "metadata": {
          "attribution": "Who said it",
          "context": "When/why they said it"
        }
      },
      {
        "type": "describe-3",
        "title": "The Plot Thickens", 
        "content": "Story escalation and complications..."
      },
      {
        "type": "comments-1",
        "title": "Reddit Reactions",
        "content": "The internet had THOUGHTS about this situation:"
      },
      {
        "type": "describe-4",
        "title": "The Climax",
        "content": "The main confrontation or resolution..."
      },
      {
        "type": "quotes",
        "content": "Second memorable quote from the climax",
        "metadata": {
          "attribution": "Who said it", 
          "context": "When/why they said it"
        }
      },
      {
        "type": "describe-5",
        "title": "The Resolution",
        "content": "How everything played out and final details..."
      },
      {
        "type": "comments-2",
        "title": "Final Reactions",
        "content": "More internet reactions to the outcome:"
      },
      {
        "type": "outro",
        "title": "The Aftermath",
        "content": "Final thoughts and what happened next..."
      }
    ]
  }
}`;

      const completion = await openai.chat.completions.create({
        model: CONFIG.models.primary,
        messages: [
          {
            role: 'system',
            content:
              'You are a viral content creator who writes engaging Reddit-style stories. Create compelling, shareable content that hooks readers and keeps them engaged.',
          },
          {
            role: 'user',
            content: storyPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      });

      let responseContent = completion.choices[0].message.content;

      // Remove markdown code blocks if present
      if (responseContent.includes('```json')) {
        responseContent = responseContent
          .replace(/```json\n?/g, '')
          .replace(/\n?```/g, '');
      }

      const generatedStory = JSON.parse(responseContent);

      // Check for duplicates
      const isDuplicate = await checkForDuplicates(
        generatedStory.title,
        category
      );

      if (!isDuplicate) {
        storyData = generatedStory;
        // console.log(`✅ Unique story generated: "${storyData.title}"`);
        break;
      } else if (attempts >= maxAttempts) {
        // console.log(`⚠️  Max attempts reached, proceeding with story despite similarity`);
        storyData = generatedStory;
        break;
      }
    } while (attempts < maxAttempts);

    // Select intelligent image
    const imageScore = CONFIG.imageLibrary.map(img => ({
      ...img,
      score: calculateImageScore(storyData, img),
    }));

    const bestImage = imageScore.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    // Create complete story object
    const story = {
      id: `story-${Date.now()}`,
      title: storyData.title,
      slug: createSlug(storyData.title),
      excerpt: storyData.excerpt,
      category: category,
      status: 'published',
      trending: true,
      featured: Math.random() > 0.5,
      author: persona.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: {
        name: persona.name,
        slug: persona.slug,
        bio: persona.bio,
        tone: persona.tone,
        avatar: persona.avatar,
      },
      content: {
        sections: [
          {
            type: 'image',
            content: bestImage.description,
            metadata: {
              image_source: 'Stock photo from ThreadJuice library',
              image_url: bestImage.path,
              attribution: 'Stock photo',
              source: 'ThreadJuice curated library',
              selection_timestamp: new Date().toISOString(),
              image_type: 'stock',
            },
          },
          ...storyData.content.sections,
          {
            type: 'comments-1',
            title: `${sourceInfo.platform === 'tiktok' ? 'TikTok Comments' : 'Reddit Reactions'}`,
            content: 'The internet had THOUGHTS about this situation:',
            metadata: {
              comments:
                sourceInfo.platform === 'tiktok'
                  ? generateTikTokComments()
                  : generateRedditComments(),
            },
          },
        ],
      },
      imageUrl: bestImage.path,
      viewCount: Math.floor(Math.random() * 50000) + 10000,
      upvoteCount: Math.floor(Math.random() * 5000) + 1000,
      commentCount: Math.floor(Math.random() * 500) + 50,
      shareCount: Math.floor(Math.random() * 3000) + 500,
      bookmarkCount: Math.floor(Math.random() * 500) + 50,
      tags: [category, 'viral', sourceInfo.platform, sourceInfo.type],
      viral_score: Math.floor(Math.random() * 3) + 8,
      contentSource: {
        platform: sourceInfo.platform,
        type: sourceInfo.type,
        originalPost:
          sourceInfo.platform === 'tiktok'
            ? 'Multi-part TikTok series'
            : 'Generated story thread',
        url:
          sourceInfo.platform === 'tiktok'
            ? `https://tiktok.com/@user${Math.floor(Math.random() * 9999)}`
            : `https://reddit.com/r/${getSubredditForCategory(category)}`,
      },
      // Legacy field for backward compatibility
      redditSource: {
        subreddit:
          sourceInfo.platform === 'reddit'
            ? getSubredditForCategory(category)
            : null,
        originalPost: 'Generated story thread',
        threadUrl:
          sourceInfo.platform === 'reddit'
            ? `https://reddit.com/r/${getSubredditForCategory(category)}`
            : null,
      },
      readingTime: Math.ceil(storyData.content.sections.length * 0.5),
    };

    // console.log(`✅ Generated: "${story.title}"`);
    // console.log(`📸 Image: ${bestImage.path} (score: ${bestImage.score})`);
    // console.log(`📊 Stats: ${story.viewCount} views, ${story.upvoteCount} upvotes`);

    return story;
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Save story to database
 */
async function saveToDatabase(story) {
  try {
    // console.log('\n💾 Saving to database...');

    // Check if persona exists, create if not
    let existingPersona = await prisma.persona.findUnique({
      where: { name: story.persona.name },
    });

    if (!existingPersona) {
      existingPersona = await prisma.persona.create({
        data: {
          name: story.persona.name,
          slug: story.persona.slug,
          bio: story.persona.bio,
          tone: story.persona.tone,
          avatarUrl: story.persona.avatar,
          storyCount: 0,
          rating: 4.5,
        },
      });
    }

    // Save story to database
    const savedStory = await prisma.post.create({
      data: {
        title: story.title,
        slug: story.slug,
        excerpt: story.excerpt,
        content: JSON.stringify(story.content),
        imageUrl: story.imageUrl,
        category: story.category,
        author: story.author,
        personaId: existingPersona.id,
        status: story.status,
        viewCount: story.viewCount,
        upvoteCount: story.upvoteCount,
        commentCount: story.commentCount,
        shareCount: story.shareCount,
        bookmarkCount: story.bookmarkCount,
        trending: story.trending,
        featured: story.featured,
        subreddit: story.redditSource.subreddit,
      },
    });

    // console.log(`✅ Saved to database with ID: ${savedStory.id}`);
    // console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);

    return savedStory;
  } catch (error) {
    console.error('❌ Database save failed:', error.message);
    throw error;
  }
}

/**
 * Helper functions
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 60);
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(null));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1, // deletion
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen; // Return similarity ratio (0-1)
}

/**
 * Find fuzzy matches for a term in a list of keywords
 */
function findFuzzyMatches(searchTerm, keywords, threshold = 0.6) {
  const matches = [];
  const searchLower = searchTerm.toLowerCase();

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();

    // Exact match
    if (keywordLower === searchLower) {
      matches.push({ keyword, score: 1.0 });
      return;
    }

    // Substring match
    if (
      keywordLower.includes(searchLower) ||
      searchLower.includes(keywordLower)
    ) {
      matches.push({ keyword, score: 0.8 });
      return;
    }

    // Fuzzy match using similarity
    const similarity = calculateSimilarity(searchLower, keywordLower);
    if (similarity >= threshold) {
      matches.push({ keyword, score: similarity });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Extract meaningful terms from text for image matching
 */
function extractSearchTerms(text) {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'throughout',
    'despite',
    'towards',
    'upon',
    'concerning',
    'a',
    'an',
    'this',
    'that',
    'these',
    'those',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'us',
    'them',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'shall',
    'can',
    'get',
    'got',
    'come',
    'go',
    'went',
    'gone',
    'make',
    'made',
    'take',
    'took',
    'taken',
    'see',
    'saw',
    'seen',
    'know',
    'knew',
    'known',
    'think',
    'thought',
    'say',
    'said',
    'tell',
    'told',
    'become',
    'became',
    'like',
    'just',
    'now',
    'then',
    'than',
    'only',
    'also',
    'back',
    'more',
    'most',
    'much',
    'many',
    'some',
    'any',
    'no',
    'not',
    'very',
    'so',
    'too',
    'way',
    'well',
    'good',
    'new',
    'first',
    'last',
    'long',
    'great',
    'little',
    'own',
    'other',
    'old',
    'right',
    'big',
    'high',
    'different',
    'small',
    'large',
    'next',
    'early',
    'young',
    'important',
    'few',
    'public',
    'bad',
    'same',
    'able',
    'how',
    'when',
    'where',
    'why',
    'what',
    'who',
    'which',
    'how',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
}

function calculateImageScore(story, image) {
  let score = 0;

  // Extract all text content for analysis
  const titleText = story.title.toLowerCase();
  const excerptText = (story.excerpt || '').toLowerCase();
  const contentText =
    story.content?.sections
      ?.map(s => s.content || '')
      .join(' ')
      .toLowerCase() || '';
  const allText = `${titleText} ${excerptText} ${contentText}`;

  // Extract meaningful search terms from story content
  const searchTerms = [
    ...extractSearchTerms(titleText),
    ...extractSearchTerms(excerptText),
    ...extractSearchTerms(contentText),
  ].filter((term, index, arr) => arr.indexOf(term) === index); // Remove duplicates

  // Enhanced fuzzy matching with weighted scoring
  searchTerms.forEach(searchTerm => {
    const fuzzyMatches = findFuzzyMatches(
      searchTerm,
      image.keywords || [],
      0.6
    );

    fuzzyMatches.forEach(match => {
      // Weight by content location and fuzzy match quality
      if (titleText.includes(searchTerm)) {
        score += match.score * 30; // Highest weight for title matches
      } else if (excerptText.includes(searchTerm)) {
        score += match.score * 20; // Medium weight for excerpt matches
      } else {
        score += match.score * 10; // Lower weight for content matches
      }
    });
  });

  // Direct keyword matching (for exact matches not caught by fuzzy search)
  image.keywords?.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();

    // Title exact matches (highest weight)
    if (titleText.includes(keywordLower)) score += 25;

    // Excerpt exact matches (medium weight)
    if (excerptText.includes(keywordLower)) score += 15;

    // Content exact matches (lower weight but still important)
    const contentMatches = (
      contentText.match(new RegExp(keywordLower, 'g')) || []
    ).length;
    score += contentMatches * 5;
  });

  // Category-specific bonuses for contextual relevance
  const categoryBonus = {
    politics: [
      'meeting',
      'professional',
      'office',
      'discussion',
      'argument',
      'confrontation',
    ],
    sports: [
      'victory',
      'celebration',
      'competition',
      'team',
      'success',
      'confident',
    ],
    technology: [
      'computer',
      'laptop',
      'work',
      'office',
      'typing',
      'professional',
    ],
    celebrity: [
      'phone',
      'social',
      'celebration',
      'success',
      'victory',
      'confident',
    ],
    business: [
      'office',
      'meeting',
      'professional',
      'work',
      'computer',
      'success',
    ],
    relationships: [
      'couple',
      'relationship',
      'dating',
      'restaurant',
      'phone',
      'emotional',
    ],
    workplace: [
      'office',
      'work',
      'meeting',
      'boss',
      'professional',
      'computer',
      'frustrated',
    ],
    education: ['meeting', 'discussion', 'group', 'professional', 'work'],
    travel: ['outdoor', 'contemplative', 'thinking', 'reflection', 'decision'],
    food: ['restaurant', 'dining', 'food', 'kitchen', 'cooking', 'meal'],
    parenting: [
      'home',
      'family',
      'domestic',
      'kitchen',
      'bedroom',
      'emotional',
    ],
    social: ['phone', 'typing', 'computer', 'online', 'discussion', 'group'],
    health: ['contemplative', 'thinking', 'reflection', 'outdoor', 'stressed'],
    environment: ['outdoor', 'contemplative', 'reflection', 'thinking'],
    gaming: ['computer', 'laptop', 'typing', 'work', 'celebration', 'victory'],
    legal: ['meeting', 'professional', 'office', 'discussion', 'argument'],
    housing: [
      'apartment',
      'home',
      'living',
      'domestic',
      'argument',
      'conflict',
    ],
    money: ['stressed', 'worried', 'frustrated', 'contemplative', 'thinking'],
  };

  const relevantKeywords = categoryBonus[story.category] || [];
  image.keywords?.forEach(keyword => {
    if (relevantKeywords.includes(keyword)) {
      score += 20;
    }
  });

  // Emotional tone matching
  const emotionalContext = {
    positive: [
      'happy',
      'smiling',
      'success',
      'victory',
      'celebration',
      'confident',
      'empowered',
    ],
    negative: [
      'stressed',
      'defeated',
      'sad',
      'disappointed',
      'frustrated',
      'betrayed',
      'overwhelmed',
    ],
    conflict: ['argument', 'confrontation', 'heated', 'conflict', 'anger'],
    victory: [
      'victory',
      'justice',
      'success',
      'celebration',
      'confident',
      'empowered',
    ],
  };

  // Determine story emotional arc (usually ends positive in revenge stories)
  if (
    allText.includes('justice') ||
    allText.includes('revenge') ||
    allText.includes('karma')
  ) {
    emotionalContext.victory.forEach(emotion => {
      if (image.keywords?.includes(emotion)) score += 15;
    });
  }

  // Smart contextual analysis
  const contextualMatches = {
    cheating: ['phone', 'relationship', 'betrayed', 'dating'],
    boss: ['office', 'work', 'frustrated', 'professional'],
    roommate: ['apartment', 'home', 'living', 'domestic'],
    'dating app': ['phone', 'laptop', 'online', 'computer'],
    restaurant: ['restaurant', 'food', 'dining'],
    profile: ['phone', 'laptop', 'computer', 'online'],
    viral: ['phone', 'laptop', 'computer', 'celebration', 'success'],
  };

  Object.entries(contextualMatches).forEach(([context, keywords]) => {
    if (allText.includes(context)) {
      keywords.forEach(keyword => {
        if (image.keywords?.includes(keyword)) score += 12;
      });
    }
  });

  // Penalize obviously mismatched images
  const storyMood =
    allText.includes('victory') || allText.includes('success')
      ? 'positive'
      : allText.includes('betrayed') || allText.includes('upset')
        ? 'negative'
        : 'neutral';

  if (
    storyMood === 'positive' &&
    image.keywords?.some(k => ['defeated', 'sad', 'overwhelmed'].includes(k))
  ) {
    score -= 10;
  }

  if (
    storyMood === 'negative' &&
    image.keywords?.some(k => ['celebration', 'victory', 'happy'].includes(k))
  ) {
    score -= 10;
  }

  // Ensure minimum score for fallback
  return Math.max(score, 1) + Math.random() * 3;
}

function generateRedditComments() {
  const comments = [
    'This is the kind of justice we need more of! Absolutely brilliant move.',
    'Kudos to you for turning the tables. They got what they deserved!',
    'This should be a lesson to all manipulators. The truth always comes out.',
    'Honestly, the way you handled this? Legendary.',
    'The audacity of some people never ceases to amaze me.',
    'Play stupid games, win stupid prizes. Perfect example right here.',
  ];

  return comments.slice(0, 4).map((content, index) => ({
    author: `RedditUser${Math.floor(Math.random() * 9999)}`,
    content,
  }));
}

function generateTikTokComments() {
  const comments = [
    'WAIT WHAT?! I need part 47 immediately 😭',
    'The way I RAN to the comments... bestie did not disappoint',
    'Not me watching this whole saga instead of doing homework',
    'Main character energy ✨ we love to see it',
    'This is better than Netflix I swear',
    'The absolute CHAOS... I live for this drama',
  ];

  return comments.slice(0, 4).map((content, index) => ({
    author: `@tiktoker${Math.floor(Math.random() * 9999)}`,
    content,
  }));
}

function getSubredditForCategory(category) {
  const mapping = {
    politics: 'politics',
    sports: 'sports',
    technology: 'technology',
    celebrity: 'entertainment',
    business: 'business',
    relationships: 'relationships',
    workplace: 'antiwork',
    education: 'college',
    travel: 'travel',
    food: 'food',
    parenting: 'parenting',
    social: 'socialmedia',
    health: 'health',
    environment: 'environment',
    gaming: 'gaming',
    legal: 'legaladvice',
    housing: 'legaladvice',
    money: 'personalfinance',
  };
  return mapping[category] || 'stories';
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--category') options.category = args[i + 1];
    if (args[i] === '--source') options.source = args[i + 1]; // trending, alltime, tiktok, updates
    if (args[i] === '--persona')
      options.persona = CONFIG.personas.find(p => p.id === args[i + 1]);
    if (args[i] === '--save') options.save = args[i + 1] !== 'false';
  }

  try {
    const story = await generateStory(options);

    if (options.save !== false) {
      await saveToDatabase(story);
    }

    // console.log('\n🎉 Story generation complete!');
    // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use as module
export { generateStory, saveToDatabase };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
