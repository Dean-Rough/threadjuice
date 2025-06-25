"""
Pytest configuration and shared fixtures for ThreadJuice Video Maker tests
"""

import pytest
import os
import json
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
import tempfile
import shutil

# Add project root to path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

# Test data directory
FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture(autouse=True)
def mock_environment():
    """Mock environment variables for all tests"""
    with patch.dict(os.environ, {
        'NEXT_PUBLIC_SUPABASE_URL': 'https://test.supabase.co',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'test_key_123',
        'PEXELS_API_KEY': 'test_pexels_key',
        'ELEVENLABS_API_KEY': 'test_elevenlabs_key',
        'SPEECHIFY_API_KEY': 'test_speechify_key'
    }):
        yield


@pytest.fixture
def mock_story_data():
    """Mock ThreadJuice story data"""
    return {
        'slug': 'test-story-slug',
        'title': 'Test Viral Story: The Shocking Truth',
        'content': {
            'sections': [
                {
                    'type': 'describe-1',
                    'content': 'This is the first part of an amazing story about something unbelievable.'
                },
                {
                    'type': 'describe-2', 
                    'content': 'The story continues with even more shocking revelations.'
                },
                {
                    'type': 'comments-1',
                    'metadata': {
                        'comments': [
                            {
                                'content': 'OMG this is crazy!',
                                'author': 'testuser1',
                                'upvotes': 100,
                                'isOP': False
                            },
                            {
                                'content': 'I cant believe this happened',
                                'author': 'testuser2',
                                'upvotes': 50,
                                'isOP': False
                            }
                        ]
                    }
                }
            ]
        },
        'category': 'drama',
        'sourceUrl': 'https://reddit.com/r/test/comments/123/test',
        'sourceUsername': 'u/testuser',
        'upvoteCount': 5000,
        'commentCount': 150,
        'created_at': '2024-01-01T00:00:00Z',
        'status': 'published'
    }


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    mock_client = MagicMock()
    
    # Mock successful response
    mock_response = MagicMock()
    mock_response.data = []
    mock_response.error = None
    
    # Chain mocks for query building
    mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
    mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = mock_response
    
    return mock_client


@pytest.fixture
def mock_pexels_response():
    """Mock Pexels API response"""
    return {
        'videos': [
            {
                'id': 12345,
                'width': 1920,
                'height': 1080,
                'duration': 30,
                'user': {'name': 'Test Creator'},
                'video_files': [
                    {
                        'id': 1,
                        'quality': 'hd',
                        'file_type': 'video/mp4',
                        'width': 1920,
                        'height': 1080,
                        'link': 'https://test.pexels.com/video.mp4'
                    }
                ]
            }
        ],
        'total_results': 1,
        'page': 1,
        'per_page': 15
    }


@pytest.fixture
def temp_assets_dir():
    """Create temporary directory for test assets"""
    temp_dir = tempfile.mkdtemp()
    assets_path = Path(temp_dir) / "assets"
    assets_path.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    (assets_path / "temp").mkdir(exist_ok=True)
    (assets_path / "backgrounds" / "pexels").mkdir(parents=True, exist_ok=True)
    
    yield assets_path
    
    # Cleanup
    shutil.rmtree(temp_dir)


@pytest.fixture
def mock_audio_file(temp_assets_dir):
    """Create mock audio file"""
    audio_path = temp_assets_dir / "temp" / "test_audio.mp3"
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    audio_path.write_bytes(b'fake audio content')
    return audio_path


@pytest.fixture
def mock_video_file(temp_assets_dir):
    """Create mock video file"""
    video_path = temp_assets_dir / "backgrounds" / "test_video.mp4"
    video_path.parent.mkdir(parents=True, exist_ok=True)
    video_path.write_bytes(b'fake video content')
    return video_path


@pytest.fixture
def mock_image_file(temp_assets_dir):
    """Create mock image file"""
    image_path = temp_assets_dir / "temp" / "test_image.png"
    image_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create a simple PNG
    from PIL import Image
    img = Image.new('RGB', (100, 100), color='red')
    img.save(str(image_path))
    
    return image_path


@pytest.fixture
def mock_moviepy_clip():
    """Mock MoviePy VideoFileClip"""
    mock_clip = MagicMock()
    mock_clip.duration = 30.0
    mock_clip.fps = 30
    mock_clip.size = (1920, 1080)
    mock_clip.w = 1920
    mock_clip.h = 1080
    
    # Mock methods
    mock_clip.resize.return_value = mock_clip
    mock_clip.crop.return_value = mock_clip
    mock_clip.subclip.return_value = mock_clip
    mock_clip.set_audio.return_value = mock_clip
    mock_clip.set_position.return_value = mock_clip
    mock_clip.set_opacity.return_value = mock_clip
    
    return mock_clip


@pytest.fixture
def mock_gtts():
    """Mock gTTS for text-to-speech"""
    with patch('gtts.gTTS') as mock:
        instance = MagicMock()
        instance.save = MagicMock()
        mock.return_value = instance
        yield mock


@pytest.fixture
def mock_requests():
    """Mock requests library"""
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post:
        
        # Default successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True}
        mock_response.content = b'mock content'
        
        mock_get.return_value = mock_response
        mock_post.return_value = mock_response
        
        yield {
            'get': mock_get,
            'post': mock_post,
            'response': mock_response
        }


@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Cleanup any test files created during tests"""
    yield
    
    # Clean up test results directory
    test_results = Path("results") / "test_*"
    for file in Path("results").glob("test_*"):
        if file.exists():
            file.unlink()
            

@pytest.fixture
def capture_logs():
    """Capture log output during tests"""
    import logging
    from io import StringIO
    
    log_capture = StringIO()
    handler = logging.StreamHandler(log_capture)
    handler.setLevel(logging.DEBUG)
    
    # Add to root logger
    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    
    yield log_capture
    
    # Cleanup
    logger.removeHandler(handler)


# Pytest plugins configuration
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "unit: Unit tests for individual components"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests for full pipeline"
    )
    config.addinivalue_line(
        "markers", "external: Tests requiring external API access"
    )
    config.addinivalue_line(
        "markers", "slow: Tests that take significant time"
    )
    config.addinivalue_line(
        "markers", "mock: Tests using mocked dependencies"
    )