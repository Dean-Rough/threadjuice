#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// console.log('FIXING REDDIT COMMENTS - REMOVING FAKE SCORES & IMPROVING USERNAMES');
// console.log('━'.repeat(70));

// Get all story JSON files
const storyFiles = [
  'first-story-sister-fake-influencer-lifestyle-exposed.json',
  'new-story-boss-birthday-presentation-revenge.json',
  'test-short-story.json',
  'auto-generated-swiping-right-on-sweet-revenge-karma-strikes-back.json',
  'auto-generated-thanksgiving-exposes-instagram-lies.json',
  'auto-generated-office-tyrant-meets-his-match.json',
  'auto-generated-tinder-date-revenge-master-manipulator.json',
  'auto-generated-instagram-lies-cousin-exposed.json',
];

// Better realistic usernames
const betterUsernames = [
  'throwaway_2024',
  'RedditUser42',
  'anonymous_commenter',
  'longtime_lurker',
  'story_lover',
  'justice_seeker',
  'real_talk_only',
  'been_there_done_that',
  'relationship_veteran',
  'family_drama_queen',
  'workplace_survivor',
  'karma_believer',
  'dating_app_veteran',
  'social_media_detective',
  'truth_teller',
  'revenge_supporter',
  'life_experience',
  'similar_situation',
  'been_through_this',
  'family_issues',
  'dating_disasters',
  'workplace_stories',
  'justice_served',
  'reality_check',
];

function getRandomUsername() {
  return betterUsernames[Math.floor(Math.random() * betterUsernames.length)];
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
      '-pre-comment-fix-backup.json'
    );
    if (!fs.existsSync(backupName)) {
      fs.copyFileSync(filename, backupName);
      // console.log(`  ✓ Backup created: ${backupName}`);
    }

    // Read and parse story
    const storyContent = fs.readFileSync(filename, 'utf8');
    const story = JSON.parse(storyContent);

    let modified = false;

    // Process content sections
    if (story.content && story.content.sections) {
      story.content.sections.forEach((section, index) => {
        // Process comments sections
        if (
          (section.type === 'comments-1' || section.type === 'comments-2') &&
          section.metadata &&
          section.metadata.comments
        ) {
          // Update section title if it's the second comments section
          if (
            section.type === 'comments-2' &&
            section.title !== 'Controversial Comments'
          ) {
            section.title = 'Controversial Comments';
            section.content =
              'The most divisive takes (sorted by controversial):';
            // console.log(`  ✓ Updated section ${index + 1} to Controversial Comments`);
            modified = true;
          }

          section.metadata.comments.forEach((comment, commentIndex) => {
            // Remove score field entirely
            if (comment.score !== undefined) {
              delete comment.score;
              // console.log(`  ✓ Removed score from comment ${commentIndex + 1} in section ${index + 1}`);
              modified = true;
            }

            // Improve usernames if they look fake/unrealistic
            const originalAuthor = comment.author;
            if (
              originalAuthor.includes('User') ||
              originalAuthor.includes('Guru') ||
              originalAuthor.includes('Expert') ||
              originalAuthor.includes('Babe') ||
              originalAuthor.includes('Nancy') ||
              originalAuthor.includes('Veteran') ||
              originalAuthor.length < 5
            ) {
              comment.author = getRandomUsername();
              // console.log(`  ✓ Updated username: "${originalAuthor}" → "${comment.author}"`);
              modified = true;
            }

            // Remove replies field if it exists
            if (comment.replies !== undefined) {
              delete comment.replies;
              modified = true;
            }
          });
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

// console.log('━'.repeat(70));
// console.log('REDDIT COMMENTS FIXED');
// console.log('• Removed all fake vote scores');
// console.log('• Improved unrealistic usernames');
// console.log('• Updated second comment sections to "Controversial Comments"');
