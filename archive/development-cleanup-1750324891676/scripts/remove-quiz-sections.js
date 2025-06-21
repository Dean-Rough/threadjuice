#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// console.log('🗑️  REMOVING QUIZ SECTIONS FROM ALL STORIES');
// console.log('━'.repeat(50));

// Get all story files
const allStoryFiles = [
  'test-short-story.json',
  'new-story-boss-birthday-presentation-revenge.json',
  'first-story-sister-fake-influencer-lifestyle-exposed.json',
  'auto-generated-swiping-right-on-sweet-revenge-karma-strikes-back.json',
  'auto-generated-thanksgiving-exposes-instagram-lies.json',
  'auto-generated-office-tyrant-meets-his-match.json',
];

function removeQuizFromStory(filename) {
  // console.log(`\n🔄 Processing: ${filename}`);
  // console.log('─'.repeat(40));

  if (!fs.existsSync(filename)) {
    console.error(`❌ File not found: ${filename}`);
    return;
  }

  try {
    // Read existing story
    const storyData = fs.readFileSync(filename, 'utf8');
    const story = JSON.parse(storyData);

    // Check if story has quiz sections
    const hasQuiz = story.content.sections.some(
      section => section.type === 'quiz'
    );
    if (!hasQuiz) {
      // console.log('⏭️  No quiz section found, skipping...');
      return;
    }

    // Remove quiz sections
    const sectionsWithoutQuiz = story.content.sections.filter(
      section => section.type !== 'quiz'
    );

    const updatedStory = {
      ...story,
      content: {
        ...story.content,
        sections: sectionsWithoutQuiz,
      },
    };

    // Create backup
    const backupFilename = filename.replace(
      '.json',
      '-pre-quiz-removal-backup.json'
    );
    fs.writeFileSync(backupFilename, storyData);
    // console.log(`💾 Backup saved: ${backupFilename}`);

    // Write updated story
    fs.writeFileSync(filename, JSON.stringify(updatedStory, null, 2));
    // console.log(`✅ Quiz section removed`);
    // console.log(`📊 Sections: ${story.content.sections.length} → ${sectionsWithoutQuiz.length}`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

function removeAllQuizzes() {
  // console.log(`🚀 Processing ${allStoryFiles.length} story files...\n`);

  allStoryFiles.forEach(filename => {
    removeQuizFromStory(filename);
  });

  // console.log('\n🎉 QUIZ REMOVAL COMPLETE!');
  // console.log('━'.repeat(50));
  // console.log('✅ All quiz sections removed');
  // console.log('✅ Backup files created for safety');
  // console.log('✅ Stories now focus on core content');
  // console.log('✅ Ready for streamlined experience!');
}

// Run the removal
removeAllQuizzes();
