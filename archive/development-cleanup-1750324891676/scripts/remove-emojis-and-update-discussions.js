#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// console.log('REMOVING EMOJIS AND UPDATING DISCUSSION SECTIONS');
// console.log('━'.repeat(60));

// Get all story JSON files
const storyFiles = [
  'first-story-sister-fake-influencer-lifestyle-exposed.json',
  'new-story-boss-birthday-presentation-revenge.json',
  'test-short-story.json',
  'auto-generated-swiping-right-on-sweet-revenge-karma-strikes-back.json',
  'auto-generated-thanksgiving-exposes-instagram-lies.json',
  'auto-generated-office-tyrant-meets-his-match.json',
];

function removeEmojis(text) {
  if (typeof text !== 'string') return text;

  // Remove emojis but keep basic punctuation and symbols
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ''
    )
    .trim();
}

function processStory(filename) {
  if (!fs.existsSync(filename)) {
    // console.log(`Skipping ${filename} (file not found)`);
    return;
  }

  // console.log(`Processing ${filename}...`);

  try {
    // Create backup
    const backupName = filename.replace(
      '.json',
      '-pre-emoji-removal-backup.json'
    );
    if (!fs.existsSync(backupName)) {
      fs.copyFileSync(filename, backupName);
      // console.log(`  ✓ Backup created: ${backupName}`);
    }

    // Read and parse story
    const storyContent = fs.readFileSync(filename, 'utf8');
    const story = JSON.parse(storyContent);

    let modified = false;

    // Remove emojis from title
    const originalTitle = story.title;
    story.title = removeEmojis(story.title);
    if (story.title !== originalTitle) {
      // console.log(`  ✓ Title updated: "${originalTitle}" → "${story.title}"`);
      modified = true;
    }

    // Remove emojis from excerpt
    const originalExcerpt = story.excerpt;
    story.excerpt = removeEmojis(story.excerpt);
    if (story.excerpt !== originalExcerpt) {
      // console.log(`  ✓ Excerpt updated`);
      modified = true;
    }

    // Process content sections
    if (story.content && story.content.sections) {
      story.content.sections.forEach((section, index) => {
        // Update discussion section titles
        if (
          section.type === 'discussion' &&
          section.title === 'ThreadJuice Deep Dive'
        ) {
          section.title = 'What Really Happened';
          // console.log(`  ✓ Discussion section ${index + 1} title updated`);
          modified = true;
        }

        // Remove emojis from section titles
        if (section.title) {
          const originalSectionTitle = section.title;
          section.title = removeEmojis(section.title);
          if (section.title !== originalSectionTitle) {
            // console.log(`  ✓ Section ${index + 1} title updated`);
            modified = true;
          }
        }

        // Remove emojis from section content
        if (section.content) {
          const originalContent = section.content;
          section.content = removeEmojis(section.content);
          if (section.content !== originalContent) {
            // console.log(`  ✓ Section ${index + 1} content updated`);
            modified = true;
          }
        }

        // Process comments if present
        if (section.metadata && section.metadata.comments) {
          section.metadata.comments.forEach((comment, commentIndex) => {
            const originalCommentContent = comment.content;
            comment.content = removeEmojis(comment.content);
            if (comment.content !== originalCommentContent) {
              // console.log(`  ✓ Comment ${commentIndex + 1} in section ${index + 1} updated`);
              modified = true;
            }
          });
        }

        // Process quotes if present
        if (section.type === 'quotes' && section.content) {
          const originalQuoteContent = section.content;
          section.content = removeEmojis(section.content);
          if (section.content !== originalQuoteContent) {
            // console.log(`  ✓ Quote content updated`);
            modified = true;
          }
        }
      });
    }

    // Save updated story
    if (modified) {
      fs.writeFileSync(filename, JSON.stringify(story, null, 2));
      // console.log(`  ✓ ${filename} updated successfully`);
    } else {
      // console.log(`  • No changes needed for ${filename}`);
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filename}:`, error.message);
  }
}

// Process all story files
storyFiles.forEach(processStory);

// console.log('━'.repeat(60));
// console.log('EMOJI REMOVAL AND DISCUSSION UPDATE COMPLETE');
// console.log('All stories now have clean text and updated discussion sections');
