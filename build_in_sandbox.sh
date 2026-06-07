#!/usr/bin/env bash

# Usery OS Build Script for Daytona Debian Sandbox
set -e

REPO_DIR="/home/daytona/UseryOS"
BOOTSTRAP_DIR="/home/daytona/arch-bootstrap"
MIRROR="https://archive.archlinux.org/iso/latest"

echo -e "\e[1;34m[1/6] Downloading Arch Linux bootstrap tarball...\e[0m"
cd /home/daytona
if [[ ! -f archlinux-bootstrap-x86_64.tar.zst ]]; then
    # We use archive.archlinux.org for a stable release download
    wget -q --show-progress "$MIRROR/archlinux-bootstrap-x86_64.tar.zst"
fi

echo -e "\e[1;34m[2/6] Extracting bootstrap environment...\e[0m"
if [[ ! -d "$BOOTSTRAP_DIR" ]]; then
    mkdir -p "$BOOTSTRAP_DIR"
    tar -x -I zstd -f archlinux-bootstrap-x86_64.tar.zst -C "$BOOTSTRAP_DIR" --strip-components=1
fi

echo -e "\e[1;34m[3/6] Setting up Chroot mounts...\e[0m"
# Helper to mount
safe_mount() {
    if ! mountpoint -q "$2"; then
        sudo mount --bind "$1" "$2"
    fi
}

mkdir -p "$BOOTSTRAP_DIR/UseryOS"
mkdir -p "$BOOTSTRAP_DIR/run/shm"

safe_mount /proc "$BOOTSTRAP_DIR/proc"
safe_mount /sys "$BOOTSTRAP_DIR/sys"
safe_mount /dev "$BOOTSTRAP_DIR/dev"
safe_mount /run "$BOOTSTRAP_DIR/run"
safe_mount /dev/shm "$BOOTSTRAP_DIR/run/shm"
safe_mount "$REPO_DIR" "$BOOTSTRAP_DIR/UseryOS"

# Copy resolv.conf for network access
sudo cp /etc/resolv.conf "$BOOTSTRAP_DIR/etc/resolv.conf"

# Enable a default mirror in chroot
echo 'Server = https://mirrors.kernel.org/archlinux/$repo/os/$arch' | sudo tee "$BOOTSTRAP_DIR/etc/pacman.d/mirrorlist" > /dev/null

echo -e "\e[1;34m[4/6] Initializing Arch keyring inside chroot...\e[0m"
sudo chroot "$BOOTSTRAP_DIR" /usr/bin/bash -c "pacman-key --init && pacman-key --populate archlinux"

echo -e "\e[1;34m[5/6] Installing compilation tools inside chroot...\e[0m"
sudo chroot "$BOOTSTRAP_DIR" /usr/bin/bash -c "pacman -Sy --noconfirm --needed archiso squashfs-tools libisoburn dosfstools mtools make patch git"

echo -e "\e[1;34m[6/6] Compiling Usery OS ISO inside chroot...\e[0m"
# Run the build process inside the Arch chroot
sudo chroot "$BOOTSTRAP_DIR" /usr/bin/bash -c "
    cd /UseryOS/archcraft-src/profile
    mkdir -p work out
    ./mkarchcraftiso -v -w ./work -o ./out .
"

echo -e "\e[1;32m============================================================\e[0m"
echo -e "\e[1;32m                 ISO COMPILED SUCCESSFULLY!\e[0m"
echo -e "\e[1;32m============================================================\e[0m"
echo -e "Your bootable ISO is located in: \e[1;34m$REPO_DIR/archcraft-src/profile/out/\e[0m"
