"""
Unit tests for Pexels video integration
Testing video search, download, and category matching
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, mock_open
from pathlib import Path
import json
import requests

from threadjuice.pexels_videos import PexelsVideoFetcher, VideoSelector


class TestPexelsVideoFetcher:
    """Test PexelsVideoFetcher class"""
    
    @pytest.mark.unit
    def test_fetcher_initialization(self):
        """Test PexelsVideoFetcher initialization"""
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            assert fetcher.api_key == 'test_key'
            assert fetcher.base_url == 'https://api.pexels.com/videos'
            assert 'Authorization' in fetcher.headers
            assert fetcher.headers['Authorization'] == 'test_key'
    
    @pytest.mark.unit
    def test_fetcher_initialization_no_api_key(self):
        """Test fetcher without API key"""
        with patch.dict('os.environ', {}, clear=True):
            fetcher = PexelsVideoFetcher()
            assert fetcher.api_key is None
            assert fetcher.headers == {'Authorization': None}
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_search_videos_success(self, mock_requests, mock_pexels_response):
        """Test successful video search"""
        mock_requests['response'].json.return_value = mock_pexels_response
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            videos = fetcher.search_videos('office', per_page=5)
            
            assert len(videos) == 1
            assert videos[0]['id'] == 12345
            assert videos[0]['duration'] == 30
            
            # Verify API call
            mock_requests['get'].assert_called_once()
            call_args = mock_requests['get'].call_args
            assert 'office' in call_args[0][0]
            assert call_args[1]['headers']['Authorization'] == 'test_key'
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_search_videos_api_error(self, mock_requests):
        """Test handling of API errors during search"""
        mock_requests['response'].status_code = 429  # Rate limit
        mock_requests['response'].json.return_value = {'error': 'Rate limit exceeded'}
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            videos = fetcher.search_videos('test')
            
            assert videos == []  # Should return empty list on error
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_search_videos_no_api_key(self):
        """Test search without API key returns empty"""
        with patch.dict('os.environ', {}, clear=True):
            fetcher = PexelsVideoFetcher()
            videos = fetcher.search_videos('test')
            assert videos == []
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_download_video_success(self, mock_requests, temp_assets_dir):
        """Test successful video download"""
        mock_requests['response'].content = b'fake video content'
        mock_requests['response'].headers = {'content-type': 'video/mp4'}
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            
            video_url = 'https://example.com/video.mp4'
            result = fetcher.download_video(video_url, 'test-slug', temp_assets_dir)
            
            assert result is not None
            assert result.exists()
            assert result.name == 'test-slug_video.mp4'
            assert result.read_bytes() == b'fake video content'
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_download_video_with_cache(self, temp_assets_dir):
        """Test video download with existing cache"""
        # Create cached file
        cached_file = temp_assets_dir / 'backgrounds' / 'pexels' / 'test-slug_12345.mp4'
        cached_file.parent.mkdir(parents=True, exist_ok=True)
        cached_file.write_bytes(b'cached content')
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            
            # Should return cached file without downloading
            with patch('requests.get') as mock_get:
                result = fetcher.download_video(
                    'https://example.com/video.mp4',
                    'test-slug',
                    temp_assets_dir,
                    video_id=12345
                )
                
                assert result == cached_file
                mock_get.assert_not_called()  # Should not download
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_download_video_failure(self, mock_requests, temp_assets_dir):
        """Test handling of download failures"""
        mock_requests['get'].side_effect = requests.RequestException("Network error")
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}):
            fetcher = PexelsVideoFetcher()
            result = fetcher.download_video('https://example.com/video.mp4', 'test', temp_assets_dir)
            
            assert result is None


class TestVideoSelector:
    """Test VideoSelector class"""
    
    @pytest.mark.unit
    def test_selector_initialization(self, temp_assets_dir):
        """Test VideoSelector initialization"""
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            assert isinstance(selector.fetcher, PexelsVideoFetcher)
            assert selector.cache_dir.exists()
    
    @pytest.mark.unit
    def test_get_search_terms_for_category(self):
        """Test search term generation for different categories"""
        selector = VideoSelector()
        
        # Test known categories
        terms = selector._get_search_terms_for_category('relationships')
        assert 'couple' in terms[0] or 'relationship' in terms[0]
        
        terms = selector._get_search_terms_for_category('workplace')
        assert any('office' in term or 'work' in term for term in terms)
        
        # Test unknown category falls back to generic
        terms = selector._get_search_terms_for_category('unknown')
        assert any('lifestyle' in term for term in terms)
    
    @pytest.mark.unit
    def test_extract_keywords_from_title(self):
        """Test keyword extraction from story titles"""
        selector = VideoSelector()
        
        # Test with common words that should be filtered
        keywords = selector._extract_keywords_from_title(
            "The Amazing Story of How I Found My Lost Dog"
        )
        assert 'the' not in keywords
        assert 'of' not in keywords
        assert 'amazing' in keywords or 'lost' in keywords or 'dog' in keywords
        
        # Test with all common words
        keywords = selector._extract_keywords_from_title("The And But Or")
        assert keywords == []
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_select_video_for_story_success(self, mock_story_data, mock_pexels_response, temp_assets_dir):
        """Test successful video selection for a story"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        story = ThreadJuiceStory(mock_story_data)
        
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            
            # Mock the search and download
            with patch.object(selector.fetcher, 'search_videos', return_value=mock_pexels_response['videos']), \
                 patch.object(selector.fetcher, 'download_video') as mock_download:
                
                # Create mock downloaded file
                mock_file = temp_assets_dir / 'backgrounds' / 'test.mp4'
                mock_file.parent.mkdir(parents=True, exist_ok=True)
                mock_file.write_bytes(b'video')
                mock_download.return_value = mock_file
                
                result = selector.select_video_for_story(story)
                
                assert result == mock_file
                # Verify it searched with appropriate terms
                selector.fetcher.search_videos.assert_called()
                call_args = selector.fetcher.search_videos.call_args[0][0]
                # Should search based on category or keywords
                assert any(term in call_args for term in ['drama', 'viral', 'story'])
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_select_video_with_multiple_search_attempts(self, mock_story_data, temp_assets_dir):
        """Test video selection tries multiple search terms"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        story = ThreadJuiceStory(mock_story_data)
        
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            
            # First searches return no results, third succeeds
            search_results = [
                [],  # First search fails
                [],  # Second search fails
                [{'id': 999, 'video_files': [{'link': 'http://video.mp4'}]}]  # Third succeeds
            ]
            
            with patch.object(selector.fetcher, 'search_videos', side_effect=search_results), \
                 patch.object(selector.fetcher, 'download_video') as mock_download:
                
                mock_file = temp_assets_dir / 'test.mp4'
                mock_file.write_bytes(b'video')
                mock_download.return_value = mock_file
                
                result = selector.select_video_for_story(story)
                
                assert result == mock_file
                assert selector.fetcher.search_videos.call_count >= 3
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_select_video_all_searches_fail(self, mock_story_data, temp_assets_dir):
        """Test when all video searches fail"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        story = ThreadJuiceStory(mock_story_data)
        
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            
            # All searches return empty
            with patch.object(selector.fetcher, 'search_videos', return_value=[]):
                result = selector.select_video_for_story(story)
                
                assert result is None
                # Should have tried multiple searches
                assert selector.fetcher.search_videos.call_count > 1
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_select_video_download_fails(self, mock_story_data, mock_pexels_response, temp_assets_dir):
        """Test when video search succeeds but download fails"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        story = ThreadJuiceStory(mock_story_data)
        
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            
            with patch.object(selector.fetcher, 'search_videos', return_value=mock_pexels_response['videos']), \
                 patch.object(selector.fetcher, 'download_video', return_value=None):
                
                result = selector.select_video_for_story(story)
                
                assert result is None


@pytest.mark.integration
class TestPexelsIntegration:
    """Integration tests for Pexels video functionality"""
    
    @pytest.mark.mock
    def test_full_video_selection_pipeline(self, mock_story_data, mock_pexels_response, mock_requests, temp_assets_dir):
        """Test complete video selection and download pipeline"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        story = ThreadJuiceStory(mock_story_data)
        
        # Setup mock responses
        mock_requests['response'].json.return_value = mock_pexels_response
        mock_requests['response'].content = b'video content'
        
        with patch.dict('os.environ', {'PEXELS_API_KEY': 'test_key'}), \
             patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            
            selector = VideoSelector()
            result = selector.select_video_for_story(story)
            
            # Verify the complete flow
            assert result is not None
            assert result.exists()
            assert result.suffix == '.mp4'
            assert 'test-story-slug' in result.name
            
            # Verify API calls were made
            assert mock_requests['get'].call_count >= 2  # Search + download
    
    @pytest.mark.mock
    def test_category_based_video_selection(self, temp_assets_dir):
        """Test that different categories result in different search terms"""
        from threadjuice.story_fetcher import ThreadJuiceStory
        
        categories = ['relationships', 'workplace', 'family', 'money']
        search_calls = []
        
        with patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            selector = VideoSelector()
            
            with patch.object(selector.fetcher, 'search_videos', return_value=[]) as mock_search:
                for category in categories:
                    story_data = {'category': category, 'title': 'Test Story', 'slug': f'test-{category}'}
                    story = ThreadJuiceStory(story_data)
                    
                    selector.select_video_for_story(story)
                    search_calls.extend([call[0][0] for call in mock_search.call_args_list])
                
                # Verify different search terms were used for different categories
                assert any('couple' in call or 'relationship' in call for call in search_calls)
                assert any('office' in call or 'workplace' in call for call in search_calls)
                assert any('family' in call for call in search_calls)
                assert any('money' in call or 'financial' in call for call in search_calls)