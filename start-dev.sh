#!/bin/bash

# TribeChat - Development Startup Script with Network Access
# This script starts the application in development mode and allows network access

set -e

echo "🚀 Starting TribeChat in development mode with network access..."
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: You need to generate APP_KEY!"
    echo "Run: docker compose run --rm backend node ace generate:key"
    echo "Then copy the key to backend/.env and run this script again."
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
echo "   Frontend:    http://localhost:9000"
echo ""
echo "🌐 Network Access (from other devices):"
echo "   Backend API: http://$LOCAL_IP:3333"
echo "   Frontend:    http://$LOCAL_IP:9000"
echo ""
echo "💡 To access from other devices on the same network:"
echo "   1. Make sure your firewall allows connections on ports 3333 and 9000"
echo "   2. On other devices, navigate to: http://$LOCAL_IP:9000"
echo "   3. Update the frontend .env file if needed:"
echo "      VITE_API_URL=http://$LOCAL_IP:3333"
echo "      VITE_WS_URL=http://$LOCAL_IP:3333"
echo ""

# Start docker compose
echo "🐳 Starting Docker containers..."
docker compose up --build
