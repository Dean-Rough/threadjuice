#!/usr/bin/env python
"""
Improved ThreadJuice Video Creator with proper branding and styling
"""

import os
import sys
from pathlib import Path
import textwrap
import re

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

print("🎬 ThreadJuice Video Creator v2.0\n")

from moviepy.editor import *
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from gtts import gTTS
import tempfile

def download_geist_font():
    """Download Geist font if not available"""
    font_dir = Path("assets/fonts")
    font_dir.mkdir(parents=True, exist_ok=True)
    
    font_path = font_dir / "Geist-Black.ttf"
    
    if not font_path.exists():
        print("⬇️  Downloading Geist font...")
        import urllib.request
        try:
            urllib.request.urlretrieve(
                "https://github.com/vercel/geist-font/raw/main/packages/next/src/fonts/geist-sans/Geist-Black.ttf",
                font_path
            )
            print("✅ Downloaded Geist-Black.ttf")
        except:
            print("⚠️  Could not download Geist font, using default")
            return None
    
    return str(font_path)

def create_branded_image(title_text, story_text, image_type="title"):
    """Create ThreadJuice branded image with proper styling"""
    
    # Canvas size (9:16 aspect ratio)
    width, height = 1080, 1920
    
    # Create image with ThreadJuice dark background
    img = Image.new('RGB', (width, height), color='#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    # Try to load Geist font
    font_path = download_geist_font()
    
    try:
        # Load ThreadJuice logo
        logo_path = Path("../public/assets/img/brand/1x/Logotype-White.png")
        if not logo_path.exists():
            logo_path = Path("../brand/Logo/1x/Logotype-White.png")
        
        if logo_path.exists():
            logo = Image.open(logo_path)
            # Resize logo
            logo = logo.resize((300, int(300 * logo.height / logo.width)))
            # Position logo at top
            logo_x = (width - logo.width) // 2
            img.paste(logo, (logo_x, 80), logo if logo.mode == 'RGBA' else None)
        else:
            # Fallback text logo
            try:
                logo_font = ImageFont.truetype(font_path, 60) if font_path else ImageFont.load_default()
            except:
                logo_font = ImageFont.load_default()
            draw.text((width//2, 120), "ThreadJuice", fill='#FF6B00', anchor='mm', font=logo_font)
    except Exception as e:
        print(f"⚠️  Logo error: {e}")
        # Fallback text logo
        draw.text((width//2, 120), "ThreadJuice", fill='#FF6B00', anchor='mm')
    
    # Load fonts
    try:
        title_font = ImageFont.truetype(font_path, 72) if font_path else ImageFont.load_default()
        story_font = ImageFont.truetype(font_path, 48) if font_path else ImageFont.load_default()
        caption_font = ImageFont.truetype(font_path, 36) if font_path else ImageFont.load_default()
    except:
        title_font = ImageFont.load_default()
        story_font = ImageFont.load_default()
        caption_font = ImageFont.load_default()
    
    if image_type == "title":
        # Title screen
        y_pos = 300
        
        # Wrap title text
        wrapped_title = textwrap.fill(title_text, width=20)
        title_lines = wrapped_title.split('\n')
        
        # Create black semi-transparent background for text
        for line in title_lines:
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Black background with padding
            padding = 30
            bg_rect = [
                width//2 - text_width//2 - padding,
                y_pos - padding,
                width//2 + text_width//2 + padding,
                y_pos + text_height + padding
            ]
            
            # Draw black background with rounded corners (simulation)
            draw.rectangle(bg_rect, fill='#000000aa')
            
            # Draw text
            draw.text((width//2, y_pos), line, fill='white', anchor='mt', font=title_font)
            y_pos += text_height + 40
        
        # Add trending badge
        badge_y = height - 200
        draw.rectangle([40, badge_y, 320, badge_y + 60], fill='#FF6B00')
        draw.text((180, badge_y + 30), "VIRAL STORY", fill='white', anchor='mm', font=caption_font)
        
    else:
        # Story screen with captions
        y_pos = 350
        
        # Wrap story text for better readability
        wrapped_story = textwrap.fill(story_text[:400] + "...", width=25)
        story_lines = wrapped_story.split('\n')
        
        for line in story_lines[:8]:  # Max 8 lines
            if line.strip():
                bbox = draw.textbbox((0, 0), line, font=story_font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Black background with padding
                padding = 25
                bg_rect = [
                    width//2 - text_width//2 - padding,
                    y_pos - padding//2,
                    width//2 + text_width//2 + padding,
                    y_pos + text_height + padding//2
                ]
                
                # Draw black background
                draw.rectangle(bg_rect, fill='#000000cc')
                
                # Draw text
                draw.text((width//2, y_pos), line, fill='white', anchor='mt', font=story_font)
                y_pos += text_height + 35
        
        # Add "Read Full Story" CTA
        cta_y = height - 150
        draw.rectangle([width//2 - 200, cta_y, width//2 + 200, cta_y + 80], fill='#FF6B00')
        draw.text((width//2, cta_y + 40), "Read Full Story", fill='white', anchor='mm', font=caption_font)
        draw.text((width//2, cta_y + 100), "threadjuice.com", fill='#FF6B00', anchor='mm', font=caption_font)
    
    return img

def create_caption_overlay(text, duration, font_path=None):
    """Create animated caption overlay for the video"""
    
    def make_frame(t):
        # Create transparent image for overlay
        img = Image.new('RGBA', (1080, 200), color=(0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        try:
            font = ImageFont.truetype(font_path, 40) if font_path else ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Highlight current words being spoken
        words = text.split()
        words_per_second = len(words) / duration
        current_word_index = min(int(t * words_per_second), len(words) - 1)
        
        # Show 8 words at a time with current word highlighted
        start_idx = max(0, current_word_index - 4)
        end_idx = min(len(words), start_idx + 8)
        visible_words = words[start_idx:end_idx]
        
        # Create caption text with highlight
        caption_text = ' '.join(visible_words)
        
        # Wrap text
        wrapped = textwrap.fill(caption_text, width=30)
        lines = wrapped.split('\n')
        
        y_pos = 50
        for line in lines:
            # Black background for readability
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            bg_rect = [
                540 - text_width//2 - 20,
                y_pos - 10,
                540 + text_width//2 + 20,
                y_pos + text_height + 10
            ]
            
            draw.rectangle(bg_rect, fill=(0, 0, 0, 200))
            draw.text((540, y_pos), line, fill='white', anchor='mt', font=font)
            y_pos += text_height + 5
        
        return np.array(img)
    
    return VideoClip(make_frame, duration=duration)

def create_improved_video(story_slug):
    """Create improved ThreadJuice video with proper branding"""
    
    print("1️⃣ Getting story and assets...")
    
    # Get story
    from threadjuice.story_fetcher import ThreadJuiceFetcher
    fetcher = ThreadJuiceFetcher()
    story = fetcher.get_story_by_slug(story_slug)
    
    if not story:
        print("❌ Story not found!")
        return None
    
    # Paths
    assets_dir = Path(f"assets/temp/{story_slug}")
    audio_dir = assets_dir / "mp3"
    screenshots_dir = assets_dir / "png"
    audio_dir.mkdir(parents=True, exist_ok=True)
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"✅ Story: {story.title[:50]}...")
    
    print("\n2️⃣ Creating branded visuals...")
    
    # Create improved branded images
    title_img = create_branded_image(story.title, "", "title")
    story_img = create_branded_image(story.title, story.selftext, "story")
    
    # Save images
    title_path = screenshots_dir / "title_branded.png"
    story_path = screenshots_dir / "story_branded.png"
    title_img.save(title_path)
    story_img.save(story_path)
    
    print("✅ Created branded title image")
    print("✅ Created branded story image")
    
    print("\n3️⃣ Generating audio with captions...")
    
    # Create better audio
    title_text = f"ThreadJuice presents: {story.title}"
    story_text = story.selftext[:500] + "... Visit ThreadJuice dot com for the full story!"
    
    # Generate TTS
    title_tts = gTTS(text=title_text, lang='en', slow=False)
    story_tts = gTTS(text=story_text, lang='en', slow=False)
    
    title_audio_path = audio_dir / "title_branded.mp3"
    story_audio_path = audio_dir / "story_branded.mp3"
    
    title_tts.save(str(title_audio_path))
    story_tts.save(str(story_audio_path))
    
    print("✅ Generated title audio with intro")
    print("✅ Generated story audio with CTA")
    
    print("\n4️⃣ Getting background video...")
    
    # Get background video
    from threadjuice.pexels_videos import VideoSelector
    selector = VideoSelector()
    bg_video_path = selector.select_video_for_story(story)
    
    if not bg_video_path:
        print("⚠️  No background video, using black background")
        bg_video_path = None
    else:
        print(f"✅ Background: {bg_video_path.name}")
    
    print("\n5️⃣ Composing final video...")
    
    # Load audio clips
    title_audio = AudioFileClip(str(title_audio_path))
    story_audio = AudioFileClip(str(story_audio_path))
    total_duration = title_audio.duration + story_audio.duration
    
    # Load images as video clips
    title_clip = ImageClip(str(title_path)).set_duration(title_audio.duration)
    story_clip = ImageClip(str(story_path)).set_duration(story_audio.duration)
    
    # Prepare background
    if bg_video_path and bg_video_path.exists():
        bg_video = VideoFileClip(str(bg_video_path))
        
        # Loop if needed
        if bg_video.duration < total_duration:
            loops = int(total_duration / bg_video.duration) + 1
            bg_video = concatenate_videoclips([bg_video] * loops)
        
        # Crop to vertical and trim
        bg_video = bg_video.resize(height=1920).crop(x_center=bg_video.w/2, width=1080)
        bg_video = bg_video.subclip(0, total_duration)
        
        # Blur background slightly for better text readability
        bg_video = bg_video.fl_image(lambda image: np.array(
            Image.fromarray(image).filter(ImageFilter.GaussianBlur(radius=2))
        ))
        
    else:
        # Solid background
        bg_video = ColorClip(size=(1080, 1920), color=(10, 10, 10), duration=total_duration)
    
    # Create caption overlays
    font_path = download_geist_font()
    title_captions = create_caption_overlay(title_text, title_audio.duration, font_path)
    story_captions = create_caption_overlay(story_text, story_audio.duration, font_path)
    
    # Compose title sequence
    title_sequence = CompositeVideoClip([
        bg_video.subclip(0, title_audio.duration),
        title_clip.set_position('center').set_opacity(0.95),
        title_captions.set_position(('center', 1600))  # Bottom captions
    ]).set_audio(title_audio)
    
    # Compose story sequence
    story_sequence = CompositeVideoClip([
        bg_video.subclip(title_audio.duration, total_duration),
        story_clip.set_position('center').set_opacity(0.95),
        story_captions.set_position(('center', 1600))  # Bottom captions
    ]).set_audio(story_audio)
    
    # Final video
    final_video = concatenate_videoclips([title_sequence, story_sequence])
    
    print("\n6️⃣ Exporting branded video...")
    
    # Export
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)
    output_path = results_dir / f"ThreadJuice_Branded_{story_slug}.mp4"
    
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
    
    print(f"\n🎉 Branded video created!")
    print(f"📹 Location: {output_path}")
    print(f"📊 Size: {output_path.stat().st_size / (1024*1024):.1f} MB")
    print(f"⏱️  Duration: {final_video.duration:.1f} seconds")
    print(f"🎨 Features: ThreadJuice logo, Geist font, captions, black backgrounds")
    
    # Cleanup
    final_video.close()
    title_audio.close()
    story_audio.close()
    if bg_video_path:
        bg_video.close()
    
    return output_path

if __name__ == "__main__":
    story_slug = "when-free-comes-at-a-price-the-couchsurfing-horror-story"
    create_improved_video(story_slug)