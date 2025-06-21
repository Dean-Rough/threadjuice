// Get post links and URLs for viewing
const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'file:./dev.db';

async function getPostLinks() {
  // console.log('🔗 Getting ThreadJuice Post Links...\n')

  const prisma = new PrismaClient();

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        persona: true,
      },
    });

    // console.log(`📚 Found ${posts.length} posts to view:\n`)

    posts.forEach((post, index) => {
      // console.log(`${index + 1}. 📰 ${post.title}`)
      // console.log(`   🎭 Persona: ${post.persona?.name || post.author}`)
      // console.log(`   🔗 URL: http://localhost:4242/posts/${post.slug}`)
      // console.log(`   📂 Category: ${post.category}`)
      // console.log(`   📊 Status: ${post.status}`)
      // console.log('')
    });

    // console.log('🌐 Main Pages:')
    // console.log(`   🏠 Homepage: http://localhost:4242/`)
    // console.log(`   📋 All Posts: http://localhost:4242/blog`)
    // console.log(`   🎭 Personas: http://localhost:4242/personas`)
    // console.log(`   📊 Dashboard: http://localhost:4242/dashboard`)

    // console.log('\n📱 API Endpoints:')
    // console.log(`   📡 Posts API: http://localhost:4242/api/posts`)
    // console.log(`   🎭 Personas API: http://localhost:4242/api/personas`)
    // console.log(`   🚀 Automation: http://localhost:4242/api/ingest/reddit`)
  } catch (error) {
    console.error('❌ Error getting links:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getPostLinks();
