#!/usr/bin/env python
"""
Wrapper to handle settings and run ThreadJuice video generation
"""

import os
import sys
from pathlib import Path
import toml

# Add to path
sys.path.append(str(Path(__file__).parent))

# Load config
config_path = Path(__file__).parent / '.config' / 'config.toml'
if config_path.exists():
    with open(config_path) as f:
        config_data = toml.load(f)
else:
    # Default config
    config_data = {
        'settings': {
            'storymode': True,
            'opacity': 0.9,
            'tts': {
                'voice_choice': 'en_us_001',
                'silence_duration': 0.5
            },
            'background': {
                'background_video': 'minecraft',
                'background_audio': '',
                'background_audio_volume': 0.1
            }
        }
    }

# Monkey patch the settings module
from utils import settings
settings.config = config_data

# Now run the main script
from threadjuice_main import main
main()