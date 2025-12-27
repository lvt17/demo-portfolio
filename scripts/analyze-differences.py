#!/usr/bin/env python3
"""
Analyze differences in philosophy section layout
"""

from PIL import Image
import numpy as np
import sys

def analyze_layout_diff(img1_path, img2_path):
    """Analyze layout differences between two images"""
    img1 = Image.open(img1_path)
    img2 = Image.open(img2_path)
    
    # Resize to same size
    if img1.size != img2.size:
        img2 = img2.resize(img1.size, Image.Resampling.LANCZOS)
    
    # Convert to RGB
    if img1.mode != 'RGB':
        img1 = img1.convert('RGB')
    if img2.mode != 'RGB':
        img2 = img2.convert('RGB')
    
    arr1 = np.array(img1)
    arr2 = np.array(img2)
    
    # Find differences
    diff = np.abs(arr1.astype(int) - arr2.astype(int))
    mask = np.any(diff > 10, axis=2)
    
    height, width = mask.shape
    
    # Analyze horizontal distribution (left vs right)
    left_half = mask[:, :width//2]
    right_half = mask[:, width//2:]
    
    left_diff = np.sum(left_half)
    right_diff = np.sum(right_half)
    
    print(f"\n📊 Layout Analysis:")
    print(f"   Image size: {width}x{height}")
    print(f"   Left half differences: {left_diff:,} ({left_diff/(left_half.size)*100:.1f}%)")
    print(f"   Right half differences: {right_diff:,} ({right_diff/(right_half.size)*100:.1f}%)")
    
    # Analyze vertical distribution
    top_third = mask[:height//3, :]
    middle_third = mask[height//3:2*height//3, :]
    bottom_third = mask[2*height//3:, :]
    
    print(f"\n📐 Vertical Distribution:")
    print(f"   Top third: {np.sum(top_third):,} ({np.sum(top_third)/top_third.size*100:.1f}%)")
    print(f"   Middle third: {np.sum(middle_third):,} ({np.sum(middle_third)/middle_third.size*100:.1f}%)")
    print(f"   Bottom third: {np.sum(bottom_third):,} ({np.sum(bottom_third)/bottom_third.size*100:.1f}%)")
    
    # Find specific regions with high differences
    print(f"\n🔍 High Difference Regions:")
    
    # Check top area (button region)
    top_area = mask[:150, :]
    if np.sum(top_area) > top_area.size * 0.5:
        print(f"   ⚠️  Top area (0-150px): High differences - likely button position issue")
    
    # Check left side (dragon region)
    left_area = mask[:, :width//2]
    if np.sum(left_area) > left_area.size * 0.5:
        print(f"   ⚠️  Left side (0-{width//2}px): High differences - likely dragon position/size issue")
    
    # Check right side (text region)
    right_area = mask[:, width//2:]
    if np.sum(right_area) > right_area.size * 0.5:
        print(f"   ⚠️  Right side ({width//2}-{width}px): High differences - likely text position issue")
    
    # Check bottom area
    bottom_area = mask[height-200:, :]
    if np.sum(bottom_area) > bottom_area.size * 0.5:
        print(f"   ⚠️  Bottom area ({height-200}-{height}px): High differences - likely button/flower position issue")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/analyze-differences.py <image1> <image2>")
        sys.exit(1)
    
    analyze_layout_diff(sys.argv[1], sys.argv[2])

