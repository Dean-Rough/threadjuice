#!/usr/bin/env python
"""
ThreadJuice Branded Screenshots
Creates story screenshots with ThreadJuice branding
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import textwrap


class ThreadJuiceBranding:
    """Adds ThreadJuice branding to screenshots"""
    
    # Brand colors
    ORANGE = '#FF6B35'
    DARK_BG = '#0A0A0A'
    LIGHT_TEXT = '#FFFFFF'
    
    def __init__(self):
        self.assets_dir = Path(__file__).parent / 'assets'
        self.assets_dir.mkdir(exist_ok=True)
        
    def add_watermark(self, image_path: Path, output_path: Path = None):
        """Add ThreadJuice watermark to image"""
        if output_path is None:
            output_path = image_path
            
        img = Image.open(image_path)
        draw = ImageDraw.Draw(img)
        
        # Add watermark text in corner
        try:
            # Try to use custom font
            font_path = Path(__file__).parent.parent / 'fonts' / 'Roboto-Bold.ttf'
            if font_path.exists():
                font = ImageFont.truetype(str(font_path), 20)
            else:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
            
        text = "ThreadJuice.com"
        
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position in bottom right
        x = img.width - text_width - 20
        y = img.height - text_height - 20
        
        # Add shadow
        draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 128))
        # Add text
        draw.text((x, y), text, font=font, fill=self.ORANGE)
        
        img.save(output_path)
        
    def create_title_card(self, title: str, output_path: Path):
        """Create a title card with ThreadJuice branding"""
        # Create image
        img = Image.new('RGB', (1080, 1920), color=self.DARK_BG)
        draw = ImageDraw.Draw(img)
        
        # Load fonts
        try:
            font_path = Path(__file__).parent.parent / 'fonts' / 'Roboto-Bold.ttf'
            if font_path.exists():
                title_font = ImageFont.truetype(str(font_path), 60)
                brand_font = ImageFont.truetype(str(font_path), 40)
            else:
                title_font = ImageFont.load_default()
                brand_font = ImageFont.load_default()
        except:
            title_font = ImageFont.load_default()
            brand_font = ImageFont.load_default()
            
        # Add brand name at top
        brand_text = "THREADJUICE"
        bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
        brand_width = bbox[2] - bbox[0]
        draw.text((540 - brand_width // 2, 100), brand_text, font=brand_font, fill=self.ORANGE)
        
        # Add "presents" text
        presents_text = "presents"
        bbox = draw.textbbox((0, 0), presents_text, font=brand_font)
        presents_width = bbox[2] - bbox[0]
        draw.text((540 - presents_width // 2, 180), presents_text, font=brand_font, fill=self.LIGHT_TEXT)
        
        # Wrap and add title
        wrapped_title = textwrap.fill(title, width=20)
        lines = wrapped_title.split('\n')
        
        y_offset = 960 - (len(lines) * 70) // 2
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=title_font)
            line_width = bbox[2] - bbox[0]
            draw.text((540 - line_width // 2, y_offset), line, font=title_font, fill=self.LIGHT_TEXT)
            y_offset += 80
            
        # Add bottom tagline
        tagline = "Swipe up for full story"
        bbox = draw.textbbox((0, 0), tagline, font=brand_font)
        tagline_width = bbox[2] - bbox[0]
        draw.text((540 - tagline_width // 2, 1700), tagline, font=brand_font, fill=self.ORANGE)
        
        img.save(output_path)
        
    def create_end_card(self, story_url: str, output_path: Path):
        """Create end card with CTA"""
        img = Image.new('RGB', (1080, 1920), color=self.DARK_BG)
        draw = ImageDraw.Draw(img)
        
        try:
            font_path = Path(__file__).parent.parent / 'fonts' / 'Roboto-Bold.ttf'
            if font_path.exists():
                title_font = ImageFont.truetype(str(font_path), 80)
                url_font = ImageFont.truetype(str(font_path), 40)
                cta_font = ImageFont.truetype(str(font_path), 50)
            else:
                title_font = ImageFont.load_default()
                url_font = ImageFont.load_default()
                cta_font = ImageFont.load_default()
        except:
            title_font = ImageFont.load_default()
            url_font = ImageFont.load_default()
            cta_font = ImageFont.load_default()
            
        # Add main text
        main_text = "WANT MORE?"
        bbox = draw.textbbox((0, 0), main_text, font=title_font)
        main_width = bbox[2] - bbox[0]
        draw.text((540 - main_width // 2, 700), main_text, font=title_font, fill=self.ORANGE)
        
        # Add CTA
        cta_text = "Read the full story at"
        bbox = draw.textbbox((0, 0), cta_text, font=cta_font)
        cta_width = bbox[2] - bbox[0]
        draw.text((540 - cta_width // 2, 900), cta_text, font=cta_font, fill=self.LIGHT_TEXT)
        
        # Add URL
        url_text = "ThreadJuice.com"
        bbox = draw.textbbox((0, 0), url_text, font=title_font)
        url_width = bbox[2] - bbox[0]
        draw.text((540 - url_width // 2, 1000), url_text, font=title_font, fill=self.ORANGE)
        
        # Add emoji prompts
        emoji_text = "👆 Link in bio 👆"
        bbox = draw.textbbox((0, 0), emoji_text, font=cta_font)
        emoji_width = bbox[2] - bbox[0]
        draw.text((540 - emoji_width // 2, 1200), emoji_text, font=cta_font, fill=self.LIGHT_TEXT)
        
        img.save(output_path)