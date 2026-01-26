# Use official Node LTS image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install app dependencies (including dev dependencies for build if needed)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend port (default 5000)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
