import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrateToSupabase() {
  console.log('🚀 Migrating local posts to Supabase...\n');

  // Get all posts from local database
  const localPosts = await prisma.post.findMany({
    include: {
      persona: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${localPosts.length} posts in local database\n`);

  // First ensure personas exist in Supabase
  const personas = await prisma.persona.findMany();

  for (const persona of personas) {
    const { error: personaError } = await supabase.from('personas').upsert(
      {
        id: persona.id,
        name: persona.name,
        slug: persona.slug,
        bio: persona.bio,
        tone: persona.tone,
        avatar_url: persona.avatarUrl,
        story_count: persona.storyCount,
        rating: persona.rating,
      },
      {
        onConflict: 'name',
      }
    );

    if (personaError) {
      console.error(
        `Failed to upsert persona ${persona.name}:`,
        personaError.message
      );
    } else {
      console.log(`✅ Upserted persona: ${persona.name}`);
    }
  }

  console.log('\nMigrating posts...\n');

  // Insert posts into Supabase
  let migrated = 0;
  for (const post of localPosts) {
    const supabasePost = {
      title: post.title,
      slug: post.slug,
      hook: post.excerpt || post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      featured: post.featured,
      trending_score: post.trending ? 80 : 20,
      view_count: post.viewCount,
      share_count: post.shareCount,
      featured_image: post.imageUrl,
      created_at: post.createdAt.toISOString(),
      updated_at: post.updatedAt.toISOString(),
      persona_id: post.personaId,
    };

    const { error } = await supabase.from('posts').insert(supabasePost);

    if (error) {
      console.error(`Failed to migrate "${post.title}":`, error.message);
    } else {
      migrated++;
      console.log(`✅ Migrated: ${post.title}`);
    }
  }

  console.log(
    `\n📊 Successfully migrated ${migrated} out of ${localPosts.length} posts`
  );

  // Verify migration
  const { data: supabasePosts } = await supabase
    .from('posts')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n📋 Latest posts in Supabase:');
  supabasePosts?.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
  });
}

migrateToSupabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
