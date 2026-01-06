#!/bin/bash

# Validation script to check if TribeChat is configured correctly

echo "🔍 TribeChat Configuration Validator"
echo "====================================="
echo ""

ERRORS=0
WARNINGS=0

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found"
    echo "   Run: cp backend/.env.example backend/.env"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ backend/.env exists"
    
    # Check APP_KEY
    if ! grep -q "APP_KEY=.*[a-zA-Z0-9]" backend/.env; then
        echo "❌ APP_KEY not set in backend/.env"
        echo "   Run: docker compose run --rm backend node ace generate:key"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ APP_KEY is configured"
    fi
    
    # Check ALLOWED_ORIGINS
    if ! grep -q "ALLOWED_ORIGINS=" backend/.env; then
        echo "⚠️  ALLOWED_ORIGINS not set (will use defaults)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✅ ALLOWED_ORIGINS is configured"
    fi
fi

# Check frontend .env (optional)
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found (will use defaults)"
    echo "   For network access, create frontend/.env with:"
    echo "   VITE_API_URL=http://YOUR_LOCAL_IP:3333"
    echo "   VITE_WS_URL=http://YOUR_LOCAL_IP:3333"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ frontend/.env exists"
    
    # Check if using localhost or network IP
    if grep -q "localhost" frontend/.env; then
        echo "ℹ️  Using localhost - limited to this machine only"
    else
        echo "✅ Configured for network access"
    fi
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Docker is installed"
fi

if ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Docker Compose is installed"
fi

# Check ports
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -i :$port &> /dev/null; then
            echo "⚠️  Port $port is already in use"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "✅ Port $port is available"
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            echo "⚠️  Port $port is already in use"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "✅ Port $port is available"
        fi
    else
        echo "ℹ️  Cannot check if port $port is available"
    fi
}

check_port 3333
check_port 5432
check_port 9000

# Summary
echo ""
echo "====================================="
echo "Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ Configuration looks good!"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  There are $WARNINGS warning(s) that you may want to address"
    fi
    echo ""
    echo "You can start the application with:"
    echo "  ./start-dev.sh"
    echo "or"
    echo "  docker compose up --build"
    exit 0
else
    echo "❌ Found $ERRORS error(s) that must be fixed before starting"
    exit 1
fi
