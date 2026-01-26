# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build the application
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config if needed (optional, using default for now)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
