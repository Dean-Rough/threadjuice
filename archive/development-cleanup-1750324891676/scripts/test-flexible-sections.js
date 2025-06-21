// Test the new flexible section system
const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = 'file:./dev.db';

// Mock Reddit data for testing
const mockRedditPost = {
  title: 'AITA for refusing to share my inheritance with my stepbrother?',
  author: 'throwawayinherit23',
  subreddit: 'AmItheAsshole',
  score: 2847,
  num_comments: 536,
  selftext: `So this happened last week and my family is losing their minds. My grandmother passed away last year and left me (25F) her entire estate - about $180k plus her house. She specifically wrote in her will that it all goes to me because I was the only grandchild who stayed in touch and visited her regularly.

My stepbrother Jake (28M) has been asking for money constantly since he found out. He wants half the inheritance to start a business. My mom thinks I should "share" because we're family. But here's the thing - Jake never even talked to grandma. He skipped every family gathering and didn't even come to her funeral.

Yesterday at family dinner, Jake brought his girlfriend and they basically ganged up on me saying I'm being selfish and that grandma "didn't really know what she was doing" when she wrote the will. 

I told them exactly what I thought about that and left. Now everyone's blowing up my phone saying I'm tearing the family apart over money.

AITA?`,
};

const mockComments = [
  {
    author: 'FamilyDrama_Expert',
    body: "NTA. Your grandmother made her wishes crystal clear. Jake can't just show up demanding money after ignoring her for years.",
    score: 3429,
    replies: 67,
  },
  {
    author: 'InheritanceAdvice',
    body: 'Absolutely NTA. This is exactly why wills exist - to prevent situations like this. Your grandmother knew exactly what she was doing.',
    score: 2156,
    replies: 43,
  },
  {
    author: 'RedditLawyer99',
    body: "NTA and please get a lawyer ASAP. The fact that they're questioning your grandmother's mental capacity is a red flag for a will contest.",
    score: 1887,
    replies: 78,
  },
  {
    author: 'FairShare_Advocate',
    body: 'Unpopular opinion but YTA. Family should stick together and $180k is a lot to keep all to yourself.',
    score: -234,
    replies: 156,
  },
];

async function testFlexibleSections() {
  // console.log('🧪 Testing Flexible Section System...\n')

  try {
    // Import the content transformer
    const { contentTransformer } = require('./src/lib/contentTransformer.ts');

    // console.log('📝 Generating content with new flexible sections...')

    const transformedContent = await contentTransformer.transformContent(
      mockRedditPost,
      mockComments
    );

    // console.log('✅ Content Generated Successfully!\n')

    // console.log('📋 CONTENT STRUCTURE:')
    // console.log(`Title: ${transformedContent.title}`)
    // console.log(`Persona: ${transformedContent.persona}`)
    // console.log(`Viral Score: ${transformedContent.viral_score}/10`)
    // console.log(`Story Flow: ${transformedContent.content.story_flow || 'Not specified'}`)

    // console.log('\n🎭 FLEXIBLE SECTIONS:')
    transformedContent.content.sections.forEach((section, index) => {
      // console.log(`${index + 1}. ${section.type.toUpperCase()}${section.title ? ` - ${section.title}` : ''}`)

      if (section.type === 'image' && section.metadata?.image_prompt) {
        // console.log(`   📸 Image Prompt: ${section.metadata.image_prompt}`)
      }

      if (section.type.includes('comments') && section.metadata?.comments) {
        // console.log(`   💬 ${section.metadata.comments.length} Reddit comments included`)
      }

      if (section.type === 'quiz' && section.metadata?.quiz_data) {
        // console.log(`   🧠 Quiz: ${section.metadata.quiz_data.question}`)
      }

      // console.log(`   Content Preview: ${section.content.slice(0, 100)}${section.content.length > 100 ? '...' : ''}`)
      // console.log('')
    });

    // console.log('🎯 SECTION ANALYSIS:')
    const sectionTypes = transformedContent.content.sections.map(s => s.type);
    // console.log(`Selected sections: ${sectionTypes.join(' → ')}`)
    // console.log(`Total sections: ${sectionTypes.length}`)

    const hasImage = sectionTypes.includes('image');
    const hasComments = sectionTypes.some(type => type.includes('comments'));
    const hasDiscussion = sectionTypes.includes('discussion');
    const hasQuiz = sectionTypes.includes('quiz');

    // console.log('\n📊 SECTION FEATURES:')
    // console.log(`✅ Image section: ${hasImage ? 'Yes' : 'No'}`)
    // console.log(`✅ Comments showcase: ${hasComments ? 'Yes' : 'No'}`)
    // console.log(`✅ Discussion: ${hasDiscussion ? 'Yes' : 'No'}`)
    // console.log(`✅ Quiz: ${hasQuiz ? 'Yes' : 'No'}`)

    if (transformedContent.entities && transformedContent.entities.length > 0) {
      // console.log('\n🔍 DETECTED ENTITIES:')
      transformedContent.entities.forEach(entity => {
        // console.log(`• ${entity.name} (${entity.type}) - Confidence: ${(entity.confidence * 100).toFixed(0)}%`)
      });
    }

    // console.log('\n🚀 Flexible Section System Working!')
    // console.log('✅ Dynamic section selection')
    // console.log('✅ Multiple content types supported')
    // console.log('✅ Adaptive story structure')
    // console.log('✅ Ready for production use')

    return transformedContent;
  } catch (error) {
    console.error('❌ Error testing flexible sections:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFlexibleSections();
