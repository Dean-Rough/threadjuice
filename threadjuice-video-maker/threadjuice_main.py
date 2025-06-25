#!/usr/bin/env python
"""
ThreadJuice Video Maker
Based on RedditVideoMakerBot, adapted for ThreadJuice stories
"""

import os
import sys
from pathlib import Path
from typing import Optional

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from threadjuice.story_fetcher import ThreadJuiceFetcher, ThreadJuiceStory
from threadjuice.pexels_videos import VideoSelector
from utils import settings
from utils.console import print_markdown, print_step, print_substep
from video_creation.background import chop_background, download_background_video
from video_creation.final_video import make_final_video
from video_creation.screenshot_downloader import get_screenshots_of_reddit_posts
from video_creation.voices import save_text_to_mp3

# ThreadJuice branding
print("""
████████╗██╗  ██╗██████╗ ███████╗ █████╗ ██████╗      ██╗██╗   ██╗██╗ ██████╗███████╗
╚══██╔══╝██║  ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗     ██║██║   ██║██║██╔════╝██╔════╝
   ██║   ███████║██████╔╝█████╗  ███████║██║  ██║     ██║██║   ██║██║██║     █████╗  
   ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══██║██║  ██║██   ██║██║   ██║██║██║     ██╔══╝  
   ██║   ██║  ██║██║  ██║███████╗██║  ██║██████╔╝╚█████╔╝╚██████╔╝██║╚██████╗███████╗
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝  ╚════╝  ╚═════╝ ╚═╝ ╚═════╝╚══════╝
   
   🎬 Video Maker - Transform viral stories into engaging videos
""")


def load_env_vars():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / '.env.local'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"\'')
                    

def create_threadjuice_video(story_slug: Optional[str] = None, use_pexels: bool = True):
    """
    Main function to create a video from a ThreadJuice story
    
    Args:
        story_slug: Specific story slug to use, or None for latest
        use_pexels: Whether to use Pexels for dynamic backgrounds
    """
    print_step("Setting up ThreadJuice Video Maker...")
    
    # Load environment variables
    load_env_vars()
    
    # Initialize fetcher
    fetcher = ThreadJuiceFetcher()
    
    # Get story
    print_step("Fetching ThreadJuice story...")
    if story_slug:
        story = fetcher.get_story_by_slug(story_slug)
        if not story:
            print(f"❌ Story with slug '{story_slug}' not found")
            return
    else:
        story = fetcher.get_latest_story()
        if not story:
            print("❌ No stories found in database")
            return
            
    print_substep(f"✅ Found story: {story.title}")
    print_substep(f"   Category: {story.data.get('category')}")
    print_substep(f"   Engagement: {story.score} upvotes, {story.num_comments} comments")
    
    # Prepare video background
    print_step("Selecting video background...")
    
    if use_pexels:
        video_selector = VideoSelector()
        background_path = video_selector.select_video_for_story(story)
        
        if background_path:
            print_substep(f"✅ Using relevant Pexels video: {background_path.name}")
            # Update settings to use this video
            # Update background video in settings
            if not hasattr(settings, 'background_video'):
                settings.background_video = str(background_path)
            # For compatibility with existing code
            os.environ['BACKGROUND_VIDEO'] = str(background_path)
        else:
            print_substep("⚠️ No relevant video found, using default Minecraft")
            if not hasattr(settings, 'background_video'):
                settings.background_video = 'minecraft'
            os.environ['BACKGROUND_VIDEO'] = 'minecraft'
    else:
        print_substep("Using default Minecraft background")
        settings.config['settings']['background']['background_video'] = 'minecraft'
    
    # Convert story to Reddit format for compatibility
    reddit_object = {
        'thread_id': story.data.get('slug', 'story'),
        'thread_title': story.title,
        'thread_author': story.author,
        'thread_content': story.selftext,
        'thread_subreddit': story.subreddit,
        'thread_upvotes': story.score,
        'thread_permalink': story.permalink,
        'thread_url': story.url,
        'comments': [
            {
                'comment_id': f'comment_{i}',
                'comment_body': comment['body'],
                'comment_author': comment['author'],
                'comment_score': comment['score']
            }
            for i, comment in enumerate(story.comments[:3])  # Top 3 comments
        ]
    }
    
    # Generate audio
    print_step("Generating voiceover...")
    length, number_of_comments = save_text_to_mp3(reddit_object)
    print_substep(f"✅ Generated audio: {length}s duration, {number_of_comments} comments")
    
    # Download and prepare background
    print_step("Preparing background video...")
    download_background_video(settings.config["settings"]["background"]["background_video"])
    chop_background(length)
    
    # Create screenshots (with ThreadJuice branding)
    print_step("Creating story screenshots...")
    get_screenshots_of_reddit_posts(reddit_object, number_of_comments)
    
    # Compile final video
    print_step("Creating final video...")
    final_video_path = make_final_video(number_of_comments, length, reddit_object)
    
    print_markdown(f"""
### ✅ Video Created Successfully!

**Title:** {story.title}
**Duration:** {length} seconds  
**Output:** {final_video_path}

**Next Steps:**
1. Review the video
2. Upload to TikTok/Instagram Reels
3. Add trending music and effects
4. Include link to full story: {story.url}

🎉 Happy posting!
    """)
    
    return final_video_path


def main():
    """Main entry point with CLI arguments"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Create TikTok videos from ThreadJuice stories')
    parser.add_argument('--slug', type=str, help='Specific story slug to use')
    parser.add_argument('--latest', action='store_true', help='Use latest story (default)')
    parser.add_argument('--category', type=str, help='Filter by category')
    parser.add_argument('--no-pexels', action='store_true', help='Disable Pexels backgrounds')
    parser.add_argument('--list', action='store_true', help='List available stories')
    
    args = parser.parse_args()
    
    if args.list:
        # List available stories
        fetcher = ThreadJuiceFetcher()
        stories = fetcher.get_stories(limit=10)
        
        print("\n📚 Available ThreadJuice Stories:\n")
        for i, story in enumerate(stories, 1):
            print(f"{i}. {story.title}")
            print(f"   Slug: {story.data.get('slug')}")
            print(f"   Category: {story.data.get('category')}")
            print(f"   Engagement: {story.score} upvotes\n")
        return
    
    # Create video
    create_threadjuice_video(
        story_slug=args.slug,
        use_pexels=not args.no_pexels
    )


if __name__ == "__main__":
    main()