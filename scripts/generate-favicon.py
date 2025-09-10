#!/usr/bin/env python3

from PIL import Image, ImageDraw, ImageFont
import os

# Manylla theme colors
PRIMARY_COLOR = (160, 134, 112)  # #A08670 Manila brown (updated)
TEXT_COLOR = (255, 255, 255)     # White text

def generate_favicon(size):
    """Generate a favicon with the Manylla 'm' profile avatar design"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw background circle
    draw.ellipse([0, 0, size-1, size-1], fill=PRIMARY_COLOR)
    
    # Draw the letter 'm'
    # Try to use a good font, fallback to default if not available
    font_size = int(size * 0.55)
    try:
        # Try common system fonts
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", font_size)
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
    y = (size - text_height) / 2 - bbox[1] + (size * 0.02)  # Slight vertical adjustment
    
    # Draw the text
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)
    
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

# Also create a favicon.ico with multiple sizes
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [generate_favicon(size[0]) for size in ico_sizes]
ico_path = os.path.join(public_dir, 'favicon.ico')
ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes, append_images=ico_images[1:])
print(f"Generated favicon.ico with sizes: {ico_sizes}")

print("All favicons generated successfully!")