#!/usr/bin/env python3
"""
Automated website checker - Verifies layout issues from user feedback
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import os

SCREENSHOT_DIR = "/Users/mymac/portfolio/scripts/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def check_page(driver, url, page_name, width, height, size_name):
    """Check a page at specific viewport size"""
    driver.set_window_size(width, height)
    driver.get(url)
    time.sleep(2)
    
    issues = []
    
    # Take screenshot
    screenshot_path = f"{SCREENSHOT_DIR}/{page_name}_{size_name}_{width}x{height}.png"
    driver.save_screenshot(screenshot_path)
    
    # Check common issues
    try:
        # Check if element is visible in viewport
        if page_name == "index":
            # Check WELCOME text
            try:
                welcome = driver.find_element(By.CSS_SELECTOR, ".home-1__welcome-desktop")
                rect = welcome.rect
                if rect['y'] > height:
                    issues.append(f"WELCOME text out of viewport (y={rect['y']:.0f} > {height})")
            except:
                pass
            
            # Check dragon position
            try:
                dragon = driver.find_element(By.CSS_SELECTOR, ".philosophy__dragon")
                rect = dragon.rect
                if rect['width'] == 0 or rect['height'] == 0:
                    issues.append("Dragon has zero size")
            except:
                pass
            
            # Check gallery slider
            try:
                slider = driver.find_element(By.CSS_SELECTOR, ".gallery-preview__slides")
                rect = slider.rect
                if rect['y'] > height * 3:
                    issues.append(f"Gallery slider pushed too far down (y={rect['y']:.0f})")
            except:
                pass
                
        elif page_name == "about":
            # Check temple image
            try:
                temple = driver.find_element(By.CSS_SELECTOR, ".about-hero__temple")
                rect = temple.rect
                if width < 768 and rect['width'] < 200:
                    issues.append(f"Temple image too small (width={rect['width']:.0f})")
            except:
                pass
            
            # Check flower behind photo
            try:
                flower = driver.find_element(By.CSS_SELECTOR, ".about-me__flower")
                display = driver.execute_script("return window.getComputedStyle(arguments[0]).display", flower)
                if width < 768 and display == "none":
                    issues.append("Flower behind photo hidden on mobile")
            except:
                pass
            
            # Check contact card centering
            try:
                card = driver.find_element(By.CSS_SELECTOR, ".about-contact__card")
                rect = card.rect
                center_x = rect['x'] + rect['width'] / 2
                viewport_center = width / 2
                if abs(center_x - viewport_center) > 100:
                    issues.append(f"Contact card not centered (offset={center_x - viewport_center:.0f}px)")
            except:
                pass
        
        elif "gallery" in page_name or "pages/" in url:
            # Check heading position
            try:
                heading = driver.find_element(By.CSS_SELECTOR, ".project-section__heading, h1, .page-heading")
                rect = heading.rect
                nav = driver.find_element(By.CSS_SELECTOR, ".nav, .header, nav")
                nav_rect = nav.rect
                nav_bottom = nav_rect['y'] + nav_rect['height']
                
                if rect['y'] < nav_bottom + 20:
                    issues.append(f"Heading too close to navbar (gap={rect['y'] - nav_bottom:.0f}px)")
                
                # Check if heading is incorrectly centered
                heading_center_x = rect['x'] + rect['width'] / 2
                viewport_center = width / 2
                if abs(heading_center_x - viewport_center) < 50 and width > 600:
                    issues.append("Heading incorrectly centered (should be left-aligned)")
            except:
                pass
    
    except Exception as e:
        issues.append(f"Error checking: {str(e)}")
    
    return issues, screenshot_path

def main():
    print("=" * 60)
    print("AUTOMATED WEBSITE CHECK")
    print("Based on user feedback from takenote folder")
    print("=" * 60)
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    # Screen sizes to test
    sizes = [
        (1920, 1080, "desktop"),
        (768, 1024, "tablet"),
        (375, 812, "mobile"),
    ]
    
    # Pages to check
    pages = [
        ("http://localhost:3000/", "index", "Home Page"),
        ("http://localhost:3000/about.html", "about", "About Me Page"),
        ("http://localhost:3000/gallery.html", "gallery", "Gallery Page"),
        ("http://localhost:3000/pages/sound-design.html", "sound_design", "Sound Design Page"),
    ]
    
    all_issues = {}
    
    for url, page_name, page_title in pages:
        print(f"\n📄 {page_title}")
        print("-" * 40)
        
        for width, height, size_name in sizes:
            issues, screenshot = check_page(driver, url, page_name, width, height, size_name)
            
            key = f"{page_name}_{size_name}"
            all_issues[key] = issues
            
            if issues:
                print(f"  ⚠️ {size_name.upper()} ({width}x{height}):")
                for issue in issues:
                    print(f"     - {issue}")
            else:
                print(f"  ✅ {size_name.upper()} ({width}x{height}): OK")
    
    driver.quit()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    total_issues = sum(len(v) for v in all_issues.values())
    print(f"Total issues found: {total_issues}")
    print(f"Screenshots saved to: {SCREENSHOT_DIR}")
    
    # List pages with issues
    problematic = [k for k, v in all_issues.items() if v]
    if problematic:
        print(f"\nPages with issues: {', '.join(problematic)}")
    else:
        print("\n🎉 No major issues detected!")

if __name__ == "__main__":
    main()
