#!/usr/bin/env python3
"""
Generate favicon with lowercase 'm' in a clean sans-serif font
Creates a 32x32 ICO file with manila envelope background
"""

import struct
import os

def create_simple_ico():
    # Define colors
    manila = (196, 166, 107)  # #C4A66B
    dark_brown = (61, 47, 31)  # #3D2F1F
    
    # Create a simple 16x16 bitmap representation of lowercase 'm'
    # This is a simplified representation
    m_pattern = [
        "                ",
        "                ",
        "                ",
        "                ",
        "  ##  ##  ##    ",
        "  ### ### ##    ",
        "  ## ## ## ##   ",
        "  ## ## ## ##   ",
        "  ##  #  # ##   ",
        "  ##     # ##   ",
        "  ##     # ##   ",
        "  ##     # ##   ",
        "                ",
        "                ",
        "                ",
        "                ",
    ]
    
    # Create bitmap data (BMP format embedded in ICO)
    width = 16
    height = 16
    
    # BMP header
    bmp_header = struct.pack('<2sIHHI', b'BM', 40 + width * height * 3, 0, 0, 40)
    
    # DIB header
    dib_header = struct.pack('<IIIHHIIIIII', 
        40,  # header size
        width,  # width
        height,  # height
        1,  # planes
        24,  # bits per pixel
        0,  # compression
        width * height * 3,  # image size
        0, 0, 0, 0  # resolution and colors
    )
    
    # Create pixel data (bottom-up, BGR format)
    pixel_data = bytearray()
    for y in range(height - 1, -1, -1):
        for x in range(width):
            if m_pattern[y][x] == '#':
                # Dark brown for the letter
                pixel_data.extend([dark_brown[2], dark_brown[1], dark_brown[0]])
            else:
                # Manila background
                pixel_data.extend([manila[2], manila[1], manila[0]])
    
    # ICO header
    ico_header = struct.pack('<HHH', 0, 1, 1)  # reserved, type, count
    
    # ICO directory entry
    ico_entry = struct.pack('<BBBBHHII',
        width,  # width
        height,  # height
        0,  # color palette
        0,  # reserved
        1,  # color planes
        24,  # bits per pixel
        len(bmp_header) + len(dib_header) + len(pixel_data),  # size
        22  # offset to image data
    )
    
    # Combine all parts
    ico_data = ico_header + ico_entry + bmp_header + dib_header + pixel_data
    
    # Write ICO file
    with open('favicon.ico', 'wb') as f:
        f.write(ico_data)
    
    print("✅ Created favicon.ico with lowercase 'm' in manila colors")

if __name__ == "__main__":
    create_simple_ico()