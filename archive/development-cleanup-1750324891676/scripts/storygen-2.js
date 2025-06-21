// Test script to generate a complete story with all modular sections
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

// Mock Reddit data for a viral AITA story
const mockRedditPost = {
  id: 'test456',
  title:
    "AITA for putting my neighbor's Amazon packages in a decoy box filled with cat litter?",
  selftext: `So I (32M) live in an apartment complex and packages get stolen constantly. My neighbor Dave (??M) has been stealing packages from our mailroom for MONTHS. I've seen him on the security camera footage that the building manager showed me, but they "can't do anything without more evidence."

Last week, Dave stole my new headphones (£200) that I'd been saving up for. That was the last straw.

So I ordered a cheap item online and had it delivered in a big box. Then I filled the box with used cat litter from my friend's cats - just the clumping clay stuff, nothing dangerous. I wrote "EXPENSIVE ELECTRONICS" on the outside and left it in the mailroom.

Sure enough, Dave took it. I watched him through my peephole as he carried it to his apartment, grinning like he'd won the lottery.

About an hour later, I heard the most beautiful sound - Dave screaming "WHAT THE F***" through the thin walls. He came pounding on my door demanding to know if I put cat litter in "his" package.

I told him that if he hadn't stolen my package, he wouldn't have found out what was in it. He threatened to call the police, so I told him to go ahead - I'd love to explain to them how he knew what was in a package that wasn't addressed to him.

He stormed off and now half the building thinks I'm a genius and the other half thinks I went too far. My girlfriend says it was "disproportionate revenge" but honestly, I'm just tired of having my stuff stolen.

AITA?`,
  author: 'PackageTrapper2024',
  subreddit: 'AmItheAsshole',
  score: 15420,
  num_comments: 2847,
  created_utc: Date.now() - 86400, // 1 day ago
};

const mockComments = [
  {
    id: 'comment1',
    author: 'PettyRevengeExpert',
    body: "NTA. This is BRILLIANT. Play stupid games, win stupid prizes. Dave learned an important lesson about not stealing other people's stuff. The smell of justice is... cat litter.",
    score: 8245,
    replies: 156,
  },
  {
    id: 'comment2',
    author: 'LegalAdviceGuru',
    body: "NTA and legally you're in the clear. You didn't put anything dangerous in there, just smelly. Package theft is a federal crime, Dave should be thanking you for not reporting him to the postal inspector.",
    score: 6892,
    replies: 234,
  },
  {
    id: 'comment3',
    author: 'ApartmentLivingSucks',
    body: "NTA but Dave definitely learned his lesson the hard way! I bet he's not stealing packages anymore. The fact that he came to YOUR door proves he knew he was stealing. 10/10 petty revenge.",
    score: 5034,
    replies: 89,
  },
  {
    id: 'comment4',
    author: 'CatLitterConnoisseur',
    body: 'YTA for wasting perfectly good cat litter. Just kidding - NTA, this is the kind of creative problem solving we need more of. Dave F***ed around and found out.',
    score: 4156,
    replies: 78,
  },
  {
    id: 'comment5',
    author: 'BuildingManagerHere',
    body: "NTA - I'm a building manager and package theft is the WORST. We can't legally do much without solid evidence. You found a creative solution that doesn't technically break any laws. Might steal this idea for our problem residents...",
    score: 3967,
    replies: 123,
  },
];

