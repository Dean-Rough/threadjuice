# ThreadJuice Video Maker 🎬

Transform ThreadJuice stories into viral TikTok/Reels videos automatically!

## Features

- 🎯 **Relevant Backgrounds**: Uses Pexels API to find videos matching your story content
- 🎨 **ThreadJuice Branding**: Automatic watermarks and branded intro/outro
- 🗣️ **Multiple TTS Options**: Various voices including "The Terry" personality
- 📱 **Platform Optimized**: Creates vertical videos perfect for TikTok and Reels
- 🔄 **Fully Automated**: From story selection to final video output

## Setup

### 1. Install Dependencies

```bash
# Requires Python 3.10+
python setup_threadjuice.py
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# Required - From ThreadJuice
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Required for relevant backgrounds
PEXELS_API_KEY=your_pexels_api_key

# Optional - For premium voices
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 3. Test Installation

```bash
# List available stories
python threadjuice_main.py --list

# Create video from latest story
python threadjuice_main.py

# Create video from specific story
python threadjuice_main.py --slug "story-slug-here"
```

## Usage

### Basic Commands

```bash
# Generate video with relevant Pexels background
python threadjuice_main.py

# Use gaming background instead
python threadjuice_main.py --no-pexels

# Generate from specific story
python threadjuice_main.py --slug "mom-vs-vibrator-the-120-stand-off"
```

### Batch Processing

```bash
# Create videos for top 5 stories
python batch_videos.py --count 5

# Create videos for specific category
python batch_videos.py --category relationships
```

## Video Formats

### 1. Single Video (30-60 seconds)
- Complete story with top comment
- Perfect for high-drama stories

### 2. Multi-Part Series
- Split into 3 parts (20 seconds each)
- Drives profile visits with "Part 2 in comments"

### 3. Compilation Videos
- "Top 3 ThreadJuice Stories This Week"
- Great for weekly roundups

## Background Options

### Dynamic Pexels Backgrounds (Default)
- Automatically selects relevant videos based on:
  - Story category (relationships, workplace, etc.)
  - Keywords from title
  - Fallback to aesthetic backgrounds

### Gaming Backgrounds
- Minecraft Parkour
- Subway Surfers
- GTA Gameplay
- Rocket League

### Custom Backgrounds
Add your own in `utils/background_videos.json`

## Customization

### Voice Options
Edit `threadjuice_main.py` to change TTS voice:
- `en_us_001` - TikTok female
- `en_us_002` - TikTok male  
- `brian` - UK male
- `amy` - UK female

### Branding
Modify `threadjuice/branded_screenshots.py`:
- Change watermark position
- Adjust colors
- Add custom logos

### Video Style
Edit `.config/config.toml`:
```toml
[settings]
opacity = 0.9  # Text overlay opacity
storymode = true  # Full story mode

[settings.background]
background_audio_volume = 0.1  # Background music volume
```

## Output

Videos are saved to `results/` folder:
```
results/
├── ThreadJuice_Story_Title_TIMESTAMP.mp4
├── metadata.json
└── temp/ (temporary files)
```

## Tips for Viral Content

1. **Hook First**: First 3 seconds are crucial
2. **Use Trends**: Add trending audio in TikTok/Reels
3. **Multi-Part**: Split longer stories for engagement
4. **Call to Action**: "Full story in bio"
5. **Post Times**: 6-9am, 12-2pm, 7-10pm

## Troubleshooting

### No Pexels Videos Found
- Check API key is valid
- Try different keywords
- Falls back to gaming footage automatically

### Video Too Long
- TikTok max: 3 minutes
- Reels max: 90 seconds
- Adjust story selection for shorter content

### Poor Audio Quality
- Upgrade to ElevenLabs for premium voices
- Adjust silence_duration in config

## Advanced Usage

### Custom Story Selection
```python
from threadjuice.story_fetcher import ThreadJuiceFetcher

fetcher = ThreadJuiceFetcher()
viral_stories = fetcher.get_viral_stories(min_upvotes=5000)
```

### Programmatic Video Creation
```python
from threadjuice_main import create_threadjuice_video

# Create video for specific story
video_path = create_threadjuice_video(
    story_slug="epic-story-slug",
    use_pexels=True
)
```

## Contributing

This is based on RedditVideoMakerBot, adapted for ThreadJuice.
Feel free to submit issues and PRs!

## License

MIT License - See LICENSE file