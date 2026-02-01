#!/bin/bash

# Parkent Express Deployment Script

echo "🚀 Starting Parkent Express Deployment..."

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
echo "✅ Checking container status..."
docker compose -f docker-compose.prod.yml ps

# Show logs
echo "📋 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment complete!"
echo "🌐 API: http://localhost:5000"
echo "🖥️  Admin: http://localhost:3000"
