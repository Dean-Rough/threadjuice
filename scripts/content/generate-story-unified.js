#!/usr/bin/env node

/**
 * ThreadJuice Unified Story Generator
 * 
 * Consolidates all story generation functionality into one clean script
 * Replaces: generate-story.js, storygen-1.js, generate-full-automated-story.js
 * and all deprecated scripts
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    // Use existing environment variables
  }
}

loadEnvVars();

// Initialize services (lazy loading)
let prisma;
let openai;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment or .env.local');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Configuration
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
  categories: {
    politics: 'Political drama, government scandals, election controversies',
    sports: 'Athletic drama, team scandals, player controversies',
    technology: 'Tech failures, app disasters, AI mishaps',
    celebrity: 'Celebrity scandals, social media drama, PR disasters',
    business: 'Corporate scandals, startup failures, workplace drama',
    relationships: 'Dating disasters, marriage drama, family conflicts',
    workplace: 'Office politics, boss conflicts, coworker drama',
    education: 'School drama, university scandals, academic controversies',
    travel: 'Travel disasters, vacation drama, cultural incidents',
    food: 'Restaurant drama, cooking disasters, food trends',
    parenting: 'Parenting fails, school conflicts, family chaos',
    social: 'Social media drama, viral trends, community conflicts',
    health: 'Medical drama, fitness controversies, wellness scandals',
    environment: 'Climate incidents, conservation drama',
    gaming: 'Gaming controversies, esports drama, streamer incidents',
    legal: 'Court drama, legal battles, justice incidents',
    housing: 'Neighbor disputes, landlord drama, property conflicts',
    money: 'Financial scandals, investment drama, economic incidents',
  },
  imageLibrary: [
    {
      path: '/assets/img/lifestyle/life_style01.jpg',
      description: 'Person working on laptop in cafe',
      keywords: ['laptop', 'work', 'cafe', 'computer', 'online', 'typing'],
    },
    {
      path: '/assets/img/lifestyle/life_style02.jpg',
      description: 'Person looking stressed while checking phone',
      keywords: ['phone', 'stressed', 'mobile', 'text', 'messaging', 'upset', 'worried'],
    },
    {
      path: '/assets/img/lifestyle/life_style03.jpg',
      description: 'Group of people having animated discussion',
      keywords: ['discussion', 'argument', 'meeting', 'group', 'conversation', 'friends'],
    },
    {
      path: '/assets/img/lifestyle/life_style04.jpg',
      description: 'Woman smiling while using phone',
      keywords: ['happy', 'phone', 'smiling', 'success', 'victory', 'celebration'],
    },
    {
      path: '/assets/img/lifestyle/life_style05.jpg',
      description: 'Person looking contemplative outdoors',
      keywords: ['thinking', 'contemplative', 'decision', 'outdoor', 'reflection'],
    },
    {
      path: '/assets/img/lifestyle/life_style06.jpg',
      description: 'Couple having serious conversation',
      keywords: ['couple', 'relationship', 'serious', 'dating', 'confrontation'],
    },
    {
      path: '/assets/img/lifestyle/life_style07.jpg',
      description: 'Person looking disappointed at restaurant',
      keywords: ['restaurant', 'date', 'disappointed', 'dining', 'food'],
    },
    {
      path: '/assets/img/blog/blog01.jpg',
      description: 'Professional meeting room scene',
      keywords: ['office', 'meeting', 'professional', 'work', 'business', 'corporate'],
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
    {
      path: '/assets/img/lifestyle/life_style09.jpg',
      description: 'Person celebrating with raised fists',
      keywords: ['victory', 'celebration', 'justice', 'win', 'success', 'revenge'],
    },
    {
      path: '/assets/img/blog/blog05.jpg',
      description: 'Confident person standing tall',
      keywords: ['confident', 'strong', 'justice', 'victory', 'empowered'],
    },
  ],
};

/**
 * Generate story content using OpenAI
 */
