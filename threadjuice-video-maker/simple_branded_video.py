#!/usr/bin/env python
"""
Simple branded ThreadJuice video creator
"""

import os
import sys
from pathlib import Path
import textwrap

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

print("🎬 ThreadJuice Branded Video Creator\n")

from moviepy.editor import *
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from gtts import gTTS

def create_threadjuice_frame(title_text, story_text, frame_type="title"):
    """Create ThreadJuice branded frame"""
    
    # Canvas size (9:16 aspect ratio)
    width, height = 1080, 1920
    
    # Create dark background
    img = Image.new('RGB', (width, height), color='#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    # Try to load logo
    logo_loaded = False
    for logo_path in [
        Path("../public/assets/img/brand/1x/Logotype-White.png"),
        Path("../brand/Logo/1x/Logotype-White.png"),
        Path("../public/assets/img/logo/w_logo.png")
    ]:
        if logo_path.exists():
            try:
                logo = Image.open(logo_path).convert('RGBA')
                # Resize logo
                logo = logo.resize((250, int(250 * logo.height / logo.width)))
                # Create white background for logo if needed
                logo_bg = Image.new('RGB', logo.size, 'white')
                if logo.mode == 'RGBA':
                    logo_bg.paste(logo, mask=logo.split()[-1])
                else:
                    logo_bg = logo.convert('RGB')
                # Position logo
                logo_x = (width - logo.width) // 2
                img.paste(logo_bg, (logo_x, 60))
                logo_loaded = True
                break
            except Exception as e:
                print(f"⚠️  Logo error: {e}")
                continue
    
    if not logo_loaded:
        # Fallback: ThreadJuice text
        try:
            # Try to use a better font
            logo_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        except:
            logo_font = ImageFont.load_default()
        
        draw.text((width//2, 100), "ThreadJuice", fill='#FF6B00', anchor='mm', font=logo_font)
    
    # Load fonts for content
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
        story_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 44)
        caption_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    except:
        title_font = ImageFont.load_default()
        story_font = ImageFont.load_default()
        caption_font = ImageFont.load_default()
    
    if frame_type == "title":
        # Title frame
        y_start = 300
        
        # Create title with black background
        wrapped_title = textwrap.fill(title_text, width=18)
        lines = wrapped_title.split('\n')
        
        y_pos = y_start
        for line in lines:
            # Calculate text dimensions
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Black background rectangle
            padding = 30
            rect = [
                width//2 - text_width//2 - padding,
                y_pos - padding//2,
                width//2 + text_width//2 + padding,
                y_pos + text_height + padding//2
            ]
            draw.rectangle(rect, fill='#000000')
            
            # White text
            draw.text((width//2, y_pos), line, fill='white', anchor='mt', font=title_font)
            y_pos += text_height + 20
        
        # Viral badge
        badge_y = height - 180
        draw.rectangle([60, badge_y, 300, badge_y + 60], fill='#FF6B00')
        draw.text((180, badge_y + 30), "VIRAL STORY", fill='white', anchor='mm', font=caption_font)
        
    else:
        # Story frame
        y_start = 350
        
        # Story text with black background
        story_short = story_text[:350] + "..."
        wrapped_story = textwrap.fill(story_short, width=22)
        lines = wrapped_story.split('\n')
        
        y_pos = y_start
        for line in lines[:6]:  # Max 6 lines
            if line.strip():
                bbox = draw.textbbox((0, 0), line, font=story_font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Black background
                padding = 25
                rect = [
                    width//2 - text_width//2 - padding,
                    y_pos - padding//2,
                    width//2 + text_width//2 + padding,
                    y_pos + text_height + padding//2
                ]
                draw.rectangle(rect, fill='#000000')
                
                # White text
                draw.text((width//2, y_pos), line, fill='white', anchor='mt', font=story_font)
                y_pos += text_height + 25
        
        # Call to action
        cta_y = height - 200
        draw.rectangle([width//2 - 180, cta_y, width//2 + 180, cta_y + 60], fill='#FF6B00')
        draw.text((width//2, cta_y + 30), "Read Full Story", fill='white', anchor='mm', font=caption_font)
        
        # Website
        draw.text((width//2, cta_y + 100), "threadjuice.com", fill='#FF6B00', anchor='mm', font=caption_font)
    
    return img

def add_captions_to_frame(frame, text, t, duration):
    """Add moving captions to frame"""
    # Convert PIL to numpy
    frame_array = np.array(frame)
    
    # Simple caption overlay
    words = text.split()
    if len(words) > 0:
        words_per_second = len(words) / duration
        current_word = min(int(t * words_per_second), len(words) - 1)
        
        # Show 6 words around current word
        start_idx = max(0, current_word - 3)
        end_idx = min(len(words), start_idx + 6)
        caption_text = ' '.join(words[start_idx:end_idx])
        
        # Create caption overlay
        caption_img = Image.new('RGB', (1080, 120), color='#000000')
        caption_draw = ImageDraw.Draw(caption_img)
        
        try:
            caption_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        except:
            caption_font = ImageFont.load_default()
        
        # Wrap caption
        wrapped_caption = textwrap.fill(caption_text, width=25)
        caption_lines = wrapped_caption.split('\n')
        
        y_pos = 20
        for line in caption_lines[:2]:  # Max 2 lines
            caption_draw.text((540, y_pos), line, fill='white', anchor='mt', font=caption_font)
            y_pos += 40
        
        # Overlay caption on frame
        caption_array = np.array(caption_img)
        frame_array[1700:1820, :] = caption_array
    
    return frame_array

def create_branded_video(story_slug):
    """Create simple branded video"""
    
    print("1️⃣ Getting story...")
    
    # Get story
    from threadjuice.story_fetcher import ThreadJuiceFetcher
    fetcher = ThreadJuiceFetcher()
    story = fetcher.get_story_by_slug(story_slug)
    
    if not story:
        print("❌ Story not found!")
        return None
    
    print(f"✅ Story: {story.title[:50]}...")
    
    print("\n2️⃣ Creating branded images...")
    
    # Create frames
    title_frame = create_threadjuice_frame(story.title, "", "title")
    story_frame = create_threadjuice_frame(story.title, story.selftext, "story")
    
    # Save frames
    assets_dir = Path(f"assets/temp/{story_slug}")
    assets_dir.mkdir(parents=True, exist_ok=True)
    
    title_path = assets_dir / "title_branded.png"
    story_path = assets_dir / "story_branded.png"
    
    title_frame.save(title_path)
    story_frame.save(story_path)
    
    print("✅ Created branded frames")
    
    print("\n3️⃣ Generating audio...")
    
    # Create audio
    title_text = f"{story.title}"
    story_text = story.selftext[:400] + "... Visit ThreadJuice dot com for the full story!"
    
    title_tts = gTTS(text=title_text, lang='en', slow=False)
    story_tts = gTTS(text=story_text, lang='en', slow=False)
    
    title_audio_path = assets_dir / "title.mp3"
    story_audio_path = assets_dir / "story.mp3"
    
    title_tts.save(str(title_audio_path))
    story_tts.save(str(story_audio_path))
    
    print("✅ Generated audio files")
    
    print("\n4️⃣ Getting background...")
    
    # Get background
    from threadjuice.pexels_videos import VideoSelector
    selector = VideoSelector()
    bg_path = selector.select_video_for_story(story)
    
    print(f"✅ Background: {bg_path.name if bg_path else 'solid color'}")
    
    print("\n5️⃣ Creating video...")
    
    # Load audio
    title_audio = AudioFileClip(str(title_audio_path))
    story_audio = AudioFileClip(str(story_audio_path))
    
    # Create title sequence
    title_clip = ImageClip(str(title_path)).set_duration(title_audio.duration)
    
    # Create story sequence  
    story_clip = ImageClip(str(story_path)).set_duration(story_audio.duration)
    
    # Add background if available
    if bg_path and bg_path.exists():
        bg_video = VideoFileClip(str(bg_path))
        total_duration = title_audio.duration + story_audio.duration
        
        # Loop and crop background
        if bg_video.duration < total_duration:
            loops = int(total_duration / bg_video.duration) + 1
            bg_video = concatenate_videoclips([bg_video] * loops)
        
        bg_video = bg_video.resize(height=1920).crop(x_center=bg_video.w/2, width=1080)
        bg_video = bg_video.subclip(0, total_duration).set_opacity(0.3)  # Dim background
        
        # Title with background
        title_with_bg = CompositeVideoClip([
            bg_video.subclip(0, title_audio.duration),
            title_clip.set_opacity(1.0)
        ]).set_audio(title_audio)
        
        # Story with background
        story_with_bg = CompositeVideoClip([
            bg_video.subclip(title_audio.duration, total_duration),
            story_clip.set_opacity(1.0)
        ]).set_audio(story_audio)
        
        final_video = concatenate_videoclips([title_with_bg, story_with_bg])
        
    else:
        # No background - just frames
        title_clip = title_clip.set_audio(title_audio)
        story_clip = story_clip.set_audio(story_audio)
        final_video = concatenate_videoclips([title_clip, story_clip])
    
    print("\n6️⃣ Exporting...")
    
    # Export
    results_dir = Path("results")
    results_dir.mkdir(exist_ok=True)
    output_path = results_dir / f"ThreadJuice_Branded_{story_slug}.mp4"
    
    final_video.write_videofile(
        str(output_path),
        fps=24,
        codec='libx264',
        audio_codec='aac',
        verbose=False,
        logger=None
    )
    
    print(f"\n🎉 Branded video created!")
    print(f"📹 {output_path}")
    print(f"📊 {output_path.stat().st_size / (1024*1024):.1f} MB")
    print(f"⏱️  {final_video.duration:.1f}s")
    
    # Cleanup
    final_video.close()
    title_audio.close()
    story_audio.close()
    if bg_path:
        bg_video.close()
    
    return output_path

if __name__ == "__main__":
    story_slug = "when-free-comes-at-a-price-the-couchsurfing-horror-story"
    create_branded_video(story_slug)