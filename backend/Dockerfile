# Multi-stage build for Node.js backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install since no lock file exists)
# Note: For production, it's recommended to generate and commit package-lock.json
# to ensure reproducible builds across environments
RUN npm install --omit=dev && npm cache clean --force

# Development dependencies
FROM base AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

USER nodejs

EXPOSE 5000

CMD ["node", "server.js"]
