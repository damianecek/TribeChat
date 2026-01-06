#!/bin/bash

# Helper script to get local IP address for network access

echo "🌐 Network Configuration Helper"
echo "================================"
echo ""

# Try to get local IP address
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Fallback methods if hostname -I doesn't work
if [ -z "$LOCAL_IP" ]; then
    # Try ip command (Linux)
    if command -v ip &> /dev/null; then
        LOCAL_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi
fi

# Fallback to ifconfig (Mac/BSD)
if [ -z "$LOCAL_IP" ]; then
    if command -v ifconfig &> /dev/null; then
        LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    fi
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not automatically detect local IP address"
    echo ""
    echo "Please find your IP manually:"
    echo "  - Linux: ip addr show"
    echo "  - Mac: ifconfig"
    echo "  - Windows: ipconfig"
    exit 1
fi

echo "✅ Local IP Address: $LOCAL_IP"
echo ""
echo "📋 Configuration Instructions:"
echo "================================"
echo ""
echo "1. Update frontend/.env:"
echo "   VITE_API_URL=http://$LOCAL_IP:3333"
echo "   VITE_WS_URL=http://$LOCAL_IP:3333"
echo ""
echo "2. Update backend/.env:"
echo "   ALLOWED_ORIGINS=http://localhost:9000,http://192.168.*.*:9000"
echo ""
echo "3. Configure firewall to allow ports 3333 and 9000"
echo ""
echo "4. Restart the application:"
echo "   docker compose down"
echo "   docker compose up --build"
echo ""
echo "5. Access from other devices:"
echo "   http://$LOCAL_IP:9000"
echo ""
echo "================================"
echo ""
echo "💡 Quick setup commands:"
echo ""
echo "# Create/update frontend .env:"
echo "cat > frontend/.env << EOF"
echo "VITE_API_URL=http://$LOCAL_IP:3333"
echo "VITE_WS_URL=http://$LOCAL_IP:3333"
echo "NODE_ENV=development"
echo "EOF"
echo ""
echo "# Update backend .env ALLOWED_ORIGINS (manual edit required)"
echo "# Or for quick testing (allows all local network):"
echo "sed -i 's/ALLOWED_ORIGINS=.*/ALLOWED_ORIGINS=http:\\/\\/localhost:9000,http:\\/\\/192.168.*.*:9000/' backend/.env"
