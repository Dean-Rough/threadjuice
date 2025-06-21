// Direct test of modular story generation system
require('dotenv').config({ path: '.env.local' });

// Mock the imports we need
const OpenAI = require('openai');

// Mock Reddit data
const mockPost = {
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
};

const mockComments = [
  {
    id: 'comment1',
    author: 'judgmental_judy',
    body: 'YTA. You could have just said "he seems nice" or something neutral. No need to roast the poor guy.',
    score: 1542,
  },
  {
    id: 'comment2',
    author: 'honest_abe_lincoln',
    body: 'NTA. She literally asked for your opinion! Play stupid games, win stupid prizes. Also "discount Ryan Gosling" is actually hilarious.',
    score: 2103,
  },
];

// Simple prompt generator based on our modular system
function generateTestPrompt(post, comments) {
  const topComments = comments
    .map(c => `Score: ${c.score} | ${c.author}: ${c.body}`)
    .join('\n\n');

  return `🎯 SYNTAX & GRAMMAR RULES - Write Like a Real Person

CONVERSATIONAL TONE
• Write like a smart person talking to a friend—natural, not stiff or formulaic
• Use contractions and casual openings: "And that's why..." or "But here's the thing..."
• Don't be afraid to use "I" or "you" to sound like a real person

PUNCTUATION & STRUCTURE
• NEVER use em dashes—they scream "AI"
• Use commas, colons, semicolons, parentheses, or short sentences instead
• Avoid formula phrases like "It's not about X, it's about Y"
• Be direct: explain relationships with specific examples

🎭 THE SNARKY SAGE VOICE

PERSONALITY
• Sarcastic and witty, but not mean-spirited
• Finds humor in human chaos and absurdity
• Deadpan delivery with perfect comedic timing

SIGNATURE STYLE
• Opens with phrases like "Oh, buckle up" or "Ladies and gentlemen"
• Uses dry humor to highlight the ridiculous
• Makes observations about human behavior patterns

📖 STORY STRUCTURE - Viral Content Framework

Transform this Reddit thread into a ThreadJuice viral story:

ORIGINAL POST:
Title: ${post.title}
Author: u/${post.author}
Subreddit: r/${post.subreddit}
Score: ${post.score} upvotes, ${post.num_comments} comments
Content: ${post.selftext}

TOP COMMENTS:
${topComments}

Create a viral story following this EXACT JSON structure:
{
  "title": "Viral headline with emoji",
  "slug": "url-friendly-slug", 
  "excerpt": "Hook paragraph that makes readers want to click",
  "category": "aita",
  "persona": "the-snarky-sage",
  "content": {
    "sections": [
      {
        "type": "paragraph",
        "content": "Opening hook in Snarky Sage voice"
      },
      {
        "type": "heading", 
        "content": "Section heading"
      },
      {
        "type": "paragraph",
        "content": "Story content with drama and detail"
      }
    ]
  },
  "tags": ["aita", "family-drama", "relationships", "viral"],
  "viral_score": 8,
  "image_keywords": ["family", "drama", "ryan gosling"],
  "entities": [
    {
      "name": "Ryan Gosling",
      "type": "celebrity",
      "confidence": 0.95,
      "wikipedia_title": "Ryan_Gosling"
    }
  ]
}

Requirements:
- Write in The Snarky Sage voice (sarcastic and deadpan)
- Create 4-6 content sections
- Make it engaging and shareable
- NO em dashes anywhere
- Keep it entertaining but factual
- Identify notable entities (Ryan Gosling, Wish, Instagram, Facebook)
- Provide Wikipedia titles for entities when they exist`;
}

async function testStoryGeneration() {
  // console.log('🎭 Testing Modular Story Generation System...\n')

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = generateTestPrompt(mockPost, mockComments);

    // console.log('📝 Generated prompt structure:')
    // console.log('   ✓ Syntax & Grammar Rules')
    // console.log('   ✓ Snarky Sage Voice Instructions')
    // console.log('   ✓ Story Structure Framework')
    // console.log('   ✓ Entity Recognition Guidelines')
    // console.log('   ✓ JSON Output Schema')

    // console.log('\n🤖 Calling GPT-4o with modular prompt...')
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    // console.log(`⏱️ Generation completed in ${duration}ms`)

    // Try to parse the JSON
    let story;
    try {
      story = JSON.parse(content);
      // console.log('\n✅ Valid JSON generated!')
    } catch (parseError) {
      // console.log('\n❌ JSON parsing failed, showing raw content:')
      // console.log(content.slice(0, 500) + '...')
      return;
    }

    // Analyze the results
    // console.log('\n🎯 Story Analysis:')
    // console.log(`   📰 Title: "${story.title}"`)
    // console.log(`   🎭 Persona: ${story.persona}`)
    // console.log(`   📊 Viral Score: ${story.viral_score}/10`)
    // console.log(`   📝 Sections: ${story.content?.sections?.length || 0}`)
    // console.log(`   🏷️ Tags: ${story.tags?.join(', ') || 'none'}`)

    if (story.entities && story.entities.length > 0) {
      // console.log('\n🔍 Entities Detected:')
      story.entities.forEach(entity => {
        // console.log(`   - ${entity.name} (${entity.type}, confidence: ${entity.confidence})`)
        if (entity.wikipedia_title) {
          // console.log(`     Wikipedia: ${entity.wikipedia_title}`)
        }
      });
    }

    // Check for em dashes
    const fullContent = JSON.stringify(story);
    const emDashCount = (fullContent.match(/—/g) || []).length;
    // console.log(`\n📏 Em Dash Check: ${emDashCount === 0 ? '✅ Clean' : `❌ Found ${emDashCount}`}`)

    // Show a sample of the content
    if (story.content?.sections?.[0]?.content) {
      // console.log('\n📖 Sample Content (First paragraph):')
      // console.log(`"${story.content.sections[0].content.slice(0, 200)}..."`)
    }

    if (story.excerpt) {
      // console.log('\n🎣 Hook/Excerpt:')
      // console.log(`"${story.excerpt}"`)
    }

    // console.log('\n🎉 Modular Story Generation Test Complete!')
    // console.log('✅ Syntax rules applied')
    // console.log('✅ Persona voice activated')
    // console.log('✅ Entity recognition working')
    // console.log('✅ Structured JSON output')
  } catch (error) {
    console.error('\n❌ Story generation failed:', error.message);

    if (error.message.includes('API key')) {
      // console.log('💡 Make sure OPENAI_API_KEY is set in .env.local')
    }
  }
}

testStoryGeneration();
