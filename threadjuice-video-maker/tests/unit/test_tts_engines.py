"""
Unit tests for Text-to-Speech engines
Testing various TTS providers and fallback mechanisms
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, mock_open
from pathlib import Path
import tempfile

from TTS.GTTS import GTTS
from TTS.engine_wrapper import TTSEngine
from video_creation.voices import save_text_to_mp3


class TestGoogleTTS:
    """Test Google Text-to-Speech engine"""
    
    @pytest.mark.unit
    def test_gtts_initialization(self):
        """Test GTTS initialization"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test Title'
        }
        
        tts = GTTS(reddit_obj)
        assert tts.reddit_object == reddit_obj
        assert hasattr(tts, 'run')
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_gtts_run_success(self, mock_gtts, temp_assets_dir):
        """Test successful TTS generation with gTTS"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test Title',
            'thread_content': 'This is test content.',
            'comments': [
                {
                    'comment_id': 'c1',
                    'comment_body': 'Test comment'
                }
            ]
        }
        
        with patch('pathlib.Path.mkdir'), \
             patch('pathlib.Path.exists', return_value=False):
            
            tts = GTTS(reddit_obj)
            result = tts.run(text='Test text', filepath='title.mp3')
            
            # Verify gTTS was called
            mock_gtts.assert_called_with(text='Test text', lang='en', slow=False)
            mock_gtts.return_value.save.assert_called()
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_gtts_language_detection(self, mock_gtts):
        """Test language detection in GTTS"""
        reddit_obj = {'thread_id': 'test', 'thread_title': 'Test'}
        
        # Test with different language settings
        with patch('utils.settings.config', {'reddit': {'thread': {'post_lang': 'es'}}}):
            tts = GTTS(reddit_obj)
            tts.run(text='Hola', filepath='test.mp3')
            
            # Should use Spanish
            mock_gtts.assert_called_with(text='Hola', lang='es', slow=False)


class TestTTSEngine:
    """Test TTS Engine wrapper"""
    
    @pytest.mark.unit
    def test_engine_initialization(self):
        """Test TTSEngine initialization"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test Title',
            'thread_content': 'Content',
            'comments': []
        }
        
        # Mock TTS module
        mock_tts_module = Mock()
        
        with patch('TTS.engine_wrapper.re.sub', return_value='test123'):
            engine = TTSEngine(mock_tts_module, reddit_obj)
            
            assert engine.tts_module == mock_tts_module()
            assert engine.reddit_object == reddit_obj
            assert engine.redditid == 'test123'
            assert engine.path == 'assets/temp/test123/mp3'
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_engine_run_title_only(self):
        """Test engine run with title only"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Amazing Story Title',
            'thread_content': '',
            'comments': []
        }
        
        mock_tts_module = Mock()
        mock_tts_instance = Mock()
        mock_tts_instance.run.return_value = True
        mock_tts_module.return_value = mock_tts_instance
        
        with patch('TTS.engine_wrapper.process_text', side_effect=lambda x: x), \
             patch('pathlib.Path.mkdir'), \
             patch('utils.settings.config', {'settings': {'storymode': True}}):
            
            engine = TTSEngine(mock_tts_module, reddit_obj)
            length, num_comments = engine.run()
            
            # Should have called TTS for title
            assert mock_tts_instance.run.call_count >= 1
            assert length > 0
            assert num_comments == 0
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_engine_run_with_comments(self):
        """Test engine run with title, content, and comments"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test Title',
            'thread_content': 'This is the main story content.',
            'comments': [
                {
                    'comment_id': 'c1',
                    'comment_body': 'Great story!',
                    'comment_author': 'user1'
                },
                {
                    'comment_id': 'c2',
                    'comment_body': 'I agree!',
                    'comment_author': 'user2'
                }
            ]
        }
        
        mock_tts_module = Mock()
        mock_tts_instance = Mock()
        mock_tts_instance.run.return_value = True
        mock_tts_module.return_value = mock_tts_instance
        
        with patch('TTS.engine_wrapper.process_text', side_effect=lambda x: x), \
             patch('pathlib.Path.mkdir'), \
             patch('utils.settings.config', {'settings': {'storymode': True}}), \
             patch('TTS.engine_wrapper.AudioFileClip') as mock_audio:
            
            # Mock audio duration
            mock_audio_instance = Mock()
            mock_audio_instance.duration = 5.0
            mock_audio.return_value = mock_audio_instance
            
            engine = TTSEngine(mock_tts_module, reddit_obj)
            length, num_comments = engine.run()
            
            # Should process title, content, and comments
            assert mock_tts_instance.run.call_count >= 3  # title + content + at least 1 comment
            assert num_comments > 0
            assert length > 0
    
    @pytest.mark.unit
    def test_engine_text_processing(self):
        """Test text processing for TTS"""
        from TTS.engine_wrapper import process_text
        
        # Mock settings for text processing
        with patch('utils.settings.config', {'reddit': {'thread': {'post_lang': 'en'}}}), \
             patch('utils.voice.sanitize_text', side_effect=lambda x: x.replace('*', '')):
            
            # Test basic processing
            result = process_text("Hello *world*!")
            assert result == "Hello world!"
            
            # Test with empty text
            result = process_text("")
            assert result == ""


