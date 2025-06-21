import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const personas = [
  {
    name: 'The Snarky Sage',
    slug: 'the-snarky-sage',
    avatarUrl: '/assets/img/avatars/snarky-sage.png',
    tone: 'Sarcastic and deadpan with a love for chaos',
    bio: 'The Snarky Sage delivers Reddit\'s most entertaining drama with a side of brutal honesty. Professional chaos observer and part-time life coach for people who probably shouldn\'t take advice.',
    storyCount: 127,
    rating: 4.8,
  },
  {
    name: 'The Down-to-Earth Buddy',
    slug: 'the-down-to-earth-buddy',
    avatarUrl: '/assets/img/avatars/buddy.png',
    tone: 'Chill and friendly with relatable insights',
    bio: 'Your internet best friend who always knows how to make sense of the chaos. Serves up viral content with a side of wisdom and zero judgment.',
    storyCount: 89,
    rating: 4.6,
  },
  {
    name: 'The Dry Cynic',
    slug: 'the-dry-cynic',
    avatarUrl: '/assets/img/avatars/cynic.png',
    tone: 'Bitterly hilarious with a chaos-loving perspective',
    bio: 'Finds humor in humanity\'s daily disasters and serves it with a perfectly dry martini of sarcasm. Believes the internet was invented specifically for entertainment.',
    storyCount: 156,
    rating: 4.9,
  },
]

const categories = [
  { name: 'AITA', slug: 'aita', description: 'Am I The Asshole stories and moral dilemmas', postCount: 45 },
  { name: 'Revenge', slug: 'revenge', description: 'Petty and pro revenge stories', postCount: 32 },
  { name: 'Funny', slug: 'funny', description: 'Hilarious fails and viral moments', postCount: 67 },
  { name: 'News', slug: 'news', description: 'Current events with a viral twist', postCount: 23 },
  { name: 'Relationships', slug: 'relationships', description: 'Dating disasters and relationship drama', postCount: 41 },
  { name: 'Work Stories', slug: 'work-stories', description: 'Office drama and workplace chaos', postCount: 28 },
  { name: 'Malicious Compliance', slug: 'malicious-compliance', description: 'Following rules to absurd perfection', postCount: 19 },
  { name: 'TikTok Fails', slug: 'tiktok-fails', description: 'Social media gone wrong', postCount: 34 },
  { name: 'Roommate Drama', slug: 'roommate-drama', description: 'Living situation nightmares', postCount: 15 },
  { name: 'Food Fails', slug: 'food-fails', description: 'Culinary disasters and kitchen chaos', postCount: 22 },
]

const tags = [
  { name: 'reddit', slug: 'reddit', usageCount: 150 },
  { name: 'viral', slug: 'viral', usageCount: 89 },
  { name: 'drama', slug: 'drama', usageCount: 67 },
  { name: 'fail', slug: 'fail', usageCount: 45 },
  { name: 'wholesome', slug: 'wholesome', usageCount: 23 },
  { name: 'cringe', slug: 'cringe', usageCount: 34 },
  { name: 'justice', slug: 'justice', usageCount: 28 },
  { name: 'chaos', slug: 'chaos', usageCount: 41 },
  { name: 'awkward', slug: 'awkward', usageCount: 19 },
  { name: 'satisfying', slug: 'satisfying', usageCount: 32 },
]

