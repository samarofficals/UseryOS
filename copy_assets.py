#!/usr/bin/env python3
import os
import shutil
import glob

def main():
    brain_dir = r"C:\Users\khati\.gemini\antigravity\brain\75b74f8d-3480-4db8-a9d1-d2352a85f5f8"
    
    # Destination directories
    iso_bg_dir = os.path.join("archcraft-src", "profile", "airootfs", "usr", "share", "backgrounds", "usery")
    web_bg_dir = os.path.join("assets", "wallpapers")
    
    os.makedirs(iso_bg_dir, exist_ok=True)
    os.makedirs(web_bg_dir, exist_ok=True)
    
    # Find generated files
    nordic_files = glob.glob(os.path.join(brain_dir, "usery_nordic_wallpaper_*.png"))
    dracula_files = glob.glob(os.path.join(brain_dir, "usery_dracula_wallpaper_*.png"))
    cyberpunk_files = glob.glob(os.path.join(brain_dir, "usery_cyberpunk_wallpaper_*.png"))
    
    if nordic_files:
        shutil.copy(nordic_files[0], os.path.join(iso_bg_dir, "nordic.png"))
        shutil.copy(nordic_files[0], os.path.join(web_bg_dir, "nordic.png"))
        print(f"Copied Nordic wallpaper: {nordic_files[0]}")
    else:
        print("Nordic wallpaper not found!")
        
    if dracula_files:
        shutil.copy(dracula_files[0], os.path.join(iso_bg_dir, "dracula.png"))
        shutil.copy(dracula_files[0], os.path.join(web_bg_dir, "dracula.png"))
        print(f"Copied Dracula wallpaper: {dracula_files[0]}")
    else:
        print("Dracula wallpaper not found!")
        
    if cyberpunk_files:
        shutil.copy(cyberpunk_files[0], os.path.join(iso_bg_dir, "cyberpunk.png"))
        shutil.copy(cyberpunk_files[0], os.path.join(web_bg_dir, "cyberpunk.png"))
        print(f"Copied Cyberpunk wallpaper: {cyberpunk_files[0]}")
    else:
        print("Cyberpunk wallpaper not found!")
        
    print("Wallpapers copy complete!")

if __name__ == "__main__":
    main()