// Enhanced prompt for full modular story generation
function generateFullModularPrompt(post, comments) {
  const topComments = comments
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(
      c =>
        `u/${c.author} (${c.score} upvotes, ${c.replies || 0} replies): ${c.body}`
    )
    .join('\n\n');

  return `🎯 GENERATE COMPLETE MODULAR THREADJUICE STORY

TASK: Transform this Reddit AITA post into a viral ThreadJuice story using ALL specified section types in exact order.

🎭 PERSONA: The Snarky Sage
VOICE CHARACTERISTICS:
• Sarcastic and deadpan humor
• Finds chaos hilarious  
• Makes witty observations about human behavior
• Uses phrases like "Oh, buckle up" and "Ladies and gentlemen"
• Perfect comedic timing with dry delivery

📖 REDDIT SOURCE MATERIAL:

ORIGINAL POST:
Title: ${post.title}
Author: u/${post.author}
Subreddit: r/${post.subreddit}
Score: ${post.score} upvotes | ${post.num_comments} comments
Content: ${post.selftext}

TOP REDDIT COMMENTS:
${topComments}

🏗️ REQUIRED STORY STRUCTURE (EXACT ORDER):
You MUST generate these 8 sections in this exact order:

1. IMAGE - Hero image description and caption
2. DESCRIBE-1 - Opening narrative section
3. DESCRIBE-2 - Story development section  
4. COMMENTS-1 - First Reddit comments showcase
5. COMMENTS-2 - Second Reddit comments showcase
6. DISCUSSION - Podcast-style conversational analysis
7. OUTRO - Conclusion and reader engagement
8. QUIZ - Interactive quiz about the story

📝 OUTPUT FORMAT:
Generate valid JSON following this EXACT schema:

{
  "title": "🚨 Viral headline with emoji in Snarky Sage voice",
  "slug": "url-friendly-slug-from-title", 
  "excerpt": "Hook paragraph that makes readers want to click (compelling summary)",
  "category": "aita",
  "persona": "the-snarky-sage",
  "content": {
    "sections": [
      {
        "type": "image",
        "content": "Caption describing the hero image scene",
        "metadata": {
          "image_prompt": "Detailed prompt for image generation: apartment, packages, revenge, cat litter"
        }
      },
      {
        "type": "describe-1", 
        "title": "Section heading (optional)",
        "content": "Opening narrative in Snarky Sage voice - set the scene with humor"
      },
      {
        "type": "describe-2",
        "title": "Section heading (optional)", 
        "content": "Story development - build the drama and tension"
      },
      {
        "type": "comments-1",
        "title": "Reddit's Verdict",
        "content": "Introduction to comments showcase",
        "metadata": {
          "comments": [
            {
              "author": "Reddit username",
              "content": "Comment text", 
              "score": 8245,
              "replies": 156
            }
          ]
        }
      },
      {
        "type": "comments-2",
        "title": "More Reddit Reactions",
        "content": "Second batch of comments analysis",
        "metadata": {
          "comments": [
            {
              "author": "Reddit username",
              "content": "Comment text",
              "score": 6892,
              "replies": 234
            }
          ]
        }
      },
      {
        "type": "discussion",
        "title": "ThreadJuice Discussion",
        "content": "Podcast-style conversational analysis of the situation - multiple perspectives"
      },
      {
        "type": "outro", 
        "title": "The Bottom Line",
        "content": "Snarky Sage's final thoughts and call-to-action for readers"
      },
      {
        "type": "quiz",
        "title": "Test Your AITA Knowledge", 
        "content": "Interactive quiz introduction",
        "metadata": {
          "quiz_data": {
            "question": "Based on this story, what's the best way to handle package thieves?",
            "options": [
              "Call the police immediately",
              "Set up creative deterrents like OP did", 
              "Move to a better building",
              "Accept that package theft is inevitable"
            ],
            "correct_answer": 1,
            "explanation": "OP's creative cat litter trap was legal, harmless, and effectively stopped the thief while proving his guilt!"
          }
        }
      }
    ],
    "story_flow": "buildup"
  },
  "tags": ["aita", "package-theft", "petty-revenge", "apartment-living", "viral"],
  "viral_score": 9,
  "image_keywords": ["apartment", "packages", "mailroom", "cat litter", "revenge"],
  "entities": [
    {
      "name": "Amazon",
      "type": "company", 
      "confidence": 0.95,
      "wikipedia_title": "Amazon_(company)"
    },
    {
      "name": "Package Theft",
      "type": "crime",
      "confidence": 0.90
    }
  ]
}

🚨 CRITICAL REQUIREMENTS:
• Use EXACTLY 8 sections in the specified order
• Write in The Snarky Sage's sarcastic, deadpan voice throughout
• Include real Reddit usernames and comment scores from provided data
• NO em dashes (—) anywhere - use colons, semicolons, or short sentences
• Make it entertaining, shareable, and engaging
• Keep quiz question relevant to the story theme
• Include metadata for comments and quiz as shown

Generate the complete story now:`;
}

