#!/usr/bin/env python3
import os
import glob

def rebrand_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        new_content = content
        # Replacements
        new_content = new_content.replace('Archcraft', 'Usery OS')
        new_content = new_content.replace('archcraft', 'usery-os')
        new_content = new_content.replace('ARCHCRAFT', 'USERY_OS')

        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Rebranded: {file_path}")
    except Exception as e:
        print(f"Error rebranding {file_path}: {e}")

def main():
    profile_dir = os.path.join("archcraft-src", "profile")
    
    # 1. Rebrand grub files
    for f in glob.glob(os.path.join(profile_dir, "grub", "*.cfg")):
        rebrand_file(f)
        
    # 2. Rebrand syslinux files
    for f in glob.glob(os.path.join(profile_dir, "syslinux", "*.cfg")):
        rebrand_file(f)
        
    # 3. Rebrand efiboot files
    for f in glob.glob(os.path.join(profile_dir, "efiboot", "loader", "entries", "*.conf")):
        rebrand_file(f)

    # 4. Rebrand pacman.conf
    pacman_conf = os.path.join(profile_dir, "pacman.conf")
    if os.path.exists(pacman_conf):
        rebrand_file(pacman_conf)
        
    print("Rebranding script completed!")

if __name__ == "__main__":
    main()
