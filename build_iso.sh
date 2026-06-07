#!/usr/bin/env bash

# Usery OS Build Script
set -e

PROFILE_DIR="archcraft-src/profile"
WORK_DIR="$PROFILE_DIR/work"
OUT_DIR="$PROFILE_DIR/out"

echo -e "\e[1;34mPreparing Usery OS ISO build directories...\e[0m"
mkdir -p "$WORK_DIR"
mkdir -p "$OUT_DIR"

echo -e "\e[1;34mStarting ISO build (requires root privileges)...\e[0m"
cd "$PROFILE_DIR"
sudo ./mkarchcraftiso -v -w ./work -o ./out .

echo -e "\e[1;32m============================================================\e[0m"
echo -e "\e[1;32m                 BUILD COMPLETED SUCCESSFULLY!\e[0m"
echo -e "\e[1;32m============================================================\e[0m"
echo -e "You can find your ISO file in: \e[1;34m$OUT_DIR/\e[0m"
echo -e "To test the ISO, run: \e[1;32m./run_vm.sh\e[0m from the repository root."
