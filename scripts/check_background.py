#!/usr/bin/env python3
"""
Script kiểm tra animated background trên portfolio website
Sử dụng Selenium để tự động hóa
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import os

def main():
    print("🔍 Starting background animation check...")
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run without GUI
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Initialize driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("http://localhost:3000")
        
        print("✅ Page loaded successfully")
        
        # Wait for page to load
        time.sleep(3)
        
        # Check for canvas element
        print("\n📋 Checking for canvas elements...")
        
        try:
            canvas_container = driver.find_element(By.ID, "bg-canvas-home-1")
            print(f"  ✅ Found #bg-canvas-home-1 container")
            
            # Check if canvas is inside
            canvases = canvas_container.find_elements(By.TAG_NAME, "canvas")
            if canvases:
                print(f"  ✅ Found {len(canvases)} canvas element(s) inside container")
                for i, canvas in enumerate(canvases):
                    width = canvas.get_attribute("width")
                    height = canvas.get_attribute("height")
                    print(f"     Canvas {i+1}: {width}x{height}")
            else:
                print("  ❌ NO canvas found inside container - p5.js NOT initialized!")
                
        except Exception as e:
            print(f"  ❌ Container #bg-canvas-home-1 not found: {e}")
        
        # Check for JavaScript errors
        print("\n📋 Checking browser console for errors...")
        logs = driver.get_log("browser")
        errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if errors:
            print(f"  ❌ Found {len(errors)} JavaScript error(s):")
            for error in errors:
                print(f"     - {error['message']}")
        else:
            print("  ✅ No JavaScript errors found")
            
        # Check if p5 is defined
        print("\n📋 Checking if p5.js is loaded...")
        p5_defined = driver.execute_script("return typeof p5 !== 'undefined'")
        print(f"  {'✅' if p5_defined else '❌'} p5 library: {'loaded' if p5_defined else 'NOT loaded'}")
        
        # Check CSS of home-1__bg
        print("\n📋 Checking CSS of .home-1__bg...")
        try:
            home_bg = driver.find_element(By.CSS_SELECTOR, ".home-1__bg")
            display = driver.execute_script("return window.getComputedStyle(arguments[0]).display", home_bg)
            print(f"  .home-1__bg display: {display}")
            if display == "none":
                print("  ✅ Static background is hidden (correct)")
            else:
                print("  ⚠️ Static background is visible - might be showing instead of canvas!")
        except:
            print("  ❌ .home-1__bg not found")
        
        # Take screenshots to check animation
        print("\n📷 Taking screenshots to check animation...")
        screenshot_dir = "/Users/mymac/portfolio/scripts"
        
        driver.save_screenshot(f"{screenshot_dir}/bg_check_1.png")
        print(f"  Screenshot 1 saved")
        
        time.sleep(2)  # Wait 2 seconds
        
        driver.save_screenshot(f"{screenshot_dir}/bg_check_2.png")
        print(f"  Screenshot 2 saved")
        
        # Compare screenshots (basic check)
        print("\n📊 Screenshots saved to:")
        print(f"  - {screenshot_dir}/bg_check_1.png")
        print(f"  - {screenshot_dir}/bg_check_2.png")
        print("\nIf the two screenshots look different, animation is working!")
        
        driver.quit()
        print("\n✅ Check completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("  1. Chrome/ChromeDriver is installed")
        print("  2. Server is running: npx serve . -p 3000")

if __name__ == "__main__":
    main()
