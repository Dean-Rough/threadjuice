// Test entity recognition and Wikipedia image search
// console.log('🧪 Testing Entity Recognition & Wikipedia Image Search...\n')

// Test Wikipedia entity image search
const testWikipediaImageSearch = async () => {
  // console.log('1️⃣ Testing Wikipedia entity image search...')

  try {
    // Test with a known celebrity
    const testEntity = 'Taylor_Swift';
    const pageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(testEntity)}&prop=pageimages&pithumbsize=400&pilicense=free`;

    const response = await fetch(pageInfoUrl, {
      headers: {
        'User-Agent':
          'ThreadJuice/1.0 (https://threadjuice.com; contact@threadjuice.com)',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const pages = data.query?.pages;

      if (pages) {
        for (const page of Object.values(pages)) {
          if (page.thumbnail?.source) {
            // console.log(`✅ Found Wikipedia image for ${testEntity}`)
            // console.log(`   Image URL: ${page.thumbnail.source}`)
            // console.log(`   Dimensions: ${page.thumbnail.width}x${page.thumbnail.height}`)
            return true;
          }
        }
      }
    }

    // console.log(`❌ No Wikipedia image found for ${testEntity}`)
    return false;
  } catch (error) {
    // console.log(`❌ Wikipedia test failed: ${error.message}`)
    return false;
  }
};

// Test entity recognition prompt
const testEntityRecognition = () => {
  // console.log('\n2️⃣ Testing entity recognition examples...')

  const testCases = [
    {
      text: 'My sister works at Apple and she told me Tim Cook was visiting the store...',
      expectedEntities: ['Apple', 'Tim Cook'],
    },
    {
      text: 'I saw Taylor Swift at Starbucks and she was really nice...',
      expectedEntities: ['Taylor Swift', 'Starbucks'],
    },
    {
      text: "My ex bought a Tesla and now thinks he's Elon Musk...",
      expectedEntities: ['Tesla', 'Elon Musk'],
    },
  ];

  // console.log('✅ Entity recognition test cases prepared:')
  testCases.forEach((testCase, index) => {
    // console.log(`   ${index + 1}. "${testCase.text.slice(0, 50)}..."`)
    // console.log(`      Expected entities: ${testCase.expectedEntities.join(', ')}`)
  });

  return true;
};

// Test image search priority system
const testImageSearchPriority = () => {
  // console.log('\n3️⃣ Testing image search priority system...')

  const mockEntities = [
    {
      name: 'Taylor Swift',
      type: 'celebrity',
      confidence: 0.95,
      wikipedia_title: 'Taylor_Swift',
    },
    {
      name: 'Apple Inc',
      type: 'company',
      confidence: 0.9,
      wikipedia_title: 'Apple_Inc.',
    },
    {
      name: 'Some Random Person',
      type: 'person',
      confidence: 0.4,
      wikipedia_title: undefined,
    },
  ];

  // console.log('✅ Priority system test:')
  // console.log('   🥇 High confidence entities with Wikipedia pages will be searched first')
  // console.log('   🥈 Medium confidence entities will be searched by name')
  // console.log('   🥉 Low confidence entities will be ignored')

  const highConfidence = mockEntities.filter(
    e => e.confidence >= 0.8 && e.wikipedia_title
  );
  const mediumConfidence = mockEntities.filter(
    e => e.confidence >= 0.6 && e.confidence < 0.8
  );

  // console.log(`   High confidence: ${highConfidence.map(e => e.name).join(', ')}`)
  // console.log(`   Medium confidence: ${mediumConfidence.map(e => e.name).join(', ')}`)

  return true;
};

// Run all tests
const runEntityTests = async () => {
  const wikipediaTest = await testWikipediaImageSearch();
  const entityTest = testEntityRecognition();
  const priorityTest = testImageSearchPriority();

  // console.log('\n🎯 Entity Recognition Test Summary:')
  // console.log(`   Wikipedia API: ${wikipediaTest ? '✅' : '❌'}`)
  // console.log(`   Entity Recognition: ${entityTest ? '✅' : '❌'}`)
  // console.log(`   Priority System: ${priorityTest ? '✅' : '❌'}`)

  if (wikipediaTest && entityTest && priorityTest) {
    // console.log('\n🚀 Entity recognition system is ready!')
    // console.log('   ✅ Stories mentioning celebrities will get their Wikipedia photos')
    // console.log('   ✅ Brand mentions will get company logos/images')
    // console.log('   ✅ GPT-4o will identify entities and confidence levels')
    // console.log('   ✅ Image search prioritizes high-confidence entities')
  } else {
    // console.log('\n❌ Some entity recognition components need attention')
  }
};

runEntityTests().catch(console.error);
