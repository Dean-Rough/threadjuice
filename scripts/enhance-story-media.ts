import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pexels API
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Search Pexels for relevant images
async function searchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = (await response.json()) as any;
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large || data.photos[0].src.original;
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }

  return null;
}

// Get reaction GIF based on emotion
function getReactionGif(emotion: string): { url: string; caption: string } {
  const reactionGifs: Record<string, { url: string; caption: string }> = {
    shocked: {
      url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/giphy.gif',
      caption: 'MRW I realize what they did',
    },
    facepalm: {
      url: 'https://media.giphy.com/media/XsUtdIeJ0MWMo/giphy.gif',
      caption: 'The only appropriate response',
    },
    laughing: {
      url: 'https://media.giphy.com/media/Q7ozWVYCR0nyW2rvPW/giphy.gif',
      caption: 'Cannot stop laughing at this',
    },
    confused: {
      url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
      caption: 'Wait, what just happened?',
    },
    mindblown: {
      url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
      caption: 'Brain.exe has stopped working',
    },
  };

  return reactionGifs[emotion] || reactionGifs.confused;
}

async function enhanceStoryWithMedia() {
  console.log('🎨 Enhancing stories with real media...\n');

  // Get recent stories
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, content')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !posts) {
    console.error('Error fetching posts:', error);
    return;
  }

  for (const post of posts) {
    console.log(`\n📖 Processing: ${post.title}`);

    if (!post.content || !post.content.sections) {
      console.log('❌ No sections found');
      continue;
    }

    let updated = false;
    const sections = [...post.content.sections];

    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Enhance image sections
      if (section.type === 'image' && !section.metadata?.imageUrl) {
        console.log('🖼️  Finding image for:', section.content);

        // Extract search terms from the image description
        const searchQuery = section.content
          .replace(/Image of|Picture of|Photo of/gi, '')
          .trim();

        const imageUrl = await searchPexelsImage(searchQuery);

        if (imageUrl) {
          sections[i] = {
            ...section,
            metadata: {
              ...section.metadata,
              imageUrl: imageUrl,
              source: 'pexels',
            },
          };
          updated = true;
          console.log('✅ Found image from Pexels');
        } else {
          // Fallback to ThreadJuice images
          const randomImage = `/assets/img/lifestyle/life_style${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}.jpg`;
          sections[i] = {
            ...section,
            metadata: {
              ...section.metadata,
              imageUrl: randomImage,
              source: 'local',
            },
          };
          updated = true;
          console.log('📁 Using local fallback image');
        }
      }

      // Add reaction GIFs after key sections
      if (
        (section.type === 'describe-2' || section.type === 'describe-3') &&
        i < sections.length - 1 &&
        sections[i + 1].type !== 'reaction_gif'
      ) {
        // Determine emotion based on section content
        let emotion = 'shocked';
        const content = section.content.toLowerCase();

        if (content.includes('hilarious') || content.includes('laughing')) {
          emotion = 'laughing';
        } else if (content.includes('confused') || content.includes('what')) {
          emotion = 'confused';
        } else if (
          content.includes('disaster') ||
          content.includes('mistake')
        ) {
          emotion = 'facepalm';
        } else if (
          content.includes('incredible') ||
          content.includes('amazing')
        ) {
          emotion = 'mindblown';
        }

        const gif = getReactionGif(emotion);

        // Insert reaction GIF after this section
        sections.splice(i + 1, 0, {
          type: 'reaction_gif',
          content: gif.caption,
          metadata: {
            gifUrl: gif.url,
            emotion: emotion,
            placement: 'after-drama',
          },
        });

        updated = true;
        console.log(`🎭 Added ${emotion} reaction GIF`);
        i++; // Skip the newly inserted section
      }
    }

    // Add story link at the end if not present
    const hasLink = sections.some(s => s.type === 'story_link');
    if (!hasLink) {
      sections.push({
        type: 'story_link',
        content: 'Read more stories like this on ThreadJuice',
        metadata: {
          url: `https://threadjuice.com/blog/${post.slug}`,
          linkText: 'Share this story',
        },
      });
      updated = true;
    }

    // Update the post if we made changes
    if (updated) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: { sections },
        })
        .eq('id', post.id);

      if (updateError) {
        console.error('❌ Error updating post:', updateError);
      } else {
        console.log('✅ Story enhanced successfully');
      }
    }
  }

  console.log('\n🎉 Media enhancement complete!');
}

// Also update featured images
async function updateFeaturedImages() {
  console.log('\n🖼️  Updating featured images...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, category, featured_image')
    .is('featured_image', null)
    .limit(20);

  if (!posts) return;

  for (const post of posts) {
    const imageUrl = await searchPexelsImage(
      post.category + ' ' + post.title.split(' ').slice(0, 3).join(' ')
    );

    if (imageUrl) {
      await supabase
        .from('posts')
        .update({ featured_image: imageUrl })
        .eq('id', post.id);

      console.log(`✅ Updated featured image for: ${post.title}`);
    }
  }
}

// Run both enhancements
async function runEnhancements() {
  await enhanceStoryWithMedia();
  await updateFeaturedImages();
}

runEnhancements().catch(console.error);
