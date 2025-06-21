import { NextRequest, NextResponse } from 'next/server.js';
import fs from 'fs';
import path from 'path';
// import { prisma } from '@/lib/prisma';

// Load real generated stories
function loadGeneratedStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'generated-stories');
    if (!fs.existsSync(storiesDir)) {
      return [];
    }
    
    const files = fs.readdirSync(storiesDir).filter(file => file.endsWith('.json'));
    const stories = files.map(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf-8');
      return JSON.parse(content);
    });
    
    return stories;
  } catch (error) {
    console.warn('Failed to load generated stories:', error);
    return [];
  }
}

// Mock data for development - includes our Twitter drama stories with full content
const mockPosts = [
  {
    id: 'simulated-twitter-1750417063190',
    title: 'Food Twitter Civil War Erupts Over Whether Microwaving Leftover Pizza is a Crime Against Humanity',
    slug: 'food-twitter-civil-war-erupts-over-whether-microwaving-leftover-pizza-is-a-crime-against-humanity',
    excerpt: 'A innocent poll about reheating methods triggered 567 quote tweets of pure culinary rage, scientific papers about heat distribution, and deeply personal stories about childhood pizza trauma.',
    imageUrl: '/assets/img/blog/blog07.jpg',
    category: 'Food Wars',
    author: 'the-snarky-sage',
    viewCount: 690,
    upvoteCount: 67,
    commentCount: 24,
    shareCount: 24,
    bookmarkCount: 66,
    trending: true,
    featured: true,
    status: 'published',
    createdAt: new Date('2025-06-20T10:57:43Z'),
    updatedAt: new Date('2025-06-20T10:57:43Z'),
    readingTime: 8,
    content: {
      sections: [
        {
          type: 'describe-1',
          title: 'The Tweet That Broke Food Twitter',
          content: `It started so innocently. @PizzaPurist92 posted what they thought was a simple poll: "Reheating leftover pizza: Microwave (30 sec) vs Oven (5 min) vs Pan (2 min) vs Cold (like a barbarian)?" \n\nWithin minutes, the replies section transformed into a battlefield where culinary science met personal trauma, and everyone had Very Strong Opinions about optimal pizza temperature distribution. The humble pizza slice had become the unlikely flashpoint for debates about kitchen privilege, time economics, and what constitutes "proper" food preparation.\n\nWhat @PizzaPurist92 didn't anticipate was that their innocent poll would become the catalyst for Food Twitter's most heated debate since the great pineapple wars of 2019. By the time the dust settled, we'd have physics professors explaining thermal dynamics, Italian nonnas cursing in three languages, and broke college students defending their microwave-based survival strategies.\n\nThe Terry notes this is exactly the sort of perfectly reasonable question that sends Food Twitter into complete meltdown. Because apparently, asking how to reheat pizza is like asking someone to choose their favourite child - deeply personal, surprisingly divisive, and guaranteed to reveal far more about society than anyone bargained for.`
        },
        {
          type: 'image',
          content: 'The battleground: A perfectly innocent pizza slice that would soon divide the internet into warring factions of reheating purists',
          metadata: { image_prompt: 'leftover pizza slice on a plate' }
        },
        {
          type: 'quotes',
          content: 'Imagine gatekeeping happiness and then calling other people barbarians for eating cold pizza at 2 AM during a breakdown.',
          metadata: {
            attribution: '@MidnightMunchies47',
            context: 'The quote tweet that started the real drama'
          }
        },
        {
          type: 'describe-2',
          title: 'The Science Squad Arrives',
          content: `Professional chefs descended like culinary vultures, armed with physics explanations and temperature charts. @ChefThermal provided a 12-tweet thread about heat distribution patterns, complete with diagrams that looked like something from a thermal engineering textbook.\n\n"The microwave creates hot spots due to standing wave patterns," they explained with the confidence of someone who'd clearly never eaten a slice at 3 AM in their dressing gown. Apparently unaware that most people just want edible pizza without a physics degree, they proceeded to explain electromagnetic radiation as if we were all PhD candidates in Food Science.\n\nMeanwhile, @FoodScienceNerd shared actual research papers about moisture retention in reheated carbohydrates. Because nothing says "casual lunch" like peer-reviewed literature about pizza crust integrity. The Terry appreciates thoroughness, but this felt less like helpful advice and more like academic flexing at the expense of people who just want warm cheese.\n\nThe real entertainment began when @ItalianNonnaRage entered the chat, announcing in broken English and perfect fury that her late husband would be "spinning in his grave like a rotisserie chicken" at this entire conversation. She proceeded to explain, in increasingly capital letters, that "REAL PIZZA DOESN'T NEED REHEATING BECAUSE YOU EAT IT FRESH LIKE CIVILIZED PEOPLE."\n\nThe scientific crowd tried to explain thermal dynamics to an 82-year-old woman from Naples. It went about as well as you'd expect.`
        },
        {
          type: 'comments-1',
          title: 'The Personal Confessions Begin',
          content: 'As the thread exploded, people started sharing deeply personal pizza stories that nobody asked for but everyone needed to hear.',
          metadata: {
            comments: [
              {
                author: 'BrokeCollegeKid',
                content: 'Y\'all had access to ovens? We had a microwave older than some of my professors and we were GRATEFUL.',
                score: 1247,
                replies: 89
              },
              {
                author: 'ItalianNonna47',
                content: 'My grandmother is rolling in her grave at this entire conversation. She never had a microwave and her leftover pizza was perfect every time.',
                score: 892,
                replies: 156
              },
              {
                author: 'RegionalPizzaLoyalist',
                content: 'Chicago deep dish vs NY thin crust changes everything. You can\'t apply the same reheating rules to different pizza architectures.',
                score: 567,
                replies: 234
              }
            ]
          }
        },
        {
          type: 'discussion',
          title: 'When Food Becomes Class Warfare',
          content: `The real drama emerged when the conversation shifted from reheating methods to access and privilege. @WorkingClassEats pointed out that not everyone has the luxury of "proper" kitchen equipment or the time for elaborate reheating rituals.\n\n"Some of us eat cold pizza for breakfast while getting three kids ready for school," they tweeted. "Your cast iron pan method is very cute though."\n\nThis single tweet cracked open the entire facade of Food Twitter's performative sophistication. Suddenly, the pizza debate became a mirror reflecting broader societal issues about food access, time poverty, and kitchen privilege. Because nothing escalates quite like Food Twitter when it realizes it's accidentally discussing economics.\n\nThe Terry observed the magnificent pivot from "optimal thermal distribution" to "check your kitchen privilege" with the sort of fascination usually reserved for wildlife documentaries. Within an hour, we had people confessing to eating cereal for dinner, microwaving pasta water, and storing leftover Chinese takeaway in the cardboard containers because washing dishes is apparently for people with both time and energy.\n\n@SingleParentSurvival dropped perhaps the most devastating response: "I haven't had leftover pizza in three years because my kids eat it all. What's this 'reheating' you speak of?" The quote tweets to this particular comment could have powered a small nuclear reactor with their concentrated guilt and recognition.\n\nMeanwhile, @KitchenMinimalist pointed out that some people live in studio apartments where the "oven" is actually just a toaster oven balanced on top of a mini-fridge. The cast iron pan crowd went suspiciously quiet after that reality check.`
        },
        {
          type: 'quotes',
          content: 'The fact that we\'re having a moral panic about microwave pizza while people are struggling to afford any pizza is peak internet energy.',
          metadata: {
            attribution: '@FoodEquityNow',
            context: 'The reality check that went viral'
          }
        },
        {
          type: 'outro',
          title: 'The Aftermath and Lessons Learned',
          content: `By the time the dust settled 48 hours later, @PizzaPurist92's innocent poll had generated over 567 quote tweets, 1,200 replies, spawned seventeen different think pieces about food culture in America, and somehow managed to trend alongside actual news events. The Terry notes this is peak internet behavior - taking something delightfully mundane and transforming it into a sociology thesis with extra cheese.\n\nLocal pizza shops started posting their own reheating recommendations with the desperation of small businesses trying to ride any viral wave. Food blogs scrambled to publish "definitive guides" to leftover pizza, complete with step-by-step photos and affiliate links to pizza stones. Someone created a "Pizza Reheating Personality Quiz" that went viral on TikTok, because apparently everything must be content now.\n\nBuzzFeed published "17 Pizza Reheating Methods That Will Change Your Life" within six hours. The New York Times food section editor was reportedly seen muttering about commissioning a "serious piece" on thermal food dynamics. Food Network probably started developing a show called "Reheat Masters" before the weekend was over.\n\nThe original poll results? Microwave won with 34% of the vote, followed by oven at 28%, pan at 23%, and cold pizza at 15%. But the real winner was the internet's infinite capacity to turn any topic into a multi-faceted cultural battlefield where everyone's simultaneously right, wrong, and personally attacked.\n\nPerhaps the most telling outcome was watching Food Twitter realize it had accidentally become a case study in economic privilege, social media performance, and the strange psychology of food gatekeeping. @PizzaPurist92 later tweeted: "I just wanted to know how to heat up my lunch. I didn't mean to start a class war."\n\nIn the end, perhaps @FoodEquityNow said it best: "The best way to reheat pizza is however makes you happy with whatever equipment you have available." A perfectly reasonable conclusion that somehow felt revolutionary in the context of a platform that routinely argues about everything.\n\nThe Terry's final observation: Food Twitter managed to take a simple question about reheating pizza and turn it into a masterclass in how the internet can simultaneously be deeply insightful and absolutely mental. It's almost impressive how we can extract sociological meaning from melted cheese.\n\nBut let's be honest - Food Twitter will probably find a way to argue about that conclusion too. Give it a week and someone will tweet about how "reheating discourse analysis" is itself a form of cultural elitism. The cycle continues, as it always does, until the next innocent food question triggers the next completely predictable meltdown.\n\nAt least the pizza was eventually eaten. Probably cold, out of pure spite.`
        }
      ]
    }
  },
  {
    id: 'live-twitter-ranch-drama',
    title: 'Food Twitter Declares War Over Ranch Pizza and Nobody Wins',
    slug: 'food-twitter-declares-war-ranch-pizza-nobody-wins',
    excerpt: 'What started as a PSA about pizza condiments escalated into 189 replies questioning life choices, personality traits, and middle school trauma. Peak food discourse achieved.',
    imageUrl: '/assets/img/blog/blog08.jpg',
    category: 'Food Wars',
    author: 'the-snarky-sage',
    viewCount: 1847,
    upvoteCount: 64,
    commentCount: 31,
    shareCount: 18,
    bookmarkCount: 22,
    trending: true,
    featured: true,
    status: 'published',
    createdAt: new Date('2025-06-20T10:15:00Z'),
    updatedAt: new Date('2025-06-20T10:35:00Z'),
    readingTime: 7,
    content: {
      sections: [
        {
          type: 'describe-1',
          title: 'The Ranch Revelation',
          content: `Oh, Food Twitter. Just when The Terry thought we'd exhausted every possible culinary controversy, along comes @culinary_truth with a ranch pizza take so inflammatory it could season the very dough it's criticizing.\n\nFor those who missed today's cafeteria culture wars, our protagonist decided Thursday morning was the perfect time to declare that ranch-on-pizza enthusiasts are living reminders of middle school mediocrity. Bold strategy, particularly coming from someone whose bio lists "authentic cuisine explorer" and "flavor evangelist" - which is food influencer speak for "I take photos of expensive meals."\n\nThe Terry notes this is precisely the sort of food snobbery that transforms innocent condiment preferences into psychological profiles. Because apparently, wanting tangy white sauce on your pizza is now a character defect requiring public intervention.\n\nWhat started as performative culinary superiority quickly escalated into something far more fascinating: a real-time demonstration of how food discourse inevitably becomes a mirror for every other social anxiety we're pretending not to have.`
        },
        {
          type: 'quotes',
          content: 'PSA: If you think putting ranch on pizza makes you "quirky" and "different," you\'re neither. You\'re just someone with questionable taste buds who peaked in middle school cafeteria culture.',
          metadata: {
            attribution: '@culinary_truth',
            context: 'The tweet that started it all'
          }
        },
        {
          type: 'describe-2',
          title: 'The Quote Tweet Apocalypse',
          content: `The tweet that launched a thousand lunch tray memories garnered 421 likes and 189 increasingly personal replies within the hour. But here's where it gets properly spicy - the quote tweet ratio tells the real story.\n\n134 people felt compelled to share this take with their own commentary, ranging from "imagine gatekeeping happiness" to deeply personal confessions about childhood food trauma that nobody asked for but everyone needed to read.\n\nThe responses escalated from food preferences to full psychological profiles faster than you could say "Hidden Valley." Suddenly everyone was a forensic analyst of cafeteria behavior patterns, ready to diagnose personality disorders based on condiment choices.\n\n@TherapyTikToker jumped in with a thread about how "food shaming is actually a form of classist microaggression that perpetuates educational trauma." The Terry appreciates the attempt at depth, but turning ranch dressing into a sociology dissertation felt like academic overreach with extra steps.\n\nMeanwhile, @MillennialMomStruggles shared a 47-tweet thread about how ranch pizza was the only food her autistic son would eat for six months, and how food shaming directly impacts families dealing with sensory processing issues. This was the tweet that really cracked the conversation wide open.\n\nSuddenly we weren't talking about pizza anymore. We were talking about neurodivergence, childhood poverty, cultural assimilation, and the very American tendency to turn every personal preference into a moral battlefield.`
        },
        {
          type: 'comments-1',
          title: 'The Personal Attacks Begin',
          content: 'What started as condiment shaming quickly devolved into class warfare disguised as taste discourse.',
          metadata: {
            comments: [
              {
                author: 'RanchDefender2023',
                content: 'Tell me you grew up with a full spice rack without telling me you grew up with a full spice rack.',
                score: 234,
                replies: 45
              },
              {
                author: 'PizzaPurist',
                content: 'Ranch pizza slaps and your bougie taste buds can cope. Some of us didn\'t have access to "authentic" Italian cuisine, Karen.',
                score: 189,
                replies: 67
              }
            ]
          }
        },
        {
          type: 'twitter-conversation',
          title: 'The Epic Back-and-Forth',
          content: 'The conversation escalated quickly from there:',
          metadata: {
            conversation: [
              {
                id: 'original',
                author: 'culinary_truth',
                handle: 'culinary_truth',
                content: 'PSA: If you think putting ranch on pizza makes you "quirky" and "different," you\'re neither. You\'re just someone with questionable taste buds who peaked in middle school cafeteria culture.',
                timestamp: '4h',
                likes: 421,
                retweets: 67,
                replies: 189,
                verified: false,
                isOP: true
              },
              {
                id: 'response1',
                author: 'RanchDefender2023',
                handle: 'ranchdefender2023',
                content: 'Tell me you grew up with a full spice rack without telling me you grew up with a full spice rack.',
                timestamp: '3h',
                likes: 1247,
                retweets: 234,
                replies: 89,
                verified: false
              },
              {
                id: 'response2',
                author: 'culinary_truth',
                handle: 'culinary_truth',
                content: 'Having access to proper seasoning doesn\'t make me privileged, it makes me someone who understands that pizza already has flavor.',
                timestamp: '3h',
                likes: 156,
                retweets: 23,
                replies: 312,
                verified: false,
                isOP: true
              },
              {
                id: 'response3',
                author: 'UncleBobEats',
                handle: 'uncleBobeats',
                content: 'I\'m 67 years old and I\'ve been putting ranch on everything since 1987. This includes pizza, hamburgers, salad, other ranch, and once memorably, ice cream during a power outage. Come at me, Gen Z.',
                timestamp: '2h',
                likes: 3421,
                retweets: 892,
                replies: 234,
                verified: false
              },
              {
                id: 'response4',
                author: 'FoodEquityNow',
                handle: 'foodequitynow',
                content: 'The fact that we\'re having a moral panic about ranch dressing while people are struggling to afford any food is peak internet energy.',
                timestamp: '2h',
                likes: 2156,
                retweets: 567,
                replies: 143,
                verified: true
              }
            ]
          }
        },
        {
          type: 'outro',
          title: 'The Ranch Reckoning',
          content: `By noon, #RanchGate was trending in food circles alongside actual news events, because apparently condiment discourse is as important as global politics now. Local pizza places started posting ranch-positive content with the desperation of small businesses trying to avoid becoming the next cancellation casualty. Someone created a GoFundMe for "Ranch Pizza Acceptance Therapy" that somehow raised $47 before being reported as satirical fraud.\n\nDomino's social media team, sensing an opportunity, posted a picture of ranch-dipped pizza with the caption "We see you" and watched their engagement numbers explode. Pizza Hut responded within the hour with their own ranch solidarity post. Papa John's remained suspiciously silent, probably because they were already controversial enough.\n\nThe final tally by end of day: 421 likes, 189 replies, 67 retweets, and 134 quote tweets of pure condiment chaos. @culinary_truth later clarified she was "obviously joking," but the internet had already chosen violence and wasn't backing down for something as pedestrian as authorial intent.\n\nThe Terry's favourite response came from @UncleBobEats: "I'm 67 years old and I've been putting ranch on everything since 1987. This includes pizza, hamburgers, salad, other ranch, and once memorably, ice cream during a power outage. Come at me, Gen Z."\n\nThe most telling aspect of Ranch Gate wasn't the passion - it was watching people realize they were arguing about salad dressing at 2 PM on a Thursday. Multiple users posted variations of "why am I invested in this" while continuing to refresh the thread for updates.\n\nThe moral? Twitter doesn't do food nuance because Twitter doesn't do any kind of nuance. Every opinion becomes a worldview, every preference becomes an identity, and every disagreement becomes a battle for the soul of civilization.\n\nLife's too short to let Food Twitter ruin your lunch. Eat ranch on pizza if you want. Don't if you don't. The pizza doesn't care about your cultural sophistication, and neither should anyone else.\n\nBut The Terry will admit: watching grown adults have emotional breakdowns about mayonnaise-based condiments was properly entertaining. Same time next week, Food Twitter?`
        }
      ]
    }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Combine real generated stories with mock posts
    const generatedStories = loadGeneratedStories();
    const allPosts = [...generatedStories, ...mockPosts];
    
    // Find post by ID or slug
    const post = allPosts.find(p => p.id === id || p.slug === id);
    
    if (!post) {
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Only return published posts (generated stories don't have status, so they're considered published)
    if (post.status && post.status !== 'published') {
      return NextResponse.json(
        {
          error: 'POST_NOT_AVAILABLE',
          message: 'Post is not available',
        },
        { status: 404 }
      );
    }

    // Transform for API response
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      status: post.status,
      trending: post.trending,
      featured: post.featured,
      author: post.author,
      createdAt: typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString(),
      updatedAt: typeof post.updatedAt === 'string' ? post.updatedAt : post.updatedAt?.toISOString() || new Date().toISOString(),
      content: post.content,
      imageUrl: post.imageUrl,
      viewCount: post.viewCount,
      upvoteCount: post.upvoteCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
      bookmarkCount: post.bookmarkCount,
      readingTime: post.readingTime,
      persona: {
        name: post.author === 'the-snarky-sage' ? 'The Snarky Sage' : 
              post.author === 'the-dry-cynic' ? 'The Dry Cynic' :
              post.author === 'the-down-to-earth-buddy' ? 'The Down-to-Earth Buddy' :
              post.author,
        bio: 'Professional social media drama analyst and digital culture commentator',
        avatar: '/assets/img/blog/blog01.jpg'
      }
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Post API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch post',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
