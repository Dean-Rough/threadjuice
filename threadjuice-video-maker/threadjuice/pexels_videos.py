#!/usr/bin/env python
"""
Pexels Video Integration for ThreadJuice
Fetches relevant video backgrounds based on story content
"""

import os
import json
import requests
import random
from typing import List, Dict, Optional
from pathlib import Path


class PexelsVideoFetcher:
    """Fetches relevant video backgrounds from Pexels"""
    
    def __init__(self):
        self.api_key = os.getenv('PEXELS_API_KEY')
        self.base_url = 'https://api.pexels.com/videos'
        self.headers = {
            'Authorization': self.api_key
        }
        self.cache_dir = Path(__file__).parent.parent / 'assets' / 'backgrounds' / 'pexels'
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def search_videos(self, query: str, per_page: int = 5) -> List[Dict]:
        """Search for videos based on query"""
        if not self.api_key:
            print("⚠️ No Pexels API key found")
            return []
            
        url = f"{self.base_url}/search"
        params = {
            'query': query,
            'per_page': per_page,
            'orientation': 'landscape',  # Better for TikTok/Reels
            'size': 'medium'  # Balance quality and file size
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get('videos', [])
        except Exception as e:
            print(f"❌ Pexels search error: {e}")
            return []
    
    def get_video_for_category(self, category: str) -> Optional[Dict]:
        """Get appropriate video based on story category"""
        # Category-specific search terms
        category_queries = {
            'relationships': ['couple arguing', 'relationship drama', 'couple talking', 'romantic conflict'],
            'workplace': ['office stress', 'workplace', 'business meeting', 'corporate life'],
            'family': ['family dinner', 'family gathering', 'home life', 'family drama'],
            'money': ['counting money', 'financial', 'bills', 'shopping'],
            'food': ['cooking', 'restaurant', 'food preparation', 'kitchen'],
            'life': ['daily life', 'city life', 'lifestyle', 'everyday moments'],
            'drama': ['dramatic', 'conflict', 'intense', 'emotional'],
            'viral': ['trending', 'social media', 'viral', 'internet']
        }
        
        queries = category_queries.get(category, ['lifestyle', 'abstract', 'background'])
        
        # Try each query until we find videos
        all_videos = []
        for query in queries:
            videos = self.search_videos(query)
            all_videos.extend(videos)
            if len(all_videos) >= 3:
                break
                
        if all_videos:
            # Return a random video from results
            return random.choice(all_videos[:5])
            
        return None
    
    def get_video_for_keywords(self, keywords: List[str]) -> Optional[Dict]:
        """Get video based on extracted keywords"""
        # Try combinations of keywords
        if len(keywords) >= 2:
            query = f"{keywords[0]} {keywords[1]}"
        else:
            query = keywords[0] if keywords else "lifestyle"
            
        videos = self.search_videos(query)
        
        if not videos and len(keywords) > 1:
            # Try individual keywords
            for keyword in keywords[:3]:
                videos = self.search_videos(keyword)
                if videos:
                    break
                    
        return videos[0] if videos else None
    
    def download_video(self, video_data: Dict, filename: str = None) -> Optional[Path]:
        """Download video to local cache"""
        if not video_data:
            return None
            
        # Get the medium quality video file
        video_files = video_data.get('video_files', [])
        medium_file = None
        
        # Find medium quality (usually 720p)
        for file in video_files:
            if file.get('quality') == 'hd' and file.get('width') <= 1280:
                medium_file = file
                break
                
        if not medium_file and video_files:
            # Fallback to first available
            medium_file = video_files[0]
            
        if not medium_file:
            print("❌ No video file found")
            return None
            
        # Generate filename
        if not filename:
            video_id = video_data.get('id', 'unknown')
            filename = f"pexels_{video_id}.mp4"
            
        filepath = self.cache_dir / filename
        
        # Check if already downloaded
        if filepath.exists():
            print(f"✅ Using cached video: {filename}")
            return filepath
            
        # Download
        try:
            print(f"📥 Downloading video: {filename}")
            response = requests.get(medium_file['link'], stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
            print(f"✅ Downloaded: {filename}")
            return filepath
            
        except Exception as e:
            print(f"❌ Download error: {e}")
            if filepath.exists():
                filepath.unlink()
            return None
    
    def get_fallback_videos(self) -> List[str]:
        """Get generic fallback videos if specific search fails"""
        fallback_queries = [
            'abstract background',
            'nature scenery',
            'city timelapse',
            'technology',
            'lifestyle'
        ]
        
        videos = []
        for query in fallback_queries:
            result = self.search_videos(query, per_page=1)
            if result:
                videos.extend(result)
                
        return videos


class VideoSelector:
    """Intelligent video selection based on story content"""
    
    def __init__(self):
        self.fetcher = PexelsVideoFetcher()
        
    def extract_keywords_from_title(self, title: str) -> List[str]:
        """Extract relevant keywords from story title"""
        # Remove common words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'when', 'where', 'how', 'why', 'what',
            'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
        }
        
        words = title.lower().split()
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        # Extract potential themes
        theme_keywords = {
            'money': ['salary', 'pay', 'dollar', 'cost', 'price', 'financial'],
            'relationship': ['boyfriend', 'girlfriend', 'wife', 'husband', 'partner', 'dating'],
            'work': ['boss', 'job', 'work', 'office', 'employee', 'manager'],
            'family': ['mom', 'dad', 'mother', 'father', 'parent', 'sibling'],
            'food': ['eat', 'food', 'cook', 'restaurant', 'meal', 'dinner']
        }
        
        # Add theme keywords if found
        for theme, theme_words in theme_keywords.items():
            if any(word in title.lower() for word in theme_words):
                keywords.append(theme)
                
        return keywords[:5]  # Limit to 5 keywords
    
    def select_video_for_story(self, story) -> Optional[Path]:
        """Select and download appropriate video for story"""
        # Try category-based selection first
        video_data = self.fetcher.get_video_for_category(story.data.get('category'))
        
        if not video_data:
            # Try keyword-based selection
            keywords = self.extract_keywords_from_title(story.title)
            video_data = self.fetcher.get_video_for_keywords(keywords)
            
        if not video_data:
            # Use fallback
            fallbacks = self.fetcher.get_fallback_videos()
            if fallbacks:
                video_data = random.choice(fallbacks)
                
        if video_data:
            # Download the video
            filename = f"{story.data.get('slug', 'story')}_{video_data.get('id')}.mp4"
            return self.fetcher.download_video(video_data, filename)
            
        return None


# Update background videos config
def update_background_config():
    """Add Pexels videos to the background config"""
    config_path = Path(__file__).parent.parent / 'utils' / 'background_videos.json'
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Add Pexels as an option
    config['pexels-dynamic'] = [
        "dynamic",  # Special flag for dynamic selection
        "pexels_video.mp4",  # Placeholder
        "Pexels",
        "center"
    ]
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=4)
        

if __name__ == "__main__":
    # Test
    from pathlib import Path
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    
    # Load env
    env_path = Path(__file__).parent.parent.parent / '.env.local'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"\'')
    
    fetcher = PexelsVideoFetcher()
    videos = fetcher.search_videos("office drama")
    
    if videos:
        print(f"Found {len(videos)} videos")
        video = videos[0]
        print(f"Video: {video.get('user', {}).get('name')} - {video.get('url')}")
        
        # Test download
        path = fetcher.download_video(video)
        if path:
            print(f"Downloaded to: {path}")
    else:
        print("No videos found")