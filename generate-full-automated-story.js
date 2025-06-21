#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// console.log('FULLY AUTOMATED THREADJUICE STORY GENERATOR');
// console.log('━'.repeat(60));
// console.log('AI Content Generation + Stock Images');
// console.log('━'.repeat(60));

// Read OpenAI API key from .env.local
function loadEnvVar(key) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

const apiKey = loadEnvVar('OPENAI_API_KEY');
if (!apiKey) {
  console.error('OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

const imageApiKey = loadEnvVar('OPENAI_IMAGE_API_KEY');
if (!imageApiKey) {
  // console.log('OPENAI_IMAGE_API_KEY not found, using main API key for image generation');
}

// console.log('OpenAI API keys loaded from .env.local');

// Story prompts for different viral scenarios
const viralScenarios = [
  {
    category: 'workplace',
    persona: 'dry-cynic',
    prompt:
      'A story about workplace revenge where someone gets back at their toxic boss in a creative and satisfying way. Should involve corporate culture, power dynamics, and perfect timing.',
    imageStyle:
      'corporate office scene with dramatic lighting showing workplace tension and revenge',
  },
  {
    category: 'family',
    persona: 'snarky-sage',
    prompt:
      "A story about family drama where someone exposes a relative's lies or fake lifestyle in a spectacular way. Should involve social media, appearances, and family dynamics.",
    imageStyle:
      'family gathering or social media scene showing drama and shock',
  },
  {
    category: 'dating',
    persona: 'down-to-earth-buddy',
    prompt:
      'A story about dating app or relationship revenge where someone gets back at a cheater or manipulator. Should involve modern dating, technology, and perfect karma.',
    imageStyle:
      'modern dating scene with phones, apps, and dramatic revelation moment',
  },
  {
    category: 'neighbor',
    persona: 'dry-cynic',
    prompt:
      'A story about neighbor revenge involving noise complaints, property disputes, or inconsiderate behavior that gets beautifully resolved.',
    imageStyle:
      'suburban neighborhood scene with houses and dramatic confrontation',
  },
  {
    category: 'customer',
    persona: 'snarky-sage',
    prompt:
      'A story about customer service revenge where an entitled customer gets their comeuppance from a clever employee or manager.',
    imageStyle:
      'retail or restaurant scene with customer service drama and justice',
  },
];

// Personas
const personas = {
  'dry-cynic': {
    id: 'dry-cynic',
    name: 'The Dry Cynic',
    bio: "Finds humor in humanity's daily disasters and serves it with a perfectly dry martini of sarcasm.",
    avatar: '/assets/img/personas/cynic.png',
    tone: 'Bitterly hilarious with a chaos-loving perspective',
  },
  'snarky-sage': {
    id: 'snarky-sage',
    name: 'The Snarky Sage',
    bio: 'Professional chaos observer with a PhD in human stupidity.',
    avatar: '/assets/img/personas/snarky-sage.png',
    tone: 'Sarcastic and deadpan with brutal honesty',
  },
  'down-to-earth-buddy': {
    id: 'down-to-earth-buddy',
    name: 'The Down-to-Earth Buddy',
    bio: 'Your chill friend who sees through the BS but keeps it real.',
    avatar: '/assets/img/personas/buddy.png',
    tone: 'Chill and friendly with relatable insights',
  },
};

// Select random scenario
const scenario =
  viralScenarios[Math.floor(Math.random() * viralScenarios.length)];
const persona = personas[scenario.persona];

// console.log(`Selected scenario: ${scenario.category}`);
// console.log(`Using persona: ${persona.name}`);
// console.log(`Generating story about: ${scenario.prompt}`);

async function callOpenAI(messages, model = 'gpt-4o') {
  // Write request data to temp file to avoid shell escaping issues
  const requestData = JSON.stringify({
    model: model,
    messages: messages,
    max_tokens: 4000,
    temperature: 0.8,
  });

  const tempFile = 'temp_openai_request.json';
  fs.writeFileSync(tempFile, requestData);

  const curlCommand = `curl -s https://api.openai.com/v1/chat/completions \\
    -H "Authorization: Bearer ${apiKey}" \\
    -H "Content-Type: application/json" \\
    -d @${tempFile}`;

  try {
    const response = execSync(curlCommand, { encoding: 'utf8' });

    // Clean up temp file
    fs.unlinkSync(tempFile);

    const result = JSON.parse(response);

    if (result.error) {
      throw new Error(`OpenAI API Error: ${result.error.message}`);
    }

    return result.choices[0].message.content;
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    console.error('Error calling OpenAI:', error.message);
    throw error;
  }
}

async function generateStoryContent() {
  // console.log('\nGenerating story content with gpt-4o...');

  const storyPrompt = `You are ${persona.name}, writing for ThreadJuice - a viral content platform. Your tone is: ${persona.tone}.

Generate a complete viral Reddit-style story about: ${scenario.prompt}

The story should be:
- Engaging and dramatic with perfect timing
- Include specific dialogue and details
- Have clear setup, escalation, revenge/resolution, and aftermath
- Be around 1500-2000 words total
- Feel authentic and relatable
- Include satisfying justice/karma

Format as a JSON object with these exact fields:
{
  "title": "[Engaging clickbait title without emojis]",
  "slug": "[url-safe-slug]",
  "excerpt": "[2-3 sentence teaser]",
  "story_sections": {
    "setup": "[The initial situation and characters - 300-400 words]",
    "escalation": "[How things got worse - 300-400 words]", 
    "revenge": "[The perfect revenge/justice moment - 400-500 words]",
    "aftermath": "[What happened next and reactions - 300-400 words]"
  },
  "dramatic_quotes": [
    {
      "quote": "[Most shocking/controversial line from the story]",
      "attribution": "[Who said it or where it's from]",
      "context": "[Brief context of when this was said]"
    }
    // Include 3-4 most dramatic, controversial, or memorable quotes
  ],
  "reddit_comments": [
    {
      "author": "[realistic Reddit username like throwaway123, RedditUser2024, etc]",
      "content": "[Realistic Reddit comment reaction]"
    }
    // Include 6-8 varied realistic comments with NO vote scores
  ],
  "controversial_comments": [
    {
      "author": "[realistic Reddit username]", 
      "content": "[Most controversial/divisive comment that would spark debate]"
    }
    // Include 3 most controversial takes that would be heavily debated
  ],
}

Make it viral-worthy with specific details, realistic dialogue, and satisfying resolution!`;

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert viral content creator specializing in Reddit-style revenge and justice stories.',
    },
    {
      role: 'user',
      content: storyPrompt,
    },
  ];

  const content = await callOpenAI(messages);
  
  console.log('Raw OpenAI response length:', content.length);

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.log('Full response:', content);
    throw new Error('Could not extract JSON from gpt-4o response');
  }

  const jsonString = jsonMatch[0];
  console.log('Extracted JSON length:', jsonString.length);
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log('JSON parsing failed. Raw JSON:');
    console.log(jsonString.substring(0, 1000) + '...');
    console.log('Error near position:', error.message);
    throw error;
  }
}

