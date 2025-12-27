#!/usr/bin/env python3
"""
Crop philosophy section from screenshots and compare
"""

from PIL import Image
import sys

def crop_philosophy_section(img_path, output_path, y_start=0, y_end=None, x_start=0, x_end=None):
    """Crop philosophy section from full page screenshot"""
    img = Image.open(img_path)
    width, height = img.size
    
    # Default: crop entire width, from y_start to y_end
    if y_end is None:
        y_end = height
    if x_end is None:
        x_end = width
    
    # Crop the section
    cropped = img.crop((x_start, y_start, x_end, y_end))
    cropped.save(output_path)
    print(f"✓ Cropped {img_path} -> {output_path} ({cropped.size[0]}x{cropped.size[1]})")
    return cropped

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/crop-and-compare.py <input> <output> [y_start] [y_end] [x_start] [x_end]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    y_start = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    y_end = int(sys.argv[4]) if len(sys.argv) > 4 else None
    x_start = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    x_end = int(sys.argv[6]) if len(sys.argv) > 6 else None
    
    crop_philosophy_section(input_path, output_path, y_start, y_end, x_start, x_end)

