#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// console.log('📝 ADDING DRAMATIC QUOTES TO EXISTING STORIES');
// console.log('━'.repeat(50));

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
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

// Stories to upgrade (excluding auto-generated ones that already have quotes)
const storiesToUpgrade = [
  'test-short-story.json',
  'new-story-boss-birthday-presentation-revenge.json',
  'first-story-sister-fake-influencer-lifestyle-exposed.json',
];

async function callOpenAI(messages) {
  const requestData = JSON.stringify({
    model: 'gpt-4o',
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  const tempFile = 'temp_quotes_request.json';
  fs.writeFileSync(tempFile, requestData);

  const curlCommand = `curl -s https://api.openai.com/v1/chat/completions \\
    -H "Authorization: Bearer ${apiKey}" \\
    -H "Content-Type: application/json" \\
    -d @${tempFile}`;

  try {
    const response = execSync(curlCommand, { encoding: 'utf8' });
    fs.unlinkSync(tempFile);

    const result = JSON.parse(response);

    if (result.error) {
      throw new Error(`OpenAI API Error: ${result.error.message}`);
    }

    return result.choices[0].message.content;
  } catch (error) {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    console.error('❌ Error calling OpenAI:', error.message);
    throw error;
  }
}

async function generateQuotesForStory(story) {
  // console.log(`🎯 Analyzing story: ${story.title}`);

  // Extract all text content from the story
  const allContent = story.content.sections
    .map(section => section.content)
    .join(' ');

  const prompt = `Analyze this viral story and extract 3-4 of the most dramatic, controversial, or memorable quotes that would work as pullquotes for viral content.

Story Title: ${story.title}
Story Content: ${allContent}

Return ONLY a JSON array of quote objects with this exact format:
[
  {
    "quote": "The most shocking/dramatic line from the story",
    "attribution": "Who said it or where it's from (character name, OP, commenter, etc.)",
    "context": "Brief context of when/why this was said"
  }
]

Focus on:
- Lines that make readers gasp or react strongly
- Controversial or dramatic statements
- Memorable dialogue or reactions
- Moments of triumph or revenge
- Statements that capture the essence of the drama

Make sure quotes are actual text from the story, not invented.`;

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert at identifying viral, dramatic quotes from stories that will engage readers and break up text effectively.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await callOpenAI(messages);

  // Extract JSON from response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from response');
  }

  return JSON.parse(jsonMatch[0]);
}

function insertQuotesIntoStory(story, quotes) {
  // console.log(`📝 Inserting ${quotes.length} quotes into story...`);

  const sections = [...story.content.sections];
  const newSections = [];

  // Add sections with quotes strategically placed
  let quoteIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    newSections.push(section);

    // Insert quotes after certain section types, but not consecutively
    const shouldInsertQuote =
      quoteIndex < quotes.length &&
      (section.type === 'describe-1' ||
        section.type === 'describe-2' ||
        section.type === 'discussion') &&
      // Don't insert if next section is already a quote
      (i + 1 >= sections.length || sections[i + 1].type !== 'quotes');

    if (shouldInsertQuote) {
      const quote = quotes[quoteIndex];
      newSections.push({
        type: 'quotes',
        content: quote.quote,
        metadata: {
          attribution: quote.attribution,
          context: quote.context,
        },
      });
      quoteIndex++;
    }
  }

  // If we have remaining quotes, add them before the outro or quiz
  while (quoteIndex < quotes.length) {
    const outroIndex = newSections.findIndex(
      s => s.type === 'outro' || s.type === 'quiz'
    );
    if (outroIndex > 0) {
      const quote = quotes[quoteIndex];
      newSections.splice(outroIndex, 0, {
        type: 'quotes',
        content: quote.quote,
        metadata: {
          attribution: quote.attribution,
          context: quote.context,
        },
      });
      quoteIndex++;
    } else {
      break;
    }
  }

  return {
    ...story,
    content: {
      ...story.content,
      sections: newSections,
    },
  };
}

async function upgradeStory(filename) {
  // console.log(`\n🔄 Upgrading: ${filename}`);
  // console.log('─'.repeat(40));

  if (!fs.existsSync(filename)) {
    console.error(`❌ File not found: ${filename}`);
    return;
  }

  // Read existing story
  const storyData = fs.readFileSync(filename, 'utf8');
  const story = JSON.parse(storyData);

  // Check if story already has quotes
  const hasQuotes = story.content.sections.some(
    section => section.type === 'quotes'
  );
  if (hasQuotes) {
    // console.log('⏭️  Story already has quotes, skipping...');
    return;
  }

  try {
    // Generate quotes
    const quotes = await generateQuotesForStory(story);
    // console.log(`✅ Generated ${quotes.length} dramatic quotes`);

    // Insert quotes into story
    const upgradedStory = insertQuotesIntoStory(story, quotes);

    // Create backup
    const backupFilename = filename.replace('.json', '-backup.json');
    fs.writeFileSync(backupFilename, storyData);
    // console.log(`💾 Backup saved: ${backupFilename}`);

    // Write upgraded story
    fs.writeFileSync(filename, JSON.stringify(upgradedStory, null, 2));
    // console.log(`✅ Story upgraded with dramatic quotes`);

    // Show sample quotes
    // console.log('📜 Sample quotes added:');
    quotes.slice(0, 2).forEach((quote, index) => {
      // console.log(`   ${index + 1}. "${quote.quote}" - ${quote.attribution}`);
    });
  } catch (error) {
    console.error(`❌ Error upgrading ${filename}:`, error.message);
  }
}

async function upgradeAllStories() {
  // console.log(
  //   `🚀 Starting upgrade for ${storiesToUpgrade.length} stories...\n`
  // );

  for (let i = 0; i < storiesToUpgrade.length; i++) {
    await upgradeStory(storiesToUpgrade[i]);

    // Add delay between requests to respect rate limits
    if (i < storiesToUpgrade.length - 1) {
      // console.log('⏳ Waiting 3 seconds for rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // console.log('\n🎉 ALL STORIES UPGRADED WITH DRAMATIC QUOTES!');
  // console.log('━'.repeat(50));
  // console.log('✅ Backup files created for safety');
  // console.log('✅ All stories now have viral pullquotes');
  // console.log('✅ Ready for maximum engagement!');
}

// Run the upgrade
upgradeAllStories().catch(console.error);
