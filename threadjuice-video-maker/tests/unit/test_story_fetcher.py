"""
Unit tests for ThreadJuice story fetcher
Testing story retrieval, parsing, and error handling
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime

from threadjuice.story_fetcher import ThreadJuiceStory, ThreadJuiceFetcher


class TestThreadJuiceStory:
    """Test ThreadJuiceStory class"""
    
    @pytest.mark.unit
    def test_story_initialization(self, mock_story_data):
        """Test story object initialization with valid data"""
        story = ThreadJuiceStory(mock_story_data)
        
        assert story.title == 'Test Viral Story: The Shocking Truth'
        assert story.author == 'u/testuser'
        assert story.score == 5000
        assert story.num_comments == 150
        assert story.subreddit == 'test'
        assert story.url == 'https://threadjuice.com/blog/test-story-slug'
        assert story.permalink == '/blog/test-story-slug'
    
    @pytest.mark.unit
    def test_extract_story_text(self, mock_story_data):
        """Test extraction of story text from content sections"""
        story = ThreadJuiceStory(mock_story_data)
        
        expected_text = (
            "This is the first part of an amazing story about something unbelievable.\n\n"
            "The story continues with even more shocking revelations."
        )
        assert story.selftext == expected_text
    
    @pytest.mark.unit
    def test_extract_story_text_with_string_content(self):
        """Test handling of content as JSON string"""
        data = {
            'slug': 'test',
            'title': 'Test',
            'content': json.dumps({
                'sections': [
                    {'type': 'describe-1', 'content': 'Test content'}
                ]
            })
        }
        story = ThreadJuiceStory(data)
        assert story.selftext == 'Test content'
    
    @pytest.mark.unit
    def test_extract_subreddit_from_url(self):
        """Test subreddit extraction from Reddit URL"""
        data = {
            'sourceUrl': 'https://reddit.com/r/AmItheAsshole/comments/123/test',
            'category': 'drama'
        }
        story = ThreadJuiceStory(data)
        assert story.subreddit == 'AmItheAsshole'
    
    @pytest.mark.unit
    def test_extract_subreddit_from_category(self):
        """Test subreddit mapping from category"""
        category_mappings = [
            ('relationships', 'relationships'),
            ('workplace', 'antiwork'),
            ('family', 'JUSTNOMIL'),
            ('money', 'personalfinance'),
            ('life', 'tifu'),
            ('unknown', 'stories')
        ]
        
        for category, expected_subreddit in category_mappings:
            data = {'category': category, 'sourceUrl': ''}
            story = ThreadJuiceStory(data)
            assert story.subreddit == expected_subreddit
    
    @pytest.mark.unit
    def test_parse_timestamp(self, mock_story_data):
        """Test timestamp parsing"""
        story = ThreadJuiceStory(mock_story_data)
        
        # Should convert ISO timestamp to Unix timestamp
        expected_timestamp = datetime.fromisoformat('2024-01-01T00:00:00+00:00').timestamp()
        assert story.created_utc == expected_timestamp
    
    @pytest.mark.unit
    def test_extract_comments(self, mock_story_data):
        """Test comment extraction from content sections"""
        story = ThreadJuiceStory(mock_story_data)
        
        assert len(story.comments) == 2
        assert story.comments[0]['body'] == 'OMG this is crazy!'
        assert story.comments[0]['author'] == 'testuser1'
        assert story.comments[0]['score'] == 100
        assert story.comments[0]['is_submitter'] == False
        
        assert story.comments[1]['body'] == 'I cant believe this happened'
        assert story.comments[1]['author'] == 'testuser2'


class TestThreadJuiceFetcher:
    """Test ThreadJuiceFetcher class"""
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_fetcher_initialization_with_env_vars(self):
        """Test fetcher initialization with environment variables"""
        with patch.dict('os.environ', {
            'NEXT_PUBLIC_SUPABASE_URL': 'https://test.supabase.co',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'test_key'
        }):
            fetcher = ThreadJuiceFetcher()
            assert fetcher.supabase_url == 'https://test.supabase.co'
            assert fetcher.supabase_key == 'test_key'
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_fetcher_initialization_from_env_file(self, tmp_path):
        """Test fetcher initialization from .env.local file"""
        # Create mock .env.local
        env_file = tmp_path / '.env.local'
        env_file.write_text('''
NEXT_PUBLIC_SUPABASE_URL=https://env.file.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=env_file_key
''')
        
        with patch('pathlib.Path.exists', return_value=True), \
             patch('pathlib.Path.open', return_value=env_file.open()):
            
            with patch.dict('os.environ', {}, clear=True):
                fetcher = ThreadJuiceFetcher()
                assert fetcher.supabase_url == 'https://env.file.supabase.co'
                assert fetcher.supabase_key == 'env_file_key'
    
    @pytest.mark.unit
    def test_fetcher_initialization_missing_credentials(self):
        """Test fetcher raises error when credentials are missing"""
        with patch.dict('os.environ', {}, clear=True), \
             patch('pathlib.Path.exists', return_value=False):
            
            with pytest.raises(ValueError, match="Missing Supabase credentials"):
                ThreadJuiceFetcher()
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_latest_story(self, mock_supabase_client, mock_story_data):
        """Test fetching the latest story"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock response
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.order.return_value.limit.return_value \
                .execute.return_value.data = [mock_story_data]
            
            fetcher = ThreadJuiceFetcher()
            story = fetcher.get_latest_story()
            
            assert story is not None
            assert story.title == 'Test Viral Story: The Shocking Truth'
            assert isinstance(story, ThreadJuiceStory)
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_story_by_slug(self, mock_supabase_client, mock_story_data):
        """Test fetching a specific story by slug"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock response
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.single.return_value \
                .execute.return_value.data = mock_story_data
            
            fetcher = ThreadJuiceFetcher()
            story = fetcher.get_story_by_slug('test-story-slug')
            
            assert story is not None
            assert story.data['slug'] == 'test-story-slug'
            
            # Verify correct API call
            mock_supabase_client.table.assert_called_with('posts')
            mock_supabase_client.table.return_value.select.assert_called_with('*')
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_story_by_slug_not_found(self, mock_supabase_client):
        """Test handling of story not found"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock to return None
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.single.return_value \
                .execute.return_value.data = None
            
            fetcher = ThreadJuiceFetcher()
            story = fetcher.get_story_by_slug('non-existent-slug')
            
            assert story is None
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_stories_with_limit(self, mock_supabase_client, mock_story_data):
        """Test fetching multiple stories with limit"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock response
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.order.return_value.limit.return_value \
                .execute.return_value.data = [mock_story_data] * 5
            
            fetcher = ThreadJuiceFetcher()
            stories = fetcher.get_stories(limit=5)
            
            assert len(stories) == 5
            assert all(isinstance(s, ThreadJuiceStory) for s in stories)
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_stories_with_category_filter(self, mock_supabase_client, mock_story_data):
        """Test fetching stories filtered by category"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock
            mock_query = mock_supabase_client.table.return_value.select.return_value.eq.return_value
            mock_query.eq.return_value.order.return_value.limit.return_value \
                .execute.return_value.data = [mock_story_data]
            
            fetcher = ThreadJuiceFetcher()
            stories = fetcher.get_stories(category='drama')
            
            # Verify category filter was applied
            assert mock_query.eq.call_count == 2  # status and category
            calls = mock_query.eq.call_args_list
            assert calls[1][0] == ('category', 'drama')
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_get_viral_stories(self, mock_supabase_client, mock_story_data):
        """Test filtering viral stories by upvote count"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Create stories with different upvote counts
            stories_data = [
                {**mock_story_data, 'upvoteCount': 5000},
                {**mock_story_data, 'upvoteCount': 500},
                {**mock_story_data, 'upvoteCount': 2000},
                {**mock_story_data, 'upvoteCount': 100}
            ]
            
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.order.return_value.limit.return_value \
                .execute.return_value.data = stories_data
            
            fetcher = ThreadJuiceFetcher()
            viral_stories = fetcher.get_viral_stories(min_upvotes=1000)
            
            assert len(viral_stories) == 2  # Only stories with 5000 and 2000 upvotes
            assert all(s.score >= 1000 for s in viral_stories)
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_fallback_to_requests_when_no_supabase(self, mock_requests, mock_story_data):
        """Test fallback to direct API calls when supabase library not available"""
        with patch('threadjuice.story_fetcher.HAS_SUPABASE', False):
            mock_requests['response'].json.return_value = [mock_story_data]
            
            fetcher = ThreadJuiceFetcher()
            fetcher.client = None  # Force no client
            
            stories = fetcher.get_stories()
            
            # Verify requests was used
            mock_requests['get'].assert_called()
            assert 'Authorization' in mock_requests['get'].call_args[1]['headers']
            
            assert len(stories) == 1
            assert stories[0].title == 'Test Viral Story: The Shocking Truth'


@pytest.mark.integration
class TestStoryFetcherIntegration:
    """Integration tests for story fetcher with real-like scenarios"""
    
    @pytest.mark.mock
    def test_full_story_processing_pipeline(self, mock_supabase_client, mock_story_data):
        """Test complete story fetching and processing pipeline"""
        with patch('threadjuice.story_fetcher.create_client', return_value=mock_supabase_client):
            # Configure mock with realistic data
            mock_supabase_client.table.return_value.select.return_value \
                .eq.return_value.order.return_value.limit.return_value \
                .execute.return_value.data = [mock_story_data]
            
            fetcher = ThreadJuiceFetcher()
            story = fetcher.get_latest_story()
            
            # Verify all fields are properly extracted
            assert story.title
            assert story.selftext
            assert story.author
            assert story.score > 0
            assert story.num_comments >= 0
            assert len(story.comments) > 0
            assert story.url.startswith('https://threadjuice.com')
            
            # Verify Reddit-compatible format
            reddit_dict = {
                'thread_id': story.data.get('slug'),
                'thread_title': story.title,
                'thread_content': story.selftext,
                'thread_author': story.author,
                'thread_upvotes': story.score
            }
            
            assert all(reddit_dict.values())  # All fields populated