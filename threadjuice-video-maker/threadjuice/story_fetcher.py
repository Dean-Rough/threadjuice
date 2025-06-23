#!/usr/bin/env python
"""
ThreadJuice Story Fetcher
Replaces Reddit API with ThreadJuice Supabase data
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
import requests

# Try to import supabase, fall back to direct API calls if not available
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False


class ThreadJuiceStory:
    """Represents a ThreadJuice story in Reddit-compatible format"""
    
    def __init__(self, story_data: Dict):
        self.data = story_data
        self.title = story_data.get('title', '')
        self.author = story_data.get('sourceUsername', 'u/anonymous')
        self.selftext = self._extract_story_text()
        self.subreddit = self._extract_subreddit()
        self.score = story_data.get('upvoteCount', 1000)
        self.num_comments = story_data.get('commentCount', 50)
        self.created_utc = self._parse_timestamp()
        self.comments = self._extract_comments()
        self.url = f"https://threadjuice.com/blog/{story_data.get('slug', '')}"
        self.permalink = f"/blog/{story_data.get('slug', '')}"
        
    def _extract_story_text(self) -> str:
        """Extract the main story text from content sections"""
        content = self.data.get('content', {})
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                return content
                
        sections = content.get('sections', [])
        story_parts = []
        
        for section in sections:
            if section.get('type') in ['describe-1', 'describe-2', 'describe-3', 'describe-4', 'describe-5']:
                story_parts.append(section.get('content', ''))
                
        return '\n\n'.join(story_parts)
    
    def _extract_subreddit(self) -> str:
        """Extract subreddit from source info or category"""
        if 'reddit.com/r/' in self.data.get('sourceUrl', ''):
            parts = self.data['sourceUrl'].split('/r/')
            if len(parts) > 1:
                return parts[1].split('/')[0]
        
        # Map categories to subreddit-like names
        category_map = {
            'relationships': 'relationships',
            'workplace': 'antiwork',
            'family': 'JUSTNOMIL',
            'money': 'personalfinance',
            'life': 'tifu'
        }
        
        return category_map.get(self.data.get('category', ''), 'stories')
    
    def _parse_timestamp(self) -> float:
        """Convert timestamp to Reddit format"""
        created = self.data.get('created_at', datetime.now().isoformat())
        if isinstance(created, str):
            dt = datetime.fromisoformat(created.replace('Z', '+00:00'))
            return dt.timestamp()
        return datetime.now().timestamp()
    
    def _extract_comments(self) -> List[Dict]:
        """Extract comments from content sections"""
        content = self.data.get('content', {})
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                return []
                
        sections = content.get('sections', [])
        comments = []
        
        for section in sections:
            if section.get('type') == 'comments-1':
                metadata = section.get('metadata', {})
                for comment in metadata.get('comments', []):
                    comments.append({
                        'body': comment.get('content', ''),
                        'author': comment.get('author', 'anonymous'),
                        'score': comment.get('upvotes', 100),
                        'created_utc': self.created_utc,
                        'is_submitter': comment.get('isOP', False)
                    })
                    
        return comments


class ThreadJuiceFetcher:
    """Fetches stories from ThreadJuice database"""
    
    def __init__(self):
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if HAS_SUPABASE and self.supabase_url and self.supabase_key:
            self.client = create_client(self.supabase_url, self.supabase_key)
        else:
            self.client = None
            
    def get_latest_story(self) -> Optional[ThreadJuiceStory]:
        """Fetch the latest published story"""
        stories = self.get_stories(limit=1)
        return stories[0] if stories else None
    
    def get_story_by_slug(self, slug: str) -> Optional[ThreadJuiceStory]:
        """Fetch a specific story by slug"""
        if self.client:
            response = self.client.table('posts').select('*').eq('slug', slug).single().execute()
            if response.data:
                return ThreadJuiceStory(response.data)
        else:
            # Fallback to direct API call
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}'
            }
            url = f"{self.supabase_url}/rest/v1/posts?slug=eq.{slug}&select=*"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    return ThreadJuiceStory(data[0])
                    
        return None
    
    def get_stories(self, limit: int = 10, category: Optional[str] = None) -> List[ThreadJuiceStory]:
        """Fetch multiple stories"""
        stories = []
        
        if self.client:
            query = self.client.table('posts').select('*').eq('status', 'published')
            
            if category:
                query = query.eq('category', category)
                
            query = query.order('created_at', desc=True).limit(limit)
            response = query.execute()
            
            if response.data:
                stories = [ThreadJuiceStory(story) for story in response.data]
        else:
            # Fallback to direct API call
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}'
            }
            
            url = f"{self.supabase_url}/rest/v1/posts?status=eq.published&select=*&order=created_at.desc&limit={limit}"
            if category:
                url += f"&category=eq.{category}"
                
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                stories = [ThreadJuiceStory(story) for story in data]
                
        return stories
    
    def get_viral_stories(self, min_upvotes: int = 1000) -> List[ThreadJuiceStory]:
        """Get stories with high engagement"""
        stories = self.get_stories(limit=50)
        return [s for s in stories if s.score >= min_upvotes]


# Test function
if __name__ == "__main__":
    # Load env vars
    from pathlib import Path
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    
    # Try to load from .env.local
    env_path = Path(__file__).parent.parent.parent / '.env.local'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"\'')
    
    fetcher = ThreadJuiceFetcher()
    story = fetcher.get_latest_story()
    
    if story:
        print(f"Title: {story.title}")
        print(f"Author: {story.author}")
        print(f"Score: {story.score}")
        print(f"Comments: {len(story.comments)}")
        print(f"URL: {story.url}")
    else:
        print("No stories found!")