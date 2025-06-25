#!/usr/bin/env tsx

/**
 * Minimal Batch Story Ingestion
 * Creates 10 stories using only AI generation with minimal dependencies
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

// Load .env.local file explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoryData {
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  category: string;
  persona: string;
  viral_score: number;
  tags: string[];
}

async function generateStory(
  topic: string,
  persona: string
): Promise<StoryData | null> {
  try {
    console.log(`  - Generating story: "${topic}" with ${persona}`);

    const prompt = `Generate a viral ThreadJuice story based on this topic: "${topic}"

The story should:
- Be written in the style of ${persona}
- Include a compelling title (50-80 chars)
- Have an engaging excerpt (150-200 chars)
- Include full content with multiple paragraphs
- Be authentic and relatable
- Include drama, humor, or surprising twists

Format the response as JSON with:
{
  "title": "Compelling title here",
  "excerpt": "Brief excerpt that hooks readers",
  "content": [
    { "type": "paragraph", "text": "Opening paragraph..." },
    { "type": "paragraph", "text": "Story development..." },
    { "type": "quote", "text": "Relevant quote or dialogue", "author": "Speaker" },
    { "type": "paragraph", "text": "More story..." }
  ],
  "category": "appropriate category from: aita, revenge, relationships, workplace, karen, entitled",
  "viral_score": 7-10,
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a viral content writer for ThreadJuice, creating engaging stories from Reddit-style drama.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Generate slug
    const slug = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return {
      ...result,
      slug,
      persona,
    };
  } catch (error) {
    console.error('  ❌ Generation error:', error);
    return null;
  }
}

async function getRandomImage(category: string): Promise<string> {
  // Fallback images by category
  const fallbackImages: Record<string, string[]> = {
    aita: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=800&q=80',
    ],
    revenge: [
      'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?w=800&q=80',
      'https://images.unsplash.com/photo-1569163139394-de4798aa0bd5?w=800&q=80',
    ],
    relationships: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
      'https://images.unsplash.com/photo-1520903074185-95f8a3230dcd?w=800&q=80',
    ],
    workplace: [
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    ],
    karen: [
      'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&q=80',
      'https://images.unsplash.com/photo-1584940120743-8981ca35b012?w=800&q=80',
    ],
    entitled: [
      'https://images.unsplash.com/photo-1523287562758-66c7fc58967f?w=800&q=80',
      'https://images.unsplash.com/photo-1494790108906-76b103190218?w=800&q=80',
    ],
  };

  const categoryImages = fallbackImages[category] || fallbackImages['aita'];
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
}

async function main() {
  console.log(
    '🚀 Starting minimal batch ingestion of 10 AI-generated stories...\n'
  );

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  const topics = [
    'entitled customer demands refund for food they already ate',
    'boss tries to make employee work during their wedding',
    'neighbor keeps stealing packages until karma strikes',
    "mother-in-law secretly redecorates couple's house while they're away",
    'coworker takes credit for project then gets exposed in meeting',
    'bridezilla demands guests pay for their own meals at wedding',
    'roommate eats all the food then plays victim when confronted',
    'karen calls police on kids lemonade stand, backfires spectacularly',
    'family member borrows money then goes on expensive vacation',
    'HOA president power trips until homeowners unite against them',
  ];

  const personas = [
    { slug: 'the-snarky-sage', name: 'The Snarky Sage' },
    { slug: 'the-down-to-earth-buddy', name: 'The Down-to-Earth Buddy' },
    { slug: 'the-dry-cynic', name: 'The Dry Cynic' },
  ];

  let successCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const persona = personas[i % personas.length];

    try {
      // Generate story
      const story = await generateStory(topic, persona.name);
      if (!story) {
        errors.push(`Failed to generate story for: ${topic}`);
        continue;
      }

      // Get persona from database
      const dbPersona = await prisma.persona.findUnique({
        where: { slug: persona.slug },
      });

      if (!dbPersona) {
        errors.push(`Persona not found: ${persona.slug}`);
        continue;
      }

      // Get random image
      const imageUrl = await getRandomImage(story.category);

      // Create post
      const post = await prisma.post.create({
        data: {
          title: story.title,
          slug: story.slug,
          excerpt: story.excerpt,
          content: story.content,
          imageUrl,
          category: story.category,
          author: dbPersona.name,
          personaId: dbPersona.id,
          status: 'published',
          trending: story.viral_score >= 8,
          featured: story.viral_score >= 9,
          viewCount: Math.floor(Math.random() * 10000) + 1000,
          upvoteCount: Math.floor(Math.random() * 1000) + 100,
          commentCount: Math.floor(Math.random() * 200) + 20,
          shareCount: Math.floor(Math.random() * 100) + 10,
          bookmarkCount: Math.floor(Math.random() * 50) + 5,
        },
      });

      // Create tags
      for (const tagName of story.tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        let tag = await prisma.tag.findUnique({
          where: { slug },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug, usageCount: 0 },
          });
        }

        await prisma.tag.update({
          where: { id: tag.id },
          data: { usageCount: { increment: 1 } },
        });

        await prisma.postTag.create({
          data: { postId: post.id, tagId: tag.id },
        });
      }

      console.log(`  ✅ Created: "${story.title}"`);
      successCount++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Error processing "${topic}":`, error);
      errors.push(
        `${topic}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Summary
  console.log('\n📊 Batch Ingestion Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successfully created: ${successCount} stories`);
  console.log(`❌ Failed: ${errors.length} stories`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
