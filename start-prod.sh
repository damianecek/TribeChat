#!/bin/bash

# TribeChat - Production Startup Script
# This script starts the application in production mode

set -e

echo "🚀 Starting TribeChat in production mode..."
echo ""

# Check if production .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found."
    if [ -f "backend/.env.production.example" ]; then
        echo "Creating from .env.production.example..."
        cp backend/.env.production.example backend/.env
        echo "✅ Created backend/.env"
    else
        echo "Creating from .env.example..."
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env"
    fi
    echo ""
    echo "⚠️  IMPORTANT: You need to configure backend/.env for production!"
    echo "1. Generate APP_KEY: docker compose run --rm backend node ace generate:key"
    echo "2. Update database credentials (DB_USER, DB_PASSWORD)"
    echo "3. Update ALLOWED_ORIGINS with your domain(s)"
    exit 1
fi

# Check if APP_KEY is set
if ! grep -q "APP_KEY=.*[a-zA-Z0-9]" backend/.env; then
    echo "⚠️  APP_KEY is not set in backend/.env"
    echo "Run: docker compose run --rm backend node ace generate:key"
    echo "Then copy the key to backend/.env and run this script again."
    exit 1
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Could not detect local IP address"
    LOCAL_IP="<your-local-ip>"
fi

echo "📡 Network Configuration:"
echo "   Backend API: http://localhost:3333"
echo "   Frontend:    http://localhost:80"
echo ""
echo "🌐 Network Access (from other devices):"
echo "   Backend API: http://$LOCAL_IP:3333"
echo "   Frontend:    http://$LOCAL_IP"
echo ""
echo "⚠️  Production Checklist:"
echo "   ✓ APP_KEY is set in backend/.env"
echo "   ☐ Database credentials are secure"
echo "   ☐ ALLOWED_ORIGINS is configured in backend/.env"
echo "   ☐ Frontend .env.production has correct API URLs"
echo "   ☐ Firewall allows ports 80 and 3333"
echo ""

# Export environment variables for docker-compose
export VITE_API_URL=${VITE_API_URL:-http://localhost:3333}
export VITE_WS_URL=${VITE_WS_URL:-http://localhost:3333}
export DB_USER=${DB_USER:-root}
export DB_PASSWORD=${DB_PASSWORD:-root}
export DB_DATABASE=${DB_DATABASE:-app}
export DB_PORT=${DB_PORT:-5432}
export PORT=${PORT:-3333}
export FRONTEND_PORT=${FRONTEND_PORT:-80}

echo "🐳 Starting Docker containers in production mode..."
docker compose -f docker-compose.production.yml up --build
