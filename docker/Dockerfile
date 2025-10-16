# =========================
# codexsun:v3 — Node.js DevOps Base Image
# =========================

FROM node:22-alpine

# Install required packages
RUN apk add --no-cache \
    bash \
    git \
    nano \
    sudo

# Create non-root user 'devops' and grant sudo privileges
RUN adduser -D devops && \
    echo "devops ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Create working directory
RUN mkdir -p /home/devops/cloud && \
    chmod -R 777 /home/devops/cloud

# ✅ Install pnpm as root (with correct permissions)
USER root
RUN npm install -g pnpm@latest --unsafe-perm=true

# Fix ownership of global npm directories (for devops user)
RUN chown -R devops:devops /usr/local/lib /usr/local/bin /home/devops

# Switch to non-root user for safer runtime
USER devops

# Set working directory
WORKDIR /home/devops/cloud

# Expose dev ports
EXPOSE 3006
EXPOSE 5006

# Default command
CMD ["bash"]
