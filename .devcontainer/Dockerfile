FROM archlinux:latest

# Initialize pacman keys and install system dependencies
RUN pacman-key --init && \
    pacman-key --populate archlinux && \
    pacman -Syu --noconfirm \
    git \
    make \
    patch \
    archiso \
    squashfs-tools \
    libisoburn \
    dosfstools \
    mtools \
    qemu-desktop \
    websockify \
    novnc \
    wget \
    curl \
    python \
    procps-ng \
    sudo && \
    pacman -Scc --noconfirm

# Download and install cloudflared binary for easy trycloudflare tunnels
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

# Set up default directory
WORKDIR /workspace
