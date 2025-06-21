#!/usr/bin/env node

/**
 * ThreadJuice Story Generator for Supabase
 * Generates real viral content stories and saves directly to Supabase
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

// Real viral story templates based on actual internet phenomena
const realStoryTemplates = [
  {
    title: "Gym Bro's 'Motivational' TikTok Goes Viral After Background Reveals He's in Planet Fitness Judging Others",
    category: "Fitness Drama",
    hook: "Nothing says 'embrace the grind' like filming yourself mocking beginners at the judgment-free zone.",
    scenario: "gym_hypocrisy"
  },
  {
    title: "LinkedIn 'Thought Leader' Gets Roasted for Turning Grocery Store Encounter into Business Lesson",
    category: "Internet Culture",
    hook: "Local man can't buy milk without extracting a lesson about synergy and disruption.",
    scenario: "linkedin_cringe"
  },
  {
    title: "HOA President's Security Camera Obsession Backfires When Footage Shows Him Breaking Own Rules",
    category: "Neighbor Drama",
    hook: "The same cameras meant to catch rule-breakers captured the president's 3 AM lawn decorating spree.",
    scenario: "hoa_karma"
  },
  {
    title: "Woman's 'Minimalist' Apartment Tour Features 47 Storage Units She 'Doesn't Count'",
    category: "Lifestyle",
    hook: "Apparently minimalism means hiding your 200 throw pillows in a climate-controlled facility across town.",
    scenario: "fake_minimalism"
  },
  {
    title: "Tech CEO's 'Day in My Life' Video Accidentally Shows 14 Assistants Doing Everything",
    category: "Tech Drama",
    hook: "The 4 AM cold plunge hits different when someone else sets the temperature and holds your towel.",
    scenario: "ceo_reality"
  }
];

// Generate detailed story content
function generateStoryContent(template) {
  const storyId = `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const sections = [];
  
  // Opening section
  sections.push({
    type: "describe-1",
    title: "The Setup",
    content: generateOpeningContent(template),
    enhanced: true
  });

  // Image placeholder
  sections.push({
    type: "image",
    content: "The moment of revelation captured in all its glory.",
    metadata: {
      image_prompt: getImagePrompt(template.scenario)
    }
  });

  // Development
  sections.push({
    type: "describe-2",
    title: "How It All Unfolded",
    content: generateDevelopmentContent(template)
  });

  // Key quote
  sections.push({
    type: "quotes",
    content: generateKeyQuote(template),
    metadata: {
      attribution: "The moment of realization",
      context: "When the internet connected the dots"
    }
  });

  // Internet reaction
  sections.push({
    type: "comments-1",
    title: "The Internet Reacts",
    content: "Social media had thoughts:",
    metadata: {
      comments: generateComments(template)
    }
  });

  // Analysis
  sections.push({
    type: "discussion",
    title: "The Bigger Picture",
    content: generateAnalysisContent(template)
  });

  // Conclusion
  sections.push({
    type: "outro",
    title: "The Takeaway",
    content: generateConclusionContent(template)
  });

  return { sections };
}

// Content generation functions
function generateOpeningContent(template) {
  const openings = {
    "gym_hypocrisy": "Jake 'GrindNeverStops' Martinez has built his entire TikTok following on motivational gym content. 'No excuses,' 'embrace the struggle,' 'your only competition is yesterday's you'—the usual suspects of fitness platitudes delivered with aggressive enthusiasm.\n\nBut eagle-eyed viewers noticed something interesting in his latest 'beast mode' video: the distinctive purple and yellow color scheme of Planet Fitness, the gym literally branded as the 'Judgment Free Zone.'",
    "linkedin_cringe": "We've all seen them—those LinkedIn posts that turn every mundane interaction into a profound business lesson. But Gregory Chen might have just achieved peak LinkedIn when he transformed a simple grocery store encounter into a 2,000-word manifesto on leadership.\n\nThe post, which began with 'I was buying milk when I witnessed something that changed my entire perspective on scalable innovation,' has become the stuff of internet legend.",
    "hoa_karma": "Robert Peterson took his role as HOA president very seriously. Security cameras on every corner, detailed logs of every minor infraction, fines issued with military precision.\n\nSo when residents received an email blast at 3:47 AM containing security footage of Robert himself installing flamingo lawn ornaments—explicitly banned under Section 4.2.1 of the HOA guidelines—the irony was delicious.",
    "fake_minimalism": "Sophia's apartment tour video promised to show how she lives with 'only 30 items.' Clean lines, empty surfaces, the kind of space that makes Marie Kondo weep with joy.\n\nWhat she didn't mention: the three storage units containing what she calls her 'seasonal items,' 'backup essentials,' and 'things that don't count because they're not technically in my living space.'",
    "ceo_reality": "Tech CEO Brandon Wu's 'Day in My Life' videos are legendary for their grueling schedule. 4 AM wake-up, cold plunge, meditation, coding session, all before the sun rises.\n\nBut in his latest video, viewers caught glimpses of something interesting: at least 14 different people handling every aspect of his 'solo grind,' from the assistant adjusting his ring light to the chef preparing his 'simple' breakfast."
  };
  
  return openings[template.scenario] || "This is a story about modern life's beautiful absurdities.";
}

function generateDevelopmentContent(template) {
  const developments = {
    "gym_hypocrisy": "The video itself was standard Jake content—grunting through sets while shouting about 'leaving your comfort zone.' But in the background, clear as day, were several people clearly new to fitness, doing their best with lighter weights.\n\nAnd then came the moment that launched a thousand quote tweets: Jake, between sets, can be seen gesturing at someone off-camera and mouthing what lip-readers confirmed as 'look at this guy.' The camera briefly pans, catching a glimpse of an older gentleman carefully working through physical therapy exercises.\n\nThe Terry observes this is peak gym bro behavior—preaching inclusivity while practicing exclusivity.",
    "linkedin_cringe": "The post detailed how Gregory watched a grocery store employee restock shelves and had an epiphany about 'vertical integration in human capital deployment.' He managed to work in references to Amazon's supply chain, Tesla's innovation model, and somehow, blockchain.\n\nThe employee in question? They were literally just putting cereal boxes on a shelf. But in Gregory's mind, this became a masterclass in 'optimizing spatial economics while maintaining stakeholder engagement.'\n\nThe Terry notes this is what happens when business school buzzwords achieve sentience.",
    "hoa_karma": "The footage showed Robert, in full ninja cosplay (black clothes, ski mask), methodically placing plastic flamingos around his own lawn. But not just any flamingos—ones wearing tiny seasonal outfits that he had apparently hand-sewn.\n\nThe timestamp revealed this occurred mere hours after he'd issued three fines to other residents for 'unauthorized lawn decoration.' His own security system, with its military-grade night vision, captured every hypocritical moment in crystal-clear detail.",
    "fake_minimalism": "A determined internet sleuth found the storage facility's Instagram page, which featured Sophia's units in a post about 'maximizing your storage space.' The photos revealed a hoarder's paradise: mountains of clothes, dozens of furniture pieces, and enough decorative pillows to stock a Pottery Barn.\n\nThe math didn't add up. Her '30 items' mysteriously didn't include: her 200+ book collection ('they're experiences, not possessions'), her 47 plants ('living things don't count'), or her extensive kitchen gadget collection ('tools are necessities').",
    "ceo_reality": "Internet detectives had a field day with Brandon's video. They counted: two people managing his calendar on different screens, someone pre-measuring his supplements, an assistant literally starting his car, another person setting up his 'spontaneous' video calls, and someone whose only job appeared to be maintaining his ring light positioning.\n\nThe 'coding session' was particularly revealing—Brandon typed for exactly 37 seconds before cutting to a 'few hours later' transition. His commits? Nonexistent. His actual contribution? Sending Slack messages that started with 'just a thought...'"
  };
  
  return developments[template.scenario] || "The story continued to unfold in unexpected ways.";
}

function generateKeyQuote(template) {
  const quotes = {
    "gym_hypocrisy": "Bro posts 'your only competition is yourself' while literally filming himself judging others. Make it make sense.",
    "linkedin_cringe": "This man really saw someone doing their job and thought 'how can I make this about synergy?'",
    "hoa_karma": "The same man who fined me $50 for a doormat being 2 inches too wide is out here playing flamingo dress-up at 3 AM.",
    "fake_minimalism": "Having three storage units full of stuff you 'don't count' is not minimalism, it's just expensive denial.",
    "ceo_reality": "This man has more assistants than I have friends, but sure, tell me more about your 'solo grind.'"
  };
  
  return quotes[template.scenario] || "Sometimes reality is stranger than fiction.";
}

function generateAnalysisContent(template) {
  const analyses = {
    "gym_hypocrisy": "The Planet Fitness incident reveals the hollow core of much fitness influence culture. These creators preach inclusivity and self-improvement while their actual behavior suggests they view beginners as content rather than people deserving respect.\n\nThe Terry observes this disconnect between performed values and actual behavior has become the defining characteristic of social media fitness culture. Everyone's a motivational speaker until they think the camera's not watching.",
    "linkedin_cringe": "LinkedIn has evolved into a platform where ordinary human experiences must be transformed into corporate parables. Every interaction becomes a TED talk, every observation a revolutionary business insight.\n\nThe compulsion to extract profound meaning from mundane encounters reveals something deeply broken about how we communicate professional value. The Terry notes we've created a culture where simply existing isn't enough—everything must be content, every moment a teachable moment.",
    "hoa_karma": "The HOA president's downfall is a perfect metaphor for surveillance culture eating itself. The very systems designed to catch others inevitably capture our own transgressions.\n\nBut deeper than the schadenfreude is a question about community governance. When did neighborhoods become miniature police states? The Terry observes that HOAs have evolved from community organizations into power trips with landscaping requirements.",
    "fake_minimalism": "The storage unit revelation exposes how minimalism has been commodified into yet another form of consumption. Instead of actually owning less, we've created an industry around hiding what we own.\n\nThe Terry notes this performative minimalism—where the aesthetic of simplicity matters more than actual simplicity—perfectly captures our modern relationship with possessions. We don't want less stuff; we want to look like we have less stuff.",
    "ceo_reality": "The assistant revelation strips away the myth of the self-made entrepreneur grinding alone. Behind every 'solopreneur' success story is usually a team of people whose labor gets erased from the narrative.\n\nThis isn't just about one CEO—it's about how success stories get packaged and sold. The Terry observes that 'grind culture' depends on making extreme privilege look like extreme dedication."
  };
  
  return analyses[template.scenario] || "The implications extend far beyond the immediate situation.";
}

function generateConclusionContent(template) {
  const conclusions = {
    "gym_hypocrisy": "Jake's TikTok account lost 100K followers in 48 hours. He posted an apology video (from a different gym) about 'learning and growing.' Planet Fitness's social media team posted a subtle shade tweet about their judgment-free policy that got more engagement than Jake's entire account.\n\nThe Terry's final observation: Nothing says 'beast mode' quite like bullying beginners at the gym that literally has 'Judgment Free Zone' painted on the walls.",
    "linkedin_cringe": "Gregory's post became the most mocked LinkedIn content of the month, spawning a whole genre of parody posts about finding business insights in increasingly absurd situations. He doubled down with a follow-up post about 'embracing constructive feedback as a growth accelerator.'\n\nThe milk? Still just milk. The employee? Still just doing their job. The internet's capacity for secondhand embarrassment? Apparently limitless.",
    "hoa_karma": "Robert resigned as HOA president within a week, but not before trying to fine himself $500 to 'maintain consistency.' The flamingos became a neighborhood symbol of resistance, with residents adding their own dressed-up versions in solidarity.\n\nThe security cameras remain, now monitoring a neighborhood where every lawn sports at least one festive flamingo. The Terry notes this is the most beautiful form of justice—poetic and plastic.",
    "fake_minimalism": "Sophia deleted her apartment tour and posted a new video about 'honest minimalism,' which still somehow didn't include footage of her storage units. The internet responded by creating a new term: 'storage unit minimalism,' defined as owning nothing except everything you own.\n\nThe Terry's wisdom: True minimalism is not needing to hide your possessions in a different zip code.",
    "ceo_reality": "Brandon's video became required viewing in business schools as an example of how not to portray authenticity. He leaned into it, hiring two more assistants specifically to manage the assistants who appeared in his videos.\n\nThe Terry concludes: The real grind is maintaining the illusion of grinding. That probably requires its own MBA."
  };
  
  return conclusions[template.scenario] || "In the end, the internet never forgets, and irony always wins.";
}

function generateComments(template) {
  const commentTemplates = {
    "gym_hypocrisy": [
      { author: "FitnessFiona2023", content: "This is why I work out at home. No judgment, no Jake.", score: 847 },
      { author: "GymRatTruth", content: "Planet Fitness marketing team didn't even have to pay for this perfect ad", score: 623 },
      { author: "SwolePatrol", content: "Imagine being so insecure you judge others at PLANET FITNESS", score: 492 },
      { author: "CardioQueen", content: "That elderly gentleman has more dignity in his PT exercises than Jake has in his entire account", score: 1205 }
    ],
    "linkedin_cringe": [
      { author: "CorporateCringe", content: "I physically cannot read past 'scalable innovation in the dairy aisle'", score: 923 },
      { author: "LinkedInLunatic", content: "New drinking game: take a shot every time he says 'synergy'", score: 674 },
      { author: "RealistRebecca", content: "That employee deserves compensation for involuntary thought leadership", score: 1455 },
      { author: "BuzzwordBingo", content: "He really said 'vertical integration' about putting cereal on shelves I'M DECEASED", score: 892 }
    ],
    "hoa_karma": [
      { author: "SuburbanSass", content: "Those flamingos are better dressed than I am", score: 743 },
      { author: "HOAHater", content: "The ski mask really adds to the whole 'totally normal behavior' vibe", score: 892 },
      { author: "NeighborNancy", content: "He hand-sewed outfits for flamingos at 3 AM. This man needs a hobby. Oh wait.", score: 1632 },
      { author: "JusticeJunkie", content: "His own surveillance state became his downfall. Shakespeare could never.", score: 1098 }
    ],
    "fake_minimalism": [
      { author: "HoarderReformed", content: "Three storage units is just maximalism with extra steps", score: 945 },
      { author: "MarieKondoNo", content: "Those storage units definitely don't spark joy", score: 734 },
      { author: "RealMinimalist", content: "Minimalism is when you own nothing except three warehouses of stuff apparently", score: 1234 },
      { author: "StorageWars", content: "Plot twist: she probably films 'decluttering' videos in the storage units", score: 867 }
    ],
    "ceo_reality": [
      { author: "StartupSteve", content: "14 assistants but still calls it a 'solo grind' I'M SCREAMING", score: 1456 },
      { author: "WorkerBee2024", content: "My entire salary is less than what he pays someone to hold his towel", score: 987 },
      { author: "TechBroTruth", content: "The coding session was 37 seconds I cannot breathe", score: 1823 },
      { author: "AssistantToThe", content: "As someone's assistant, I can confirm we do everything while they make TikToks", score: 1345 }
    ]
  };
  
  return commentTemplates[template.scenario] || [];
}

function getImagePrompt(scenario) {
  const prompts = {
    "gym_hypocrisy": "gym interior with purple and yellow planet fitness colors",
    "linkedin_cringe": "professional man in grocery store looking contemplative",
    "hoa_karma": "security camera footage of lawn with flamingo decorations",
    "fake_minimalism": "minimalist apartment interior with hidden storage",
    "ceo_reality": "tech office with multiple assistants in background"
  };
  
  return prompts[scenario] || "viral social media moment";
}

// Generate and save story to Supabase
async function generateAndSaveStory() {
  console.log('🎯 Generating New Story for ThreadJuice');
  console.log('=====================================');
  
  // Select random template
  const template = realStoryTemplates[Math.floor(Math.random() * realStoryTemplates.length)];
  
  console.log(`📰 Title: ${template.title}`);
  console.log(`📁 Category: ${template.category}`);
  console.log(`🎯 Scenario: ${template.scenario}`);
  
  // Generate story content
  const content = generateStoryContent(template);
  
  // Create story object
  const story = {
    title: template.title,
    slug: template.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60),
    hook: template.hook,
    content: JSON.stringify(content),
    category: template.category,
    featured: Math.random() > 0.5,
    trending_score: Math.floor(Math.random() * 20) + 80,
    view_count: Math.floor(Math.random() * 5000) + 1000,
    share_count: Math.floor(Math.random() * 500) + 50,
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
    console.log('\n🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
    return data[0];
  } catch (error) {
    console.error('❌ Failed to save story:', error);
  }
}

// Run the generator
generateAndSaveStory();