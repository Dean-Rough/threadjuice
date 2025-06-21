#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all story files
const storyFiles = [
  'test-short-story.json',
  'new-story-boss-birthday-presentation-revenge.json',
  'first-story-sister-fake-influencer-lifestyle-exposed.json',
];

// console.log('🎨 DALL-E 3 Batch Image Generator for ThreadJuice Stories');
// console.log('=' .repeat(60));

// Check for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY environment variable not set');
  console.error('Set it with: export OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Create generated images directory
const generatedDir = path.join(
  process.cwd(),
  'public',
  'assets',
  'img',
  'generated'
);
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
  // console.log('📁 Created directory:', generatedDir);
}

async function generateImageForStory(storyFile, index, total) {
  // console.log(`\n[${index + 1}/${total}] Processing: ${storyFile}`);
  // console.log('─'.repeat(40));

  const storyPath = path.join(process.cwd(), storyFile);

  if (!fs.existsSync(storyPath)) {
    console.error(`❌ Story file not found: ${storyFile}`);
    return;
  }

  // Read and parse story
  let story;
  try {
    const storyData = fs.readFileSync(storyPath, 'utf8');
    story = JSON.parse(storyData);
  } catch (error) {
    console.error(`❌ Error reading story file: ${error.message}`);
    return;
  }

  // Check if image already exists
  if (story.imageUrl && story.imageUrl.includes('generated')) {
    // console.log('⏭️  Story already has generated image, skipping...');
    return;
  }

  // Generate enhanced prompt based on story content
  let enhancedPrompt = '';

  if (story.slug.includes('boss') || story.slug.includes('workplace')) {
    enhancedPrompt = `Generate a high-resolution, cinematic office workplace scene showing the moment of sweet workplace revenge. Show a determined office worker at their computer with a subtle smirk, finger hovering over the delete key. The background should show corporate meeting rooms, presentation screens, and the tension of corporate life. Use dramatic lighting with warm orange tones to highlight the person's face. The mood should be triumphant but subtle - capturing the moment of perfect petty revenge. Professional photography style, like a scene from a workplace thriller movie.`;
  } else if (
    story.slug.includes('sister') ||
    story.slug.includes('influencer')
  ) {
    enhancedPrompt = `Generate a high-resolution, cinematic scene showing the dramatic exposure of fake social media influence. Show a young woman looking shocked/exposed while staring at her phone, with fake luxury items scattered around (empty designer boxes, cheap knockoffs). The lighting should be dramatic - harsh phone screen light on her face contrasting with warm room lighting. Background should suggest a modest room trying to look luxurious. Capture the moment of being caught in a lie. Professional photography style, like a scene from a social media drama.`;
  } else {
    enhancedPrompt = `Generate a high-resolution, cinematic-style, landscape viral thumbnail image for a dramatic storytime. The image should visually dramatize the story with emotional intensity but retain quality and realism. Use dynamic lighting, sharp focus on facial expressions, dramatic composition. Maintain a horizontal format and editorial polish, like a movie still.`;
  }

  const finalPrompt = `${enhancedPrompt} Story context: ${story.title} - ${story.excerpt}`;

  // console.log('📝 Generating image with enhanced prompt...');

  // Create the curl command
  const curlCommand = `curl -s https://api.openai.com/v1/images/generations \\
    -H "Authorization: Bearer ${apiKey}" \\
    -H "Content-Type: application/json" \\
    -d '{
      "model": "dall-e-3",
      "prompt": "${finalPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ')}",
      "n": 1,
      "response_format": "url",
      "size": "1792x1024",
      "quality": "hd",
      "style": "vivid"
    }'`;

  try {
    const response = execSync(curlCommand, { encoding: 'utf8' });
    const result = JSON.parse(response);

    if (result.error) {
      console.error('❌ OpenAI API Error:', result.error.message);
      return;
    }

    if (result.data && result.data[0] && result.data[0].url) {
      const imageUrl = result.data[0].url;
      // console.log('✅ Image generated successfully!');

      // Download the image
      const imageName = `${story.slug}-generated.jpg`;
      const localImagePath = path.join(generatedDir, imageName);
      const downloadCommand = `curl -s -o "${localImagePath}" "${imageUrl}"`;

      // console.log('⬇️  Downloading image...');
      execSync(downloadCommand);
      // console.log(`📥 Image saved: ${imageName}`);

      // Update story with local image path
      story.imageUrl = `/assets/img/generated/${imageName}`;

      // Also update the image section metadata
      if (story.content && story.content.sections) {
        const imageSection = story.content.sections.find(
          section => section.type === 'image'
        );
        if (imageSection && imageSection.metadata) {
          imageSection.metadata.generated_image_url = imageUrl;
          imageSection.metadata.local_image_path = `/assets/img/generated/${imageName}`;
          imageSection.metadata.generation_timestamp = new Date().toISOString();
          imageSection.metadata.dall_e_model = 'dall-e-3';
        }
      }

      // Write updated story back to file
      fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
      // console.log('📝 Story file updated with new image path');

      // Add delay to respect rate limits
      if (index < total - 1) {
        // console.log('⏳ Waiting 3 seconds for rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else {
      console.error('❌ Unexpected API response:', result);
    }
  } catch (error) {
    console.error('❌ Error generating image:', error.message);

    if (error.message.includes('429')) {
      // console.log('⏳ Rate limit hit, waiting 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

async function generateAllImages() {
  // console.log(`🚀 Starting batch generation for ${storyFiles.length} stories...\n`);

  for (let i = 0; i < storyFiles.length; i++) {
    await generateImageForStory(storyFiles[i], i, storyFiles.length);
  }

  // console.log('\n🎉 Batch image generation complete!');
  // console.log('📁 Generated images saved to: public/assets/img/generated/');
  // console.log('✅ All story files updated with new image paths');
}

// Run the batch generation
generateAllImages().catch(console.error);
