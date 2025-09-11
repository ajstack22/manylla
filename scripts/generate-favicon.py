#!/usr/bin/env python3

from PIL import Image, ImageDraw, ImageFont
import os

# Manylla theme colors - string tie design
BROWN_COLOR = (160, 134, 112)    # #A08670 Manylla brown
MANILA_COLOR = (244, 228, 193)   # #F4E4C1 Manila envelope color  
RED_COLOR = (204, 0, 0)          # #CC0000 String tie red
WHITE_COLOR = (255, 255, 255)    # White gap

def generate_favicon(size):
    """Generate a favicon with the Manylla string tie design"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # Calculate dimensions
    center = size / 2
    main_radius = (size / 2) * 0.875  # Main circle radius
    
    # Draw red border (string tie)
    red_radius = main_radius + (size * 0.03)
    draw.ellipse([center - red_radius, center - red_radius, 
                  center + red_radius, center + red_radius], 
                 fill=RED_COLOR)
    
    # Draw white gap ring
    white_radius = main_radius + (size * 0.015)
    draw.ellipse([center - white_radius, center - white_radius,
                  center + white_radius, center + white_radius],
                 fill=WHITE_COLOR)
    
    # Draw brown background circle
    draw.ellipse([center - main_radius, center - main_radius,
                  center + main_radius, center + main_radius],
                 fill=BROWN_COLOR)
    
    # Draw the letter 'm' in manila color
    font_size = int(size * 0.56)
    try:
        # Try to use Georgia serif font for consistency
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", font_size)
    except:
        try:
            # Try Times New Roman as fallback serif
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Times New Roman.ttf", font_size)
        except:
            try:
                # Linux serif fallback
                font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", font_size)
            except:
                # Use default font as last resort
                font = ImageFont.load_default()
    
    # Get text bounding box for centering
    text = 'm'
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate position to center the text
    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1] + (size * 0.03)  # Slight vertical adjustment
    
    # Draw the text
    draw.text((x, y), text, fill=MANILA_COLOR, font=font)
    
    return img

# Get the public directory path
script_dir = os.path.dirname(os.path.abspath(__file__))
public_dir = os.path.join(os.path.dirname(script_dir), 'public')

# Generate all sizes
sizes = [
    (16, 'favicon-16.png'),
    (32, 'favicon-32.png'),
    (192, 'logo192.png'),
    (512, 'logo512.png')
]

for size, filename in sizes:
    img = generate_favicon(size)
    filepath = os.path.join(public_dir, filename)
    img.save(filepath, 'PNG')
    print(f"Generated {filename} ({size}x{size})")

# Generate .ico file with multiple sizes
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [generate_favicon(size[0]).resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
ico_path = os.path.join(public_dir, 'favicon.ico')
ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes, append_images=ico_images[1:])
print(f"Generated favicon.ico with sizes: {ico_sizes}")

print("All favicons generated successfully!")