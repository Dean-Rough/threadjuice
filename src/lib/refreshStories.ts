import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Six diverse viral stories covering different categories
const newViralStories = [
  {
    title: 'My Boss Made Me Work Christmas Day, So I Gave Him the Gift of Malicious Compliance',
    slug: 'boss-christmas-malicious-compliance',
    excerpt: 'When my micromanager boss demanded I work Christmas Day "for the team," I followed his instructions so perfectly that he regretted every word. Sometimes the best revenge is giving people exactly what they ask for.',
    category: 'work-stories',
    author: 'The Snarky Sage',
    personaId: 1,
    imageUrl: '/assets/img/generated/christmas-office-malicious-compliance.jpg',
    viewCount: 47823,
    upvoteCount: 3942,
    commentCount: 567,
    shareCount: 2341,
    bookmarkCount: 1205,
    trending: true,
    featured: true,
    content: {
      sections: [
        {
          type: 'image',
          content: 'A person sitting alone in a dark office on Christmas Day, surrounded by perfectly organized files and a computer screen showing "TASK COMPLETED" while Christmas decorations gather dust in the background',
          metadata: {
            image_prompt: 'empty office christmas day malicious compliance boss micromanager'
          }
        },
        {
          type: 'describe-1',
          title: 'The Setup: A Boss Who Loves Power More Than Christmas',
          content: 'Meet my boss, Kevin. Kevin is the kind of manager who thinks "work-life balance" is a myth invented by lazy millennials and that Christmas is just another Tuesday with better decorations. He\'s the type who schedules "urgent" meetings at 4:59 PM on Fridays and genuinely believes that checking emails at midnight shows "dedication."\n\nSo when Kevin announced in our December team meeting that someone would need to "hold down the fort" on Christmas Day for a project that had been sitting on his desk since October, I wasn\'t surprised. What did surprise me was his reasoning: "The client might have questions." About a project they hadn\'t asked about in two months. On Christmas Day. When their offices are closed.\n\nBut Kevin had made his decision. Someone needed to be there "just in case." And since I was the newest team member, guess who got voluntold for holiday duty?'
        },
        {
          type: 'describe-2',
          title: 'The Perfect Plan Takes Shape',
          content: 'Now, a normal person might have argued or complained to HR. But I\'d been watching Kevin operate for months, taking mental notes of his exact words and requirements. See, Kevin loved micromanaging, but he also loved plausible deniability. He\'d give vague instructions then blame you when things went wrong.\n\nSo when he said I needed to be there "all day" to "monitor everything" and "handle any urgent issues that arise," I decided to follow his instructions to the absolute letter. Not the spirit of what he meant – the exact, literal interpretation of every word.\n\nI arrived at 6 AM sharp (Kevin had said "all day" and I wanted to be thorough). I brought my laptop, my phone charger, and a comprehensive plan that would make Kevin proud. After all, he\'d specifically requested detailed documentation of all activities.'
        },
        {
          type: 'comments-1',
          title: 'The Christmas Day Performance',
          content: 'What followed was perhaps the most beautiful 12 hours of malicious compliance in corporate history. I documented EVERYTHING:',
          metadata: {
            comments: [
              {
                author: 'OfficeMartyrologist',
                content: '6:00 AM - Arrived at office. Lights automatically turned on. Documented light activation in compliance log. No client issues detected.',
                score: 2847,
                replies: 89
              },
              {
                author: 'ComplianceExpert',
                content: '6:15 AM - Checked all 47 company emails. No urgent issues. Forwarded holiday greetings from vendors to Kevin\'s personal phone as potential "urgent matters."',
                score: 3156,
                replies: 124
              },
              {
                author: 'DocumentationNinja',
                content: '8:30 AM - Client called! ...to wish us Merry Christmas. Immediately contacted Kevin to report "client communication." He did not appreciate the 8:30 AM holiday wake-up call.',
                score: 4523,
                replies: 203
              }
            ]
          }
        },
        {
          type: 'comments-2',
          title: 'The Beautiful Escalation',
          content: 'But the real magic happened when I started interpreting "handle any urgent issues" with Christmas Day creativity:',
          metadata: {
            comments: [
              {
                author: 'MaliciousComplianceGod',
                content: '11:00 AM - Office temperature dropped to 68°F. This could affect equipment performance. Called Kevin to authorize heating adjustment. He was opening presents with his kids.',
                score: 5234,
                replies: 156
              },
              {
                author: 'ChristmasRevengeElf',
                content: '2:00 PM - Cleaning crew had questions about trash schedule due to holiday. Called Kevin for "urgent operational decision." His family dinner did not appreciate the interruption.',
                score: 4876,
                replies: 198
              },
              {
                author: 'WorkplaceWarrior',
                content: '4:00 PM - Security guard mentioned parking lot light was flickering. Potential safety issue requiring immediate management approval. Kevin stopped answering his phone after this one.',
                score: 6123,
                replies: 267
              }
            ]
          }
        },
        {
          type: 'discussion',
          title: 'The Sweet Taste of Corporate Justice',
          content: 'By 6 PM, I had generated a 47-page report documenting every minute of my Christmas Day vigilance. Each "urgent" call to Kevin was logged with timestamps and his increasingly hostile responses. I\'d followed his instructions perfectly – monitoring everything, documenting all activities, and keeping him informed of every issue that could possibly be considered urgent.\n\nThe best part? When Kevin stormed into the office the next day, ready to tear me apart for "harassment," I handed him my meticulously documented report. Every action was justified by his exact words. Every phone call was a direct result of his demand to "handle urgent issues."\n\nHe\'d asked for someone to be there "just in case." I\'d been there for every case. He\'d wanted detailed monitoring. I\'d monitored everything, including the optimal frequency for updating management on operational status.\n\nThe look on his face when he realized he couldn\'t criticize me without criticizing his own instructions was worth every minute of that Christmas Day sacrifice.'
        },
        {
          type: 'outro',
          title: 'The Aftermath: A Christmas Miracle',
          content: 'Funny thing about malicious compliance – it has a way of teaching lessons that last. Kevin never again demanded Christmas Day coverage. In fact, he became remarkably specific about what constituted "urgent" and started including phrases like "use reasonable judgment" in his instructions.\n\nThe following year, our team got Christmas off with a company-wide email about "respecting work-life balance during the holidays." Coincidence? I think not.\n\nSometimes the best way to deal with unreasonable demands is to fulfill them so thoroughly that the person making them realizes just how unreasonable they were. Kevin wanted dedication? He got 12 hours of undiluted, unwavering, uncompromising dedication.\n\nAnd every time I see twinkling lights during the holidays, I remember the Christmas Day when perfect compliance became perfect revenge.'
        }
      ],
      story_flow: 'revenge'
    },
    redditThreadId: 'xmas_compliance_2024',
    subreddit: 'MaliciousCompliance',
  },
  {
    title: 'My Roommate\'s "Influencer" Girlfriend Tried to Turn Our Apartment Into Her Personal Studio',
    slug: 'roommate-influencer-girlfriend-apartment-takeover',
    excerpt: 'She moved in "temporarily" and immediately started rearranging our furniture for her TikToks. When I objected, she offered to "collaborate" for "exposure." Time for some creative boundary-setting.',
    category: 'roommate-drama',
    author: 'The Down-to-Earth Buddy',
    personaId: 2,
    imageUrl: '/assets/img/generated/roommate-influencer-apartment-chaos.jpg',
    viewCount: 34512,
    upvoteCount: 2847,
    commentCount: 423,
    shareCount: 1876,
    bookmarkCount: 934,
    trending: true,
    featured: false,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Hey friends, grab some popcorn because today\'s roommate tale involves ring lights, kitchen rearrangements, and the kind of audacity that makes you question humanity.'
        },
        {
          type: 'paragraph',
          content: 'So my roommate Jake started dating this girl, Madison, who describes herself as a "lifestyle influencer" with 2,300 followers. Nothing wrong with that – everyone starts somewhere, right? The problem started when her "temporary" stay became a permanent apartment makeover project.'
        }
      ]
    },
    redditThreadId: 'influencer_roommate_hell',
    subreddit: 'roommates',
  },
  {
    title: 'AITA for Exposing My Sister\'s "Perfect Life" Instagram at Family Dinner?',
    slug: 'sister-fake-instagram-family-dinner-exposed',
    excerpt: 'My sister has been posting fake luxury content for months while secretly borrowing money from family. When she tried to shame me for my "unsuccessful" life at dinner, I brought receipts.',
    category: 'aita',
    author: 'The Dry Cynic',
    personaId: 3,
    imageUrl: '/assets/img/generated/family-dinner-instagram-lies-exposed.jpg',
    viewCount: 28764,
    upvoteCount: 3456,
    commentCount: 672,
    shareCount: 1523,
    bookmarkCount: 743,
    trending: true,
    featured: false,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Ah, family dinners. That special time when relatives gather to judge each other\'s life choices while pretending to care about the cranberry sauce recipe.'
        },
        {
          type: 'paragraph',
          content: 'My sister Jessica has always been... theatrical. But lately, her Instagram has showcased a lifestyle that would make billionaires jealous. Designer bags, luxury vacations, expensive restaurants – all while she\'s been "between jobs" for eight months.'
        }
      ]
    },
    redditThreadId: 'sister_fake_insta_drama',
    subreddit: 'AmItheAsshole',
  },
  {
    title: 'My Neighbor\'s "Service Dog" Turned Out to Be a Stolen Pet – The Plot Twist Will Shock You',
    slug: 'neighbor-fake-service-dog-stolen-pet-scandal',
    excerpt: 'For months, my neighbor paraded around with her "emotional support" dog, using it to access places pets aren\'t allowed. Then I saw a missing pet poster that changed everything.',
    category: 'neighbor',
    author: 'The Snarky Sage',
    personaId: 1,
    imageUrl: '/assets/img/generated/neighbor-fake-service-dog-stolen.jpg',
    viewCount: 41234,
    upvoteCount: 4321,
    commentCount: 834,
    shareCount: 2987,
    bookmarkCount: 1456,
    trending: true,
    featured: true,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Buckle up, dear readers, because today\'s tale of neighborhood drama comes with more plot twists than a soap opera and approximately 47% more criminal activity than your average Karen encounter.'
        },
        {
          type: 'paragraph',
          content: 'Meet Brenda, my neighbor who moved in six months ago with her "emotional support dog," a beautiful Golden Retriever named Sunshine. Brenda was very vocal about Sunshine\'s status, bringing up the dog\'s "certification" in every conversation and making sure everyone knew her rights under the ADA.'
        }
      ]
    },
    redditThreadId: 'stolen_service_dog_scandal',
    subreddit: 'legaladvice',
  },
  {
    title: 'Restaurant Customer Tries to Pay $127 Bill with "Exposure" – Manager\'s Response is LEGENDARY',
    slug: 'restaurant-customer-exposure-payment-manager-response',
    excerpt: 'A wannabe food blogger with 500 followers tried to get a free meal by offering "promotion" instead of payment. The manager\'s solution was absolutely brilliant.',
    category: 'customer',
    author: 'The Down-to-Earth Buddy',
    personaId: 2,
    imageUrl: '/assets/img/generated/restaurant-exposure-payment-manager.jpg',
    viewCount: 37891,
    upvoteCount: 3789,
    commentCount: 567,
    shareCount: 2134,
    bookmarkCount: 1023,
    trending: false,
    featured: false,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Hey everyone! Today\'s story comes from the wild world of food service, where entitled customers think "exposure" pays rent and managers occasionally serve justice hotter than the soup special.'
        },
        {
          type: 'paragraph',
          content: 'Our tale begins at Luigi\'s Family Restaurant, a cozy Italian place where the pasta is homemade and the patience for nonsense is limited. Enter our protagonist: "Food Blogger" Brittany, who ordered enough food for four people then announced she couldn\'t pay because she was "promoting" the restaurant.'
        }
      ]
    },
    redditThreadId: 'exposure_payment_restaurant',
    subreddit: 'ChoosingBeggars',
  },
  {
    title: 'My Date Tried to Make Me Pay for Her Ex-Boyfriend\'s Meal – Plot Twist of the Century',
    slug: 'date-pay-ex-boyfriend-meal-plot-twist',
    excerpt: 'What started as a normal Tinder date turned into the most bizarre love triangle scam I\'ve ever witnessed. The audacity levels were off the charts, but karma had the last laugh.',
    category: 'dating',
    author: 'The Dry Cynic',
    personaId: 3,
    imageUrl: '/assets/img/generated/date-ex-boyfriend-meal-scam.jpg',
    viewCount: 29456,
    upvoteCount: 2945,
    commentCount: 445,
    shareCount: 1654,
    bookmarkCount: 823,
    trending: false,
    featured: false,
    content: {
      sections: [
        {
          type: 'paragraph',
          content: 'Dating apps are a fascinating study in human psychology, where people present their best selves while secretly harboring the chaos of reality television. Today\'s tale proves that sometimes reality is stranger than any script.'
        },
        {
          type: 'paragraph',
          content: 'I matched with Sarah on Tinder. Normal conversation, shared interests, agreeable personality. We planned dinner at a mid-tier restaurant – nothing fancy, just good food and conversation. What could go wrong? Oh, sweet summer me...'
        }
      ]
    },
    redditThreadId: 'date_ex_payment_scam',
    subreddit: 'dating_advice',
  }
]