async function analyzeAndSelectImage(title, excerpt, storyContent) {
  // console.log('\nAnalyzing story for image selection...');

  // Enhanced image library with detailed descriptions and keywords
  const imageLibrary = [
    {
      path: '/assets/img/lifestyle/life_style01.jpg',
      description: 'Woman working on laptop in modern office space',
      keywords: [
        'office',
        'work',
        'laptop',
        'professional',
        'woman',
        'workplace',
        'desk',
      ],
      suitable_for: [
        'workplace revenge',
        'office drama',
        'professional conflicts',
        'career stories',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style02.jpg',
      description: 'Person looking stressed while checking phone',
      keywords: [
        'phone',
        'stress',
        'communication',
        'anxiety',
        'mobile',
        'texting',
        'worried',
      ],
      suitable_for: [
        'dating drama',
        'relationship conflicts',
        'social media stress',
        'communication issues',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style03.jpg',
      description: 'Group of friends socializing and laughing',
      keywords: [
        'friends',
        'social',
        'laughing',
        'group',
        'happy',
        'gathering',
        'celebration',
      ],
      suitable_for: [
        'family gatherings',
        'social revelations',
        'friend drama',
        'group dynamics',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style04.jpg',
      description: 'Family dinner or gathering around table',
      keywords: [
        'family',
        'dinner',
        'table',
        'gathering',
        'meal',
        'relatives',
        'reunion',
      ],
      suitable_for: [
        'family drama',
        'holiday stories',
        'family reunions',
        'dinner confrontations',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style05.jpg',
      description: 'Person looking contemplative or concerned',
      keywords: [
        'contemplative',
        'thinking',
        'concerned',
        'reflection',
        'decision',
        'serious',
      ],
      suitable_for: [
        'moral dilemmas',
        'decision making',
        'internal conflict',
        'realization moments',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style06.jpg',
      description: 'Social media or online interaction scene',
      keywords: [
        'social media',
        'online',
        'internet',
        'digital',
        'screen',
        'posting',
        'influencer',
      ],
      suitable_for: [
        'social media drama',
        'online exposure',
        'influencer stories',
        'digital deception',
      ],
    },
    {
      path: '/assets/img/blog/blog01.jpg',
      description: 'Professional business meeting or presentation',
      keywords: [
        'meeting',
        'business',
        'presentation',
        'professional',
        'conference',
        'corporate',
      ],
      suitable_for: [
        'workplace politics',
        'business revenge',
        'professional confrontations',
        'office power plays',
      ],
    },
    {
      path: '/assets/img/blog/blog02.jpg',
      description: 'Close-up of hands typing or using device',
      keywords: [
        'typing',
        'hands',
        'device',
        'technology',
        'communication',
        'messaging',
      ],
      suitable_for: [
        'digital detective work',
        'online investigation',
        'tech-savvy revenge',
        'digital evidence',
      ],
    },
    {
      path: '/assets/img/blog/blog03.jpg',
      description: 'Emotional conversation or confrontation',
      keywords: [
        'conversation',
        'confrontation',
        'emotional',
        'discussion',
        'argument',
        'revelation',
      ],
      suitable_for: [
        'dramatic reveals',
        'confrontations',
        'emotional moments',
        'truth telling',
      ],
    },
    {
      path: '/assets/img/blog/blog04.jpg',
      description: 'Person alone, reflecting or planning',
      keywords: [
        'alone',
        'planning',
        'reflection',
        'strategy',
        'thinking',
        'scheming',
      ],
      suitable_for: [
        'revenge planning',
        'strategic thinking',
        'plotting',
        'decision moments',
      ],
    },
  ];

  // Analyze story content for key themes and elements
  const storyText = (
    title +
    ' ' +
    excerpt +
    ' ' +
    Object.values(storyContent.story_sections || {}).join(' ')
  ).toLowerCase();

  // Score each image based on relevance
  const scoredImages = imageLibrary.map(image => {
    let score = 0;

    // Check keyword matches
    image.keywords.forEach(keyword => {
      if (storyText.includes(keyword)) {
        score += 3;
      }
    });

    // Check suitable_for matches
    image.suitable_for.forEach(theme => {
      const themeWords = theme.split(' ');
      if (themeWords.some(word => storyText.includes(word))) {
        score += 5;
      }
    });

    // Boost score for exact phrase matches
    if (image.suitable_for.some(theme => storyText.includes(theme))) {
      score += 10;
    }

    return { ...image, score };
  });

  // Sort by score and pick the best match
  scoredImages.sort((a, b) => b.score - a.score);
  const selectedImage = scoredImages[0];

  // console.log(`Best match: ${selectedImage.path} (score: ${selectedImage.score})`);
  // console.log(`Description: ${selectedImage.description}`);

  return {
    type: 'stock',
    data: selectedImage.path,
    description: selectedImage.description,
    attribution: 'Stock photo',
    source: 'ThreadJuice curated library',
    relevance_score: selectedImage.score,
    keywords: selectedImage.keywords,
  };
}

async function generateImageWithAI(title, excerpt, scenario) {
  // console.log('\nGenerating AI image with gpt-image-1...');

  const imagePrompt = `Create a high-quality, photorealistic image for a viral story about ${scenario.category}. 
Title: "${title}"
Story: ${excerpt}

Style: ${scenario.imageStyle}

Requirements:
- Professional photography quality
- Realistic and contemporary
- No text overlays
- Dramatic lighting that captures the emotional intensity
- Documentary-style realism`;

  // console.log('Image prompt:', imagePrompt.substring(0, 100) + '...');

  // Try new Responses API with gpt-image-1 first
  try {
    const responsesData = {
      model: 'gpt-image-1',
      messages: [
        {
          role: 'user',
          content: imagePrompt,
        },
      ],
      max_tokens: 1000,
    };

    const responsesFile = 'temp_responses_request.json';
    fs.writeFileSync(responsesFile, JSON.stringify(responsesData));

    const responsesCurl = `curl -s https://api.openai.com/v1/chat/completions \\
      -H "Authorization: Bearer ${imageApiKey || apiKey}" \\
      -H "Content-Type: application/json" \\
      -d @${responsesFile}`;

    // console.log('Trying gpt-image-1 via Responses API...');
    const responsesResult = execSync(responsesCurl, { encoding: 'utf8' });
    fs.unlinkSync(responsesFile);

    const responsesJson = JSON.parse(responsesResult);

    if (
      responsesJson.choices &&
      responsesJson.choices[0] &&
      responsesJson.choices[0].message
    ) {
      const content = responsesJson.choices[0].message.content;

      // Check if the response contains a base64 image
      const base64Match = content.match(
        /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/
      );
      if (base64Match) {
        // console.log('✓ gpt-image-1 generated image successfully');
        return {
          type: 'base64',
          data: base64Match[1],
          description: `AI-generated photorealistic image: ${scenario.imageStyle}`,
          attribution: 'Generated with gpt-image-1',
          source: 'OpenAI gpt-image-1',
          generation_method: 'gpt_image_1',
        };
      }
    }

    throw new Error('No image data in gpt-image-1 response');
  } catch (error) {
    // console.log('gpt-image-1 failed:', error.message);
    // console.log('Falling back to DALL-E 3...');
  }

  // Fallback to DALL-E 3
  const dalleData = {
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    style: 'natural',
  };

  const dalleFile = 'temp_dalle_request.json';
  fs.writeFileSync(dalleFile, JSON.stringify(dalleData));

  const dalleCurl = `curl -s https://api.openai.com/v1/images/generations \\
    -H "Authorization: Bearer ${imageApiKey || apiKey}" \\
    -H "Content-Type: application/json" \\
    -d @${dalleFile}`;

  try {
    // console.log('Generating with DALL-E 3...');
    const dalleResult = execSync(dalleCurl, { encoding: 'utf8' });
    fs.unlinkSync(dalleFile);

    const dalleJson = JSON.parse(dalleResult);

    if (dalleJson.error) {
      throw new Error(`DALL-E 3 Error: ${dalleJson.error.message}`);
    }

    const imageUrl = dalleJson.data[0].url;
    // console.log('✓ DALL-E 3 generated image successfully');

    return {
      type: 'url',
      data: imageUrl,
      description: `AI-generated photorealistic image: ${scenario.imageStyle}`,
      attribution: 'Generated with DALL-E 3',
      source: imageUrl,
      generation_method: 'dall_e_3',
    };
  } catch (error) {
    if (fs.existsSync(dalleFile)) {
      fs.unlinkSync(dalleFile);
    }
    console.error('DALL-E 3 generation failed:', error.message);
    throw error;
  }
}

async function createStoryFile(storyData, imageResult) {
  // console.log('\nCreating ThreadJuice story file...');

  const timestamp = Date.now();
  const slug = storyData.slug;
  const filename = `auto-generated-${slug}.json`;

  // Create generated images directory
  const generatedDir = path.join(
    process.cwd(),
    'public',
    'assets',
    'img',
    'generated'
  );
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Handle image selection based on type
  let imageUrl = null;
  let imageSource = null;

  if (imageResult.type === 'stock') {
    // console.log('Using stock image...');
    imageUrl = imageResult.data;
    imageSource = imageResult.source;
    // console.log(`Stock image selected: ${imageUrl}`);
  } else if (imageResult.type === 'base64') {
    // Legacy: Save base64 image
    const imageName = `${slug}-auto-generated.png`;
    const localImagePath = path.join(generatedDir, imageName);
    fs.writeFileSync(localImagePath, Buffer.from(imageResult.data, 'base64'));
    imageUrl = `/assets/img/generated/${imageName}`;
    imageSource = 'Generated with new Responses API';
    // console.log(`Generated image saved: ${imageName}`);
  } else if (imageResult.type === 'url') {
    // Legacy: Download from URL
    const imageName = `${slug}-auto-generated.png`;
    const localImagePath = path.join(generatedDir, imageName);
    const downloadCommand = `curl -s -L --max-filesize 50000000 -o "${localImagePath}" "${imageResult.data}"`;
    execSync(downloadCommand);
    imageUrl = `/assets/img/generated/${imageName}`;
    imageSource = imageResult.data;
    // console.log(`Downloaded image saved: ${imageName}`);
  } else {
    throw new Error('Invalid image result type');
  }

  // Create full story object with interspersed dramatic quotes
  const sections = [
    {
      type: 'image',
      content:
        imageResult.description ||
        `Stock photo representing this ${scenario.category} story`,
      metadata: {
        image_source:
          imageResult.type === 'stock'
            ? 'Stock photo from ThreadJuice library'
            : 'AI-generated image',
        image_url: imageUrl,
        attribution: imageResult.attribution || 'ThreadJuice',
        source: imageSource,
        selection_timestamp: new Date().toISOString(),
        image_type: imageResult.type,
      },
    },
    {
      type: 'describe-1',
      title: 'The Setup',
      content: storyData.story_sections.setup,
    },
  ];

  // Add first dramatic quote after setup
  if (storyData.dramatic_quotes && storyData.dramatic_quotes[0]) {
    sections.push({
      type: 'quotes',
      content: storyData.dramatic_quotes[0].quote,
      metadata: {
        attribution: storyData.dramatic_quotes[0].attribution,
        context: storyData.dramatic_quotes[0].context,
      },
    });
  }

  sections.push({
    type: 'describe-2',
    title: 'Things Get Worse',
    content: storyData.story_sections.escalation,
  });

  // Add second dramatic quote after escalation
  if (storyData.dramatic_quotes && storyData.dramatic_quotes[1]) {
    sections.push({
      type: 'quotes',
      content: storyData.dramatic_quotes[1].quote,
      metadata: {
        attribution: storyData.dramatic_quotes[1].attribution,
        context: storyData.dramatic_quotes[1].context,
      },
    });
  }

  sections.push(
    {
      type: 'comments-1',
      title: 'Reddit Reactions',
      content: 'The internet had THOUGHTS about this situation:',
      metadata: {
        comments: storyData.reddit_comments.slice(0, 4),
      },
    },
    {
      type: 'discussion',
      title: 'What Really Happened',
      content: storyData.story_sections.revenge,
    }
  );

  // Add third dramatic quote after revenge section
  if (storyData.dramatic_quotes && storyData.dramatic_quotes[2]) {
    sections.push({
      type: 'quotes',
      content: storyData.dramatic_quotes[2].quote,
      metadata: {
        attribution: storyData.dramatic_quotes[2].attribution,
        context: storyData.dramatic_quotes[2].context,
      },
    });
  }

  sections.push(
    {
      type: 'comments-2',
      title: 'Controversial Comments',
      content: 'The most divisive takes (sorted by controversial):',
      metadata: {
        comments:
          storyData.controversial_comments ||
          storyData.reddit_comments.slice(4, 7),
      },
    },
    {
      type: 'outro',
      title: 'The Aftermath',
      content: storyData.story_sections.aftermath,
    }
  );

  // Add final dramatic quote before quiz
  if (storyData.dramatic_quotes && storyData.dramatic_quotes[3]) {
    sections.push({
      type: 'quotes',
      content: storyData.dramatic_quotes[3].quote,
      metadata: {
        attribution: storyData.dramatic_quotes[3].attribution,
        context: storyData.dramatic_quotes[3].context,
      },
    });
  }

  // Quiz section removed - focusing on core content

  const fullStory = {
    id: `auto-story-${timestamp}`,
    title: storyData.title,
    slug: slug,
    excerpt: storyData.excerpt,
    category: scenario.category,
    status: 'published',
    trending: true,
    featured: true,
    author: persona.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persona: persona,
    content: {
      sections: sections,
    },
    imageUrl: imageUrl,
    viewCount: Math.floor(Math.random() * 50000) + 10000,
    upvoteCount: Math.floor(Math.random() * 25000) + 5000,
    commentCount: Math.floor(Math.random() * 2000) + 500,
    shareCount: Math.floor(Math.random() * 5000) + 1000,
    bookmarkCount: Math.floor(Math.random() * 1000) + 200,
    tags: [scenario.category, 'revenge', 'viral', 'justice'],
    viral_score: Math.floor(Math.random() * 3) + 8, // 8-10
    redditSource: {
      subreddit:
        scenario.category === 'workplace' ? 'WorkplaceRevenge' : 'pettyrevenge',
      originalPost: 'Auto-generated story thread',
      threadUrl: 'https://reddit.com/r/pettyrevenge',
    },
    readingTime: Math.ceil(
      (
        storyData.story_sections.setup +
        storyData.story_sections.escalation +
        storyData.story_sections.revenge +
        storyData.story_sections.aftermath
      ).split(' ').length / 200
    ),
  };

  // Write story file
  fs.writeFileSync(filename, JSON.stringify(fullStory, null, 2));
  // console.log(`Story saved as: ${filename}`);

  return { filename, slug };
}

async function generateFullStory(useAI = false) {
  try {
    // console.log('\nStarting full automated generation...\n');

    // Step 1: Generate story content
    const storyData = await generateStoryContent();
    // console.log('Story content generated');

    // Step 2: Generate or select image
    let imageResult;
    if (useAI) {
      imageResult = await generateImageWithAI(
        storyData.title,
        storyData.excerpt,
        scenario
      );
      // console.log('AI image generated');
    } else {
      imageResult = await analyzeAndSelectImage(
        storyData.title,
        storyData.excerpt,
        storyData
      );
      // console.log('Intelligent stock image selected');
    }

    // Step 3: Create story file
    const { filename, slug } = await createStoryFile(storyData, imageResult);

    // console.log('\nFULLY AUTOMATED STORY GENERATION COMPLETE!');
    // console.log('━'.repeat(60));
    // console.log(`Story file: ${filename}`);
    // console.log(`View at: http://localhost:4242/blog/${slug}`);
    // console.log(`Title: ${storyData.title}`);
    // console.log(`Persona: ${persona.name}`);
    // console.log(`Category: ${scenario.category}`);
    // console.log(`Image type: ${useAI ? 'AI-generated' : 'Curated stock photo'}`);
    // console.log('━'.repeat(60));
    // console.log('Ready to go viral!');
  } catch (error) {
    console.error('\nGeneration failed:', error.message);
    process.exit(1);
  }
}

// Run the full automated generation
generateFullStory();
