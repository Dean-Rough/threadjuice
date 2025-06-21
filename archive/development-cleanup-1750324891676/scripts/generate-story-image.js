#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if story file is provided
if (process.argv.length < 3) {
  // console.log('Usage: node generate-story-image.js <story-file.json>');
  // console.log('Example: node generate-story-image.js test-short-story.json');
  process.exit(1);
}

const storyFile = process.argv[2];
const storyPath = path.join(process.cwd(), storyFile);

// Check if story file exists
if (!fs.existsSync(storyPath)) {
  console.error(`❌ Story file not found: ${storyFile}`);
  process.exit(1);
}

// Read and parse story
let story;
try {
  const storyData = fs.readFileSync(storyPath, 'utf8');
  story = JSON.parse(storyData);
} catch (error) {
  console.error(`❌ Error reading story file: ${error.message}`);
  process.exit(1);
}

// Check for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY environment variable not set');
  console.error('Set it with: export OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Generate the prompt
const storyPrompt = `Generate a high-resolution, cinematic-style, landscape viral thumbnail image for a TikTok or YouTube storytime video. The image should visually dramatize the following story with clickbait energy but retain quality and realism (no cartoon or AI-cheap vibes). No text. Keep the composition clean and emotionally expressive—ideal for a page header. Use dynamic lighting, sharp focus on facial expressions. Maintain a horizontal format and editorial polish, like a movie still. This is the story summary: ${story.title} - ${story.excerpt}`;

// Create the curl command
const curlCommand = `curl https://api.openai.com/v1/images/generations \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "dall-e-3",
    "prompt": "${storyPrompt.replace(/"/g, '\\"')}",
    "n": 1,
    "response_format": "url",
    "size": "1792x1024",
    "quality": "hd",
    "style": "vivid"
  }'`;

// console.log('🎨 Generating image for story:', story.title);
// console.log('📝 Using prompt:', storyPrompt);
// console.log('\n🚀 Executing DALL-E 3 request...\n');

// Execute the curl command
const { execSync } = require('child_process');

try {
  const response = execSync(curlCommand, { encoding: 'utf8' });
  const result = JSON.parse(response);

  if (result.error) {
    console.error('❌ OpenAI API Error:', result.error.message);
    process.exit(1);
  }

  if (result.data && result.data[0] && result.data[0].url) {
    const imageUrl = result.data[0].url;
    // console.log('✅ Image generated successfully!');
    // console.log('🖼️  Image URL:', imageUrl);

    // Update the story file with the new image URL
    story.imageUrl = imageUrl;

    // Also update the image section if it exists
    if (story.content && story.content.sections) {
      const imageSection = story.content.sections.find(
        section => section.type === 'image'
      );
      if (imageSection && imageSection.metadata) {
        imageSection.metadata.generated_image_url = imageUrl;
        imageSection.metadata.generation_timestamp = new Date().toISOString();
      }
    }

    // Write updated story back to file
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    // console.log('📝 Story file updated with new image URL');

    // Generate download command for the image
    const imageName = `${story.slug}-generated.jpg`;
    const downloadCommand = `curl -o "${imageName}" "${imageUrl}"`;
    // console.log('\n📥 To download the image locally, run:');
    // console.log(downloadCommand);

    // Optionally auto-download
    // console.log('\n⬇️  Auto-downloading image...');
    try {
      execSync(downloadCommand);
      // console.log(`✅ Image saved as: ${imageName}`);

      // Update story to use local image path
      story.imageUrl = `/assets/img/generated/${imageName}`;
      fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
      // console.log('📝 Story updated to use local image path');
    } catch (downloadError) {
      // console.log('⚠️  Auto-download failed, but URL is saved in story file');
    }
  } else {
    console.error('❌ Unexpected API response:', result);
  }
} catch (error) {
  console.error('❌ Error executing request:', error.message);

  // Check for common issues
  if (error.message.includes('curl: command not found')) {
    console.error('💡 curl is not installed. Please install curl first.');
  } else if (error.message.includes('401')) {
    console.error('💡 Invalid API key. Check your OPENAI_API_KEY.');
  } else if (error.message.includes('429')) {
    console.error('💡 Rate limit exceeded. Wait a moment and try again.');
  }
}
