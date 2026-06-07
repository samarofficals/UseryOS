#!/usr/bin/env bash

# Usery OS VM Launcher & Cloudflare Tunnel Streamer
set -e

# Configuration
ISO_DIR="archcraft-src/profile/out"
VNC_PORT=5900
NO_VNC_PORT=6080
VM_MEM="2G"
VM_CORES=2

# Find Built ISO
ISO_PATH=$(find "$ISO_DIR" -name "usery-os-*.iso" 2>/dev/null | head -n 1)

if [[ -z "$ISO_PATH" ]]; then
    echo -e "\e[1;31mError: No compiled Usery OS ISO found in $ISO_DIR.\e[0m"
    echo -e "Please run \e[1;32m./build_iso.sh\e[0m first to compile the distribution."
    exit 1
fi

echo -e "\e[1;34mFound Usery OS ISO:\e[0m $ISO_PATH"

# Check for running instances and kill them
echo -e "\e[1;30mCleaning up previous QEMU/websockify/cloudflared processes...\e[0m"
pkill -f qemu-system-x86_64 || true
pkill -f websockify || true
pkill -f cloudflared || true
sleep 1

# KVM Check
QEMU_ARGS=("-m" "$VM_MEM" "-smp" "$VM_CORES" "-drive" "file=$ISO_PATH,media=cdrom,readonly=on" "-vnc" ":0" "-vga" "virtio" "-soundhw" "ac97")

if [[ -c /dev/kvm ]]; then
    echo -e "\e[1;32m[KVM] Hardware virtualization available and enabled.\e[0m"
    QEMU_ARGS+=("-enable-kvm" "-cpu" "host")
else
    echo -e "\e[1;33m[QEMU] KVM not available. Running in software emulation mode (slower).\e[0m"
    QEMU_ARGS+=("-cpu" "max")
fi

# Start QEMU VM
echo -e "\e[1;34mStarting QEMU VM booting Usery OS...\e[0m"
qemu-system-x86_64 "${QEMU_ARGS[@]}" > qemu.log 2>&1 &
QEMU_PID=$!

# Start websockify (VNC -> WebSocket for noVNC)
echo -e "\e[1;34mStarting noVNC websocket bridge on port $NO_VNC_PORT...\e[0m"
websockify --web /usr/share/novnc/ "$NO_VNC_PORT" "localhost:$VNC_PORT" > websockify.log 2>&1 &
WEBSOCKIFY_PID=$!

# Start Cloudflare Tunnel
echo -e "\e[1;34mStarting Cloudflare Tunnel to expose the GUI...\e[0m"
rm -f cloudflared.log
cloudflared tunnel --url "http://localhost:$NO_VNC_PORT" > cloudflared.log 2>&1 &
CLOUDFLARED_PID=$!

# Wait for tunnel link to generate
echo -n -e "\e[1;33mWaiting for secure public link from Cloudflare...\e[0m"
TUNNEL_URL=""
for i in {1..30}; do
    sleep 1
    if [[ -f cloudflared.log ]]; then
        TUNNEL_URL=$(grep -o 'https://[-0-9a-z]*\.trycloudflare\.com' cloudflared.log | head -n 1)
        if [[ -n "$TUNNEL_URL" ]]; then
            break
        fi
    fi
    echo -n "."
done
echo ""

if [[ -n "$TUNNEL_URL" ]]; then
    echo -e "\n\e[1;35m============================================================\e[0m"
    echo -e "\e[1;32m       USERY OS LIVE STREAM IS READY!\e[0m"
    echo -e "\e[1;35m============================================================\e[0m"
    echo -e "  Local Address:  \e[4;36mhttp://localhost:$NO_VNC_PORT/vnc.html?autoconnect=true\e[0m"
    echo -e "  Public Link:    \e[1;4;32m$TUNNEL_URL/vnc.html?autoconnect=true\e[0m"
    echo -e "\e[1;35m============================================================\e[0m"
    echo -e "Open the link above in your browser to view the real GUI."
    echo -e "Press \e[1;31mCtrl+C\e[0m to terminate the VM and close the tunnel."
else
    echo -e "\e[1;31mFailed to retrieve Cloudflare tunnel URL.\e[0m"
    echo -e "You can still access the GUI locally at: \e[4;36mhttp://localhost:$NO_VNC_PORT/vnc.html?autoconnect=true\e[0m"
fi

# Keep script running to monitor processes
trap 'kill $QEMU_PID $WEBSOCKIFY_PID $CLOUDFLARED_PID 2>/dev/null; echo -e "\n\e[1;31mTerminated VM and Tunnel.\e[0m"; exit 0' INT TERM
wait $QEMU_PID
