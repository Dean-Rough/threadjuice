#!/usr/bin/env python
"""
Simple test to generate a ThreadJuice video without complex config
"""

import os
import sys
from pathlib import Path

# Add to path
sys.path.append(str(Path(__file__).parent))

# Load env vars
env_path = Path(__file__).parent.parent / '.env.local'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value.strip('"\'')

print("🎬 Simple ThreadJuice Video Test\n")

# 1. Get a story
print("1️⃣ Fetching story...")
from threadjuice.story_fetcher import ThreadJuiceFetcher

fetcher = ThreadJuiceFetcher()
story = fetcher.get_story_by_slug("when-free-comes-at-a-price-the-couchsurfing-horror-story")

if not story:
    print("❌ Story not found!")
    sys.exit(1)

print(f"✅ Got story: {story.title[:50]}...")
print(f"   Text length: {len(story.selftext)} chars")
print(f"   Comments: {len(story.comments)}")

# 2. Generate TTS audio using gTTS (simple!)
print("\n2️⃣ Generating audio...")
from gtts import gTTS
import tempfile

# Create temp directory for audio files
audio_dir = Path("assets/temp/when-free-comes-at-a-price-the-couchsurfing-horror-story/mp3")
audio_dir.mkdir(parents=True, exist_ok=True)

# Title audio
title_text = story.title
tts = gTTS(text=title_text, lang='en', slow=False)
title_path = audio_dir / "title.mp3"
tts.save(str(title_path))
print(f"✅ Created title audio: {title_path.name}")

# Story audio (first 500 chars for test)
story_text = story.selftext[:500] + "... Read the full story at threadjuice.com"
tts = gTTS(text=story_text, lang='en', slow=False)
story_path = audio_dir / "story.mp3"
tts.save(str(story_path))
print(f"✅ Created story audio: {story_path.name}")

# 3. Get Pexels video background
print("\n3️⃣ Getting video background...")
from threadjuice.pexels_videos import VideoSelector

selector = VideoSelector()
video_path = selector.select_video_for_story(story)

if video_path:
    print(f"✅ Got video: {video_path.name}")
else:
    print("⚠️ No video found, would use default")

# 4. Create simple screenshots
print("\n4️⃣ Creating screenshots...")
screenshots_dir = Path("assets/temp/when-free-comes-at-a-price-the-couchsurfing-horror-story/png")
screenshots_dir.mkdir(parents=True, exist_ok=True)

# We'll use Pillow to create simple text images
from PIL import Image, ImageDraw, ImageFont

def create_text_image(text, filename):
    # Create image
    img = Image.new('RGB', (1080, 1920), color='#1a1a1a')
    draw = ImageDraw.Draw(img)
    
    # ThreadJuice branding
    draw.text((540, 100), "ThreadJuice", fill='#FF6B00', anchor='mt', font=None)
    
    # Main text
    # Wrap text
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        if len(' '.join(current_line)) > 40:
            lines.append(' '.join(current_line[:-1]))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    # Draw lines
    y = 400
    for line in lines[:10]:  # Max 10 lines
        draw.text((540, y), line, fill='white', anchor='mt', font=None)
        y += 60
    
    # Save
    img.save(screenshots_dir / filename)
    return screenshots_dir / filename

# Create title screenshot
title_img = create_text_image(story.title, "title.png")
print(f"✅ Created title screenshot: {title_img.name}")

# Create story screenshot
story_img = create_text_image(story.selftext[:300] + "...", "story.png")
print(f"✅ Created story screenshot: {story_img.name}")

print("\n✨ Test complete!")
print("\nGenerated assets:")
print(f"  Audio: {audio_dir}")
print(f"  Screenshots: {screenshots_dir}")
if video_path:
    print(f"  Background: {video_path}")

print("\n💡 Next step would be to combine these with moviepy into a final video")
print("   But this test shows the core components are working!")