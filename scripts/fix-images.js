#!/usr/bin/env node

/**
 * Fix broken Unsplash image URLs in generated stories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image mapping for categories
const imageMapping = {
  "Tech Drama": "/assets/img/technology/tech_01.jpg",
  "Workplace Drama": "/assets/img/blog/blog15.jpg", 
  "Food Wars": "/assets/img/lifestyle/life_style05.jpg",
  "Relationship Drama": "/assets/img/blog/blog08.jpg",
  "Internet Culture": "/assets/img/blog/blog12.jpg"
};

const defaultImage = "/assets/img/blog/blog01.jpg";

function fixImageUrl(category) {
  return imageMapping[category] || defaultImage;
}

function fixStoryImages() {
  const dataDir = path.join(__dirname, '..', 'data', 'generated-stories');
  
  if (!fs.existsSync(dataDir)) {
    console.log('No stories directory found');
    return;
  }
  
  const storyFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  
  console.log(`🔧 FIXING IMAGES IN ${storyFiles.length} STORIES`);
  console.log('======================================');
  
  let fixedCount = 0;
  
  storyFiles.forEach(filename => {
    const filepath = path.join(dataDir, filename);
    const story = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Check if story has Unsplash URL
    if (story.imageUrl && story.imageUrl.includes('images.unsplash.com')) {
      const oldUrl = story.imageUrl;
      story.imageUrl = fixImageUrl(story.category);
      
      fs.writeFileSync(filepath, JSON.stringify(story, null, 2));
      
      console.log(`✅ ${story.title}`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${story.imageUrl}`);
      console.log('');
      
      fixedCount++;
    } else {
      console.log(`⏭️  ${story.title} - already using local images`);
    }
  });
  
  console.log(`🎉 FIXED ${fixedCount} STORIES`);
  console.log('Images now point to local assets that won\'t break');
}

fixStoryImages();