#!/usr/bin/env node

/**
 * Enhanced Story Generator with Rich Visual Content
 * Creates stories with embedded images, screenshots, and visual evidence
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

// Enhanced story templates with visual assets
const storyTemplates = [
  {
    title: "Twitter Thread About 'Hustle Culture' Accidentally Exposes CEO's Entire Day is Meetings About Meetings",
    category: "Tech Drama",
    hook: "47 calendar screenshots later, everyone realized productivity theater is real.",
    scenario: "hustle_expose",
    visualAssets: {
      calendar_screenshots: {
        description: "The damning evidence: A week view showing 47 meetings",
        placement: "after_setup",
        caption: "Monday alone featured 'Pre-sync for sync', 'Alignment on alignment', and 'Meeting to plan meetings'"
      },
      meeting_slides: {
        description: "Leaked slides from 'Strategic Vision Alignment Cascade'",
        placement: "mid_story",
        caption: "Slide 23: 'Is Arial killing our innovation?' - This was a real slide."
      },
      twitter_thread: {
        description: "The original thread that started it all",
        placement: "beginning",
        caption: "@DisruptDaily's productivity masterclass backfired spectacularly"
      },
      glassdoor_reviews: {
        description: "Employee reviews that confirmed everything",
        placement: "near_end",
        caption: "'Great snacks, endless meetings' appeared 147 times"
      }
    }
  },
  {
    title: "Neighborhood Facebook Group Implodes Over Mystery Dog Poop Bandit",
    category: "Neighbor Drama", 
    hook: "Security footage, DNA testing threats, and the HOA president's golden retriever.",
    scenario: "poopgate",
    visualAssets: {
      poop_evidence: {
        description: "Jennifer Martinez's infamous first post with photo evidence",
        placement: "setup",
        caption: "The post that started Poopgate: 'This is UNACCEPTABLE!!!'"
      },
      security_footage: {
        description: "Grainy Ring doorbell footage showing mysterious figure at 5:47 AM",
        placement: "investigation",
        caption: "Enhanced footage revealed a familiar golden retriever silhouette"
      },
      facebook_meltdown: {
        description: "Screenshot of the 400+ comment thread descending into chaos",
        placement: "escalation",
        caption: "The moment Linda Thompson suggested DNA testing for all neighborhood dogs"
      },
      churchill_caught: {
        description: "The damning photo of Churchill mid-deed on Jennifer's lawn",
        placement: "climax",
        caption: "HOA President Richard Kellerman's own security camera betrayed him"
      }
    }
  },
  {
    title: "Food Blogger's 'Authentic' Recipe Copied from Grandma's Blog (Not Their Grandma)",
    category: "Food Wars",
    hook: "The watermark removal was sloppy, and the real grandma has entered the chat.",
    scenario: "recipe_theft",
    visualAssets: {
      side_by_side: {
        description: "Ashley's post next to Grandma Liu's original, including same cat",
        placement: "evidence",
        caption: "Even Mr. Whiskers (the cat) was stolen content"
      },
      grandma_video: {
        description: "Screenshot from Grandma Liu's viral response video",
        placement: "response",
        caption: "'Perhaps you were very small? Like a mouse? A mouse who steals recipes?'"
      },
      dumpling_comparison: {
        description: "The incorrect folding technique that gave it away",
        placement: "technical",
        caption: "Eight folds vs seven - 'Now your dumplings have too much luck and will explode'"
      }
    }
  }
];

// Generate content with embedded visuals
function generateEnhancedContent(template) {
  const sections = [];
  
  // Hero image
  sections.push({
    type: "hero_image",
    content: "The story that broke the internet",
    metadata: {
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      isHero: true
    }
  });
  
  // Opening with first visual if applicable
  if (template.visualAssets.twitter_thread?.placement === 'beginning') {
    sections.push({
      type: "embedded_image",
      title: "The Thread That Started Everything",
      content: template.visualAssets.twitter_thread.description,
      metadata: {
        caption: template.visualAssets.twitter_thread.caption,
        imageType: "screenshot"
      }
    });
  }
  
  // Setup section
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: generateSetupContent(template)
  });
  
  // Early visual evidence
  if (template.visualAssets.poop_evidence?.placement === 'setup' || 
      template.visualAssets.calendar_screenshots?.placement === 'after_setup') {
    const asset = template.visualAssets.poop_evidence || template.visualAssets.calendar_screenshots;
    sections.push({
      type: "embedded_image",
      title: "The Evidence",
      content: asset.description,
      metadata: {
        caption: asset.caption,
        imageType: "evidence",
        imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`
      }
    });
  }
  
  // Development with quotes
  sections.push({
    type: "describe-2", 
    title: "The Investigation Begins",
    content: generateDevelopmentContent(template)
  });
  
  // Mid-story visuals
  const midVisuals = Object.entries(template.visualAssets)
    .filter(([_, asset]) => asset.placement === 'mid_story' || asset.placement === 'investigation');
  
  midVisuals.forEach(([key, asset]) => {
    sections.push({
      type: "embedded_image",
      title: "Exhibit " + (sections.length - 3),
      content: asset.description,
      metadata: {
        caption: asset.caption,
        imageType: key,
        imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`
      }
    });
  });
  
  // Comments and reactions
  sections.push({
    type: "comments",
    content: "The Internet Reacts",
    metadata: {
      comments: generateTopComments(template)
    }
  });
  
  // Climax with reveal
  sections.push({
    type: "describe-3",
    title: "The Truth Revealed",
    content: generateClimaxContent(template)
  });
  
  // Climactic visual evidence
  const climaxVisuals = Object.entries(template.visualAssets)
    .filter(([_, asset]) => asset.placement === 'climax' || asset.placement === 'evidence');
  
  climaxVisuals.forEach(([key, asset]) => {
    sections.push({
      type: "embedded_image",
      title: "The Smoking Gun",
      content: asset.description,
      metadata: {
        caption: asset.caption,
        imageType: key,
        impact: "high",
        imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`
      }
    });
  });
  
  // Resolution
  sections.push({
    type: "describe-4",
    title: "The Aftermath",
    content: generateResolutionContent(template)
  });
  
  // Final visuals
  const endVisuals = Object.entries(template.visualAssets)
    .filter(([_, asset]) => asset.placement === 'near_end' || asset.placement === 'response');
  
  endVisuals.forEach(([key, asset]) => {
    sections.push({
      type: "embedded_image",
      title: "The Final Word",
      content: asset.description,
      metadata: {
        caption: asset.caption,
        imageType: key,
        imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`
      }
    });
  });
  
  // Terry's Corner
  sections.push({
    type: "terry_corner",
    content: generateTerryWisdom(template),
    metadata: {
      imageUrl: "/assets/img/personas/the-terry.svg"
    }
  });
  
  return { sections };
}

// Content generators
function generateSetupContent(template) {
  const content = {
    hustle_expose: `@DisruptDaily thought they were sharing productivity wisdom. "Our CEO manages 500+ employees while maintaining perfect work-life balance. Here's his secret 🧵"

What followed was 23 screenshots that accidentally revealed the most elaborate performance of fake productivity in corporate history. The internet was about to witness the complete implosion of hustle culture mythology, one calendar screenshot at a time.

The thread started innocently enough with promises of "revolutionary time management." By screenshot 15, even LinkedIn was questioning if "10x productivity" meant attending 10x more meetings than humanly possible.`,
    
    poopgate: `Picture this: Oak Valley Estates, a pristine suburban paradise where the biggest controversy was usually whether holiday decorations could go up before Thanksgiving. Population: 2,847 extremely online neighbors with too much time and Ring doorbell subscriptions.

Jennifer Martinez's morning started like any other until she stepped onto her perfectly manicured lawn and into what would become known as "The Incident." Her Facebook post at 7:23 AM would transform this peaceful neighborhood into a surveillance state that would make the NSA jealous.

"ATTENTION NEIGHBORS: Someone is letting their dog do their BUSINESS on my lawn EVERY MORNING at approximately 5:45 AM and NOT cleaning it up. I have PICTURES. This is UNACCEPTABLE and ILLEGAL. If I find out who this is, I WILL be pressing charges!!!"

The pictures were, unfortunately, included.`,
    
    recipe_theft: `Ashley Chen had built her food blog "Authentic Eats by Ash" on a foundation of heartwarming family stories and "secret recipes passed down through generations." Her latest post, "My Nana's Secret Dumpling Recipe," complete with touching memories of Sunday afternoons in grandma's kitchen, was getting serious traction.

Too bad none of it was true. Not the grandma, not the kitchen, not even the cat photobombing the prep shots.

The internet's food detective squad was about to serve up a lesson in why you should always remove watermarks properly, especially when stealing from a beloved 73-year-old food blogger named Grace Liu.`
  };
  
  return content[template.scenario] || "This is where our story begins...";
}

function generateDevelopmentContent(template) {
  const content = {
    hustle_expose: `The calendar screenshots were a dystopian masterpiece. Monday started with "Pre-alignment for Tuesday's Sync" at 7 AM, followed by "Sync Sync" (yes, that was the actual meeting name), "Strategic Touchpoint Cascade," and "Ideation Session on Meeting Efficiency."

By noon, the CEO had already attended "Lunch & Learn: How to Eat While Walking to Your Next Meeting" and "Stand-up About Sitting Down Less." The 2 PM slot showed three simultaneous meetings, raising questions about either time travel or body doubles.

Twitter user @SkepticalDev zoomed in on one screenshot: "Bros... look at meeting room B at 3 PM. 'Meeting to Discuss Why We Have Too Many Meetings.' I cannot make this up." The tweet got 45K likes in an hour.

The most damning evidence came from the 4 PM slot: "Productivity Workshop: Appearing Busy for Investors." Someone at the company was clearly trying to send a message.

But the rabbit hole went deeper. Tuesday's schedule featured "Synergy Sync," "Touch Base About Touching Base," and a mysterious three-hour block labeled only "Strategic Strategic Strategy." By Wednesday, even the calendar app seemed to be crying for help with entries like "Meeting (Yes, Another One)" and "Can We Please Just Work?"

The comment threads exploded with employees from other companies sharing their own meeting hell screenshots. One showed a recurring daily meeting called "Daily Daily." Another had achieved peak corporate absurdity with "Pre-Pre-Meeting Prep."

LinkedIn influencers tried to defend the practice. "Meetings ARE work," posted one thought leader, before being ratio'd into oblivion by people with actual jobs. The CEO's own LinkedIn connections started publicly questioning if he knew what his company actually produced besides PowerPoints.`,
    
    poopgate: `The neighborhood Facebook group transformed into CSI: Suburbia within hours. Linda Thompson, self-appointed neighborhood watch captain, created a shared Google Doc titled "POOP PATROL EVIDENCE LOG" with time stamps, weather conditions, and "turd topography analysis."

Mark Sullivan contributed Ring doorbell footage showing a "suspicious figure" at 5:47 AM, though the quality was so poor it could have been Bigfoot walking a chihuahua. This didn't stop amateur detectives from enhancing, zooming, and creating conspiracy theories.

"I've triangulated the poop locations," posted David Kim, who apparently had nothing better to do with his engineering degree. "Based on the pattern, the perpetrator lives on Maple Street, owns a medium-to-large dog, and walks counter-clockwise."

Richard Kellerman, HOA president, announced emergency measures: "Effective immediately, all dogs must be registered with photo ID. DNA testing kits will be available at the clubhouse. We WILL find this criminal."

Nobody questioned why the HOA president was taking this so personally. That would come later.`,
    
    recipe_theft: `The unraveling began with a simple reverse image search by @FoodDetective. "Hey @AuthenticAshley, quick question - why does your 'family kitchen' look exactly like @GrandmaLiuKitchen's setup from 2021? Even the same flour handprint on the counter? 🤔"

The food blogging community assembled like the Avengers of culinary justice. Every hour brought new revelations. The typos were identical ("fold the dumplong"). The quirky measurements matched ("a whisper of white pepper"). Even the cat, Mr. Whiskers, was the same tabby who'd been featured in Grace Liu's posts for five years.

Ashley's response made everything worse: "I never said it was MY grandmother." The internet collectively screamed: "YOUR POST IS LITERALLY TITLED 'MY NANA'S SECRET RECIPE.'"

The investigation expanded. "Mom's Famous Casserole" traced to an Idaho food blogger. "First Apartment Pasta" belonged to a Boston college student. Ashley's entire blog was other people's memories, garnished with theft and served with audacity.`
  };
  
  return content[template.scenario] || "The plot thickened considerably...";
}

function generateClimaxContent(template) {
  const content = {
    hustle_expose: `The killing blow came from inside the company. An anonymous employee leaked the actual content of these meetings. "Strategic Vision Alignment Cascade" was 47 slides about font choices. Slide 23: "Is Arial Killing Our Innovation?" Slide 31: "What Would Helvetica Do?"

The "Productivity Workshop" materials included gems like "How to Look Thoughtful in Zoom Calls" and "Nodding: A Strategic Framework." The facilitator notes actually said: "If anyone asks about actual productivity metrics, pivot to synergy."

But wait, it got worse. The company's own Glassdoor reviews painted a picture of corporate hell: "I forgot what my actual job was supposed to be." "My calendar has meetings to plan meetings about meetings." "Great snacks, though."

The CEO attempted damage control with a LinkedIn post: "Meetings are simply collaborative productivity sessions." The comments turned into a roast that would make a comedy club jealous. Someone calculated he spent 94% of his time in meetings, leaving 6% for bathroom breaks and posting on LinkedIn about productivity.`,
    
    poopgate: `The truth revealed itself in the most poetic way possible. Richard Kellerman, in his zealous pursuit of justice, had installed a new security camera aimed at Jennifer's lawn. He livestreamed the footage to the Facebook group to catch the perpetrator in the act.

At 5:43 AM, a familiar golden retriever appeared on screen. Churchill, Richard's own dog, proceeded to do his business on Jennifer's lawn while Richard, clearly visible in his distinctive HOA president windbreaker, scrolled through his phone obliviously.

The Facebook group exploded. Comments came faster than Churchill's morning constitutional. "RICHARD IS THE POOP BANDIT." "HOA PRESIDENT MORE LIKE HOA POOPSIDENT." "CHURCHILL DID NOTHING WRONG."

Richard tried to delete the stream, but screenshots were already spreading across three different neighborhood Facebook groups, NextDoor, and somehow, Twitter. The attempted cover-up made it worse: "That's not Churchill. Churchill is smaller. This is... another golden retriever who looks identical."

Linda Thompson, sensing a power vacuum, immediately called for Richard's resignation and announced her candidacy for HOA president with a "Tough on Poop Crime" platform.`,
    
    recipe_theft: `Grace Liu entered the chat, and it was glorious. Her granddaughter helped her create a response video that would go down in internet history. Sitting in the kitchen from the photos, with Mr. Whiskers prominently featured, the 73-year-old delivered devastation with grandmotherly sweetness.

"Hello, Ashley. I see you enjoyed my dumplings. I'm glad they brought you comfort, though I'm confused how you learned this recipe in my kitchen without me noticing. Perhaps you were very small? Like a mouse? A mouse who steals recipes?"

She then proceeded to make the dumplings properly, noting every place Ashley had gotten it wrong. "She says fold eight times for luck. It's seven. Eight is too many. Now your dumplings have too much luck and will explode."

The shade reached lethal levels: "I teach anyone who asks respectfully. My kitchen is open to all. But stealing stories? That's not just taking recipes. That's taking someone's heart. Also, Mr. Whiskers wants his modeling fees."

The video hit 3 million views in 24 hours. Gordon Ramsay retweeted it with just "👑". Food Network called. Publishers offered cookbook deals. Ashley's blog went private, then disappeared entirely.`
  };
  
  return content[template.scenario] || "Then came the moment of truth...";
}

function generateResolutionContent(template) {
  const content = {
    hustle_expose: `The fallout was swift and merciless. Company stock dipped 3% as investors questioned whether a CEO spending 94% of his time in meetings could possibly be running anything effectively. The board called an emergency meeting about meetings. The irony was lost on no one except the board.

#MeetingGate spawned a cultural movement. Employees everywhere began sharing their own meeting horror stories. "No-Meeting Fridays" became a rallying cry. Some brave companies actually implemented it. Productivity soared. Morale improved. 

The CEO, showing remarkable inability to read the room, launched a consulting firm teaching "Efficient Meeting Strategies" at $500/hour. His calendar remains fully booked with meetings about how to have fewer meetings.

A year later, his former employees report 40% higher productivity and 100% fewer meetings about fonts. Arial and Helvetica have learned to coexist peacefully.`,
    
    poopgate: `Richard's resignation letter was a masterpiece of deflection: "I'm stepping down to focus on family (and Churchill's training)." Linda Thompson seized power immediately, implementing a surveillance state that would make Orwell proud.

The Facebook group never recovered. What was once a place for garage sale announcements became a digital battlefield. The annual block party was cancelled. Trust, once lost over dog poop, proved impossible to rebuild.

Jennifer Martinez parlayed her viral fame into a successful TikTok account about suburban drama. Her reenactments of Poopgate, featuring Churchill as himself, regularly hit millions of views.

Churchill remains unrepentant and is reportedly planning a memoir: "Good Boy: My Side of the Story." Richard now walks him at 4 AM in a different neighborhood entirely.`,
    
    recipe_theft: `Ashley Chen's food blog empire crumbled faster than an over-mixed dumpling. The "Ashley Chen Recipe Recovery Project" became a wholesome internet phenomenon, with people reaching out to original creators to show support.

Grandma Liu's cookbook, "Real Grandma's Kitchen: No Stealing Required," presold 50,000 copies in the first week. She donated proceeds to culinary schools with a scholarship for "students who ask permission before borrowing recipes."

Mr. Whiskers got his own Instagram managed by Grandma Liu's granddaughter. He now has brand deals and a line of aprons featuring his judgmental face. His bio reads: "I don't know Ashley Chen."

The real victory? Food bloggers started crediting each other properly. The community that exposed Ashley also created a support network for recipe sharing. Grandma Liu's kitchen really did become open to all—just with proper attribution.`
  };
  
  return content[template.scenario] || "In the aftermath...";
}

function generateTopComments(template) {
  const comments = {
    hustle_expose: [
      { author: "FormerEmployee47", content: "I once spent 6 hours in meetings about reducing meetings. We concluded we needed more meetings to discuss it.", score: 8934, replies: 234 },
      { author: "ProductivityGuru", content: "This is why I only schedule meetings to cancel other meetings. It's called negative productivity.", score: 4521, replies: 89 },
      { author: "DevManager2023", content: "My company tried this. We now communicate entirely through interpretive dance. Surprisingly effective.", score: 2341, replies: 156 }
    ],
    poopgate: [
      { author: "SuburbanSherlock", content: "I KNEW IT. The poop pattern matched Churchill's walking route perfectly. My CSI: Suburbia spreadsheet is vindicated!", score: 3456, replies: 89 },
      { author: "DogWalker99", content: "Churchill is innocent! He was framed! (This is Richard isn't it)", score: 2341, replies: 234 },
      { author: "JustMovedHere23", content: "I'm selling my house. This neighborhood is unhinged. Y'all need therapy, not DNA tests.", score: 5672, replies: 445 }
    ],
    recipe_theft: [
      { author: "GrandmaLiuStan", content: "Grandma Liu's 'mouse who steals recipes' is the most devastating burn in internet history", score: 12453, replies: 445 },
      { author: "FoodBloggerUnion", content: "Starting a support group for everyone who's been Ashley'd. Meeting weekly (with attribution)", score: 3421, replies: 234 },
      { author: "MrWhiskersOfficial", content: "Meow (I still don't know this Ashley person) 🐱", score: 45892, replies: 892 }
    ]
  };
  
  return comments[template.scenario] || [];
}

function generateTerryWisdom(template) {
  const wisdom = {
    hustle_expose: "The Terry observes: Modern productivity is just an elaborate performance where everyone pretends to work while actually just talking about working. The real innovation would be admitting this and taking a nap instead. At least then something would actually get done (the nap).",
    
    poopgate: "The Terry notes: Give a suburban neighborhood Facebook group and surveillance technology, and they'll create a police state over dog shit. The real crime here isn't the poop—it's that these people have nothing better to do with their finite existence.",
    
    recipe_theft: "The Terry reflects: The internet's greatest strength is also its greatest weakness—everything is traceable, including your lazy theft. Ashley learned that stealing recipes is easy, but stealing someone's grandmother? That's where the internet draws the line."
  };
  
  return wisdom[template.scenario] || "The Terry has observed this situation and found humanity wanting.";
}

// Main execution
async function generateEnhancedStory() {
  console.log('📸 Enhanced Story Generator with Visual Assets');
  console.log('===========================================');
  
  // Select random template
  const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
  
  console.log(`\n📰 Title: ${template.title}`);
  console.log(`📁 Category: ${template.category}`);
  console.log(`🎯 Hook: ${template.hook}`);
  console.log(`🖼️  Visual Assets: ${Object.keys(template.visualAssets).length} embedded images`);
  
  // Generate content
  const content = generateEnhancedContent(template);
  
  // Create story object
  const story = {
    title: template.title,
    slug: template.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '-' + Date.now().toString(36),
    hook: template.hook,
    content: JSON.stringify(content),
    category: template.category,
    featured: Math.random() > 0.3,
    trending_score: Math.floor(Math.random() * 20) + 80,
    view_count: Math.floor(Math.random() * 10000) + 5000,
    share_count: Math.floor(Math.random() * 1000) + 100,
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
    console.log(`🖼️  Visual Assets: ${Object.keys(template.visualAssets).length} images embedded`);
    console.log('\n🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
    // Log visual asset details
    console.log('\n📸 Embedded Visual Assets:');
    Object.entries(template.visualAssets).forEach(([key, asset]) => {
      console.log(`   • ${key}: ${asset.caption}`);
    });
    
    return data[0];
  } catch (error) {
    console.error('❌ Failed to save story:', error);
  }
}

// Run the generator
generateEnhancedStory();