// Comprehensive tags for the new stories
const storyTags = [
  { name: 'malicious-compliance', slug: 'malicious-compliance', usageCount: 2 },
  { name: 'workplace', slug: 'workplace', usageCount: 1 },
  { name: 'christmas', slug: 'christmas', usageCount: 1 },
  { name: 'boss', slug: 'boss', usageCount: 1 },
  { name: 'roommate', slug: 'roommate', usageCount: 1 },
  { name: 'influencer', slug: 'influencer', usageCount: 2 },
  { name: 'social-media', slug: 'social-media', usageCount: 3 },
  { name: 'family-drama', slug: 'family-drama', usageCount: 1 },
  { name: 'instagram', slug: 'instagram', usageCount: 2 },
  { name: 'fake-lifestyle', slug: 'fake-lifestyle', usageCount: 1 },
  { name: 'neighbor', slug: 'neighbor', usageCount: 1 },
  { name: 'service-dog', slug: 'service-dog', usageCount: 1 },
  { name: 'stolen-pet', slug: 'stolen-pet', usageCount: 1 },
  { name: 'restaurant', slug: 'restaurant', usageCount: 1 },
  { name: 'choosing-beggar', slug: 'choosing-beggar', usageCount: 1 },
  { name: 'exposure-payment', slug: 'exposure-payment', usageCount: 1 },
  { name: 'dating', slug: 'dating', usageCount: 1 },
  { name: 'scam', slug: 'scam', usageCount: 1 },
  { name: 'plot-twist', slug: 'plot-twist', usageCount: 1 },
  { name: 'justice', slug: 'justice', usageCount: 4 },
  { name: 'karma', slug: 'karma', usageCount: 3 },
  { name: 'viral', slug: 'viral', usageCount: 6 },
  { name: 'reddit', slug: 'reddit', usageCount: 6 }
]

