#!/usr/bin/env node

/**
 * Polished Story Generator with Working Media & Better UI
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

// Helper to get proper image URL
function getRandomBlogImage() {
  const imageNum = Math.floor(Math.random() * 30) + 1;
  return `/assets/img/blog/blog${imageNum.toString().padStart(2, '0')}.jpg`;
}

// Story templates with polished UI
const polishedTemplates = [
  {
    title: "Food Blogger's 'Authentic' Recipe Turns Out to Be Stolen from Actual Grandma's Blog",
    scenario: "recipe_theft",
    category: "Food Wars"
  },
  {
    title: "HOA President's Ring Doorbell Catches Him Breaking His Own 'No Decorations' Rule at 3 AM",
    scenario: "hoa_hypocrisy", 
    category: "Neighbor Drama"
  },
  {
    title: "LinkedIn Influencer's 'Productivity Hack' Video Accidentally Shows 12 Browser Tabs of Solitaire",
    scenario: "productivity_fraud",
    category: "Tech Drama"
  },
  {
    title: "Wedding Photographer Posts Couple's Photos with Wrong Names, Sparks 6-Month Identity Crisis",
    scenario: "wedding_mixup",
    category: "Life Drama"
  }
];

// Generate sections based on scenario
function createPolishedSections(scenario) {
  if (scenario === "recipe_theft") {
    return createRecipeTheftStory();
  } else if (scenario === "hoa_hypocrisy") {
    return createHOAStory();
  } else if (scenario === "productivity_fraud") {
    return createProductivityStory();
  } else if (scenario === "wedding_mixup") {
    return createWeddingStory();
  }
  return createRecipeTheftStory(); // fallback
}

function createRecipeTheftStory() {
  const sections = [];
  
  // Hero image
  sections.push({
    type: "hero_image",
    content: "The recipe theft that shocked Food Twitter",
    metadata: {
      imageUrl: getRandomBlogImage(),
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
  
  // Side by side comparison - WORKING IMAGE
  sections.push({
    type: "embedded_image",
    title: "The Evidence",
    content: "Side-by-side comparison: Ashley's 'original' post vs Grandma Liu's 3-year-old original",
    metadata: {
      caption: "Notice the identical flour handprint, same cat (Mr. Whiskers), and that poorly removed watermark in the corner",
      imageType: "evidence",
      imageUrl: getRandomBlogImage()
    }
  });
  
  // Investigation
  sections.push({
    type: "describe-2",
    title: "The Investigation Unfolds",
    content: `The unraveling began with a simple reverse image search by @FoodDetective. "Hey @AuthenticAshley, quick question - why does your 'family kitchen' look exactly like @GrandmaLiuKitchen's setup from 2021?"

Within hours, Food Twitter had assembled like the Avengers of culinary justice. Every photo matched. The "secret ingredient passed down through generations" was written in Grace's exact quirky style: "a whisper of white pepper (yes, a whisper, Grandma was very specific)."

The most damning evidence? Even the typos were identical. "Fold the dumplong" appeared in both posts. Ashley had literally copy-pasted everything, including the mistakes.`
  });
  
  // Twitter reaction with better formatting
  sections.push({
    type: "twitter_conversation",
    title: "Food Twitter Goes Nuclear",
    content: "",
    metadata: {
      conversation: [
        { 
          author: "@FoodDetective", 
          content: "UPDATE: We found 47 more stolen recipes on Ashley's blog. Starting a spreadsheet. This is insane.", 
          verified: true, 
          likes: 8934,
          timestamp: "2h ago"
        },
        { 
          author: "@ChefMarco", 
          content: "She stole my grandmother's carbonara and added CREAM. This is a declaration of war.", 
          verified: true, 
          likes: 12453,
          timestamp: "2h ago"
        },
        { 
          author: "@BakeWithLove", 
          content: "OMG she's the one who copied my sourdough diary! I KNEW those photos looked familiar!", 
          likes: 3421,
          timestamp: "1h ago"
        },
        { 
          author: "@GrandmaLiuStan", 
          content: "Grandma Liu hasn't even seen this yet. She's about to end this woman's whole career.", 
          likes: 45892,
          timestamp: "1h ago"
        }
      ]
    }
  });
  
  // The moment we've been waiting for
  sections.push({
    type: "describe-3",
    title: "Enter: Grandma Liu",
    content: `Grace Liu hadn't posted in six months due to health issues, which made the theft even more egregious. When her granddaughter showed her what happened, the 73-year-old's response was swift and devastating.

"We need to make a video," Grace said, adjusting her apron with the determination of someone about to deliver justice with a wooden spoon.

What followed was 2 minutes and 47 seconds of the most polite destruction in internet history.`
  });
  
  // THE VIDEO - with better UI
  sections.push({
    type: "video_embed", 
    title: "The Response That Broke The Internet",
    content: "3.2 million views and counting",
    metadata: {
      thumbnail: getRandomBlogImage(),
      duration: "2:47",
      views: "3.2M views",
      platform: "TikTok • @RealGrandmaLiu",
      playable: false,
      transcript: `"Hello, Ashley. I see you enjoyed my dumplings. I'm glad they brought you comfort, though I'm confused how you learned this recipe in my kitchen without me noticing. 

Perhaps you were very small? Like a mouse? A mouse who steals recipes?

*[Proceeds to make dumplings while delivering devastating commentary]*

She says fold eight times for luck. It's seven. Eight is too many. Now your dumplings have too much luck and will explode.

I teach anyone who asks respectfully. My kitchen is open to all. But stealing stories? That's not just taking recipes. That's taking someone's heart. 

Also, Mr. Whiskers wants his modeling fees."`,
      highlights: [
        "0:23 - The 'mouse' comment",
        "1:15 - Dumpling folding correction", 
        "2:30 - Mr. Whiskers demands payment"
      ]
    }
  });
  
  // Celebrity reactions
  sections.push({
    type: "comments",
    content: "The world reacts",
    metadata: {
      comments: [
        { 
          author: "Gordon Ramsay", 
          content: "Grandma Liu just served the most exquisite roast I've ever witnessed. Perfection. 👑", 
          score: 189453, 
          verified: true 
        },
        { 
          author: "Netflix", 
          content: "Grandma Liu, please check your DMs. We'd like to discuss a cooking show.", 
          score: 92341, 
          verified: true 
        },
        { 
          author: "Mr. Whiskers", 
          content: "Meow. (Translation: My lawyers will be in touch.)", 
          score: 234567 
        }
      ]
    }
  });
  
  // More evidence
  sections.push({
    type: "embedded_image",
    title: "The Spreadsheet of Stolen Recipes",
    content: "Internet sleuths documented every single theft",
    metadata: {
      caption: "47 confirmed stolen recipes, color-coded by original creator",
      imageType: "spreadsheet",
      imageUrl: getRandomBlogImage()
    }
  });
  
  // The aftermath
  sections.push({
    type: "describe-4",
    title: "The Aftermath",
    content: `Ashley's blog went private within 2 hours. Then it disappeared entirely. Her Instagram, Twitter, and TikTok followed suit. The internet had delivered swift justice.

But the story didn't end there. The "Ashley Chen Recipe Recovery Project" became a heartwarming phenomenon. Food bloggers rallied to support the original creators, driving traffic to their sites and sharing their real stories.

Grandma Liu's cookbook, "Real Grandma's Kitchen: No Stealing Required," presold 50,000 copies in the first week. She donated the proceeds to culinary schools with a scholarship specifically for "students who ask permission before borrowing recipes."

As for Mr. Whiskers? He now has his own Instagram with 2.3 million followers. His bio simply reads: "I don't know Ashley Chen. Professional food photography model. Booking: meow@grandmaliu.com"`
  });
  
  // Terry's Corner - no longer just a basic box
  sections.push({
    type: "terry_corner",
    content: "The Terry observes: In the digital age, stealing content is like wearing someone else's skin to a costume party. Everyone can see it doesn't fit, the smell gives you away, and the original owner always shows up to reclaim what's theirs. The internet never forgets, but it especially remembers theft from grandmothers.",
    metadata: {
      imageUrl: "/assets/img/personas/the-terry.svg"
    }
  });
  
  return sections;
}

function createHOAStory() {
  const sections = [];
  
  sections.push({
    type: "hero_image",
    content: "When the rule enforcer becomes the rule breaker",
    metadata: { imageUrl: getRandomBlogImage(), isHero: true }
  });
  
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: `Richard Kellerman took his job as HOA president very seriously. Too seriously, according to most residents of Maple Grove Estates. His latest crusade? A "Seasonal Decoration Enforcement Policy" that banned any decorations outside of a strict 30-day window.

The policy was vintage Richard: 47 pages of regulations, complete with violation fees ranging from $50 for "premature pumpkin display" to $200 for "Christmas light persistence beyond January 2nd."

What Richard didn't count on was his own Ring doorbell becoming the star witness in his downfall.`
  });
  
  sections.push({
    type: "video_embed",
    title: "The 3 AM Violation",
    content: "Security footage that ended an HOA presidency",
    metadata: {
      thumbnail: getRandomBlogImage(),
      duration: "0:47",
      views: "234K views",
      platform: "Ring Neighbors",
      transcript: "*3:14 AM - Motion detected*\n[Figure in HOA windbreaker sneaks across lawn]\n[Begins installing elaborate Halloween display]\n[Checks watch nervously]\n[Adds fog machine]"
    }
  });
  
  sections.push({
    type: "describe-2",
    title: "The Unraveling",
    content: `The video went live on the neighborhood app at 6:23 AM. By 6:24 AM, screenshots were flying across three different Facebook groups. By 6:30 AM, Richard's phone was buzzing with violation notices filed against... himself.

Linda Thompson, longtime Richard nemesis, was first to comment: "Per HOA regulation 14.7B, Halloween decorations are prohibited before October 1st. It's September 12th, Richard. That'll be $150."

The irony was delicious. The man who'd fined Mrs. Chen $75 for leaving her Christmas wreath up until January 3rd had been caught red-handed installing a full Halloween village in mid-September.`
  });
  
  sections.push({
    type: "terry_corner",
    content: "The Terry notes: There's a special kind of karma reserved for petty tyrants who get caught by their own surveillance state. It's like watching Big Brother stub his toe on his own boot.",
    metadata: { imageUrl: "/assets/img/personas/the-terry.svg" }
  });
  
  return sections;
}

function createProductivityStory() {
  const sections = [];
  
  sections.push({
    type: "hero_image",
    content: "When productivity theater meets Windows Solitaire",
    metadata: { imageUrl: getRandomBlogImage(), isHero: true }
  });
  
  sections.push({
    type: "describe-1",
    title: "The Setup", 
    content: `@ProductivityGuru had built a LinkedIn empire on the back of productivity tips that promised to "10x your output while working half the time." His latest video, "My Secret to Managing 200 Emails in 10 Minutes," was supposed to cement his status as the king of efficiency.

Instead, it accidentally revealed that his secret was having 12 browser tabs of Spider Solitaire open while pretending to work.

The internet detective squad had a field day with this one.`
  });
  
  sections.push({
    type: "embedded_image",
    title: "The Screenshot That Ended Everything",
    content: "Eagle-eyed viewers zoomed in on his taskbar",
    metadata: {
      caption: "12 different Solitaire games, 4 YouTube tabs, and one very unfortunate screen share",
      imageType: "evidence",
      imageUrl: getRandomBlogImage()
    }
  });
  
  sections.push({
    type: "terry_corner",
    content: "The Terry observes: The productivity industry exists because people would rather pay someone to tell them how to work than actually work. It's the ultimate meta-procrastination.",
    metadata: { imageUrl: "/assets/img/personas/the-terry.svg" }
  });
  
  return sections;
}

function createWeddingStory() {
  const sections = [];
  
  sections.push({
    type: "hero_image", 
    content: "When professional photography meets amateur organization",
    metadata: { imageUrl: getRandomBlogImage(), isHero: true }
  });
  
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: `Sarah and Mike's wedding photos were perfect. Absolutely stunning. The photographer, Amanda Chen, had captured every magical moment with artistic precision.

There was just one tiny problem: the photos were posted to Instagram with completely wrong names. According to the captions, "Jessica and David" had just had the wedding of their dreams.

What followed was a six-month identity crisis that broke the internet.`
  });
  
  sections.push({
    type: "describe-2",
    title: "The Chaos Unfolds",
    content: `Within hours, the real Jessica and David found the photos. They were confused, flattered, and slightly concerned that someone had stolen their wedding. Except they weren't married. Yet.

Meanwhile, Sarah and Mike's relatives were frantically commenting "WHO ARE JESSICA AND DAVID??" while strangers congratulated the wrong couple on their beautiful ceremony.

The plot thickened when Jessica and David actually started dating after bonding over their shared fake wedding photos.`
  });
  
  // Add more sections for wedding story
  sections.push({
    type: "embedded_image",
    title: "The Plot Twist",
    content: "The moment everything changed",
    metadata: {
      imageUrl: getRandomBlogImage(),
      caption: "Screenshots showing the moment Jessica and David found their 'wedding photos'"
    }
  });

  sections.push({
    type: "describe-3",
    title: "The Unexpected Romance",
    content: `Jessica and David's first conversation was surreal. "So... apparently we're married now?" David messaged her on Instagram. "I hope I at least looked good in my dress," Jessica replied.

What started as a joke turned into hours of conversation about the weirdness of it all. They bonded over the absurdity, shared screenshots of confused relatives, and eventually decided to meet up "to discuss their divorce."

Instead, they fell in love. For real this time.`
  });

  sections.push({
    type: "video_embed",
    title: "The Viral TikTok Explanation",
    content: "Jessica and David's story goes viral",
    metadata: {
      thumbnail: getRandomBlogImage(),
      duration: "3:24",
      views: "12.8M views", 
      platform: "TikTok • @JessicaAndDavidWedding",
      transcript: `"So we need to explain why our wedding photos are trending with the wrong names..."`
    }
  });

  sections.push({
    type: "describe-4", 
    title: "The Real Wedding",
    content: `Six months later, Jessica and David had their actual wedding. Amanda Chen, the photographer who started it all, shot their real ceremony for free as an apology.

The best part? Sarah and Mike (the original couple) were guests of honor. Their wedding photos were perfect the second time around too.

And yes, Amanda triple-checked the names before posting.`
  });

  sections.push({
    type: "twitter_conversation",
    title: "The Internet Reacts",
    content: "",
    metadata: {
      conversation: [
        {
          author: "@WeddingPlannerSarah",
          content: "I CANNOT with this story. They fell in love over someone else's wedding photos?? This is the plot of a rom-com.",
          verified: true,
          likes: 23847,
          timestamp: "4h ago"
        },
        {
          author: "@PhotograpgherLife", 
          content: "As a wedding photographer, this is my worst nightmare but also the most beautiful accident ever??",
          likes: 8934,
          timestamp: "3h ago" 
        },
        {
          author: "@JessicaAndDavidWedding",
          content: "Update: We're expecting! Our baby will have the most chaotic origin story ever.",
          verified: true,
          likes: 89234,
          timestamp: "1h ago"
        }
      ]
    }
  });

  sections.push({
    type: "terry_corner",
    content: "The Terry reflects: Sometimes the universe's filing system is so spectacularly broken that it accidentally creates better stories than reality intended. This is one of those times.",
    metadata: { imageUrl: "/assets/img/personas/the-terry.svg" }
  });
  
  return sections;
}

function generateHook(scenario) {
  const hooks = {
    recipe_theft: "The watermark was still visible. The cat was the same cat. Even the typos were identical.",
    hoa_hypocrisy: "His own Ring doorbell captured him breaking the rules he'd written. At 3 AM. In his HOA windbreaker.",
    productivity_fraud: "Screen share reveals 12 tabs of Spider Solitaire. His 'productivity empire' crumbles in real-time.",
    wedding_mixup: "Perfect wedding photos, wrong names, six-month identity crisis, and two strangers who fell in love."
  };
  return hooks[scenario] || "The internet never forgets, especially when you forget to think.";
}

// Main execution
async function generatePolishedStory() {
  console.log('✨ Polished Story Generator with Working Media');
  console.log('===========================================');
  
  // Select random template (force recipe theft for now to test full sections)
  const template = polishedTemplates[0]; // Recipe theft story with full sections
  console.log(`\n📰 Generating: ${template.title}`);
  console.log(`📁 Category: ${template.category}`);
  
  const sections = createPolishedSections(template.scenario);
  
  console.log(`\n📝 Generated ${sections.length} sections:`);
  sections.forEach((section, i) => {
    console.log(`  ${i + 1}. ${section.type}${section.title ? ` - ${section.title}` : ''}`);
  });
  
  const story = {
    title: template.title,
    slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50) + '-' + Date.now().toString(36),
    hook: generateHook(template.scenario),
    content: JSON.stringify({ sections }),
    category: template.category,
    featured: true,
    trending_score: 98,
    view_count: Math.floor(Math.random() * 50000) + 30000,
    share_count: Math.floor(Math.random() * 5000) + 2000,
    featured_image: getRandomBlogImage(),
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
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Story saved successfully!');
    console.log(`🆔 ID: ${data[0].id}`);
    console.log(`🔗 Slug: ${data[0].slug}`);
    console.log(`🖼️  Images: All using correct blog0X.jpg format`);
    console.log(`🎥 Video: Grandma Liu's response with full transcript`);
    console.log('\n🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

// Run it
generatePolishedStory();