class TestVoiceGeneration:
    """Test the main voice generation function"""
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_save_text_to_mp3_with_gtts(self, mock_gtts):
        """Test save_text_to_mp3 using GoogleTranslate"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test Story',
            'thread_content': 'Content here',
            'comments': []
        }
        
        with patch('utils.settings.config', {
            'settings': {
                'tts': {
                    'voice_choice': 'GoogleTranslate',
                    'random_voice': False
                }
            }
        }), \
        patch('video_creation.voices.TTSEngine') as mock_engine_class:
            
            # Mock engine instance
            mock_engine = Mock()
            mock_engine.run.return_value = (30.5, 2)  # 30.5 seconds, 2 comments
            mock_engine_class.return_value = mock_engine
            
            length, num_comments = save_text_to_mp3(reddit_obj)
            
            assert length == 30.5
            assert num_comments == 2
            mock_engine_class.assert_called_once()
            mock_engine.run.assert_called_once()
    
    @pytest.mark.unit
    @pytest.mark.mock
    def test_save_text_to_mp3_with_invalid_provider(self):
        """Test fallback when invalid TTS provider is specified"""
        reddit_obj = {
            'thread_id': 'test123',
            'thread_title': 'Test',
            'comments': []
        }
        
        with patch('utils.settings.config', {
            'settings': {
                'tts': {
                    'voice_choice': 'InvalidProvider',
                    'random_voice': False
                }
            }
        }), \
        patch('builtins.input', return_value='GoogleTranslate'), \
        patch('video_creation.voices.TTSEngine') as mock_engine:
            
            mock_engine.return_value.run.return_value = (10, 0)
            
            # Should prompt for valid provider
            length, num_comments = save_text_to_mp3(reddit_obj)
            
            assert length == 10
            assert num_comments == 0


@pytest.mark.integration
class TestTTSIntegration:
    """Integration tests for TTS functionality"""
    
    @pytest.mark.mock
    def test_full_tts_pipeline(self, temp_assets_dir, mock_gtts):
        """Test complete TTS pipeline from Reddit object to audio files"""
        reddit_obj = {
            'thread_id': 'integration_test',
            'thread_title': 'This is an Integration Test Story',
            'thread_content': 'The content of the story goes here. It should be converted to speech.',
            'comments': [
                {
                    'comment_id': 'comment1',
                    'comment_body': 'This is the first comment',
                    'comment_author': 'testuser1'
                },
                {
                    'comment_id': 'comment2', 
                    'comment_body': 'This is the second comment',
                    'comment_author': 'testuser2'
                }
            ]
        }
        
        with patch('utils.settings.config', {
            'settings': {
                'tts': {
                    'voice_choice': 'GoogleTranslate',
                    'random_voice': False,
                    'silence_duration': 0.5
                },
                'storymode': True
            },
            'reddit': {
                'thread': {
                    'post_lang': 'en'
                }
            }
        }), \
        patch('pathlib.Path.cwd', return_value=temp_assets_dir), \
        patch('pathlib.Path.mkdir'), \
        patch('TTS.engine_wrapper.AudioFileClip') as mock_audio:
            
            # Mock audio durations
            mock_audio_instance = Mock()
            mock_audio_instance.duration = 5.0
            mock_audio.return_value = mock_audio_instance
            
            # Run the pipeline
            length, num_comments = save_text_to_mp3(reddit_obj)
            
            # Verify results
            assert length > 0
            assert num_comments > 0
            
            # Verify gTTS was called for each text segment
            assert mock_gtts.call_count >= 3  # title + content + comments
    
    @pytest.mark.mock 
    def test_tts_error_handling(self):
        """Test TTS error handling and recovery"""
        reddit_obj = {
            'thread_id': 'error_test',
            'thread_title': 'Error Test',
            'comments': []
        }
        
        with patch('utils.settings.config', {
            'settings': {
                'tts': {'voice_choice': 'GoogleTranslate'}
            }
        }), \
        patch('TTS.GTTS.GTTS.run', side_effect=Exception("TTS Error")), \
        patch('video_creation.voices.TTSEngine') as mock_engine:
            
            # Engine should handle the error
            mock_engine.return_value.run.side_effect = Exception("TTS Engine Error")
            
            with pytest.raises(Exception):
                save_text_to_mp3(reddit_obj)