async function generateStoryContent(options = {}) {
  const category = options.category || Object.keys(CONFIG.categories)[Math.floor(Math.random() * Object.keys(CONFIG.categories).length)];
  const persona = options.persona || CONFIG.personas[0];
  const contentSource = options.source || (Math.random() < 0.15 ? 'tiktok' : 'reddit');

  const prompt = `Create a viral ${contentSource.toUpperCase()}-style story for ThreadJuice. Focus on ${CONFIG.categories[category]}

Writer persona: ${persona.name} - ${persona.tone}

CRITICAL WRITING STYLE REQUIREMENTS:
- Write in THIRD PERSON throughout - never use "I", "me", "my"
- Refer to the story author as "the author", "OP", "our protagonist", "the writer", etc.
- TONGUE-IN-CHEEK CLICKBAIT title that's self-aware about being clickbait
- Compelling story with clear setup, conflict, and satisfying resolution
- Realistic dialogue and situations
- 800-1200 words total

Format as JSON with this exact structure:
{
  "title": "Self-aware clickbait title with Terry's tongue-in-cheek wit",
  "excerpt": "2-sentence teaser that hooks readers",
  "content": {
    "sections": [
      {
        "type": "describe-1",
        "title": "The Setup",
        "content": "Opening section that sets the scene..."
      },
      {
        "type": "describe-2",
        "title": "The Situation Unfolds",
        "content": "More details about what happened..."
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
        "content": "Story escalation..."
      },
      {
        "type": "describe-4",
        "title": "The Climax",
        "content": "The main confrontation..."
      },
      {
        "type": "quotes",
        "content": "Second memorable quote",
        "metadata": {
          "attribution": "Who said it",
          "context": "When/why they said it"
        }
      },
      {
        "type": "describe-5",
        "title": "The Resolution",
        "content": "How everything played out..."
      },
      {
        "type": "outro",
        "title": "The Aftermath",
        "content": "Final thoughts..."
      }
    ]
  }
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: CONFIG.models.primary,
      messages: [
        {
          role: 'system',
          content: 'You are a viral content creator who writes engaging Reddit-style stories.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    let responseContent = completion.choices[0].message.content;
    
    // Clean up response
    if (responseContent.includes('```json')) {
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/\n?```/g, '');
    }

    const story = JSON.parse(responseContent);
    
    return {
      ...story,
      category,
      persona,
      contentSource,
    };
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Select the best image for a story
 */
function selectImageForStory(story) {
  const titleText = story.title.toLowerCase();
  const contentText = story.content.sections.map(s => s.content || '').join(' ').toLowerCase();
  const allText = `${titleText} ${story.excerpt} ${contentText}`;

  // Score each image
  const scores = CONFIG.imageLibrary.map(img => {
    let score = 0;
    
    // Check keyword matches
    img.keywords.forEach(keyword => {
      if (allText.includes(keyword)) score += 5;
      if (titleText.includes(keyword)) score += 10;
    });

    // Category bonuses
    const categoryKeywords = {
      workplace: ['office', 'work', 'meeting', 'boss', 'professional'],
      relationships: ['couple', 'relationship', 'dating', 'phone'],
      social: ['phone', 'computer', 'online', 'discussion'],
    };

    const relevantKeywords = categoryKeywords[story.category] || [];
    img.keywords.forEach(keyword => {
      if (relevantKeywords.includes(keyword)) score += 8;
    });

    return { ...img, score };
  });

  // Sort by score and return best match
  scores.sort((a, b) => b.score - a.score);
  return scores[0];
}

/**
 * Generate Reddit-style comments
 */
function generateComments(platform = 'reddit') {
  const redditComments = [
    'This is the kind of justice we need more of! Absolutely brilliant move.',
    'Play stupid games, win stupid prizes. Perfect example right here.',
    'The audacity of some people never ceases to amaze me.',
    'Honestly, the way you handled this? Legendary.',
  ];

  const tiktokComments = [
    'WAIT WHAT?! I need part 47 immediately 😭',
    'Not me watching this whole saga instead of doing homework',
    'This is better than Netflix I swear',
    'The absolute CHAOS... I live for this drama',
  ];

  const comments = platform === 'tiktok' ? tiktokComments : redditComments;
  
  return comments.map(content => ({
    author: platform === 'tiktok' 
      ? `@tiktoker${Math.floor(Math.random() * 9999)}`
      : `RedditUser${Math.floor(Math.random() * 9999)}`,
    content,
  }));
}

/**
 * Create slug from title
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
 * Save story to database
 */
async function saveToDatabase(story) {
  try {
    const db = getPrisma();
    
    // Ensure persona exists
    let persona = await db.persona.findUnique({
      where: { slug: story.persona.slug },
    });

    if (!persona) {
      persona = await db.persona.create({
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

    // Save story
    const savedStory = await db.post.create({
      data: {
        title: story.title,
        slug: story.slug,
        excerpt: story.excerpt,
        content: JSON.stringify(story.content),
        imageUrl: story.imageUrl,
        category: story.category,
        author: story.author,
        personaId: persona.id,
        status: 'published',
        viewCount: story.viewCount,
        upvoteCount: story.upvoteCount,
        commentCount: story.commentCount,
        shareCount: story.shareCount,
        bookmarkCount: story.bookmarkCount,
        trending: story.trending,
        featured: story.featured,
        subreddit: story.category,
      },
    });

    return savedStory;
  } catch (error) {
    console.error('❌ Database save failed:', error.message);
    throw error;
  }
}

/**
 * Generate a complete story
 */
export async function generateStory(options = {}) {
  try {
    // Generate content
    const storyData = await generateStoryContent(options);
    
    // Select image
    const image = selectImageForStory(storyData);
    
    // Generate comments
    const comments = generateComments(storyData.contentSource);
    
    // Build complete story
    const story = {
      id: `story-${Date.now()}`,
      title: storyData.title,
      slug: createSlug(storyData.title),
      excerpt: storyData.excerpt,
      category: storyData.category,
      status: 'published',
      trending: true,
      featured: Math.random() > 0.5,
      author: storyData.persona.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: storyData.persona,
      content: {
        sections: [
          {
            type: 'image',
            content: image.description,
            metadata: {
              image_source: 'Stock photo from ThreadJuice library',
              image_url: image.path,
              attribution: 'Stock photo',
              source: 'ThreadJuice curated library',
            },
          },
          ...storyData.content.sections,
          {
            type: 'comments-1',
            title: `${storyData.contentSource === 'tiktok' ? 'TikTok' : 'Reddit'} Reactions`,
            content: 'The internet had THOUGHTS about this situation:',
            metadata: { comments },
          },
        ],
      },
      imageUrl: image.path,
      viewCount: Math.floor(Math.random() * 50000) + 10000,
      upvoteCount: Math.floor(Math.random() * 5000) + 1000,
      commentCount: Math.floor(Math.random() * 500) + 50,
      shareCount: Math.floor(Math.random() * 3000) + 500,
      bookmarkCount: Math.floor(Math.random() * 500) + 50,
      tags: [storyData.category, 'viral', storyData.contentSource],
      viral_score: Math.floor(Math.random() * 3) + 8,
      readingTime: Math.ceil(storyData.content.sections.length * 0.5),
    };

    return story;
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate multiple stories
 */
export async function generateBulkStories(count = 5) {
  const stories = [];
  const errors = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`\n📝 Generating story ${i + 1}/${count}...`);
      const story = await generateStory();
      stories.push(story);
      console.log(`✅ Generated: "${story.title}"`);
    } catch (error) {
      console.error(`❌ Failed to generate story ${i + 1}:`, error.message);
      errors.push(error.message);
    }
  }

  return { stories, errors };
}

/**
 * Save story to JSON file
 */
export async function saveToFile(story) {
  const filename = `generated-${story.slug}.json`;
  const filepath = path.join(process.cwd(), 'data', 'generated-stories', filename);
  
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(story, null, 2));
  
  return filename;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  try {
    switch (command) {
      case 'generate': {
        const options = {};
        for (let i = 1; i < args.length; i += 2) {
          if (args[i] === '--category') options.category = args[i + 1];
          if (args[i] === '--source') options.source = args[i + 1];
          if (args[i] === '--save-file') options.saveFile = true;
          if (args[i] === '--no-db') options.noDB = true;
        }

        const story = await generateStory(options);
        
        if (!options.noDB) {
          await saveToDatabase(story);
          console.log(`✅ Saved to database: ${story.slug}`);
        }
        
        if (options.saveFile) {
          const filename = await saveToFile(story);
          console.log(`📄 Saved to file: ${filename}`);
        }
        
        console.log(`\n🎉 Story generation complete!`);
        console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);
        break;
      }
      
      case 'bulk': {
        const count = parseInt(args[1]) || 5;
        console.log(`🚀 Generating ${count} stories...`);
        
        const { stories, errors } = await generateBulkStories(count);
        
        // Save all to database
        for (const story of stories) {
          await saveToDatabase(story);
        }
        
        console.log(`\n✅ Generated ${stories.length} stories`);
        if (errors.length > 0) {
          console.log(`❌ Failed: ${errors.length}`);
        }
        break;
      }
      
      case 'help': {
        console.log(`
ThreadJuice Unified Story Generator

Usage:
  node generate-story-unified.js [command] [options]

Commands:
  generate    Generate a single story (default)
  bulk <n>    Generate n stories
  help        Show this help

Options:
  --category <name>  Specify category
  --source <type>    Content source (reddit/tiktok)
  --save-file        Save to JSON file
  --no-db           Don't save to database

Examples:
  node generate-story-unified.js
  node generate-story-unified.js generate --category workplace
  node generate-story-unified.js bulk 10
        `);
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Export for use as module
export { CONFIG, createSlug, selectImageForStory, generateComments };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}