const viralPosts = [
  {
    title: '🚨 AITA for putting my neighbor\'s stolen Amazon packages in a decoy box filled with cat litter?',
    slug: 'neighbor-package-thief-cat-litter-revenge',
    excerpt: 'When package theft meets petty revenge: One fed-up neighbor\'s brilliant (and smelly) solution to stop a serial Amazon thief. Reddit is losing its mind over this legendary justice served cold.',
    category: 'aita',
    author: 'The Snarky Sage',
    personaId: 1,
    imageUrl: '/assets/img/lifestyle/life_style01.jpg',
    viewCount: 15420,
    upvoteCount: 12336,
    commentCount: 2847,
    shareCount: 1856,
    bookmarkCount: 934,
    trending: true,
    featured: true,
    content: {
      sections: [
        {
          type: 'image',
          content: 'A frustrated apartment dweller setting up an elaborate decoy package trap in their mailroom, with Amazon boxes and a mischievous grin that says "revenge is sweet (and smelly)"',
          metadata: {
            image_prompt: 'apartment mailroom package theft decoy box cat litter revenge trap'
          }
        },
        {
          type: 'describe-1',
          title: 'The Setup',
          content: 'Oh, buckle up, dear readers, because today\'s tale of petty justice is so beautifully crafted it belongs in a revenge hall of fame. We\'re diving into the story of a fed-up apartment dweller who decided that package theft deserved a special kind of punishment. Spoiler alert: it involves cat litter and the sweet, sweet sound of a thief getting exactly what they deserve.\n\nOur protagonist, let\'s call them the Package Avenger, lives in one of those apartment complexes where packages go to die. You know the type: shared mailroom, zero security, and apparently a resident kleptomaniac named Dave who thinks "delivery for you" actually means "free shopping for me."\n\nFor months, Dave had been treating the mailroom like his personal Amazon warehouse. Security cameras caught him red-handed, but the building management\'s response was about as useful as a chocolate teapot. "We need more evidence," they said, while Dave continued his one-man crime spree.'
        },
        {
          type: 'describe-2',
          title: 'The Brilliant Revenge',
          content: 'The breaking point came when Dave stole our hero\'s £200 headphones. That\'s right, two hundred pounds worth of audio equipment that had taken months to save for. Gone. Into Dave\'s grubby little hands like he\'d won some kind of terrible lottery.\n\nBut instead of filing another useless complaint, the Package Avenger decided to get creative. Step one: Order something cheap online. Step two: Get a big box. Step three: Fill said box with used cat litter. Not the fresh stuff, mind you. We\'re talking about the full aromatic experience that only comes from actual cat usage.\n\nThe pièce de résistance? Writing "EXPENSIVE ELECTRONICS" on the outside in big, tempting letters. It was like catnip for thieves, if catnip smelled like justice and poor life choices.\n\nSure enough, Dave took the bait faster than a seagull on a dropped chip. Our hero watched through their peephole as Dave carried his "prize" home, probably already planning how to sell his latest haul.'
        },
        {
          type: 'comments-1',
          title: 'Reddit\'s Verdict',
          content: 'When this story hit r/AmItheAsshole, Reddit absolutely lost its collective mind. The responses were so unanimously supportive, you\'d think our Package Avenger had just cured world hunger. Here are the top reactions:',
          metadata: {
            comments: [
              {
                author: 'PettyRevengeExpert',
                content: 'NTA. This is BRILLIANT. Play stupid games, win stupid prizes. Dave learned an important lesson about not stealing other people\'s stuff. The smell of justice is... cat litter.',
                score: 8245,
                replies: 156
              },
              {
                author: 'LegalAdviceGuru',
                content: 'NTA and legally you\'re in the clear. You didn\'t put anything dangerous in there, just smelly. Package theft is a federal crime, Dave should be thanking you for not reporting him.',
                score: 6892,
                replies: 234
              },
              {
                author: 'ApartmentLivingSucks',
                content: 'NTA but Dave definitely learned his lesson the hard way! The fact that he came to YOUR door proves he knew he was stealing. 10/10 petty revenge.',
                score: 5034,
                replies: 89
              }
            ]
          }
        },
        {
          type: 'comments-2',
          title: 'More Reddit Reactions',
          content: 'But wait, there\'s more! The thread kept delivering absolute gold as more people shared their own package theft horror stories and praised our hero\'s creative solution:',
          metadata: {
            comments: [
              {
                author: 'CatLitterConnoisseur',
                content: 'YTA for wasting perfectly good cat litter. Just kidding - NTA, this is the kind of creative problem solving we need more of. Dave F***ed around and found out.',
                score: 4156,
                replies: 78
              },
              {
                author: 'BuildingManagerHere',
                content: 'NTA - I\'m a building manager and package theft is the WORST. We can\'t legally do much without solid evidence. You found a creative solution that doesn\'t break laws. Might steal this idea...',
                score: 3967,
                replies: 123
              },
              {
                author: 'GlitterBombVeteran',
                content: 'This is almost as good as those glitter bomb videos! Except this time the thief can\'t post it on YouTube for sympathy. Chef\'s kiss to this beautiful revenge.',
                score: 2834,
                replies: 67
              }
            ]
          }
        },
        {
          type: 'discussion',
          title: 'ThreadJuice Discussion',
          content: 'Let\'s take a moment to appreciate the sheer artistry of this revenge. It\'s not violent, it\'s not destructive, it\'s just... perfectly poetic. Dave got exactly what he deserved: a box full of consequences that smell like his life choices.\n\nWhat makes this story even better is Dave\'s reaction. Instead of slinking away in shame, this absolute legend had the audacity to march up to our hero\'s door and demand an explanation. "Did you put cat litter in MY package?" he asked. My package. The sheer entitlement is breathtaking.\n\nThis is what happens when someone\'s moral compass is so broken they forget which direction "wrong" points. Dave was so confident in his thievery that he couldn\'t even pretend the package wasn\'t meant for him.\n\nThe beauty of this revenge is that it\'s completely self-selecting. Only someone stealing packages would ever discover the surprise inside. It\'s like a morality test that comes with its own punishment.'
        },
        {
          type: 'outro',
          title: 'The Bottom Line',
          content: 'Look, package theft is a real problem that ruins people\'s days, weeks, and sometimes even special occasions. But when building management won\'t help and the police can\'t act, sometimes you have to get creative.\n\nOur Package Avenger didn\'t hurt anyone, didn\'t break any laws, and didn\'t even waste good cat litter (according to the comments). They just created a natural consequence for someone\'s terrible behavior.\n\nThe real question isn\'t whether this was justified. It\'s why more people aren\'t doing this. Dave learned a valuable lesson that day: if you\'re going to steal packages, maybe don\'t complain when they contain exactly what you deserve.\n\nWhat would you have done in this situation? Are you team Package Avenger or team "that went too far"? Let us know, and remember: if you\'re thinking about stealing packages, maybe reconsider. You never know what surprises might be waiting inside.'
        },
        {
          type: 'quiz',
          title: 'Test Your Petty Revenge Knowledge',
          content: 'Think you understand the fine art of package theft karma? Let\'s see how you\'d handle this situation:',
          metadata: {
            quiz_data: {
              question: 'What\'s the best part about this cat litter revenge?',
              options: [
                'It\'s completely legal and harmless',
                'Only guilty people would discover the surprise',
                'Dave\'s reaction proved his guilt',
                'All of the above'
              ],
              correct_answer: 3,
              explanation: 'This revenge is perfect because it\'s legal, self-selecting (only thieves get the surprise), and Dave\'s outraged reaction was basically a confession!'
            }
          }
        }
      ],
      story_flow: 'buildup'
    },
    redditThreadId: 'abc123',
    subreddit: 'AmItheAsshole',
  },
  {
    title: '🚨 Entitled Karen Demands I Give Up My Airplane Seat - You Won\'t Believe What Happened Next',
    slug: 'entitled-karen-airplane-seat-drama',
    excerpt: 'A cross-country flight turned into pure chaos when a woman demanded my seat for her "precious angel." The flight attendant\'s reaction was absolutely legendary.',
    category: 'aita',
    author: 'The Snarky Sage',
    personaId: 1,
    imageUrl: '/assets/img/lifestyle/life_style01.jpg',
    viewCount: 15420,
    upvoteCount: 2847,
    commentCount: 389,
    shareCount: 1205,
    bookmarkCount: 567,
    trending: true,
    featured: true,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Oh, buckle up buttercups, because today\'s tale of human audacity comes to us fresh from 30,000 feet where the air is thin and apparently so is common sense.'
        },
        {
          type: 'paragraph',
          content: 'Our protagonist (let\'s call them "Reasonable Human Being") had booked a window seat for a cross-country flight. You know, the kind where you actually pay extra because you enjoy not being crushed by the beverage cart every twelve minutes.'
        },
        {
          type: 'heading',
          content: 'Enter: The Karen'
        },
        {
          type: 'paragraph',
          content: 'But wait! Enter stage left: a woman with That Haircut™ and the confidence of someone who definitely asks to speak to managers at self-checkout machines. She\'s got a kid in tow - and not just any kid, but her "precious angel" who apparently has never heard the word "no" in his eight years of existence.'
        }
      ]
    },
    redditThreadId: 'abc123',
    subreddit: 'AmItheAsshole',
  },
  {
    title: '💀 My Coworker Stole My Lunch Every Day - So I Made Them a "Special" Sandwich',
    slug: 'coworker-lunch-thief-revenge',
    excerpt: 'Someone kept stealing my carefully prepared lunches from the office fridge. Time for some malicious compliance with a ghost pepper surprise.',
    category: 'revenge',
    author: 'The Dry Cynic',
    personaId: 3,
    imageUrl: '/assets/img/lifestyle/life_style02.jpg',
    viewCount: 12350,
    upvoteCount: 1956,
    commentCount: 245,
    shareCount: 823,
    bookmarkCount: 412,
    trending: true,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Ah, office lunch thieves. Those delightful specimens of humanity who somehow missed the kindergarten lesson about not taking things that don\'t belong to them.'
        },
        {
          type: 'paragraph',
          content: 'For three weeks straight, my beautiful, carefully crafted sandwiches were disappearing from the communal fridge. Not partially eaten - completely vanished, like they never existed.'
        },
        {
          type: 'heading',
          content: 'The Ghost Pepper Solution'
        },
        {
          type: 'paragraph',
          content: 'So I did what any reasonable person would do: I made a sandwich that would haunt their taste buds for the next geological era.'
        }
      ]
    },
    redditThreadId: 'def456',
    subreddit: 'ProRevenge',
  },
  {
    title: '😱 Wedding Photographer Deletes All Photos After Bride Refuses to Pay - Reddit is DIVIDED',
    slug: 'wedding-photographer-deleted-photos',
    excerpt: 'A wedding photographer deleted an entire wedding\'s worth of photos after the bride tried to stiff them on payment. The internet has thoughts.',
    category: 'aita',
    author: 'The Down-to-Earth Buddy',
    personaId: 2,
    imageUrl: '/assets/img/lifestyle/life_style03.jpg',
    viewCount: 9876,
    upvoteCount: 1543,
    commentCount: 567,
    shareCount: 987,
    bookmarkCount: 234,
    trending: false,
    featured: true,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Hey friends, buckle in because we\'ve got a wedding drama that\'s spicier than the cocktail hour and twice as messy as the cake cutting.'
        },
        {
          type: 'paragraph',
          content: 'So picture this: a professional photographer spends an entire day capturing someone\'s special moment, only to have the couple try to ghost them when the bill comes due.'
        }
      ]
    },
    redditThreadId: 'ghi789',
    subreddit: 'AmItheAsshole',
  },
  {
    title: '🤡 TikToker Tries to "Prank" Random Stranger - Gets Instant Karma That Broke the Internet',
    slug: 'tiktok-prank-instant-karma',
    excerpt: 'A wannabe influencer thought they could harass strangers for views. The universe had other plans, and the security camera caught it all.',
    category: 'tiktok-fails',
    author: 'The Snarky Sage',
    personaId: 1,
    imageUrl: '/assets/img/lifestyle/life_style04.jpg',
    viewCount: 23450,
    upvoteCount: 4521,
    commentCount: 789,
    shareCount: 2106,
    bookmarkCount: 891,
    trending: true,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Ladies and gentlemen, boys and girls, gather \'round for today\'s lesson in "Play Stupid Games, Win Stupid Prizes: TikTok Edition."'
        },
        {
          type: 'paragraph',
          content: 'Our star today is a self-proclaimed "prankster" (and I use that term about as loosely as their grip on social norms) who decided that harassing random people in public would be the perfect content for their thriving audience of... *checks notes* ...47 followers.'
        }
      ]
    },
    redditThreadId: 'jkl012',
    subreddit: 'instant_regret',
  },
]

