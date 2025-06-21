#!/usr/bin/env node

/**
 * Intelligent Story Generator with Content-Aware Visual Assets
 * Parses story content and automatically creates necessary media embeds
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Parse content for media references
function parseMediaReferences(content) {
  const mediaReferences = [];
  
  // Video patterns
  const videoPatterns = [
    /viral (?:response )?video/gi,
    /video (?:response|reply|went viral)/gi,
    /posted a video/gi,
    /video (?:that|which) (?:went|gone) (?:viral|mega-viral)/gi
  ];
  
  // Screenshot patterns
  const screenshotPatterns = [
    /screenshot(?:s|ed)?/gi,
    /calendar screenshot/gi,
    /leaked (?:the )?screenshot/gi,
    /(?:posted|shared) (?:a |the )?screenshot/gi
  ];
  
  // Photo patterns
  const photoPatterns = [
    /photo evidence/gi,
    /damning photo/gi,
    /security (?:camera )?footage/gi,
    /caught on camera/gi,
    /side-by-side comparison/gi
  ];
  
  // Thread patterns
  const threadPatterns = [
    /twitter thread/gi,
    /thread (?:that|which) started/gi,
    /original thread/gi,
    /viral thread/gi
  ];
  
  // Check for video references
  videoPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      mediaReferences.push({
        type: 'video',
        context: matches[0],
        required: true
      });
    }
  });
  
  // Check for screenshot references
  screenshotPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      mediaReferences.push({
        type: 'screenshot',
        context: matches[0],
        required: true
      });
    }
  });
  
  // Check for photo references
  photoPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      mediaReferences.push({
        type: 'photo',
        context: matches[0],
        required: true
      });
    }
  });
  
  // Check for thread references
  threadPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      mediaReferences.push({
        type: 'twitter_thread',
        context: matches[0],
        required: true
      });
    }
  });
  
  return mediaReferences;
}

// Generate video embed section
function generateVideoEmbed(context, storyDetails) {
  const videoTypes = {
    'grandma_response': {
      title: "Grandma Liu's Viral Response",
      thumbnail: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      duration: "2:47",
      views: "3.2M views",
      platform: "TikTok",
      description: "The response that broke the internet",
      transcript: `"Hello, Ashley. I see you enjoyed my dumplings. I'm glad they brought you comfort, though I'm confused how you learned this recipe in my kitchen without me noticing. Perhaps you were very small? Like a mouse? A mouse who steals recipes?"`
    },
    'ceo_calendar': {
      title: "CEO's Productivity Masterclass",
      thumbnail: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      duration: "15:23",
      views: "892K views",
      platform: "LinkedIn",
      description: "The video that accidentally exposed everything"
    },
    'poop_evidence': {
      title: "Ring Doorbell Footage - ENHANCED",
      thumbnail: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      duration: "0:34",
      views: "45K views",
      platform: "Facebook",
      description: "The moment Churchill was caught red-handed (or red-pawed)"
    }
  };
  
  // Determine which video type based on story context
  let videoData = videoTypes.grandma_response; // default
  if (context.toLowerCase().includes('calendar') || context.toLowerCase().includes('ceo')) {
    videoData = videoTypes.ceo_calendar;
  } else if (context.toLowerCase().includes('doorbell') || context.toLowerCase().includes('churchill')) {
    videoData = videoTypes.poop_evidence;
  }
  
  return {
    type: "video_embed",
    title: videoData.title,
    content: videoData.description,
    metadata: {
      thumbnail: videoData.thumbnail,
      duration: videoData.duration,
      views: videoData.views,
      platform: videoData.platform,
      playable: false, // Since we don't have actual videos
      transcript: videoData.transcript
    }
  };
}

// Enhanced story templates
const intelligentStoryTemplates = [
  {
    title: "Food Blogger's 'Authentic' Recipe Copied from Grandma's Blog (Not Their Grandma)",
    category: "Food Wars",
    hook: "The watermark removal was sloppy, and the real grandma's response video went viral.",
    scenario: "recipe_theft",
    contentGenerator: () => generateRecipeTheftStory()
  },
  {
    title: "Twitter Thread About 'Hustle Culture' Accidentally Exposes CEO's Entire Day is Meetings About Meetings",
    category: "Tech Drama",
    hook: "47 calendar screenshots later, everyone realized productivity theater is real.",
    scenario: "hustle_expose",
    contentGenerator: () => generateHustleExposeStory()
  }
];

// Generate recipe theft story with proper video embeds
function generateRecipeTheftStory() {
  const sections = [];
  
  // Hero image
  sections.push({
    type: "hero_image",
    content: "The recipe theft that shocked Food Twitter",
    metadata: {
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      isHero: true
    }
  });
  
  // Setup
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: `Ashley Chen had built her food blog "Authentic Eats by Ash" on a foundation of heartwarming family stories and "secret recipes passed down through generations." Her latest post, "My Nana's Secret Dumpling Recipe," complete with touching memories of Sunday afternoons in grandma's kitchen, was getting serious traction.

Too bad none of it was true. Not the grandma, not the kitchen, not even the cat photobombing the prep shots.

The internet's food detective squad was about to serve up a lesson in why you should always remove watermarks properly, especially when stealing from a beloved 73-year-old food blogger named Grace Liu.`
  });
  
  // Side by side comparison
  sections.push({
    type: "embedded_image",
    title: "The Evidence",
    content: "Side-by-side comparison of Ashley's post and Grandma Liu's original",
    metadata: {
      caption: "Even Mr. Whiskers (the cat) appeared in the exact same position",
      imageType: "comparison",
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`
    }
  });
  
  // Investigation
  sections.push({
    type: "describe-2",
    title: "The Unraveling",
    content: `The investigation started with a simple reverse image search by @FoodDetective. Every single photo on Ashley's blog post appeared on "Grandma Liu's Kitchen," posted three years earlier with the same rustic wooden table, the same ceramic plates, and crucially, the same tabby cat named Mr. Whiskers.

Food Twitter assembled like the Avengers of culinary justice. The evidence mounted: Ashley's "secret ingredient passed down through generations" was listed in the exact same quirky way Grace wrote it: "a whisper of white pepper (yes, a whisper, Grandma was very specific)."

Grace Liu hadn't posted in six months due to health issues, which made the theft even more egregious. Her granddaughter found out when followers started messaging asking why her grandma was now calling herself Ashley.`
  });
  
  // Twitter reaction thread
  sections.push({
    type: "twitter_conversation",
    title: "Food Twitter Reacts",
    content: "The community response was swift and merciless",
    metadata: {
      conversation: [
        { author: "@FoodDetective", content: "So Ashley Chen's touching story includes the exact same flour handprint as Grace Liu's 2021 post? Interesting genetics 🧐", verified: true, likes: 3421 },
        { author: "@GrandmaLiuStan", content: "NOT THE WATERMARK STILL BEING VISIBLE IN THE CORNER 💀💀💀", likes: 8934 },
        { author: "@ChefMarco", content: "She once posted my ceviche recipe as her 'beach vacation discovery.' I've never been so insulted by someone adding ketchup to my life's work.", verified: true, likes: 2341 },
        { author: "@RecipeRescue", content: "Starting a spreadsheet of all Ashley's stolen recipes. We're at 47 confirmed thefts and counting.", likes: 5672 }
      ]
    }
  });
  
  // The moment we've been waiting for - THE VIDEO
  sections.push({
    type: "describe-3",
    title: "Grandma Liu Enters the Chat",
    content: `The real Grandma Liu's response video became the stuff of internet legend. Her granddaughter helped her create a TikTok that would go down in history as the most devastating takedown delivered with grandmotherly sweetness.

Sitting in the kitchen from the photos, with Mr. Whiskers prominently featured, the 73-year-old Grace Liu delivered pure devastation wrapped in a gentle smile.`
  });
  
  // THE ACTUAL VIDEO EMBED
  sections.push({
    type: "video_embed",
    title: "Grandma Liu's Viral Response Video",
    content: "The most polite destruction in internet history",
    metadata: {
      thumbnail: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      duration: "2:47",
      views: "3.2M views",
      platform: "TikTok",
      playable: false,
      transcript: `"Hello, Ashley. I see you enjoyed my dumplings. I'm glad they brought you comfort, though I'm confused how you learned this recipe in my kitchen without me noticing. Perhaps you were very small? Like a mouse? A mouse who steals recipes?

She says fold eight times for luck. It's seven. Eight is too many. Now your dumplings have too much luck and will explode.

I teach anyone who asks respectfully. My kitchen is open to all. But stealing stories? That's not just taking recipes. That's taking someone's heart. Also, Mr. Whiskers wants his modeling fees."`
    }
  });
  
  // Comments on the video
  sections.push({
    type: "comments",
    content: "The Internet Reacts to Grandma Liu",
    metadata: {
      comments: [
        { author: "Gordon Ramsay", content: "👑", score: 89234, replies: 4521, verified: true },
        { author: "NetflixOfficial", content: "Grandma Liu, check your DMs. We have a proposal.", score: 45672, replies: 892, verified: true },
        { author: "MrWhiskersOfficial", content: "Meow (Translation: I demand compensation for unauthorized use of my likeness)", score: 67890, replies: 234 }
      ]
    }
  });
  
  // Aftermath
  sections.push({
    type: "describe-4",
    title: "The Aftermath",
    content: `Ashley's blog went private within hours, then disappeared entirely. The "Ashley Chen Recipe Recovery Project" became a wholesome internet phenomenon, with people reaching out to original creators to show support.

Grandma Liu's cookbook, "Real Grandma's Kitchen: No Stealing Required," presold 50,000 copies in the first week. She donated proceeds to culinary schools with a scholarship for "students who ask permission before borrowing recipes."

Mr. Whiskers got his own Instagram managed by Grandma Liu's granddaughter. He now has brand deals and a line of aprons featuring his judgmental face. His bio reads: "I don't know Ashley Chen."`
  });
  
  // Terry's Corner
  sections.push({
    type: "terry_corner",
    content: "The Terry observes: In the attention economy, stealing content is like wearing someone else's skin to a party - everyone can tell it doesn't fit, but you're the only one who doesn't notice the smell.",
    metadata: {
      imageUrl: "/assets/img/personas/the-terry.svg"
    }
  });
  
  return sections;
}

// Generate hustle expose story with calendar screenshots
function generateHustleExposeStory() {
  const sections = [];
  
  // Hero
  sections.push({
    type: "hero_image",
    content: "When productivity theater meets reality",
    metadata: {
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      isHero: true
    }
  });
  
  // The thread that started it all
  sections.push({
    type: "twitter_thread",
    title: "The Thread That Started Everything",
    content: "@DisruptDaily's productivity masterclass that backfired spectacularly",
    metadata: {
      tweets: [
        {
          author: "@DisruptDaily",
          content: "🧵 How our CEO manages 500+ employees while maintaining perfect work-life balance (THREAD)",
          verified: true,
          timestamp: "9:23 AM",
          metrics: { likes: 234, retweets: 45, quotes: 892 }
        },
        {
          author: "@DisruptDaily", 
          content: "1/ First, he starts every day at 4:30 AM with meditation, cold plunge, and strategic visioning",
          verified: true,
          timestamp: "9:24 AM",
          metrics: { likes: 156, retweets: 23, quotes: 445 }
        },
        {
          author: "@DisruptDaily",
          content: "2/ By 7 AM, he's already had 3 'alignment sessions' to ensure everyone is synchronized",
          verified: true,
          timestamp: "9:25 AM",
          metrics: { likes: 89, retweets: 12, quotes: 1234 },
          attachments: ["calendar_screenshot_1.jpg"]
        }
      ]
    }
  });
  
  // Content continues...
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: `@DisruptDaily thought they were sharing productivity wisdom. What followed was 23 screenshots that accidentally revealed the most elaborate performance of fake productivity in corporate history.

The thread started innocently enough with promises of "revolutionary time management." By screenshot 15, even LinkedIn was questioning if "10x productivity" meant attending 10x more meetings than humanly possible.`
  });
  
  // The damning calendar screenshot
  sections.push({
    type: "embedded_image",
    title: "Exhibit A: Monday's Calendar",
    content: "The calendar that broke the internet",
    metadata: {
      caption: "Notice the 3PM slot: 'Meeting to Discuss Why We Have Too Many Meetings'",
      imageType: "calendar_screenshot",
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      annotations: [
        { time: "7:00 AM", meeting: "Pre-alignment for Tuesday's Sync" },
        { time: "8:00 AM", meeting: "Sync Sync (yes, that's the name)" },
        { time: "9:00 AM", meeting: "Strategic Touchpoint Cascade" },
        { time: "10:00 AM", meeting: "Ideation Session on Meeting Efficiency" },
        { time: "11:00 AM", meeting: "Stand-up About Sitting Down Less" },
        { time: "12:00 PM", meeting: "Lunch & Learn: Eating While Walking to Meetings" },
        { time: "2:00 PM", meeting: "Productivity Workshop: Appearing Busy" },
        { time: "3:00 PM", meeting: "Meeting to Discuss Why We Have Too Many Meetings" },
        { time: "4:00 PM", meeting: "Alignment on Alignment Strategy" }
      ]
    }
  });
  
  return sections;
}

// Main execution
async function generateIntelligentStory() {
  console.log('🧠 Intelligent Story Generator with Content-Aware Media');
  console.log('====================================================');
  
  // Select template - force recipe story for demonstration
  const template = intelligentStoryTemplates[0]; // Recipe theft story with video
  
  console.log(`\n📰 Title: ${template.title}`);
  console.log(`📁 Category: ${template.category}`);
  console.log(`🎯 Hook: ${template.hook}`);
  
  // Generate content
  const sections = template.contentGenerator();
  
  // Parse content for media references
  const allContent = sections.map(s => s.content).join(' ');
  const mediaRefs = parseMediaReferences(allContent);
  
  console.log(`\n🎬 Media References Found: ${mediaRefs.length}`);
  mediaRefs.forEach(ref => {
    console.log(`   • ${ref.type}: "${ref.context}"`);
  });
  
  // Create story object
  const story = {
    title: template.title,
    slug: template.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36),
    hook: template.hook,
    content: JSON.stringify({ sections }),
    category: template.category,
    featured: true,
    trending_score: Math.floor(Math.random() * 10) + 90,
    view_count: Math.floor(Math.random() * 20000) + 10000,
    share_count: Math.floor(Math.random() * 2000) + 500,
    featured_image: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('\n💾 Saving to Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([story])
      .select();
    
    if (error) {
      console.error('❌ Error saving to Supabase:', error);
      return;
    }
    
    console.log('✅ Story saved successfully!');
    console.log(`🆔 ID: ${data[0].id}`);
    console.log(`🔗 Slug: ${data[0].slug}`);
    console.log(`📊 Trending Score: ${data[0].trending_score}`);
    
    // Log special sections
    const videoSections = sections.filter(s => s.type === 'video_embed');
    const threadSections = sections.filter(s => s.type === 'twitter_thread');
    
    console.log(`\n📹 Video Embeds: ${videoSections.length}`);
    videoSections.forEach(v => {
      console.log(`   • ${v.title} (${v.metadata.duration}, ${v.metadata.views})`);
    });
    
    console.log(`\n🐦 Twitter Threads: ${threadSections.length}`);
    
    console.log('\n🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
    return data[0];
  } catch (error) {
    console.error('❌ Failed to save story:', error);
  }
}

// Add video embed rendering support
console.log('\n📝 Note: Update SimplePostDetail.tsx to support video_embed and twitter_thread types');

// Run the generator
generateIntelligentStory();