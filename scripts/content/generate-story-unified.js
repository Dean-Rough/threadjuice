#!/usr/bin/env node

/**
 * ThreadJuice Unified Story Generator
 * 
 * Consolidates all story generation functionality into one clean script
 * Replaces: generate-story.js, storygen-1.js, generate-full-automated-story.js
 * and all deprecated scripts
 */

import { createClient } from '@supabase/supabase-js';
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
    const envContent = readFileSync(envPath, 'utf8');
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
let supabase;
let openai;
let imageServiceInstance;
let storyCounter = 0;

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

// Simple Pexels integration
async function searchPexels(query) {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.log('❌ No Pexels API key found');
    return null;
  }

  try {
    console.log(`📸 Searching Pexels for: "${query}"`);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': pexelsApiKey,
        },
      }
    );

    if (!response.ok) {
      console.log(`❌ Pexels API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      console.log(`✅ Found ${data.photos.length} Pexels images`);
      const photo = data.photos[0];
      return {
        path: photo.src.large,
        description: photo.alt || `Photo by ${photo.photographer}`,
        source_name: 'Pexels',
        source_url: photo.url,
        author: photo.photographer,
        license_type: 'Pexels License',
      };
    }
    
    console.log('⚠️  No Pexels results found');
    return null;
  } catch (error) {
    console.error('❌ Pexels search failed:', error.message);
    return null;
  }
}

async function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment or .env.local');
    }
    const OpenAI = (await import('openai')).default;
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
  
  // Every 6th story should be Twitter
  storyCounter++;
  let contentSource = options.source;
  if (!contentSource) {
    if (storyCounter % 6 === 0) {
      contentSource = 'twitter';
    } else {
      contentSource = 'reddit'; // No TikTok
    }
  }

  const platformStyles = {
    reddit: 'Reddit post with authentic community feel, using subreddit-style language',
    twitter: 'Twitter thread controversy with quote tweets, ratios, and viral screenshots'
  };

  const prompt = `Create a viral ${contentSource.toUpperCase()}-style story for ThreadJuice. Focus on ${CONFIG.categories[category]}

Writer persona: ${persona.name} - ${persona.tone}

PLATFORM: ${contentSource.toUpperCase()} - ${platformStyles[contentSource]}

CRITICAL WRITING STYLE REQUIREMENTS:
- Write in THIRD PERSON throughout - never use "I", "me", "my"
- Refer to the story author as "the author", "OP", "our protagonist", "the writer", etc.
- TONGUE-IN-CHEEK CLICKBAIT title that's self-aware about being clickbait
- Each section should be 150-250 words (longer than typical)
- Total story: 1200-1800 words
- Section titles should be CREATIVE and SPECIFIC to the story - NOT generic like "The Setup"
- Vary sentence structure and paragraph length
- Include specific details, dialogue, and vivid descriptions
- Add unexpected twists and unique observations

MEDIA REFERENCES:
- When mentioning specific videos or tweets, add a media placeholder
- Format: [MEDIA: type="video/tweet" query="search terms" context="what it shows"]
- Examples:
  - "The CEO posted an apology video [MEDIA: type="video" query="CEO name apology 2024" context="emotional apology about layoffs"]"
  - "The tweet went viral [MEDIA: type="tweet" query="specific quote from tweet" context="ratio'd response about topic"]"
- If the story mentions TikTok, just reference it naturally without media embeds

${contentSource === 'twitter' ? 
'TWITTER SPECIFIC: Include mentions of quote tweets, viral threads, being "ratioed", screenshots going viral, blue check drama' : 
'REDDIT SPECIFIC: Include subreddit culture, upvotes, awards, cross-posting, "Edit: Thanks for the gold!"'}

Format as JSON with this structure (but with CREATIVE, STORY-SPECIFIC titles):
{
  "title": "Wildly specific clickbait title that hints at the absurdity",
  "excerpt": "2-3 sentence hook that creates intrigue without giving everything away",
  "sourceUrl": "${contentSource === 'reddit' ? 'https://reddit.com/r/AmItheAsshole/comments/xyz123' : 'https://twitter.com/user/status/123456789'}",
  "sourceUsername": "${contentSource === 'reddit' ? 'u/throwaway12345' : '@dramauser123'}",
  "sourcePlatform": "${contentSource}",
  "content": {
    "sections": [
      {
        "type": "describe-1",
        "content": "[150-250 words setting up the story. MUST include: 'Originally posted by [username] on [platform]' with specific subreddit/hashtag. NO TITLE for this first section]"
      },
      {
        "type": "describe-2", 
        "title": "[Specific title about what happens next]",
        "content": "[150-250 words developing the situation]"
      },
      {
        "type": "quotes",
        "content": "[Memorable quote that captures the absurdity]",
        "metadata": {
          "attribution": "[Specific person/username]",
          "context": "[When and why this was said]",
          "userUrl": "[Link to user profile - reddit.com/u/username or twitter.com/username]"
        }
      },
      {
        "type": "describe-3",
        "title": "[Title that hints at the twist/escalation]",
        "content": "[150-250 words of rising action]"
      },
      {
        "type": "describe-4",
        "title": "[Dramatic title for the peak moment]",
        "content": "[150-250 words of the main confrontation]"
      },
      {
        "type": "quotes",
        "content": "[Another memorable quote]",
        "metadata": {
          "attribution": "[Who said it]",
          "context": "[The moment this happened]",
          "userUrl": "[Link to user profile - reddit.com/u/username or twitter.com/username]"
        }
      },
      {
        "type": "describe-5",
        "title": "[Title about the unexpected resolution]",
        "content": "[150-250 words of how it resolved]"
      },
      {
        "type": "outro",
        "title": "[Witty title for the aftermath]",
        "content": "[150-250 words of reflection and current status]"
      }
    ]
  }
}`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
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
      sourceUrl: story.sourceUrl,
      sourceUsername: story.sourceUsername,
      sourcePlatform: story.sourcePlatform || contentSource,
    };
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Extract key nouns from a title for image searches
 */
function extractKeyNouns(title) {
  // Common words to ignore
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'by', 'from', 'when', 'where', 'how', 'why', 'what',
                     'becomes', 'turns', 'makes', 'gets', 'goes', 'comes', 'takes'];
  
  // Common compound terms to keep together
  const compoundTerms = {
    'hedge fund': 'finance investment',
    'social media': 'social media',
    'high school': 'school',
    'middle school': 'school', 
    'real estate': 'property',
    'wall street': 'finance',
    'silicon valley': 'technology',
    'venture capital': 'business investment',
    'private equity': 'business finance',
    'artificial intelligence': 'AI technology',
    'machine learning': 'technology',
    'electric vehicle': 'electric car',
    'climate change': 'environment',
    'stock market': 'trading finance',
    'crypto currency': 'cryptocurrency',
    'bitcoin': 'cryptocurrency',
    'video game': 'gaming',
    'tik tok': 'social media',
    'gen z': 'young people',
    'baby boomer': 'older people',
    'millennial': 'millennial generation',
    'air fryer': 'kitchen appliance',
    'avocado toast': 'food brunch',
    'escape room': 'entertainment',
    'food truck': 'restaurant',
    'startup founder': 'entrepreneur',
    'tech bro': 'technology person',
    'wine mom': 'parent lifestyle',
    'gender reveal': 'party celebration'
  };
  
  // Check for compound terms first
  let lowerTitle = title.toLowerCase();
  let primaryConcept = null;
  let secondaryConcept = null;
  
  // Look for compound terms
  for (const [compound, replacement] of Object.entries(compoundTerms)) {
    if (lowerTitle.includes(compound)) {
      primaryConcept = replacement;
      // Remove the compound term from title for further processing
      lowerTitle = lowerTitle.replace(compound, '');
      break;
    }
  }
  
  // Extract meaningful words
  const words = lowerTitle
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Filter out common filler words
  const potentialObjects = words.filter(word => 
    !['missing', 'viral', 'shocking', 'amazing', 'incredible', 'breaking', 'exclusive', 'trending'].includes(word)
  );
  
  // If no compound term found, use the first meaningful words
  if (!primaryConcept) {
    primaryConcept = potentialObjects[0] || words[0] || 'lifestyle';
  }
  
  // Find secondary concept
  secondaryConcept = potentialObjects.find(word => word !== primaryConcept) || potentialObjects[1] || primaryConcept;
  
  return {
    what: primaryConcept,
    where: secondaryConcept,
    all: words
  };
}

/**
 * Select images for a story (hero + inline)
 */
async function selectImagesForStory(story) {
  try {
    console.log(`🖼️  Finding images for: "${story.title}"`);
    
    // Extract key concepts
    const concepts = extractKeyNouns(story.title);
    console.log(`📎 Key concepts - What: "${concepts.what}", Where: "${concepts.where}"`);
    
    // Category-specific search terms
    const categorySearchTerms = {
      workplace: 'office',
      relationships: 'couple',
      technology: 'computer',
      politics: 'government',
      sports: 'sports',
      celebrity: 'celebrity',
      food: 'restaurant',
      parenting: 'family',
      travel: 'travel',
      legal: 'courtroom',
      housing: 'house',
      education: 'classroom',
      gaming: 'gaming',
      health: 'medical',
      money: 'finance',
      social: 'social media',
    };
    
    const categoryTerm = categorySearchTerms[story.category] || story.category;
    
    // Search for hero image (the "what")
    console.log(`🎯 Searching for hero image: "${concepts.what}"`);
    let heroImage = await searchPexels(concepts.what);
    
    if (!heroImage) {
      // Try with category context
      heroImage = await searchPexels(`${concepts.what} ${categoryTerm}`);
    }
    
    // Search for inline image (the "where" or setting)
    console.log(`🎯 Searching for inline image: "${concepts.where}" or "${categoryTerm}"`);
    let inlineImage = await searchPexels(concepts.where !== concepts.what ? concepts.where : categoryTerm);
    
    if (!inlineImage) {
      // Try broader category search
      inlineImage = await searchPexels(`${categoryTerm} ${story.category}`);
    }
    
    // Fallback to stock photos if needed
    if (!heroImage) {
      console.log(`⚠️  Using fallback stock photo for hero image`);
      const fallbackImages = CONFIG.imageLibrary.filter(img => 
        img.keywords.some(keyword => story.category.includes(keyword))
      );
      heroImage = fallbackImages[0] || CONFIG.imageLibrary[0];
    }
    
    if (!inlineImage) {
      // Use different stock photo for inline
      const fallbackImages = CONFIG.imageLibrary.filter(img => 
        img.keywords.some(keyword => story.category.includes(keyword))
      );
      inlineImage = fallbackImages[1] || fallbackImages[0] || CONFIG.imageLibrary[1];
    }
    
    return { heroImage, inlineImage };
  } catch (error) {
    console.error('❌ Image selection failed:', error.message);
    
    // Ultimate fallback
    return {
      heroImage: CONFIG.imageLibrary[0],
      inlineImage: CONFIG.imageLibrary[1]
    };
  }
}

/**
 * Generate Reddit-style comments
 */
function generateComments(platform = 'reddit', storyContext = {}) {
  // Generate context-aware comments based on story category and content
  const { category = 'general', title = '', trending = false } = storyContext;
  
  const redditCommentTemplates = {
    general: [
      'This is the kind of content I come to Reddit for. Pure gold.',
      'OP delivered. What a wild ride from start to finish.',
      'I was not prepared for that plot twist. Absolutely unhinged.',
      'The fact that this actually happened... I can\'t even.',
      'This needs to be higher up. Everyone needs to read this.',
      'I\'ve been on Reddit for years and this is top tier content.',
      'Someone give this person an award. This is incredible.',
      'This is why I sort by new. Hidden gems like this.'
    ],
    celebrity: [
      'Celebrity PR teams are working overtime after this one.',
      'The way they thought they could control the narrative... hilarious.',
      'This is going to be in every tabloid by tomorrow.',
      'Their publicist just quit after reading this, guaranteed.',
      'The damage control attempts made it SO much worse.',
      'I give it 24 hours before the apology video drops.',
      'Their Instagram comments are already a warzone.',
      'This is what happens when you surround yourself with yes-people.'
    ],
    workplace: [
      'HR is definitely browsing LinkedIn right now.',
      'This is exactly why I record every meeting.',
      'Your boss sounds like every nightmare manager rolled into one.',
      'I would have rage quit on the spot. You have more patience than me.',
      'Please tell me you have this documented. This is lawsuit material.',
      'The fact that they thought this was acceptable... mind-blowing.',
      'Update your resume immediately. This place is toxic.',
      'Name and shame. People need to know about companies like this.'
    ],
    relationships: [
      'This is why communication is important, people.',
      'Red flags everywhere. You dodged a bullet, OP.',
      'The audacity of thinking this was okay... I\'m speechless.',
      'My therapist would have a field day with this story.',
      'This belongs in the relationship hall of fame for what NOT to do.',
      'I need an update. Did they ever realize how wrong they were?',
      'The mental gymnastics here deserve an Olympic medal.',
      'Run. Don\'t walk. RUN.'
    ],
    food: [
      'Gordon Ramsay would have a stroke reading this.',
      'This is a crime against food and humanity.',
      'I\'ve worked in restaurants for 10 years. This is sadly common.',
      'The health inspector needs to see this immediately.',
      'My Italian grandmother is rolling in her grave.',
      'This is why I have trust issues with restaurants.',
      'The fact that they served this to people... jail.',
      'I would have called the police. This is assault.'
    ],
    legal: [
      'Lawyer here. This is absolutely grounds for action.',
      'The judge\'s face must have been priceless.',
      'This is why you always get everything in writing.',
      'Their lawyer probably wanted to crawl under the desk.',
      'I\'ve seen some wild cases but this takes the cake.',
      'The fact that this made it to court... amazing.',
      'Discovery is going to be VERY interesting.',
      'Please tell me you have a good lawyer. You\'re going to need one.'
    ],
    technology: [
      'This is why we can\'t have nice things.',
      'Someone\'s getting fired from the dev team.',
      'The fact that this passed QA... how?',
      'I\'m sending this to my entire engineering team as a cautionary tale.',
      'This is what happens when you ignore the documentation.',
      'The GitHub issues for this must be spectacular.',
      'Production is not a testing environment, people!',
      'This is why I have trust issues with auto-updates.'
    ],
    sports: [
      'ESPN is frantically trying to get the rights to this story.',
      'This is worse than any scandal I\'ve seen in 20 years of following sports.',
      'The locker room is never going to be the same.',
      'Their career is over. No coming back from this.',
      'The fact that teammates knew and said nothing...',
      'This makes other sports scandals look tame.',
      'The press conference after this is going to be must-watch TV.',
      'Fantasy league in shambles right now.'
    ]
  };
  
  // Get base comments for the category
  const categoryComments = redditCommentTemplates[category] || redditCommentTemplates.general;
  
  // Mix in some general comments
  const generalComments = redditCommentTemplates.general;
  
  // Create a pool of comments
  const commentPool = [...categoryComments.slice(0, 5), ...generalComments.slice(0, 3)];

  const tiktokComments = [
    'WAIT WHAT?! I need part 47 immediately 😭',
    'Not me watching this whole saga instead of doing homework',
    'This is better than Netflix I swear',
    'The absolute CHAOS... I live for this drama',
    'bestie dropped the tea and SCALDED everyone',
    'no but why is this literally my life rn',
    'the way I RAN here after seeing part 1',
    'putting this in my "drama that feeds my soul" folder'
  ];

  const twitterComments = [
    'This whole thread is unhinged and I\'m here for it',
    'The way this escalated... I can\'t breathe 💀',
    'Quote tweeting for posterity before it gets deleted',
    'Not the plot twist in tweet 7/23 😭😭😭',
    'Ratioed their whole existence, we love to see it',
    'The screenshots... bestie you really kept ALL the receipts',
    'Imagine being the person this thread is about and seeing it go viral',
    'This is why I pay for internet'
  ];

  let comments;
  if (platform === 'twitter') {
    comments = twitterComments;
  } else if (platform === 'tiktok') {
    comments = tiktokComments;
  } else {
    comments = commentPool;
  }
  
  // Randomly select 4-6 comments
  const selectedComments = [];
  const numComments = Math.floor(Math.random() * 3) + 4; // 4-6 comments
  
  while (selectedComments.length < numComments && selectedComments.length < comments.length) {
    const comment = comments[Math.floor(Math.random() * comments.length)];
    if (!selectedComments.find(c => c === comment)) {
      selectedComments.push(comment);
    }
  }
  
  return selectedComments.map(content => ({
    author: platform === 'tiktok' 
      ? `@${['bestie', 'user', 'drama', 'tea', 'chaos'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 9999)}`
      : platform === 'twitter'
      ? `@${['chaos', 'drama', 'unhinged', 'viral', 'tea'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 999)}`
      : `${['Dramatic', 'Unhinged', 'Chaotic', 'Wild', 'Reddit'][Math.floor(Math.random() * 5)]}User${Math.floor(Math.random() * 9999)}`,
    content,
    upvotes: platform === 'reddit' ? Math.floor(Math.random() * 5000) + 100 : undefined,
    likes: platform !== 'reddit' ? Math.floor(Math.random() * 10000) + 500 : undefined,
    retweets: platform === 'twitter' ? Math.floor(Math.random() * 1000) + 50 : undefined,
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
    const db = getSupabase();
    
    // Ensure persona exists (using name since slug column doesn't exist)
    console.log(`👤 Checking persona: ${story.persona.name}`);
    let { data: persona, error: personaError } = await db
      .from('personas')
      .select('*')
      .eq('name', story.persona.name)
      .single();

    if (personaError && personaError.code !== 'PGRST116') {
      console.error('❌ Error checking persona:', personaError.message);
      throw personaError;
    }

    if (!persona) {
      console.log(`➕ Creating new persona: ${story.persona.name}`);
      const { data: newPersona, error: createPersonaError } = await db
        .from('personas')
        .insert({
          name: story.persona.name,
          avatar_url: story.persona.avatar,
          tone: story.persona.tone,
          style_preferences: story.persona.bio || 'Standard style preferences',
          target_audience: 'General audience',
          content_focus: 'Viral stories and entertainment',
        })
        .select()
        .single();

      if (createPersonaError) {
        console.error('❌ Error creating persona:', createPersonaError.message);
        throw createPersonaError;
      }
      persona = newPersona;
    }

    // Save story to Supabase
    console.log(`📝 Saving story: "${story.title}"`);
    const { data: savedStory, error: saveError } = await db
      .from('posts')
      .insert({
        title: story.title,
        slug: story.slug,
        hook: story.excerpt,
        content: JSON.stringify(story.content),
        featured_image: story.imageUrl,
        category: story.category,
        persona_id: persona.id,
        status: 'published',
        view_count: story.viewCount,
        share_count: story.shareCount,
        featured: story.featured,
        trending_score: story.trending ? 8 : 5,
        subreddit: story.category,
        layout_style: 1,
        seo_title: story.title,
        seo_description: story.excerpt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving story:', saveError.message);
      throw saveError;
    }

    console.log(`✅ Successfully saved story to Supabase: ${savedStory.slug}`);
    return savedStory;
  } catch (error) {
    console.error('❌ Database save failed:', error.message);
    throw error;
  }
}

/**
 * Parse media placeholders from story content
 */
function parseMediaPlaceholders(content) {
  const mediaRegex = /\[MEDIA:\s*type="([^"]+)"\s*query="([^"]+)"\s*context="([^"]+)"\]/g;
  const placeholders = [];
  
  // Search through all sections
  content.sections.forEach((section, index) => {
    if (section.content) {
      let match;
      while ((match = mediaRegex.exec(section.content)) !== null) {
        placeholders.push({
          sectionIndex: index,
          type: match[1],
          query: match[2],
          context: match[3],
          fullMatch: match[0],
          position: match.index
        });
      }
    }
  });
  
  return placeholders;
}

/**
 * Generate a complete story
 */
export async function generateStory(options = {}) {
  try {
    // Generate content
    const storyData = await generateStoryContent(options);
    
    // Parse media placeholders
    const mediaPlaceholders = parseMediaPlaceholders(storyData.content);
    console.log(`🎬 Found ${mediaPlaceholders.length} media placeholders`);
    
    // Select images (hero + inline)
    const { heroImage, inlineImage } = await selectImagesForStory(storyData);
    
    // Generate real comments from Reddit/Twitter
    let comments;
    try {
      const { generateRealComments } = await import('./real-comment-generator.js');
      comments = await generateRealComments(storyData.contentSource, {
        category: storyData.category,
        title: storyData.title,
        query: storyData.title, // Use title as search query
        trending: true
      });
      console.log(`💬 Generated ${comments.length} real comments from ${storyData.contentSource}`);
    } catch (error) {
      console.log('⚠️  Real comment generation failed, using templates:', error.message);
      // Fallback to template comments
      comments = generateComments(storyData.contentSource, {
        category: storyData.category,
        title: storyData.title,
        trending: true
      });
    }
    
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
          // Add inline image after the second describe section
          ...storyData.content.sections.slice(0, 2),
          {
            type: 'image',
            content: inlineImage.description,
            metadata: {
              image_source: inlineImage.source_name || 'Stock photo from ThreadJuice library',
              image_url: inlineImage.path,
              attribution: inlineImage.author || 'Stock photo',
              source: inlineImage.source_url || 'ThreadJuice curated library',
              license_type: inlineImage.license_type || 'Standard License',
            },
          },
          // Insert all sections except outro
          ...storyData.content.sections.slice(2).filter(s => s.type !== 'outro'),
          {
            type: 'comments-1',
            title: storyData.contentSource === 'twitter' 
              ? 'Twitter Went Absolutely Feral' 
              : storyData.contentSource === 'tiktok' 
              ? 'The Comments Section Lost It' 
              : 'Reddit Reacts',
            content: storyData.contentSource === 'twitter'
              ? 'The quote tweets alone could fuel a small country:'
              : storyData.contentSource === 'tiktok'
              ? 'The FYP was NOT ready for this chaos:'
              : 'The comment section delivered, as always:',
            metadata: { 
              comments,
              platform: storyData.contentSource 
            },
          },
          // Add outro as the very last section
          ...storyData.content.sections.filter(s => s.type === 'outro'),
        ],
      },
      imageUrl: heroImage.path,
      viewCount: Math.floor(Math.random() * 50000) + 10000,
      upvoteCount: Math.floor(Math.random() * 5000) + 1000,
      commentCount: Math.floor(Math.random() * 500) + 50,
      shareCount: Math.floor(Math.random() * 3000) + 500,
      bookmarkCount: Math.floor(Math.random() * 500) + 50,
      tags: [storyData.category, 'viral', storyData.contentSource],
      viral_score: Math.floor(Math.random() * 3) + 8,
      readingTime: Math.ceil(storyData.content.sections.length * 0.5),
      sourceUrl: storyData.sourceUrl,
      sourceUsername: storyData.sourceUsername,
      sourcePlatform: storyData.sourcePlatform,
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

        const story = await generateStoryWithMedia(options);
        
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
        
        const stories = [];
        const errors = [];
        
        for (let i = 0; i < count; i++) {
          try {
            console.log(`\n📝 Generating story ${i + 1}/${count}...`);
            const story = await generateStoryWithMedia();
            stories.push(story);
            console.log(`✅ Generated: "${story.title}"`);
          } catch (error) {
            console.error(`❌ Failed to generate story ${i + 1}:`, error.message);
            errors.push(error.message);
          }
        }
        
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
  }
}

// Initialize media enricher (using JavaScript wrapper)
async function getMediaEnricher() {
  try {
    const { mediaEnricher, youtubeExtractor, twitterExtractor, tiktokExtractor, redditExtractor } = await import('./mediaEnricherWrapper.js');
    
    // Register extractors if not already registered
    if (!mediaEnricher.platformExtractors?.has('video')) {
      mediaEnricher.registerExtractor('video', youtubeExtractor);
      mediaEnricher.registerExtractor('youtube', youtubeExtractor);
      mediaEnricher.registerExtractor('tweet', twitterExtractor);
      mediaEnricher.registerExtractor('twitter', twitterExtractor);
      mediaEnricher.registerExtractor('tiktok', tiktokExtractor);
      mediaEnricher.registerExtractor('reddit', redditExtractor);
      mediaEnricher.registerExtractor('reddit_post', redditExtractor);
    }
    
    return mediaEnricher;
  } catch (error) {
    console.warn('⚠️ Media enricher not available:', error.message);
    return null;
  }
}

/**
 * Generate story with media enrichment
 */
export async function generateStoryWithMedia(options = {}) {
  try {
    // Generate base story
    const story = await generateStory(options);
    
    // Check if we have media placeholders
    const hasMedia = story.content.sections.some(s => 
      s.content && s.content.includes('[MEDIA:')
    );
    
    if (!hasMedia) {
      return story;
    }
    
    // Enrich with media
    console.log('🎬 Enriching story with media embeds...');
    const enricher = await getMediaEnricher();
    
    if (!enricher) {
      console.log('⚠️ Media enricher not available, returning story without embeds');
      return story;
    }
    
    const enrichedStory = await enricher.processStory(story);
    
    return enrichedStory;
  } catch (error) {
    console.error('❌ Media enrichment failed:', error.message);
    // Return story without media enrichment
    return generateStory(options);
  }
}

// Export for use as module
export { CONFIG, createSlug, selectImagesForStory, generateComments };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}