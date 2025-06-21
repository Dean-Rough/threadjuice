// View generated posts to see our enhanced system results
const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'file:./dev.db';

async function viewPosts() {
  // console.log('📖 Viewing Generated ThreadJuice Posts...\n')

  const prisma = new PrismaClient();

  try {
    const posts = await prisma.post.findMany({
      take: 2, // Show first 2 posts
      orderBy: { createdAt: 'desc' },
      include: {
        persona: true,
        images: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    for (const post of posts) {
      // console.log('==================================================================================')
      // console.log(`📰 TITLE: ${post.title}`)
      // console.log(`🎭 PERSONA: ${post.persona?.name || post.author}`)
      // console.log(`📂 CATEGORY: ${post.category}`)
      // console.log(`📊 STATUS: ${post.status}`)
      // console.log(`🔥 TRENDING: ${post.trending ? 'Yes' : 'No'}`)
      // console.log(`⭐ FEATURED: ${post.featured ? 'Yes' : 'No'}`)
      // console.log(`🗓️ CREATED: ${post.createdAt.toLocaleString()}`)

      if (post.excerpt) {
        // console.log(`\n🎣 EXCERPT:`)
        // console.log(`"${post.excerpt}"`)
      }

      if (post.content) {
        // console.log(`\n📝 CONTENT PREVIEW:`)
        const contentText =
          typeof post.content === 'string'
            ? post.content
            : JSON.stringify(post.content, null, 2);
        // console.log(contentText.slice(0, 800) + '...')
      }

      if (post.postTags && post.postTags.length > 0) {
        const tagNames = post.postTags.map(pt => pt.tag.name);
        // console.log(`\n🏷️ TAGS: ${tagNames.join(', ')}`)
      }

      if (post.images.length > 0) {
        // console.log(`\n🖼️ IMAGES: ${post.images.length}`)
        post.images.forEach(img => {
          // console.log(`   - ${img.url}`)
          // console.log(`     Alt: ${img.altText}`)
          // console.log(`     Source: ${img.sourceName}`)
        });
      }

      // console.log('\n')
    }

    // console.log('🎯 Analysis of Generated Content:')

    // Check for em dashes
    const allContent = posts
      .map(p => p.title + ' ' + (p.excerpt || '') + ' ' + (p.content || ''))
      .join(' ');
    const emDashCount = (allContent.match(/—/g) || []).length;
    // console.log(`📏 Em Dash Check: ${emDashCount === 0 ? '✅ Clean (no em dashes found)' : `❌ Found ${emDashCount} em dashes`}`)

    // Check persona distribution
    const personaCounts = posts.reduce((acc, post) => {
      const persona = post.persona?.name || 'Unknown';
      acc[persona] = (acc[persona] || 0) + 1;
      return acc;
    }, {});

    // console.log('\n🎭 Persona Distribution:')
    Object.entries(personaCounts).forEach(([persona, count]) => {
      // console.log(`   ${persona}: ${count} posts`)
    });

    // Check for emoji usage in titles
    const emojiTitles = posts.filter(p =>
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
        p.title
      )
    );
    // console.log(`\n😀 Emoji Usage: ${emojiTitles.length}/${posts.length} titles have emojis`)

    // console.log('\n🚀 ThreadJuice Content Generation System Working!')
    // console.log('✅ Modular prompts generating natural content')
    // console.log('✅ Personas creating distinct voices')
    // console.log('✅ Viral headlines with emojis')
    // console.log('✅ Content ready for social sharing')
  } catch (error) {
    console.error('❌ Error viewing posts:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewPosts();