async function testFullModularGeneration() {
  // console.log('🎭 Testing FULL Modular Story Generation System...\n')

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = generateFullModularPrompt(mockRedditPost, mockComments);

    // console.log('📝 Generating story with ALL modular sections:')
    // console.log('   1. ✅ IMAGE - Hero image section')
    // console.log('   2. ✅ DESCRIBE-1 - Opening narrative')
    // console.log('   3. ✅ DESCRIBE-2 - Story development')
    // console.log('   4. ✅ COMMENTS-1 - First Reddit showcase')
    // console.log('   5. ✅ COMMENTS-2 - Second Reddit showcase')
    // console.log('   6. ✅ DISCUSSION - Podcast-style analysis')
    // console.log('   7. ✅ OUTRO - Conclusion & CTA')
    // console.log('   8. ✅ QUIZ - Interactive quiz component')

    // console.log('\n🤖 Calling GPT-4o for full story generation...')
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000, // Increased for full story
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    // console.log(`⏱️ Generation completed in ${duration}ms`)

    // Parse and validate JSON
    let story;
    try {
      story = JSON.parse(content);
      // console.log('\n✅ Valid JSON generated!')
    } catch (parseError) {
      // console.log('\n❌ JSON parsing failed. Raw content:')
      // console.log(content.slice(0, 1000) + '...')
      return;
    }

    // Analyze the complete story structure
    // console.log('\n🎯 COMPLETE STORY ANALYSIS:')
    // console.log(`   📰 Title: "${story.title}"`)
    // console.log(`   🎭 Persona: ${story.persona}`)
    // console.log(`   📊 Viral Score: ${story.viral_score}/10`)
    // console.log(`   📝 Total Sections: ${story.content?.sections?.length || 0}`)
    // console.log(`   🏷️ Tags: ${story.tags?.join(', ') || 'none'}`)

    if (story.content?.sections) {
      // console.log('\n📋 SECTION BREAKDOWN:')
      story.content.sections.forEach((section, index) => {
        const hasMetadata = section.metadata ? ' (with metadata)' : '';
        // console.log(`   ${index + 1}. ${section.type.toUpperCase()}${hasMetadata}`)

        if (section.type === 'quiz' && section.metadata?.quiz_data) {
          // console.log(`      🧠 Quiz: "${section.metadata.quiz_data.question}"`)
        }

        if (section.type.includes('comments') && section.metadata?.comments) {
          // console.log(`      💬 ${section.metadata.comments.length} Reddit comments included`)
        }
      });
    }

    // Verify all required sections are present
    const expectedSections = [
      'image',
      'describe-1',
      'describe-2',
      'comments-1',
      'comments-2',
      'discussion',
      'outro',
      'quiz',
    ];
    const actualSections = story.content?.sections?.map(s => s.type) || [];

    // console.log('\n🔍 SECTION VALIDATION:')
    expectedSections.forEach((expected, index) => {
      const actual = actualSections[index];
      const match = actual === expected;
      // console.log(`   ${index + 1}. ${expected}: ${match ? '✅' : '❌'} ${actual || 'MISSING'}`)
    });

    const allSectionsPresent = expectedSections.every(
      (section, index) => actualSections[index] === section
    );
    // console.log(`\n📊 All Sections Present: ${allSectionsPresent ? '✅ YES' : '❌ NO'}`)

    // Check for em dashes
    const fullContent = JSON.stringify(story);
    const emDashCount = (fullContent.match(/—/g) || []).length;
    // console.log(`📏 Em Dash Check: ${emDashCount === 0 ? '✅ Clean' : `❌ Found ${emDashCount}`}`)

    // Show sample content
    if (story.content?.sections?.[0]?.content) {
      // console.log('\n📖 Sample Content (Opening):')
      // console.log(`"${story.content.sections[0].content.slice(0, 150)}..."`)
    }

    if (story.excerpt) {
      // console.log('\n🎣 Story Hook:')
      // console.log(`"${story.excerpt}"`)
    }

    // Entity analysis
    if (story.entities && story.entities.length > 0) {
      // console.log('\n🔍 Detected Entities:')
      story.entities.forEach(entity => {
        // console.log(`   • ${entity.name} (${entity.type}) - ${(entity.confidence * 100).toFixed(0)}% confidence`)
      });
    }

    // console.log('\n🎉 FULL MODULAR STORY GENERATION TEST COMPLETE!')
    // console.log('✅ All 8 sections generated')
    // console.log('✅ The Snarky Sage voice applied')
    // console.log('✅ Reddit comments integrated')
    // console.log('✅ Interactive quiz included')
    // console.log('✅ Entity recognition working')
    // console.log('✅ Ready for ThreadJuice deployment!')

    // Save story for potential use
    // console.log('\n💾 Story saved as test-full-story.json')
    const fs = require('fs');
    fs.writeFileSync('test-full-story.json', JSON.stringify(story, null, 2));

    return story;
  } catch (error) {
    console.error('\n❌ Full story generation failed:', error.message);

    if (error.message.includes('API key')) {
      // console.log('💡 Make sure OPENAI_API_KEY is set in .env.local')
    }
  }
}

// Run the test
testFullModularGeneration();
