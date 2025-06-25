#!/usr/bin/env python
"""
Create a complete ThreadJuice video using the generated assets
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

print("🎬 Creating Complete ThreadJuice Video\n")

from moviepy.editor import *
import numpy as np

# Paths from our simple test
story_slug = "when-free-comes-at-a-price-the-couchsurfing-horror-story"
assets_dir = Path(f"assets/temp/{story_slug}")
audio_dir = assets_dir / "mp3"
screenshots_dir = assets_dir / "png"
background_video = Path(f"assets/backgrounds/pexels/{story_slug}_3617005.mp4")

# Check if assets exist
if not all([
    (audio_dir / "title.mp3").exists(),
    (audio_dir / "story.mp3").exists(),
    (screenshots_dir / "title.png").exists(),
    (screenshots_dir / "story.png").exists(),
    background_video.exists()
]):
    print("❌ Missing assets! Run simple_test.py first")
    sys.exit(1)

print("1️⃣ Loading assets...")

# Load audio
title_audio = AudioFileClip(str(audio_dir / "title.mp3"))
story_audio = AudioFileClip(str(audio_dir / "story.mp3"))

# Load images
title_img = ImageClip(str(screenshots_dir / "title.png")).set_duration(title_audio.duration)
story_img = ImageClip(str(screenshots_dir / "story.png")).set_duration(story_audio.duration)

# Load background video
bg_video = VideoFileClip(str(background_video))

print(f"✅ Title audio: {title_audio.duration:.1f}s")
print(f"✅ Story audio: {story_audio.duration:.1f}s") 
print(f"✅ Background video: {bg_video.duration:.1f}s")

print("\n2️⃣ Creating video composition...")

# Calculate total duration
total_duration = title_audio.duration + story_audio.duration

# Prepare background - loop if needed
if bg_video.duration < total_duration:
    # Loop the background video
    loops_needed = int(total_duration / bg_video.duration) + 1
    bg_video = concatenate_videoclips([bg_video] * loops_needed)

# Trim background to exact duration
bg_video = bg_video.subclip(0, total_duration)

# Resize background to vertical (9:16 aspect ratio)
bg_video = bg_video.resize(height=1920).crop(x_center=bg_video.w/2, width=1080)

# Create title sequence
title_sequence = CompositeVideoClip([
    bg_video.subclip(0, title_audio.duration),
    title_img.set_position('center').set_opacity(0.9)
]).set_audio(title_audio)

# Create story sequence  
story_sequence = CompositeVideoClip([
    bg_video.subclip(title_audio.duration, total_duration),
    story_img.set_position('center').set_opacity(0.9)
]).set_audio(story_audio)

print("✅ Composed title sequence")
print("✅ Composed story sequence")

print("\n3️⃣ Combining sequences...")

# Combine sequences
final_video = concatenate_videoclips([title_sequence, story_sequence])

print(f"✅ Final video duration: {final_video.duration:.1f}s")

print("\n4️⃣ Exporting video...")

# Create results directory
results_dir = Path("results")
results_dir.mkdir(exist_ok=True)

# Export video
output_path = results_dir / f"ThreadJuice_{story_slug}_test.mp4"

final_video.write_videofile(
    str(output_path),
    fps=24,
    codec='libx264',
    audio_codec='aac',
    temp_audiofile='temp-audio.m4a',
    remove_temp=True,
    verbose=False,
    logger=None
)

print(f"\n🎉 Video created successfully!")
print(f"📹 Location: {output_path}")
print(f"📊 Size: {output_path.stat().st_size / (1024*1024):.1f} MB")
print(f"⏱️  Duration: {final_video.duration:.1f} seconds")

# Clean up
final_video.close()
title_audio.close()
story_audio.close()
bg_video.close()