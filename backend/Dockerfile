# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev for potential tests/builds)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# --- Production Stage ---
FROM node:20-alpine AS runner

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variable for Puppeteer to find Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy source from builder
COPY --from=builder /app/src ./src

# Create a non-root user and set permissions
RUN addgroup -S nodeuser && adduser -S nodeuser -G nodeuser && \
    mkdir -p /app/logs /app/uploads && \
    chown -R nodeuser:nodeuser /app

USER nodeuser

EXPOSE 5000

CMD ["npm", "start"]
