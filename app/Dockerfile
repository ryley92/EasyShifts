# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy environment script
COPY env.sh /docker-entrypoint.d/10-env.sh
RUN chmod +x /docker-entrypoint.d/10-env.sh

# Set default PORT
ENV PORT=8080

# Expose port (will be overridden by Cloud Run)
EXPOSE $PORT

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
