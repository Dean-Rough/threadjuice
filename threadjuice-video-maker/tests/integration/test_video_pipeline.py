"""
Integration tests for the complete video generation pipeline
Testing end-to-end workflows and component interactions
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, call
from pathlib import Path
import tempfile
import shutil

from threadjuice_main import create_threadjuice_video, main as threadjuice_main
from threadjuice.story_fetcher import ThreadJuiceStory, ThreadJuiceFetcher


@pytest.mark.integration
class TestVideoCreationPipeline:
    """Test the complete video creation pipeline"""
    
    @pytest.mark.mock
    def test_create_video_from_slug(self, mock_story_data, mock_pexels_response, 
                                    mock_gtts, mock_moviepy_clip, temp_assets_dir):
        """Test creating a video from a story slug"""
        
        # Setup all mocks
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class, \
             patch('threadjuice.pexels_videos.VideoSelector') as mock_selector_class, \
             patch('video_creation.voices.save_text_to_mp3') as mock_save_tts, \
             patch('video_creation.background.download_background_video') as mock_download_bg, \
             patch('video_creation.background.chop_background') as mock_chop_bg, \
             patch('video_creation.screenshot_downloader.get_screenshots_of_reddit_posts') as mock_screenshots, \
             patch('video_creation.final_video.make_final_video') as mock_make_video, \
             patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            
            # Configure mocks
            mock_fetcher = Mock()
            mock_story = ThreadJuiceStory(mock_story_data)
            mock_fetcher.get_story_by_slug.return_value = mock_story
            mock_fetcher_class.return_value = mock_fetcher
            
            mock_selector = Mock()
            mock_video_path = temp_assets_dir / 'backgrounds' / 'test.mp4'
            mock_video_path.parent.mkdir(parents=True, exist_ok=True)
            mock_video_path.write_bytes(b'video')
            mock_selector.select_video_for_story.return_value = mock_video_path
            mock_selector_class.return_value = mock_selector
            
            mock_save_tts.return_value = (45.5, 3)  # 45.5 seconds, 3 comments
            mock_make_video.return_value = 'results/final_video.mp4'
            
            # Run the pipeline
            result = create_threadjuice_video(story_slug='test-story-slug', use_pexels=True)
            
            # Verify the pipeline flow
            mock_fetcher.get_story_by_slug.assert_called_once_with('test-story-slug')
            mock_selector.select_video_for_story.assert_called_once_with(mock_story)
            mock_save_tts.assert_called_once()
            mock_download_bg.assert_called_once()
            mock_chop_bg.assert_called_once_with(45.5)
            mock_screenshots.assert_called_once()
            mock_make_video.assert_called_once()
            
            assert result == 'results/final_video.mp4'
    
    @pytest.mark.mock
    def test_create_video_latest_story(self, mock_story_data):
        """Test creating video from latest story when no slug provided"""
        
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class, \
             patch('threadjuice.pexels_videos.VideoSelector') as mock_selector_class, \
             patch('video_creation.voices.save_text_to_mp3') as mock_save_tts, \
             patch('video_creation.background.download_background_video'), \
             patch('video_creation.background.chop_background'), \
             patch('video_creation.screenshot_downloader.get_screenshots_of_reddit_posts'), \
             patch('video_creation.final_video.make_final_video'):
            
            # Configure mocks
            mock_fetcher = Mock()
            mock_story = ThreadJuiceStory(mock_story_data)
            mock_fetcher.get_latest_story.return_value = mock_story
            mock_fetcher_class.return_value = mock_fetcher
            
            mock_save_tts.return_value = (30, 2)
            
            # Run without slug
            result = create_threadjuice_video(story_slug=None, use_pexels=False)
            
            # Should fetch latest story
            mock_fetcher.get_latest_story.assert_called_once()
            mock_fetcher.get_story_by_slug.assert_not_called()
    
    @pytest.mark.mock
    def test_create_video_story_not_found(self):
        """Test handling when story is not found"""
        
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class:
            mock_fetcher = Mock()
            mock_fetcher.get_story_by_slug.return_value = None
            mock_fetcher_class.return_value = mock_fetcher
            
            result = create_threadjuice_video(story_slug='non-existent')
            
            assert result is None
    
    @pytest.mark.mock
    def test_create_video_without_pexels(self, mock_story_data):
        """Test video creation without Pexels background"""
        
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class, \
             patch('video_creation.voices.save_text_to_mp3') as mock_save_tts, \
             patch('video_creation.background.download_background_video') as mock_download_bg, \
             patch('video_creation.background.chop_background'), \
             patch('video_creation.screenshot_downloader.get_screenshots_of_reddit_posts'), \
             patch('video_creation.final_video.make_final_video'), \
             patch('utils.settings.config', {'settings': {'background': {'background_video': 'minecraft'}}}):
            
            mock_fetcher = Mock()
            mock_story = ThreadJuiceStory(mock_story_data)
            mock_fetcher.get_latest_story.return_value = mock_story
            mock_fetcher_class.return_value = mock_fetcher
            
            mock_save_tts.return_value = (30, 1)
            
            # Run without Pexels
            result = create_threadjuice_video(use_pexels=False)
            
            # Should use default background
            mock_download_bg.assert_called_once_with('minecraft')


@pytest.mark.integration
class TestMainFunction:
    """Test the main entry point"""
    
    @pytest.mark.mock
    def test_main_with_args(self):
        """Test main function with command line arguments"""
        
        test_args = ['threadjuice_main.py', '--slug', 'test-story']
        
        with patch('sys.argv', test_args), \
             patch('threadjuice_main.create_threadjuice_video') as mock_create:
            
            mock_create.return_value = 'results/video.mp4'
            
            threadjuice_main()
            
            mock_create.assert_called_once_with(
                story_slug='test-story',
                use_pexels=True
            )
    
    @pytest.mark.mock
    def test_main_with_no_pexels_flag(self):
        """Test main function with --no-pexels flag"""
        
        test_args = ['threadjuice_main.py', '--no-pexels']
        
        with patch('sys.argv', test_args), \
             patch('threadjuice_main.create_threadjuice_video') as mock_create:
            
            mock_create.return_value = 'results/video.mp4'
            
            threadjuice_main()
            
            mock_create.assert_called_once_with(
                story_slug=None,
                use_pexels=False
            )
    
    @pytest.mark.mock
    def test_main_with_list_flag(self, mock_story_data, capsys):
        """Test main function with --list flag"""
        
        test_args = ['threadjuice_main.py', '--list']
        
        with patch('sys.argv', test_args), \
             patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class:
            
            mock_fetcher = Mock()
            stories = [ThreadJuiceStory(mock_story_data) for _ in range(3)]
            mock_fetcher.get_stories.return_value = stories
            mock_fetcher_class.return_value = mock_fetcher
            
            threadjuice_main()
            
            # Check output
            captured = capsys.readouterr()
            assert "Available ThreadJuice Stories:" in captured.out
            assert "Test Viral Story" in captured.out
            assert "drama" in captured.out


@pytest.mark.integration
class TestErrorHandling:
    """Test error handling throughout the pipeline"""
    
    @pytest.mark.mock
    def test_tts_error_recovery(self, mock_story_data):
        """Test recovery when TTS fails"""
        
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class, \
             patch('video_creation.voices.save_text_to_mp3') as mock_save_tts:
            
            mock_fetcher = Mock()
            mock_story = ThreadJuiceStory(mock_story_data)
            mock_fetcher.get_latest_story.return_value = mock_story
            mock_fetcher_class.return_value = mock_fetcher
            
            # TTS fails
            mock_save_tts.side_effect = Exception("TTS service unavailable")
            
            with pytest.raises(Exception, match="TTS service unavailable"):
                create_threadjuice_video()
    
    @pytest.mark.mock
    def test_background_download_error(self, mock_story_data):
        """Test handling of background download errors"""
        
        with patch('threadjuice.story_fetcher.ThreadJuiceFetcher') as mock_fetcher_class, \
             patch('threadjuice.pexels_videos.VideoSelector') as mock_selector_class, \
             patch('video_creation.voices.save_text_to_mp3') as mock_save_tts, \
             patch('video_creation.background.download_background_video') as mock_download:
            
            mock_fetcher = Mock()
            mock_story = ThreadJuiceStory(mock_story_data)
            mock_fetcher.get_latest_story.return_value = mock_story
            mock_fetcher_class.return_value = mock_fetcher
            
            mock_selector = Mock()
            mock_selector.select_video_for_story.return_value = None  # No video found
            mock_selector_class.return_value = mock_selector
            
            mock_save_tts.return_value = (30, 1)
            mock_download.side_effect = Exception("Download failed")
            
            # Should still work with fallback background
            with pytest.raises(Exception, match="Download failed"):
                create_threadjuice_video(use_pexels=True)


@pytest.mark.integration
@pytest.mark.slow
class TestFullPipeline:
    """Test full pipeline with minimal mocking (slower tests)"""
    
    @pytest.mark.mock
    def test_complete_video_generation(self, mock_story_data, temp_assets_dir, 
                                     mock_gtts, mock_requests):
        """Test complete video generation with minimal mocking"""
        
        # This test would run the actual pipeline with only external services mocked
        # Marked as slow because it involves real file operations
        
        with patch('threadjuice.story_fetcher.create_client') as mock_supabase, \
             patch('moviepy.editor.VideoFileClip') as mock_video_clip, \
             patch('moviepy.editor.AudioFileClip') as mock_audio_clip, \
             patch('moviepy.editor.ImageClip') as mock_image_clip, \
             patch('moviepy.editor.CompositeVideoClip') as mock_composite, \
             patch('moviepy.editor.concatenate_videoclips') as mock_concat, \
             patch('pathlib.Path.cwd', return_value=temp_assets_dir):
            
            # Setup Supabase mock
            mock_client = MagicMock()
            mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = mock_story_data
            mock_supabase.return_value = mock_client
            
            # Setup MoviePy mocks
            mock_video = MagicMock()
            mock_video.duration = 30
            mock_video.write_videofile = MagicMock()
            mock_video_clip.return_value = mock_video
            mock_audio_clip.return_value = mock_video
            mock_image_clip.return_value = mock_video
            mock_composite.return_value = mock_video
            mock_concat.return_value = mock_video
            
            # Create necessary directories
            (temp_assets_dir / 'results').mkdir(exist_ok=True)
            
            # Run pipeline
            from threadjuice_main import create_threadjuice_video
            result = create_threadjuice_video(story_slug='test-story')
            
            # Verify some video was created
            assert mock_video.write_videofile.called