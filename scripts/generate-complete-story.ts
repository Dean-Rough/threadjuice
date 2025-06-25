import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const STORY_PROMPT = `You are The Terry, ThreadJuice's most acerbic writer. Generate a complete viral story with this EXACT structure:

{
  "title": "Catchy clickbait title without emojis",
  "slug": "url-safe-slug",
  "excerpt": "2-3 sentence hook",
  "content": {
    "sections": [
      {
        "type": "hero",
        "title": "Opening hook title",
        "content": "Powerful opening paragraph that sets the scene"
      },
      {
        "type": "describe-1",
        "title": "The Setup",
        "content": "2-3 paragraphs describing the initial situation"
      },
      {
        "type": "twitter_quote",
        "content": "A relevant tweet or social media quote",
        "metadata": {
          "author": "@username",
          "likes": 1234,
          "retweets": 567
        }
      },
      {
        "type": "describe-2", 
        "title": "The Twist",
        "content": "2-3 paragraphs where things get interesting"
      },
      {
        "type": "pullquote",
        "content": "A memorable quote from the story"
      },
      {
        "type": "describe-3",
        "title": "The Escalation", 
        "content": "2-3 paragraphs where chaos ensues"
      },
      {
        "type": "image",
        "content": "Image description for context",
        "metadata": {
          "caption": "Witty image caption",
          "imageType": "meme_worthy"
        }
      },
      {
        "type": "describe-4",
        "title": "The Resolution",
        "content": "2-3 paragraphs wrapping up the drama"
      },
      {
        "type": "comments",
        "title": "The Internet Reacts",
        "content": "Summary of online reactions",
        "metadata": {
          "comments": [
            {
              "author": "RedditUser1",
              "content": "Hilarious comment",
              "upvotes": 2847
            },
            {
              "author": "RedditUser2", 
              "content": "Insightful observation",
              "upvotes": 1923
            }
          ]
        }
      },
      {
        "type": "roundup",
        "title": "The Aftermath",
        "content": "Final thoughts and what happened next"
      },
      {
        "type": "terry_corner",
        "title": "Terry's Take",
        "content": "The Terry's cynical but hilarious final commentary"
      }
    ]
  }
}`;

async function generateCompleteStory() {
  console.log('🚀 Generating complete ThreadJuice story...\n');

  try {
    // Generate story using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "You are The Terry, ThreadJuice's most cynical and witty writer. Create viral stories with proper British wit and sardonic observations.",
        },
        {
          role: 'user',
          content: `${STORY_PROMPT}\n\nGenerate a story about: "Karen demands restaurant remake her salad 17 times until it matches her Instagram aesthetic"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const storyData = JSON.parse(completion.choices[0].message.content!);

    console.log('✅ Generated story:', storyData.title);
    console.log('📝 Sections:', storyData.content.sections.length);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: storyData.title,
        slug: storyData.slug,
        hook: storyData.excerpt,
        content: storyData.content,
        category: 'karen',
        status: 'published',
        featured: true,
        trending_score: 95,
        view_count: Math.floor(Math.random() * 50000) + 10000,
        share_count: Math.floor(Math.random() * 5000) + 1000,
        featured_image: '/assets/img/lifestyle/life_style01.jpg',
        persona_id: 1, // The Terry
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting story:', error);
      return;
    }

    console.log('\n✅ Story published successfully!');
    console.log(`📖 View at: http://localhost:4242/blog/${data.slug}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Generate multiple stories
async function generateBatch() {
  const prompts = [
    'Karen demands restaurant remake her salad 17 times until it matches her Instagram aesthetic',
    "Tech bro's 'revolutionary' app is just a worse version of something that already exists",
    "Couple's gender reveal party accidentally starts international incident",
    "Influencer's 'life hack' video causes citywide plumbing crisis",
  ];

  for (const prompt of prompts) {
    console.log(`\n📝 Generating: ${prompt}`);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              "You are The Terry, ThreadJuice's most cynical and witty writer. Create viral stories with proper British wit and sardonic observations.",
          },
          {
            role: 'user',
            content: `${STORY_PROMPT}\n\nGenerate a story about: "${prompt}"`,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      });

      const storyData = JSON.parse(completion.choices[0].message.content!);

      // Determine category based on prompt
      let category = 'viral';
      if (prompt.includes('Karen')) category = 'karen';
      else if (prompt.includes('Tech')) category = 'technology';
      else if (prompt.includes('gender reveal')) category = 'relationships';
      else if (prompt.includes('Influencer')) category = 'social-media';

      // Insert into Supabase
      const { error } = await supabase.from('posts').insert({
        title: storyData.title,
        slug: storyData.slug,
        hook: storyData.excerpt,
        content: storyData.content,
        category,
        status: 'published',
        featured: false,
        trending_score: Math.floor(Math.random() * 50) + 50,
        view_count: Math.floor(Math.random() * 30000) + 5000,
        share_count: Math.floor(Math.random() * 3000) + 500,
        featured_image: '/assets/img/lifestyle/life_style01.jpg',
        persona_id: 1, // The Terry
      });

      if (error) {
        console.error(`❌ Error inserting "${storyData.title}":`, error);
      } else {
        console.log(`✅ Published: ${storyData.title}`);
      }

      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error generating story:`, error);
    }
  }

  console.log('\n🎉 Batch generation complete!');
}

// Run the batch generation
generateBatch().catch(console.error);
