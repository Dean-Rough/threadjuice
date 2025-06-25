import { NextRequest, NextResponse } from 'next/server.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
// import { prisma } from '@/lib/prisma';

const PostQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .optional(),
  category: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  trending: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  featured: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  search: z.string().nullable().optional(),
  sortBy: z
    .enum(['views', 'shares', 'comments', 'latest', 'trending'])
    .nullable()
    .optional(),
});

// Load real generated stories
function loadGeneratedStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'generated-stories');
    if (!fs.existsSync(storiesDir)) {
      return [];
    }

    const files = fs
      .readdirSync(storiesDir)
      .filter(file => file.endsWith('.json'));
    const stories = files.map(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf-8');
      return JSON.parse(content);
    });

    // Sort by creation date, newest first
    return stories.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.warn('Failed to load generated stories:', error);
    return [];
  }
}

// Mock data for development - replace with Prisma when database is ready
const mockPosts = [
  {
    id: '1',
    title:
      'Coworker Discovered My Secret Reddit Addiction During Teams Meeting',
    slug: 'coworker-discovered-secret-reddit-addiction',
    excerpt:
      'Forgot to close my tabs during screen share. Now they know about my 47-hour binge of r/antiwork stories.',
    imageUrl: '/assets/img/blog/blog01.jpg',
    category: 'Work Drama',
    author: 'the-snarky-sage',
    viewCount: 12847,
    upvoteCount: 287,
    commentCount: 156,
    shareCount: 89,
    bookmarkCount: 234,
    trending: true,
    featured: true,
    status: 'published',
    createdAt: new Date('2024-06-19T10:30:00Z'),
    updatedAt: new Date('2024-06-19T10:30:00Z'),
  },
  {
    id: '2',
    title:
      'Landlord Tried to Charge Me for "Excessive Breathing" in Lease Renewal',
    slug: 'landlord-excessive-breathing-charge',
    excerpt:
      'Apparently my respiratory rate exceeds the "standard tenant oxygen consumption allowance." I wish I was making this up.',
    imageUrl: '/assets/img/blog/blog02.jpg',
    category: 'Housing Hell',
    author: 'the-dry-cynic',
    viewCount: 8934,
    upvoteCount: 445,
    commentCount: 289,
    shareCount: 156,
    bookmarkCount: 167,
    trending: true,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-19T08:15:00Z'),
    updatedAt: new Date('2024-06-19T08:15:00Z'),
  },
  {
    id: '3',
    title: 'Gym Bro Asked if I "Even Lift" While I Was Literally Mid-Deadlift',
    slug: 'gym-bro-do-you-even-lift',
    excerpt:
      "Had 315 pounds in my hands. Apparently that doesn't count unless you grunt loud enough for the entire facility to hear.",
    imageUrl: '/assets/img/blog/blog03.jpg',
    category: 'Gym Life',
    author: 'the-down-to-earth-buddy',
    viewCount: 15623,
    upvoteCount: 672,
    commentCount: 394,
    shareCount: 203,
    bookmarkCount: 445,
    trending: true,
    featured: true,
    status: 'published',
    createdAt: new Date('2024-06-19T07:45:00Z'),
    updatedAt: new Date('2024-06-19T07:45:00Z'),
  },
  {
    id: '4',
    title: 'Karen at Starbucks Demanded to Speak to the Manager of My Laptop',
    slug: 'karen-starbucks-laptop-manager',
    excerpt:
      'Apparently my MacBook was "hogging bandwidth" from her Instagram live stream. She wanted Apple\'s corporate number.',
    imageUrl: '/assets/img/blog/blog04.jpg',
    category: 'Public Freakouts',
    author: 'the-snarky-sage',
    viewCount: 22156,
    upvoteCount: 834,
    commentCount: 567,
    shareCount: 289,
    bookmarkCount: 623,
    trending: false,
    featured: true,
    status: 'published',
    createdAt: new Date('2024-06-18T16:20:00Z'),
    updatedAt: new Date('2024-06-18T16:20:00Z'),
  },
  {
    id: '5',
    title:
      'Uber Driver Started Livestreaming Our Conversation Without Permission',
    slug: 'uber-driver-livestream-conversation',
    excerpt:
      'Found out I was the unwilling star of "Awkward Passenger Reactions" on TikTok. My social anxiety is now viral content.',
    imageUrl: '/assets/img/blog/blog05.jpg',
    category: 'Tech Nightmares',
    author: 'the-dry-cynic',
    viewCount: 18742,
    upvoteCount: 523,
    commentCount: 298,
    shareCount: 167,
    bookmarkCount: 389,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-18T14:30:00Z'),
    updatedAt: new Date('2024-06-18T14:30:00Z'),
  },
  {
    id: '6',
    title:
      'Neighbor\'s WiFi Name Changed to "Pay Your Rent Steve" After Argument',
    slug: 'neighbor-wifi-name-pay-rent',
    excerpt:
      'Now every device in my apartment reminds me of our property line dispute. Even my smart TV is taking sides.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Neighbor Wars',
    author: 'the-down-to-earth-buddy',
    viewCount: 9876,
    upvoteCount: 345,
    commentCount: 178,
    shareCount: 123,
    bookmarkCount: 234,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-18T12:15:00Z'),
    updatedAt: new Date('2024-06-18T12:15:00Z'),
  },
  {
    id: '7',
    title: 'Dating App Match Asked for My Credit Score on First Message',
    slug: 'dating-app-credit-score-request',
    excerpt:
      'Apparently "Hey gorgeous" is too mainstream. Modern romance requires a full financial disclosure and three references.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Dating Disasters',
    author: 'the-snarky-sage',
    viewCount: 16789,
    upvoteCount: 598,
    commentCount: 423,
    shareCount: 245,
    bookmarkCount: 456,
    trending: true,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-18T09:30:00Z'),
    updatedAt: new Date('2024-06-18T09:30:00Z'),
  },
  {
    id: '8',
    title:
      'Boss Scheduled "Mandatory Fun" Meeting to Discuss Why Morale is Low',
    slug: 'boss-mandatory-fun-morale-meeting',
    excerpt:
      'Nothing says "we care about employee happiness" like forcing people to explain why they\'re miserable at 8 AM on Monday.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Work Drama',
    author: 'the-dry-cynic',
    viewCount: 25643,
    upvoteCount: 892,
    commentCount: 634,
    shareCount: 378,
    bookmarkCount: 567,
    trending: true,
    featured: true,
    status: 'published',
    createdAt: new Date('2024-06-17T15:45:00Z'),
    updatedAt: new Date('2024-06-17T15:45:00Z'),
  },
  {
    id: '9',
    title: 'Mother-in-Law Critiqued My Grocery Receipt Line by Line',
    slug: 'mother-in-law-grocery-receipt-critique',
    excerpt:
      'Apparently organic milk is "showing off" and store-brand cereal means I don\'t love her son enough. Peak holiday family time.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Family Drama',
    author: 'the-down-to-earth-buddy',
    viewCount: 13456,
    upvoteCount: 467,
    commentCount: 289,
    shareCount: 189,
    bookmarkCount: 334,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-17T11:20:00Z'),
    updatedAt: new Date('2024-06-17T11:20:00Z'),
  },
  {
    id: '10',
    title: 'Food Delivery Driver Left My Order with "Suspicious Guy in Hoodie"',
    slug: 'delivery-driver-suspicious-guy-hoodie',
    excerpt:
      'Plot twist: I was the suspicious guy in a hoodie. Apparently my own appearance made me untrustworthy to receive my own food.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Tech Nightmares',
    author: 'the-snarky-sage',
    viewCount: 11234,
    upvoteCount: 389,
    commentCount: 156,
    shareCount: 134,
    bookmarkCount: 278,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-17T08:10:00Z'),
    updatedAt: new Date('2024-06-17T08:10:00Z'),
  },
  {
    id: '11',
    title: 'Zoom Meeting Turned into Accidental Therapy Session',
    slug: 'zoom-meeting-accidental-therapy-session',
    excerpt:
      'Client started oversharing about their divorce. Somehow I became their unpaid counselor while trying to discuss quarterly reports.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Work Drama',
    author: 'the-dry-cynic',
    viewCount: 8967,
    upvoteCount: 234,
    commentCount: 167,
    shareCount: 89,
    bookmarkCount: 189,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-16T14:55:00Z'),
    updatedAt: new Date('2024-06-16T14:55:00Z'),
  },
  {
    id: '12',
    title: 'Barista Wrote "Disappointed Dad" Instead of My Name on Cup',
    slug: 'barista-disappointed-dad-name',
    excerpt:
      'Ordered a simple latte. Got an emotional intervention instead. Apparently my life choices are written all over my face.',
    imageUrl: '/assets/img/blog/blog06.jpg',
    category: 'Public Freakouts',
    author: 'the-down-to-earth-buddy',
    viewCount: 7845,
    upvoteCount: 298,
    commentCount: 134,
    shareCount: 67,
    bookmarkCount: 156,
    trending: false,
    featured: false,
    status: 'published',
    createdAt: new Date('2024-06-16T10:30:00Z'),
    updatedAt: new Date('2024-06-16T10:30:00Z'),
  },
  // FRESH TWITTER DRAMA STORY (Just Generated)
  {
    id: 'simulated-twitter-1750417063190',
    title:
      'Food Twitter Civil War Erupts Over Whether Microwaving Leftover Pizza is a Crime Against Humanity',
    slug: 'food-twitter-civil-war-erupts-over-whether-microwaving-leftover-pizza-is-a-crime-against-humanity',
    excerpt:
      'A innocent poll about reheating methods triggered 567 quote tweets of pure culinary rage, scientific papers about heat distribution, and deeply personal stories about childhood pizza trauma.',
    imageUrl: '/assets/img/blog/blog06.jpg',
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
  },
  // PREVIOUS TWITTER DRAMA STORY
  {
    id: 'live-twitter-ranch-drama',
    title: 'Food Twitter Declares War Over Ranch Pizza and Nobody Wins',
    slug: 'food-twitter-declares-war-ranch-pizza-nobody-wins',
    excerpt:
      'What started as a PSA about pizza condiments escalated into 189 replies questioning life choices, personality traits, and middle school trauma. Peak food discourse achieved.',
    imageUrl: '/assets/img/blog/blog06.jpg',
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
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryResult = PostQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      category: searchParams.get('category'),
      author: searchParams.get('author'),
      trending: searchParams.get('trending'),
      featured: searchParams.get('featured'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      page = 1,
      limit = 12,
      category,
      author,
      trending,
      featured,
      search,
      sortBy,
    } = queryResult.data;

    // Build where clause based on filters
    const where: any = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }

    if (author) {
      // Convert display name back to slug format for database lookup
      const authorSlug = author.toLowerCase().replace(/\s+/g, '-');
      where.author = {
        contains: authorSlug,
        mode: 'insensitive',
      };
    }

    if (trending === true) {
      where.trending = trending;
    }

    if (featured === true) {
      where.featured = featured;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Combine real generated stories with mock posts
    const generatedStories = loadGeneratedStories();
    const allPosts = [...generatedStories, ...mockPosts];

    // Filter posts based on query parameters
    const filteredPosts = allPosts.filter(post => {
      // Status filter (all posts are published, generated stories don't have status field)
      if (post.status && post.status !== 'published') return false;

      // Category filter
      if (category && post.category !== category) return false;

      // Author filter
      if (author) {
        const authorSlug = author.toLowerCase().replace(/\s+/g, '-');
        if (!post.author.toLowerCase().includes(authorSlug)) return false;
      }

      // Trending filter
      if (trending === true && !post.trending) return false;

      // Featured filter
      if (featured === true && !post.featured) return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
        if (!titleMatch && !excerptMatch) return false;
      }

      return true;
    });

    // Sort posts based on sortBy parameter
    switch (sortBy) {
      case 'views':
        filteredPosts.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'shares':
        filteredPosts.sort((a, b) => b.shareCount - a.shareCount);
        break;
      case 'comments':
        filteredPosts.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'trending':
        filteredPosts.sort((a, b) => {
          if (b.trending !== a.trending) return b.trending ? 1 : -1;
          return b.viewCount - a.viewCount;
        });
        break;
      case 'latest':
        filteredPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // Default ordering: trending first, then featured, then by date
        filteredPosts.sort((a, b) => {
          if (b.trending !== a.trending) return b.trending ? 1 : -1;
          if (b.featured !== a.featured) return b.featured ? 1 : -1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
    }

    // Calculate pagination
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const skip = (page - 1) * limit;
    const posts = filteredPosts.slice(skip, skip + limit);

    // Transform posts for API response
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      image_url: post.imageUrl,
      category: post.category,
      author: post.author,
      view_count: post.viewCount,
      upvote_count: post.upvoteCount,
      comment_count: post.commentCount,
      share_count: post.shareCount,
      bookmark_count: post.bookmarkCount,
      trending: post.trending,
      featured: post.featured,
      created_at: post.createdAt.toISOString(),
      updated_at: post.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      posts: transformedPosts,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch posts',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