async function main() {
  // console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.postTag.deleteMany()
  await prisma.userInteraction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.image.deleteMany()
  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.category.deleteMany()
  await prisma.persona.deleteMany()

  // console.log('📝 Creating personas...')
  const createdPersonas = await prisma.persona.createMany({
    data: personas,
  })

  // console.log('📂 Creating categories...')
  const createdCategories = await prisma.category.createMany({
    data: categories,
  })

  // console.log('🏷️ Creating tags...')
  const createdTags = await prisma.tag.createMany({
    data: tags,
  })

  // console.log('📰 Creating posts...')
  for (const post of viralPosts) {
    await prisma.post.create({
      data: post,
    })
  }

  // Create some user interactions for engagement
  // console.log('👥 Creating user interactions...')
  const posts = await prisma.post.findMany()
  
  for (const post of posts) {
    // Create random upvotes
    for (let i = 0; i < post.upvoteCount; i++) {
      await prisma.userInteraction.create({
        data: {
          postId: post.id,
          interactionType: 'upvote',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (compatible; ThreadJuice/1.0)',
        },
      })
    }

    // Create some shares
    for (let i = 0; i < post.shareCount; i++) {
      await prisma.userInteraction.create({
        data: {
          postId: post.id,
          interactionType: 'share',
          metadata: {
            share_platform: ['twitter', 'facebook', 'reddit', 'copy'][Math.floor(Math.random() * 4)],
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        },
      })
    }
  }

  // console.log('✅ Seed completed successfully!')
  // console.log(`Created:`)
  // console.log(`  ${createdPersonas.count} personas`)
  // console.log(`  ${createdCategories.count} categories`)
  // console.log(`  ${createdTags.count} tags`)
  // console.log(`  ${viralPosts.length} posts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })