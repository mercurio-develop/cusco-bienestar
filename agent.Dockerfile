# Base image with Node.js
FROM node:22-slim

# Install necessary system dependencies for Git, Curl, and basic operations
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install Gemini CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Set the working directory to where the project will be mounted
WORKDIR /workspace

# Use the existing 'node' user that matches the typical host UID (1000)
# This ensures files created by the agent aren't owned by root on the host machine.
USER node

# Default command if none is provided
CMD ["bash"]