async function refreshStories() {
  // console.log('🔄 Refreshing stories - deleting all existing posts...')

  // Delete all existing posts and their related data
  await prisma.postTag.deleteMany()
  await prisma.userInteraction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.image.deleteMany()
  await prisma.post.deleteMany()
  
  // Clear old tags and add new ones
  await prisma.tag.deleteMany()
  // console.log('🏷️ Creating new tags...')
  await prisma.tag.createMany({
    data: storyTags,
  })

  // console.log('📰 Creating 6 new viral stories...')
  
  // Create the new stories
  for (const story of newViralStories) {
    const createdPost = await prisma.post.create({
      data: story,
    })
    
    // Add relevant tags to each post
    const postTagMappings = []
    
    // Add universal tags to all posts
    const universalTags = ['viral', 'reddit', 'justice']
    
    // Add category-specific tags
    if (story.category === 'work-stories') {
      postTagMappings.push('malicious-compliance', 'workplace', 'boss')
      if (story.slug.includes('christmas')) postTagMappings.push('christmas')
    } else if (story.category === 'roommate-drama') {
      postTagMappings.push('roommate', 'influencer', 'social-media')
    } else if (story.category === 'aita') {
      postTagMappings.push('family-drama', 'instagram', 'fake-lifestyle', 'social-media')
    } else if (story.category === 'neighbor') {
      postTagMappings.push('neighbor', 'service-dog', 'stolen-pet', 'karma')
    } else if (story.category === 'customer') {
      postTagMappings.push('restaurant', 'choosing-beggar', 'exposure-payment')
    } else if (story.category === 'dating') {
      postTagMappings.push('dating', 'scam', 'plot-twist')
    }
    
    // Combine with universal tags
    const allTagsForPost = [...new Set([...universalTags, ...postTagMappings])]
    
    // Create post-tag relationships
    for (const tagSlug of allTagsForPost) {
      const tag = await prisma.tag.findFirst({
        where: { slug: tagSlug }
      })
      
      if (tag) {
        await prisma.postTag.create({
          data: {
            postId: createdPost.id,
            tagId: tag.id,
          }
        })
      }
    }
    
    // console.log(`✅ Created story: ${story.title.substring(0, 50)}...`)
  }

  // Create realistic user interactions for the new posts
  // console.log('👥 Creating user interactions...')
  const posts = await prisma.post.findMany()
  
  for (const post of posts) {
    // Create upvotes
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

    // Create shares
    for (let i = 0; i < Math.min(post.shareCount, 50); i++) { // Limit to prevent too many records
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

    // Create bookmarks
    for (let i = 0; i < Math.min(post.bookmarkCount, 30); i++) { // Limit to prevent too many records
      await prisma.userInteraction.create({
        data: {
          postId: post.id,
          interactionType: 'bookmark',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        },
      })
    }
  }

  // console.log('✅ Story refresh completed successfully!')
  // console.log(`Created:`)
  // console.log(`  ${newViralStories.length} new viral stories`)
  // console.log(`  ${storyTags.length} tags`)
  // console.log(`  Multiple user interactions for engagement`)
  // console.log('')
  // console.log('New stories cover these categories:')
  const categories = [...new Set(newViralStories.map(s => s.category))]
  // categories.forEach(cat => console.log(`  - ${cat}`))
}

// Run the refresh
refreshStories()
  .catch((e) => {
    console.error('❌ Error refreshing stories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })