#!/usr/bin/env python
"""
Batch Video Generator for ThreadJuice
Creates multiple videos automatically
"""

import argparse
import time
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent))

from threadjuice.story_fetcher import ThreadJuiceFetcher
from threadjuice_main import create_threadjuice_video, load_env_vars


def generate_batch_videos(count: int = 5, category: str = None, delay: int = 5):
    """
    Generate multiple videos in batch
    
    Args:
        count: Number of videos to generate
        category: Filter by category (optional)
        delay: Delay between videos in seconds
    """
    print(f"""
╔══════════════════════════════════════════════╗
║       ThreadJuice Batch Video Generator      ║
╚══════════════════════════════════════════════╝

Generating {count} videos...
    """)
    
    # Load environment
    load_env_vars()
    
    # Get stories
    fetcher = ThreadJuiceFetcher()
    stories = fetcher.get_stories(limit=count * 2, category=category)  # Get extra in case some fail
    
    if not stories:
        print("❌ No stories found!")
        return
        
    print(f"📚 Found {len(stories)} stories to process\n")
    
    successful = 0
    failed = 0
    video_paths = []
    
    for i, story in enumerate(stories[:count], 1):
        print(f"\n{'='*50}")
        print(f"Video {i}/{count}: {story.title[:60]}...")
        print(f"{'='*50}\n")
        
        try:
            video_path = create_threadjuice_video(
                story_slug=story.data.get('slug'),
                use_pexels=True
            )
            
            if video_path:
                successful += 1
                video_paths.append(video_path)
                print(f"✅ Video {i} completed successfully!")
            else:
                failed += 1
                print(f"❌ Video {i} failed!")
                
        except Exception as e:
            failed += 1
            print(f"❌ Error creating video {i}: {e}")
            
        # Delay between videos (except last one)
        if i < count and delay > 0:
            print(f"\n⏱️  Waiting {delay} seconds before next video...")
            time.sleep(delay)
    
    # Summary
    print(f"""
    
╔══════════════════════════════════════════════╗
║              Batch Complete!                 ║
╚══════════════════════════════════════════════╝

✅ Successful: {successful}
❌ Failed: {failed}

Videos saved to: results/
    """)
    
    if video_paths:
        print("\n📹 Generated videos:")
        for path in video_paths:
            print(f"   - {Path(path).name}")
            
    return video_paths


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Generate multiple ThreadJuice videos in batch'
    )
    
    parser.add_argument(
        '--count', '-c',
        type=int,
        default=5,
        help='Number of videos to generate (default: 5)'
    )
    
    parser.add_argument(
        '--category',
        type=str,
        help='Filter by category (e.g., relationships, workplace)'
    )
    
    parser.add_argument(
        '--delay', '-d',
        type=int,
        default=5,
        help='Delay between videos in seconds (default: 5)'
    )
    
    parser.add_argument(
        '--viral-only',
        action='store_true',
        help='Only use stories with 1000+ upvotes'
    )
    
    args = parser.parse_args()
    
    # If viral only, get high-engagement stories
    if args.viral_only:
        load_env_vars()
        fetcher = ThreadJuiceFetcher()
        viral_stories = fetcher.get_viral_stories(min_upvotes=1000)
        
        if not viral_stories:
            print("❌ No viral stories found!")
            return
            
        print(f"🔥 Found {len(viral_stories)} viral stories")
        count = min(args.count, len(viral_stories))
    else:
        count = args.count
    
    # Generate videos
    generate_batch_videos(
        count=count,
        category=args.category,
        delay=args.delay
    )


if __name__ == "__main__":
    main()