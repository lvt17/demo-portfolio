#!/usr/bin/env python3
"""
Compare two images pixel-by-pixel to find differences
Usage: python3 scripts/compare-images.py <image1> <image2> [output_diff]
"""

import sys
from PIL import Image
import numpy as np

def compare_images(img1_path, img2_path, output_diff=None, threshold=10):
    """Compare two images and highlight differences"""
    # Load images
    img1 = Image.open(img1_path)
    img2 = Image.open(img2_path)
    
    # Resize to same size if different
    if img1.size != img2.size:
        print(f"⚠️  Images have different sizes: {img1.size} vs {img2.size}")
        # Resize img2 to match img1
        img2 = img2.resize(img1.size, Image.Resampling.LANCZOS)
        print(f"   Resized img2 to {img1.size}")
    
    # Convert to RGB if needed
    if img1.mode != 'RGB':
        img1 = img1.convert('RGB')
    if img2.mode != 'RGB':
        img2 = img2.convert('RGB')
    
    # Convert to numpy arrays
    arr1 = np.array(img1)
    arr2 = np.array(img2)
    
    # Calculate difference
    diff = np.abs(arr1.astype(int) - arr2.astype(int))
    
    # Create difference mask (where difference > threshold)
    mask = np.any(diff > threshold, axis=2)
    
    # Count different pixels
    diff_count = np.sum(mask)
    total_pixels = mask.size
    diff_percentage = (diff_count / total_pixels) * 100
    
    print(f"\n📊 Comparison Results:")
    print(f"   Image 1: {img1_path} ({img1.size[0]}x{img1.size[1]})")
    print(f"   Image 2: {img2_path} ({img2.size[0]}x{img2.size[1]})")
    print(f"   Different pixels: {diff_count:,} / {total_pixels:,} ({diff_percentage:.2f}%)")
    print(f"   Threshold: {threshold}")
    
    # Find bounding box of differences
    if diff_count > 0:
        rows = np.any(mask, axis=1)
        cols = np.any(mask, axis=0)
        if np.any(rows) and np.any(cols):
            top = np.argmax(rows)
            bottom = len(rows) - np.argmax(rows[::-1])
            left = np.argmax(cols)
            right = len(cols) - np.argmax(cols[::-1])
            print(f"\n📍 Difference bounding box:")
            print(f"   Top: {top}px, Left: {left}px")
            print(f"   Bottom: {bottom}px, Right: {right}px")
            print(f"   Width: {right - left}px, Height: {bottom - top}px")
    
    # Create visual diff image
    if output_diff:
        diff_img = img1.copy()
        # Highlight differences in red
        diff_img_array = np.array(diff_img)
        diff_img_array[mask] = [255, 0, 0]  # Red for differences
        diff_img = Image.fromarray(diff_img_array)
        diff_img.save(output_diff)
        print(f"\n💾 Difference image saved to: {output_diff}")
    
    # Analyze differences by region (for layout analysis)
    if diff_count > 0:
        height, width = mask.shape
        regions = {
            'top': (0, height//3),
            'middle': (height//3, 2*height//3),
            'bottom': (2*height//3, height)
        }
        print(f"\n📐 Differences by region:")
        for name, (start, end) in regions.items():
            region_mask = mask[start:end, :]
            region_diff = np.sum(region_mask)
            region_total = region_mask.size
            region_pct = (region_diff / region_total) * 100 if region_total > 0 else 0
            print(f"   {name.capitalize()}: {region_diff:,} / {region_total:,} ({region_pct:.2f}%)")
    
    return {
        'diff_count': diff_count,
        'total_pixels': total_pixels,
        'diff_percentage': diff_percentage,
        'mask': mask
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/compare-images.py <image1> <image2> [output_diff]")
        sys.exit(1)
    
    img1_path = sys.argv[1]
    img2_path = sys.argv[2]
    output_diff = sys.argv[3] if len(sys.argv) > 3 else None
    
    compare_images(img1_path, img2_path, output_diff)

