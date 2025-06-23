#!/usr/bin/env python
"""
ThreadJuice Video Maker Setup
Installs dependencies and configures environment
"""

import os
import sys
import subprocess
from pathlib import Path


def check_python_version():
    """Ensure Python 3.10+ is installed"""
    if sys.version_info < (3, 10):
        print("❌ Python 3.10+ is required")
        print(f"   Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")


def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing dependencies...")
    
    # Add supabase to requirements
    requirements_path = Path(__file__).parent / 'requirements.txt'
    requirements = requirements_path.read_text()
    
    if 'supabase' not in requirements:
        print("Adding supabase to requirements...")
        with open(requirements_path, 'a') as f:
            f.write('\nsupabase==2.10.0\n')
    
    # Install packages
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    print("✅ Dependencies installed")


def setup_playwright():
    """Install Playwright browsers"""
    print("\n🎭 Setting up Playwright...")
    subprocess.check_call([sys.executable, '-m', 'playwright', 'install'])
    print("✅ Playwright browsers installed")


def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    dirs = [
        'assets/backgrounds/pexels',
        'assets/backgrounds/gaming',
        'results',
        'temp'
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        
    print("✅ Directories created")


def check_env_vars():
    """Check for required environment variables"""
    print("\n🔐 Checking environment variables...")
    
    required_vars = {
        'NEXT_PUBLIC_SUPABASE_URL': 'Supabase URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase Anon Key',
        'PEXELS_API_KEY': 'Pexels API Key (for video backgrounds)'
    }
    
    env_path = Path(__file__).parent.parent / '.env.local'
    
    missing = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            # Try to load from .env.local
            if env_path.exists():
                with open(env_path) as f:
                    for line in f:
                        if line.startswith(f"{var}="):
                            os.environ[var] = line.split('=', 1)[1].strip()
                            break
            
            if not os.getenv(var):
                missing.append(f"  - {var}: {description}")
    
    if missing:
        print("⚠️  Missing environment variables:")
        for var in missing:
            print(var)
        print("\nAdd these to your .env.local file")
    else:
        print("✅ All environment variables found")


def download_sample_backgrounds():
    """Download sample background videos"""
    print("\n🎬 Setting up background videos...")
    
    # The original script will download from YouTube
    # We'll skip this for now and use Pexels instead
    print("✅ Will use Pexels for dynamic backgrounds")


def create_config():
    """Create default configuration"""
    print("\n⚙️  Creating configuration...")
    
    config_dir = Path(__file__).parent / '.config'
    config_dir.mkdir(exist_ok=True)
    
    config_file = config_dir / 'config.toml'
    if not config_file.exists():
        config_content = """
[settings]
theme = "dark"
times_to_run = 1
opacity = 0.9
storymode = true

[settings.background]
background_video = "pexels-dynamic"
background_audio = "lofi"
background_audio_volume = 0.1

[settings.tts]
voice = "en_us_001"
silence_duration = 0.3
"""
        config_file.write_text(config_content)
        print("✅ Configuration created")
    else:
        print("✅ Configuration already exists")


def test_setup():
    """Test the setup"""
    print("\n🧪 Testing setup...")
    
    try:
        # Test imports
        from threadjuice.story_fetcher import ThreadJuiceFetcher
        from threadjuice.pexels_videos import PexelsVideoFetcher
        
        # Test Supabase connection
        fetcher = ThreadJuiceFetcher()
        stories = fetcher.get_stories(limit=1)
        
        if stories:
            print("✅ Successfully connected to ThreadJuice database")
            print(f"   Found story: {stories[0].title[:50]}...")
        else:
            print("⚠️  Connected to database but no stories found")
            
        # Test Pexels
        if os.getenv('PEXELS_API_KEY'):
            pexels = PexelsVideoFetcher()
            videos = pexels.search_videos("office", per_page=1)
            if videos:
                print("✅ Pexels API working")
            else:
                print("⚠️  Pexels API key set but no results")
        else:
            print("⚠️  No Pexels API key (videos will use default backgrounds)")
            
    except Exception as e:
        print(f"❌ Setup test failed: {e}")
        return False
        
    return True


def main():
    """Run setup process"""
    print("""
╔══════════════════════════════════════════════╗
║     ThreadJuice Video Maker Setup            ║
╚══════════════════════════════════════════════╝
    """)
    
    # Check Python version
    check_python_version()
    
    # Install dependencies
    install_dependencies()
    
    # Setup Playwright
    setup_playwright()
    
    # Create directories
    create_directories()
    
    # Check environment
    check_env_vars()
    
    # Create config
    create_config()
    
    # Test setup
    if test_setup():
        print("""
╔══════════════════════════════════════════════╗
║            ✅ Setup Complete!                ║
╚══════════════════════════════════════════════╝

Next steps:
1. Run a test video: python threadjuice_main.py --list
2. Create your first video: python threadjuice_main.py
3. Check the 'results' folder for output

Happy video making! 🎬
        """)
    else:
        print("\n⚠️  Setup completed with warnings. Check the errors above.")


if __name__ == "__main__":
    main()