#!/usr/bin/env python3
"""
Simplified Comprehensive Website Test - Compare against takenote feedback
Tests: Index, About, Gallery at Desktop/Tablet/Mobile sizes
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import os
import json

SCREENSHOT_DIR = "/Users/mymac/portfolio/scripts/comprehensive_test"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def check_layout_issues(driver, page_name, size_name, width):
    """Check for common layout issues based on takenote feedback"""
    issues = []
    
    # Page-specific checks based on takenote feedback
    if page_name == "index":
        # Check WELCOME visibility (only for desktop/tablet - mobile hides it by design)
        if size_name != "mobile":
            try:
                welcome = driver.find_element(By.CSS_SELECTOR, ".home-1__welcome-desktop")
                rect = welcome.rect
                if rect['height'] == 0:
                    issues.append("WELCOME text has zero height")
            except:
                pass
        
        # Check dragon
        try:
            dragon = driver.find_element(By.CSS_SELECTOR, ".philosophy__dragon")
            rect = dragon.rect
            if rect['width'] == 0:
                issues.append("Dragon not visible")
        except:
            pass
                
        # Check gallery slider visibility
        try:
            slogans = driver.find_element(By.CSS_SELECTOR, ".gallery-preview__slogans")
            display = driver.execute_script("return window.getComputedStyle(arguments[0]).display", slogans)
            if display == "none":
                issues.append("Gallery slogans hidden")
        except:
            pass
            
    elif page_name == "about":
        # Check temple size
        try:
            temple = driver.find_element(By.CSS_SELECTOR, ".about-hero__temple")
            rect = temple.rect
            if size_name == "mobile" and rect['width'] < 300:
                issues.append(f"Temple too small ({rect['width']:.0f}px)")
            elif rect['width'] > 0:
                pass  # OK
        except:
            pass
            
        # Check flower behind photo
        try:
            flower = driver.find_element(By.CSS_SELECTOR, ".about-me__flower")
            display = driver.execute_script("return window.getComputedStyle(arguments[0]).display", flower)
            rect = flower.rect
            if size_name == "mobile" and display == "none":
                issues.append("Flower hidden on mobile")
            elif rect['width'] > 0:
                pass  # OK
        except:
            pass
            
    elif "sound" in page_name or page_name == "gallery_project":
        # Check heading spacing from navbar
        try:
            header = driver.find_element(By.CSS_SELECTOR, ".project__header")
            rect = header.rect
            if rect['y'] < 80:
                issues.append(f"Heading too close to top (y={rect['y']:.0f}px)")
        except:
            pass
    
    return issues

def run_test():
    print("=" * 70)
    print("COMPREHENSIVE WEBSITE TEST")
    print("=" * 70)
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    sizes = [
        (1920, 1080, "desktop"),
        (768, 1024, "tablet"),
        (375, 812, "mobile"),
    ]
    
    pages = [
        ("http://localhost:3000/", "index", "Home Page"),
        ("http://localhost:3000/about.html", "about", "About Page"),
        ("http://localhost:3000/gallery.html", "gallery", "Gallery Page"),
        ("http://localhost:3000/pages/sound-design.html", "sound_design", "Sound Design"),
    ]
    
    results = {"takenote_issues": [], "ok_pages": []}
    
    for url, page_name, page_title in pages:
        print(f"\n📄 {page_title}")
        
        for width, height, size_name in sizes:
            driver.set_window_size(width, height)
            driver.get(url)
            time.sleep(1.5)
            
            # Capture simple viewport screenshot
            ss_path = f"{SCREENSHOT_DIR}/{page_name}_{size_name}.png"
            try:
                driver.save_screenshot(ss_path)
            except:
                pass
            
            # Check issues
            issues = check_layout_issues(driver, page_name, size_name, width)
            
            if issues:
                print(f"  ⚠️ {size_name.upper()}: {', '.join(issues)}")
                results["takenote_issues"].extend([f"{page_name}/{size_name}: {i}" for i in issues])
            else:
                print(f"  ✅ {size_name.upper()}: OK")
                results["ok_pages"].append(f"{page_name}/{size_name}")
    
    driver.quit()
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY (Based on Takenote Feedback)")
    print("=" * 70)
    
    total_issues = len(results["takenote_issues"])
    print(f"\n✅ Pages OK: {len(results['ok_pages'])}")
    print(f"⚠️ Issues found: {total_issues}")
    
    if results["takenote_issues"]:
        print("\nRemaining Issues:")
        for issue in results["takenote_issues"]:
            print(f"  - {issue}")
    
    print(f"\n📷 Screenshots saved to: {SCREENSHOT_DIR}")
    
    # Save results
    with open(f"{SCREENSHOT_DIR}/results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    return results

if __name__ == "__main__":
    run_test()
