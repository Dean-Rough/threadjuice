#!/usr/bin/env node

/**
 * Dynamic Story Generator for ThreadJuice
 * Creates stories with organic flow: intro → dynamic content with inserts → outro → Terry's Corner
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

// Story templates with potential for dynamic expansion
const storyTemplates = [
  {
    title: "Neighborhood Facebook Group Implodes Over Mystery Dog Poop Bandit",
    category: "Neighbor Drama",
    hook: "Security camera footage, DNA testing threats, and a surprise twist involving the HOA president's own golden retriever.",
    scenario: "neighborhood_drama",
    hasPotentialForExpansion: true,
    twitterDrama: false
  },
  {
    title: "Twitter Thread About 'Hustle Culture' Accidentally Exposes CEO's Entire Day is Meetings About Meetings",
    category: "Tech Drama", 
    hook: "A LinkedIn guru's attempt to share productivity tips revealed 47 calendar screenshots of back-to-back 'syncs' and 'alignments'.",
    scenario: "corporate_expose",
    hasPotentialForExpansion: true,
    twitterDrama: true
  },
  {
    title: "Food Blogger's 'Authentic' Recipe Turns Out to Be Copied from Grandma's Blog (Not Their Grandma)",
    category: "Food Wars",
    hook: "The watermark removal was sloppy, the backstory was fiction, and the actual grandma has entered the chat with receipts.",
    scenario: "recipe_theft",
    hasPotentialForExpansion: true,
    twitterDrama: false
  }
];

// Dynamic content generators with proper story structure
function generateIntro(template) {
  // Each intro needs: Hook → Context → Promise of drama
  const intros = {
    neighborhood_drama: {
      hook: "The HOA president was leading a vigilante hunt for a serial lawn pooper. Plot twist: it was his own golden retriever the entire time.",
      context: "Picture this: a peaceful suburban neighborhood Facebook group, 2,847 members strong, where the biggest controversy is usually whether the ice cream truck plays its music too loud. That was before The Poop Incident.",
      setup: `It started with a simple post from Jennifer Martinez, complete with a photo that nobody asked for but everyone got anyway. "ATTENTION NEIGHBORS: Someone is letting their dog do their BUSINESS on my lawn EVERY MORNING and not cleaning it up. This is UNACCEPTABLE."

What followed was a masterclass in suburban warfare, complete with security camera footage analysis that would make CSI jealous, threats of DNA testing that definitely aren't legal, and a twist ending that nobody saw coming—least of all the HOA president who'd been leading the witch hunt.`
    },

    corporate_expose: {
      hook: "A CEO's 'productivity masterclass' accidentally revealed his calendar: 47 meetings per week, including 'Pre-meeting for the planning meeting' and 'Alignment on alignment strategy.'",
      context: "Tech Twitter was having a normal Thursday when @DisruptDaily decided to share their CEO's secret to managing 500+ employees while maintaining work-life balance.",
      setup: `The thread started innocently enough with promises of revolutionary time management. What followed was 23 screenshots that accidentally revealed the emperor had no clothes—unless you count back-to-back meetings about meetings as clothes.

The calendar was a dystopian masterpiece. By screenshot 15, even the CEO's most loyal followers were starting to question if "10x productivity" meant attending 10x more meetings than actual work.`
    },

    recipe_theft: {
      hook: "Food blogger steals grandma's dumpling recipe, forgets to remove watermark. Real grandma enters chat with video response: 'Perhaps you were very small? Like a mouse? A mouse who steals recipes?'",
      context: "Food blogging is built on a foundation of shared family recipes and heartwarming stories. So when Ashley Chen posted 'Nana's Secret Dumpling Recipe' with touching childhood memories, thousands were moved.",
      setup: `Too bad it wasn't her grandmother. Or her recipe. Or even a good job at removing the watermark from the actual grandmother's blog.

The internet's detective squad assembled faster than you can say "fold the dumpling." Within hours, they'd traced everything back to Grace Liu's blog "Grandma Liu's Kitchen," complete with the exact same photos, typos, and even the same cat photobombing the prep shots.`
    }
  };

  const intro = intros[template.scenario];
  return {
    type: "intro",
    content: intro ? `${intro.hook}\n\n${intro.context}\n\n${intro.setup}` : "This is a story about the internet being the internet.",
    metadata: {
      hook: intro?.hook,
      hasProperStructure: true
    }
  };
}

// Helper to break up long paragraphs
function breakIntoParagraphs(text, maxLength = 400) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const paragraphs = [];
  let currentParagraph = '';
  
  sentences.forEach(sentence => {
    if (currentParagraph.length + sentence.length > maxLength && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = sentence;
    } else {
      currentParagraph += sentence;
    }
  });
  
  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }
  
  return paragraphs.join('\n\n');
}

// Generate dynamic section headers
function generateSectionHeader(storyProgress, template) {
  const headers = {
    beginning: [
      "The Opening Salvo",
      "How It Started", 
      "The Incident",
      "Ground Zero",
      "The Spark"
    ],
    middle: [
      "The Plot Thickens",
      "Things Escalate Quickly",
      "Enter the Internet",
      "The Investigation Begins",
      "When Twitter Does Its Thing"
    ],
    climax: [
      "The Truth Emerges",
      "Plot Twist Incoming", 
      "The Revelation",
      "Everything Unravels",
      "Peak Drama Achieved"
    ],
    end: [
      "The Aftermath",
      "The Dust Settles",
      "Lessons Learned (Or Not)",
      "The Final Word",
      "Resolution, Of Sorts"
    ]
  };
  
  const stage = storyProgress < 0.3 ? 'beginning' : 
                storyProgress < 0.6 ? 'middle' :
                storyProgress < 0.8 ? 'climax' : 'end';
                
  const stageHeaders = headers[stage];
  return stageHeaders[Math.floor(Math.random() * stageHeaders.length)];
}

function generateContentParagraphs(template, sectionNumber) {
  // Generate 3-4 paragraphs of story progression with paragraph limits
  const contentMap = {
    neighborhood_drama: {
      1: `The investigation began immediately. Linda Thompson, self-appointed neighborhood watch captain, posted Ring doorbell footage from the past month. "I've been reviewing the tapes," she announced, like she was heading a federal investigation. "The perpetrator appears to be a medium-sized brown dog, walking between 6:47 and 7:13 AM."

Comments flooded in. Security camera angles were shared. A spreadsheet was created tracking dog walking patterns. Someone suggested hiring a private investigator. Another person, definitely not joking, offered to do DNA testing through their veterinarian cousin.

By day three, the Facebook group had transformed into a surveillance state. Every dog owner was a suspect. Trust eroded faster than you could say "scoop the poop." Michael Rodriguez posted a photo of his beagle with a timestamp alibi: "Patches was inside eating breakfast at the time of the incident. Here's video proof."

The paranoia reached peak levels when someone created a anonymous form for "poop crime tips." This was no longer about lawn maintenance. This was war.`,

      2: `Then came The Meeting. An emergency HOA session was called, led by president Richard Kellerman, who approached the podium with the gravitas of a man addressing the UN Security Council. "We cannot allow this biological terrorism to continue," he actually said, out loud, to a room full of adults.

He proposed a series of increasingly unhinged solutions: mandatory doggie DNA database, paid security patrols, motion-activated sprinklers, and—this is real—a neighborhood-wide email alert system called "Poop Watch."

The room erupted. Dog owners felt persecuted. Non-dog owners demanded justice. Sarah Kim suggested everyone was overreacting and was immediately shouted down. Someone yelled "If you have nothing to hide, you have nothing to fear!" and that's when civility died completely.

Richard, red-faced and righteous, declared he would personally patrol the neighborhood each morning until the culprit was caught. "This ends now," he proclaimed, probably imagining himself as suburban Batman.`,

      3: `The plot twist came at 6:52 AM the following Tuesday. Jennifer Martinez, the original victim, was enjoying her coffee when she saw something shocking through her window: Richard Kellerman himself, standing on her lawn while his golden retriever, Churchill, did exactly what you think he was doing.

But here's the beautiful part—he was so busy typing on his phone (later revealed to be updating the Poop Watch Facebook group about "suspicious activity" on Elm Street) that he walked away without cleaning up. The entire incident was captured on three different security cameras.

The Facebook group imploded. Screenshots were shared. Zoom backgrounds were made. Someone created a GIF. The phrase "Poopgate" started trending locally. Richard tried to claim it was his first offense, that he simply forgot bags that one time, but the security footage told a different story.

Linda Thompson, ever the detective, had already compiled a montage: "FIVE SEPARATE INCIDENTS, RICHARD. FIVE." The video, set to dramatic music, showed Churchill's morning constitutional tour of the neighborhood while Richard scrolled his phone, oblivious.`
    },

    corporate_expose: {
      1: `The calendar screenshots were a dystopian work of art. Monday started with "Alignment on Q3 Alignment Strategy" followed immediately by "Sync to Discuss Friday's Sync." By 10 AM, our productivity guru CEO had attended "Pre-Meeting for Tomorrow's Planning Meeting" and "Quick Connect Re: Yesterday's Quick Connect."

Twitter users started creating bingo cards. "Meeting about meetings" was the free space. "Circling back on circling back" got you bonus points. Someone calculated that the CEO spent 47 hours per week in meetings, leaving approximately 3 minutes for actual CEO duties.

The best part? Between the meetings were 5-minute blocks labeled "Bio break" and "Transition time," suggesting our 10x leader had optimized bathroom visits into his revolutionary productivity system. One user noted: "This man has monetized peeing. Respect."

By screenshot 12, people were finding meetings scheduled during other meetings. "Overflow sync for overbooked alignment" was a real calendar entry. The Russian nesting doll of corporate buzzword salad had achieved sentience.`,

      2: `@DisruptDaily tried damage control, claiming these meetings were "high-level strategic sessions that drive innovation." This backfired spectacularly when Twitter users started translating the meeting titles.

"Weekly Stand-up to Align on Stand-ups" = We're meeting about how we meet
"Stakeholder Temperature Check Touch-base" = Asking people if they're annoyed yet  
"Cross-functional Collaboration Synthesis" = Nobody knows why we're here
"Innovation Pipeline Ideation Session" = Please someone have an idea

A former employee entered the chat: "I once spent 6 hours in meetings about reducing meetings. We concluded we needed more meetings to discuss it." This tweet got 45K likes and started a support group thread for meeting survivors.

The CEO's assistant (anonymous account, but obvious) revealed the truth: "He double-books himself to look busy, then randomly picks which meeting to attend based on which room has better snacks." The emperor wasn't wearing clothes; he was wearing a calendar costume made of pure nonsense.`,

      3: `Peak absurdity arrived when someone leaked the actual content of "Strategic Vision Alignment Cascade" - it was 47 slides about font choices for future presentations. Slide 23 was titled "Is Arial killing our innovation?" Slide 31 asked "What would Helvetica do?"

The internet lost its collective mind. Designers started a holy war in the replies. Someone created a Netflix documentary pitch about corporate font politics. The CEO, attempting to save face, scheduled an emergency all-hands meeting about "Message Architecture Crisis Management."

But the final nail in the coffin came from the company's own Glassdoor reviews. "Great snacks, endless meetings" appeared 147 times. "I learned 17 synonyms for 'discussion' but forgot how to actually work" had 89 helpful votes. One review simply said: "Sync sync sync sync sync sync sync. That's it. That's the job."

By day's end, "CEO's Calendar Challenge" was trending, with people sharing increasingly ridiculous meeting screenshots from their own workplaces. Corporate America had been exposed as one giant performance art piece about talking about maybe someday doing something.`
    },

    recipe_theft: {
      1: `The investigation started with a simple reverse image search that revealed the truth faster than Ashley's "30-minute authentic dumplings." Every single photo on her blog post appeared on "Grandma Liu's Kitchen," posted three years earlier with the same rustic wooden table, the same ceramic plates, and crucially, the same tabby cat named Mr. Whiskers.

Food Twitter assembled like the Avengers of culinary justice. @FoodDetective started a thread: "So Ashley Chen's touching story about learning from her Nana includes the exact same flour handprint on the counter as Grace Liu's 2021 post? Interesting genetics 🧐"

The evidence mounted. Ashley's "secret ingredient passed down through generations" was listed in the exact same quirky way Grace wrote it: "a whisper of white pepper (yes, a whisper, Grandma was very specific)." Even the typos were copied. "Fold the dumplong" appeared in both posts.

Grace Liu hadn't posted in six months due to health issues, which made the theft even more egregious. Her granddaughter found out when followers started messaging asking why her grandma was now calling herself Ashley.`,

      2: `Ashley's response was a masterclass in making things worse. "I never said it was MY grandmother," she posted, apparently forgetting the title literally said "My Nana's Secret Recipe." She claimed it was an "homage" to grandmothers everywhere, which would have been fine if she hadn't copied the specific story about Grace's grandmother escaping with this recipe hidden in her shoe.

The food blogging community went nuclear. Professional chefs started sharing stories of their recipes being stolen. @ChefMarco revealed: "She once posted my ceviche recipe as her 'beach vacation discovery.' I've never been so insulted by someone adding ketchup to my life's work."

Then came the investigation into Ashley's entire blog. Internet sleuths found that "Mom's Famous Casserole" belonged to a food blogger in Idaho. "My First Apartment Pasta" was from a college student in Boston. Her entire online persona was built on other people's memories, garnished with stock photos and served with fabricated nostalgia.

Someone created a spreadsheet tracking all of Ashley's recipes to their original sources. The document grew to 47 pages. It was shared more than her entire blog had ever been.`,

      3: `The real Grandma Liu entered the chat, and it was glorious. Her granddaughter helped her create a video response that went mega-viral. Sitting in the same kitchen from the photos, with Mr. Whiskers prominently featured, Grace Liu delivered the most devastating takedown with grandmotherly sweetness.

"Hello, Ashley. I see you enjoyed my dumplings. I'm glad they brought you comfort, though I'm confused how you learned this recipe in my kitchen without me noticing. Perhaps you were very small? Like a mouse? A mouse who steals recipes?"

She then proceeded to make the dumplings properly, noting every place Ashley had gotten it wrong. "She says fold eight times for luck. It's seven. Eight is too many. Now your dumplings have too much luck and will explode." The shade was lethal.

But the killing blow came at the end: "I teach anyone who asks respectfully. My kitchen is open to all. But stealing stories? That's not just taking recipes. That's taking someone's heart. Also, Mr. Whiskers wants his modeling fees."

The video got 3 million views in 24 hours. Cooking shows started calling Grandma Liu. A publisher offered her a cookbook deal. Ashley's blog went private, then disappeared entirely. The internet had delivered justice, one perfectly folded dumpling at a time.`
    }
  };

  const content = contentMap[template.scenario]?.[sectionNumber] || "The story continued in unexpected ways.";
  return breakIntoParagraphs(content);
}

// Generate Twitter back-and-forth conversations
function generateTwitterConversation(topic, participants = 3) {
  const conversations = {
    corporate: [
      { author: "@DisruptDaily", content: "Our CEO manages 500+ employees with revolutionary productivity 🧵", verified: true },
      { author: "@SkepticalDev", content: "Is meeting about meetings considered productivity now?", likes: 2341 },
      { author: "@DisruptDaily", content: "These are strategic alignment sessions!", verified: true },
      { author: "@SkepticalDev", content: "*screenshots calendar* My brother in Christ this says 'Pre-meeting for the meeting about meetings'", likes: 8934 },
      { author: "@RandomObserver", content: "I'm deceased 💀 He really thought we wouldn't notice", likes: 445 },
      { author: "@DisruptDaily", content: "[This Tweet has been deleted]", verified: true }
    ],
    food: [
      { author: "@FoodBloggerAsh", content: "So excited to share my Nana's secret dumpling recipe! 🥟✨", verified: false },
      { author: "@DetectiveFood", content: "Why does your Nana's kitchen look exactly like @GrandmaLiu's? 🤔", likes: 1243 },
      { author: "@FoodBloggerAsh", content: "Many kitchens look similar! This is my family recipe", verified: false },
      { author: "@GrandmaLiuOfficial", content: "Interesting. Even same cat? Same flour handprint? You very small mouse who steal recipes?", verified: true, likes: 45892 },
      { author: "@InternetHero", content: "GRANDMA LIU HAS ENTERED THE CHAT", likes: 8234 },
      { author: "@FoodBloggerAsh", content: "[Account has been made private]", verified: false }
    ]
  };
  
  return conversations[topic] || [];
}

function generateInsert(template, insertNumber) {
  // Dynamically generate pullquotes, tweets, or comments based on story needs
  const inserts = {
    neighborhood_drama: [
      {
        type: "quotes", 
        content: "I've triangulated the poop locations. The pattern suggests someone walking from Maple Street.",
        metadata: {
          attribution: "Top comment by SuburbanSherlock",
          context: "1.2K upvotes on neighborhood Facebook group",
          isTopComment: true
        }
      },
      {
        type: "comments",
        content: "The committee has spoken:",
        metadata: {
          comments: [
            { author: "BlessedKaren2019", content: "DNA testing for dogs should be MANDATORY. This is about PROPERTY VALUES.", score: 47, replies: 23 },
            { author: "DogDadMike", content: "Y'all need Jesus. And maybe some hobbies.", score: 234, replies: 67 },
            { author: "SuburbanSherlock", content: "I've triangulated the poop locations. The pattern suggests someone walking from Maple Street.", score: 89, replies: 31 },
            { author: "JustMovedHere99", content: "What kind of neighborhood did I move into??? 😭", score: 445, replies: 94 }
          ]
        }
      },
      {
        type: "quotes",
        content: "Poopgate has revealed the true character of our leadership. Churchill and I will be pursuing legal action for defamation.",
        metadata: {
          attribution: "Richard Kellerman",
          context: "Posted before deleting his entire Facebook account"
        }
      }
    ],
    corporate_expose: [
      {
        type: "twitter_conversation",
        title: "The Thread That Started It All",
        content: generateTwitterConversation('corporate'),
        metadata: {
          platform: "Twitter",
          context: "The back-and-forth that exposed everything"
        }
      },
      {
        type: "quotes",
        content: "We're not having meetings about meetings. We're having strategic collaborative sessions about optimizing our synchronous communication touchpoints.",
        metadata: {
          attribution: "CEO via company Slack",
          context: "This clarification required six more meetings"
        }
      },
      {
        type: "image",
        content: "The leaked calendar screenshot that broke the internet",
        metadata: {
          context: "47 meetings in one week, color-coded by futility level"
        }
      }
    ],
    recipe_theft: [
      {
        type: "twitter_conversation",
        title: "The Unraveling",
        content: generateTwitterConversation('food'),
        metadata: {
          platform: "Twitter",
          context: "When Grandma Liu entered the chat"
        }
      },
      {
        type: "comments",
        content: "Food bloggers assemble:",
        metadata: {
          comments: [
            { author: "ChefSarahK", content: "She stole my brownie recipe and added 'a secret ingredient' (it was just extra butter)", score: 892, replies: 67 },
            { author: "BakeWithLove", content: "OMG she's the one who copied my sourdough starter diary! I KNEW those photos looked familiar!", score: 1243, replies: 128 },
            { author: "RecipeRescue", content: "Starting a support group for food bloggers who've been Ashley'd", score: 2341, replies: 445 },
            { author: "GrandmaLiuStan", content: "Grandma Liu could destroy her with one disapproving look", score: 5672, replies: 234 }
          ]
        }
      },
      {
        type: "quotes",
        content: "Eight is too many. Now your dumplings have too much luck and will explode.",
        metadata: {
          attribution: "Grandma Liu",
          context: "The most devastating cooking critique ever delivered"
        }
      }
    ]
  };

  return inserts[template.scenario]?.[insertNumber] || null;
}

function generateOutro(template, dynamicLength) {
  const outros = {
    neighborhood_drama: `The aftermath of Poopgate transformed the neighborhood forever. The Facebook group split into two factions: "Justice for Jennifer" and "Churchill Did Nothing Wrong" (which was quickly pointed out to be factually incorrect—Churchill did, in fact, do something wrong on multiple lawns).

Richard resigned from the HOA presidency in disgrace, though he attempted to save face by claiming he was stepping down to "focus on family" (Churchill, presumably). Linda Thompson took over and immediately implemented her surveillance state dreams, including mandatory weekly poop patrols and a three-strike policy for lawn violations.

The real winner? Jennifer Martinez, who parlayed her viral fame into a successful TikTok account about suburban drama. Her series "Neighbors from Hell" regularly features reenactments of the Poopgate saga, complete with Churchill appearing as himself (he's very professional on set).

The Facebook group never recovered. What was once a place to share garage sale announcements and complain about fireworks became a digital battlefield of passive-aggressive posts and thinly veiled threats. The annual block party was cancelled. Trust, once lost over dog poop, proved impossible to rebuild.

But perhaps the most lasting impact was the normalization of suburban surveillance. Other neighborhoods, inspired by Poopgate, began implementing their own detection systems. An entire industry sprouted up around "lawn protection services." Someone's definitely getting rich off Ring doorbell footage analysis.

In the end, Poopgate wasn't really about dog poop. It was about what happens when suburban paranoia meets social media justice meets a HOA president who couldn't be bothered to carry poop bags. It was, as these things always are, about power, control, and the thin veneer of civilization that separates us from complete neighborhood chaos.

Churchill, for his part, remains unrepentant. Good boy.`,

    corporate_expose: `The CEO tried to salvage his reputation by posting a LinkedIn article titled "Why Meetings Are Actually Productivity Multipliers," which achieved the impossible: uniting Twitter and LinkedIn in mockery. The comments section became a masterpiece of corporate sarcasm. Someone suggested he schedule a meeting to discuss the article's reception.

His company's stock actually dipped 3% as investors questioned whether a CEO who spends 94% of his time in meetings could possibly be running anything effectively. The board scheduled an emergency meeting about meeting reduction. The irony was not lost on anyone except, apparently, the board.

But the real legacy of #MeetingGate was the cultural shift it sparked. Employees everywhere began sharing their own meeting horror stories. "No-Meeting Fridays" became a rallying cry. Some brave companies actually implemented it. Productivity soared. Morale improved. Snack budgets decreased dramatically.

A year later, @DisruptDaily quietly deleted the thread, but the internet never forgets. The CEO now runs a consulting firm teaching "Efficient Meeting Strategies." His calendar is still fully booked, but now people pay $500/hour to learn why their meetings are terrible. It's meetings all the way down.

The ultimate lesson? In the attention economy, even being productively unproductive can be monetized. Our CEO didn't change his ways—he just found a way to charge for them. That's the real 10x mindset: turning your biggest weakness into someone else's expensive problem.

Meanwhile, his former employees report 40% higher productivity and 100% fewer meetings about fonts. Arial and Helvetica have learned to coexist. Peace was possible all along; it just required fewer PowerPoints to achieve it.`,

    recipe_theft: `Ashley Chen's food blog empire crumbled faster than an over-mixed dumpling. Within a week, every recipe had been traced to its original source. The "Ashley Chen Recipe Recovery Project" became a wholesome internet phenomenon, with people reaching out to the original creators to show support.

Grandma Liu became an unlikely internet celebrity. Her cookbook, "Real Grandma's Kitchen: No Stealing Required," presold 50,000 copies in the first week. She donated proceeds to culinary schools, with a scholarship specifically for "students who ask permission before borrowing recipes." The shade remained generational.

Mr. Whiskers got his own Instagram account managed by Grandma Liu's granddaughter. He now has brand deals with pet food companies and a line of aprons featuring his judgemental face. His bio reads: "I don't know Ashley Chen."

The food blogging community implemented new standards. Recipe attribution became mandatory. The phrase "inspired by" replaced rampant theft. Food bloggers started collaborating instead of copying, creating beautiful fusion dishes with proper credit. It was character development on a platform-wide scale.

Ashley attempted a comeback six months later with "My Apology Focaccia," but the internet has a long memory and excellent screenshot capabilities. The focaccia was also stolen (from a baker in Portland). Some people never learn.

The real victory belonged to every grandmother whose recipes had been stolen and repackaged as someone else's nostalgia. Grace Liu's video inspired dozens of other family cooks to share their stories, creating a beautiful archive of actual family recipes with real histories and cats who actually belong in the photos.

In the end, the internet's hunger for authenticity proved stronger than its appetite for aesthetic food blogs. Real stories, real grandmothers, real cats—that's what people actually wanted. Even Mr. Whiskers could have told you that, if anyone had bothered to ask.`
  };

  return {
    type: "outro",
    content: outros[template.scenario] || "And that's how the internet learned something today. (It didn't.)"
  };
}

function generateTerrysCorner(template) {
  const terrysWisdom = {
    neighborhood_drama: {
      summary: "Sometimes the real crime isn't the dog poop on your lawn—it's the surveillance state you create along the way.",
      observation: "The Terry observes that HOA presidents who live in glass houses shouldn't throw poop accusations.",
      mood: "contemplative"
    },
    corporate_expose: {
      summary: "In the land of endless meetings, the person with a actual job is king.",
      observation: "The Terry notes that 'synergy' is just 'cynergy' with the honesty removed.",
      mood: "sardonic"
    },
    recipe_theft: {
      summary: "You can steal a recipe, but you can't steal a grandmother's disapproving stare.",
      observation: "The Terry reflects that Mr. Whiskers showed more integrity than most food bloggers.",
      mood: "righteous"
    }
  };

  return {
    type: "terrys_corner",
    title: "Terry's Corner",
    content: terrysWisdom[template.scenario]?.summary || "The internet remains undefeated.",
    metadata: {
      observation: terrysWisdom[template.scenario]?.observation || "The Terry has observed humanity and found it wanting.",
      mood: terrysWisdom[template.scenario]?.mood || "perpetually bewildered",
      graphic: true
    }
  };
}

// Quality gate system
function analyzeStoryQuality(story, sections) {
  let score = 0;
  const passes = [];
  const issues = [];
  const editorNotes = [];
  const improvementAreas = [];
  
  // Check 1: Story structure (beginning, middle, end)
  const hasIntro = sections.some(s => s.type === 'intro');
  const hasOutro = sections.some(s => s.type === 'outro');
  const hasTerrysCorner = sections.some(s => s.type === 'terrys_corner');
  
  if (hasIntro && hasOutro && hasTerrysCorner) {
    score += 20;
    passes.push('Complete structure');
  } else {
    issues.push('Missing story elements');
    editorNotes.push('Story needs clear beginning, middle, and end');
  }
  
  // Check 2: Content length and depth
  const totalContent = sections
    .filter(s => s.type === 'describe' || s.type === 'intro' || s.type === 'outro')
    .map(s => s.content)
    .join('');
  
  if (totalContent.length > 3000) {
    score += 20;
    passes.push('Sufficient content depth');
  } else {
    issues.push('Content too short');
    editorNotes.push('Expand key story sections with more detail');
    improvementAreas.push('content_depth');
  }
  
  // Check 3: Dynamic inserts (quotes, comments, tweets)
  const insertCount = sections.filter(s => 
    s.type === 'quotes' || s.type === 'comments' || s.type === 'twitter_thread'
  ).length;
  
  if (insertCount >= 2) {
    score += 15;
    passes.push('Good insert variety');
  } else {
    issues.push('Needs more dynamic elements');
    editorNotes.push('Add pullquotes or comments to break up text');
    improvementAreas.push('dynamic_elements');
  }
  
  // Check 4: Hook effectiveness
  const intro = sections.find(s => s.type === 'intro');
  if (intro?.metadata?.hook) {
    score += 15;
    passes.push('Strong hook');
  } else {
    issues.push('Weak opening');
    editorNotes.push('Start with a compelling hook that promises drama');
    improvementAreas.push('hook_strength');
  }
  
  // Check 5: Terry's voice consistency
  const terryPhrases = ['The Terry', 'properly mental', 'peak', 'observes', 'notes'];
  const hasTerryVoice = terryPhrases.some(phrase => 
    totalContent.toLowerCase().includes(phrase.toLowerCase())
  );
  
  if (hasTerryVoice) {
    score += 10;
    passes.push("Terry's voice present");
  } else {
    issues.push("Missing Terry's voice");
    editorNotes.push("Add Terry's observations and voice throughout");
    improvementAreas.push('terry_voice');
  }
  
  // Check 6: Story arc and tension
  const hasConflict = totalContent.includes('but') || totalContent.includes('however') || 
                     totalContent.includes('plot twist') || totalContent.includes('then');
  const hasResolution = sections.find(s => s.type === 'outro')?.content.includes('end');
  
  if (hasConflict && hasResolution) {
    score += 20;
    passes.push('Clear story arc');
  } else {
    issues.push('Weak narrative tension');
    editorNotes.push('Build more conflict and provide satisfying resolution');
    improvementAreas.push('narrative_arc');
  }
  
  return {
    score,
    passes,
    issues,
    editorNotes: editorNotes.join('; '),
    improvementAreas
  };
}

async function generateDynamicStory() {
  console.log('🎯 Generating Dynamic Story for ThreadJuice');
  console.log('========================================');
  
  // Select template
  const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
  
  console.log(`📰 Title: ${template.title}`);
  console.log(`📁 Category: ${template.category}`);
  console.log(`🎭 Type: ${template.twitterDrama ? 'Twitter Drama' : 'Regular Drama'}`);
  
  const sections = [];
  let storyProgress = 0;
  
  // 1. Hero image at the very start
  sections.push({
    type: "hero_image",
    content: "The scene of the crime",
    metadata: {
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      isHero: true
    }
  });
  
  // 2. Always start with intro
  sections.push(generateIntro(template));
  storyProgress = 0.1;
  
  // 3. First content section with header
  sections.push({
    type: "section_header",
    content: generateSectionHeader(storyProgress, template)
  });
  sections.push({
    type: "describe",
    content: generateContentParagraphs(template, 1)
  });
  storyProgress = 0.3;
  
  // 4. First insert (prefer top comment or tweet conversation)
  const insert1 = generateInsert(template, 0);
  if (insert1) sections.push(insert1);
  
  // 5. Second content section with header
  sections.push({
    type: "section_header", 
    content: generateSectionHeader(storyProgress, template)
  });
  sections.push({
    type: "describe",
    content: generateContentParagraphs(template, 2)
  });
  storyProgress = 0.5;
  
  // 6. Inline image for visual break
  sections.push({
    type: "inline_image",
    content: "Visual evidence of the chaos",
    metadata: {
      imageUrl: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
      caption: "The moment everything changed"
    }
  });
  
  // 7. Second insert
  const insert2 = generateInsert(template, 1);
  if (insert2) sections.push(insert2);
  
  // 8. Third content section with header
  sections.push({
    type: "section_header",
    content: generateSectionHeader(0.7, template)
  });
  sections.push({
    type: "describe",
    content: generateContentParagraphs(template, 3)
  });
  storyProgress = 0.8;
  
  // 9. Third insert if warranted (especially for Twitter drama)
  if (template.hasPotentialForExpansion || template.twitterDrama) {
    const insert3 = generateInsert(template, 2);
    if (insert3) sections.push(insert3);
  }
  
  // 10. Final section header before outro
  sections.push({
    type: "section_header",
    content: generateSectionHeader(0.9, template)
  });
  
  // 11. Outro (always substantial)
  sections.push(generateOutro(template));
  
  // 12. Always end with Terry's Corner
  sections.push(generateTerrysCorner(template));
  
  // Create story object
  const story = {
    title: template.title,
    slug: template.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60),
    hook: template.hook,
    content: JSON.stringify({ sections }),
    category: template.category,
    featured: Math.random() > 0.3,
    trending_score: Math.floor(Math.random() * 30) + 70,
    view_count: Math.floor(Math.random() * 8000) + 2000,
    share_count: Math.floor(Math.random() * 800) + 200,
    featured_image: `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log(`\n📝 Generated ${sections.length} sections with dynamic flow`);
  
  // Quality gate check
  const quality = analyzeStoryQuality(story, sections);
  console.log('\n🔍 Quality Analysis:');
  console.log(`📊 Overall Score: ${quality.score}/100`);
  console.log(`✅ Passes: ${quality.passes.join(', ')}`);
  console.log(`❌ Issues: ${quality.issues.length > 0 ? quality.issues.join(', ') : 'None'}`);
  
  if (quality.score < 70) {
    console.log('\n⚠️  Story quality below threshold (70). Regenerating with improvements...');
    console.log('📝 Editor notes:', quality.editorNotes);
    
    // For now, we'll just flag it - full regeneration would require API integration
    console.log('🔄 Would regenerate with these focus areas:', quality.improvementAreas);
  }
  
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
    console.log('\n🌐 View at: http://localhost:4242/blog/' + data[0].slug);
    
    return data[0];
  } catch (error) {
    console.error('❌ Failed to save story:', error);
  }
}

// Run the generator
generateDynamicStory();