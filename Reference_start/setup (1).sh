#!/usr/bin/env bash
#
# Strudel Composer Setup Script
# Installs dependencies and prepares the project for use.
#
# Usage:
#   ./setup.sh
#

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'BANNER'
  ____  _                   _      _    ____                                         
 / ___|| |_ _ __ _   _  __| | ___| |  / ___|___  _ __ ___  _ __   ___  ___  ___ _ __ 
 \___ \| __| '__| | | |/ _` |/ _ \ | | |   / _ \| '_ ` _ \| '_ \ / _ \/ __|/ _ \ '__|
  ___) | |_| |  | |_| | (_| |  __/ | | |__| (_) | | | | | | |_) | (_) \__ \  __/ |   
 |____/ \__|_|   \__,_|\__,_|\___|_|  \____\___/|_| |_| |_| .__/ \___/|___/\___|_|   
                                                          |_|                        
BANNER
echo -e "${NC}"
echo "AI Music Generation with Farmhand"
echo ""

# Check if we're in the right directory
if [[ ! -f "CLAUDE.md" ]]; then
    echo "Error: Run this script from the strudel-composer directory"
    exit 1
fi

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p compositions references output scripts/analysis web/src docs

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
if command -v pip &> /dev/null; then
    pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
else
    echo "Warning: pip not found. Install Python dependencies manually."
fi

# Install Node.js dependencies for web app
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
cd web
if command -v npm &> /dev/null; then
    npm install
elif command -v bun &> /dev/null; then
    bun install
else
    echo "Warning: npm/bun not found. Install Node.js dependencies manually."
fi
cd ..

# Install ffmpeg if needed (for audio conversion)
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}Installing ffmpeg...${NC}"
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    else
        echo "Warning: Could not install ffmpeg. Install it manually for audio format support."
    fi
fi

# Set up cloudflared tunnel instructions
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the web app:"
echo "  cd web && npm run dev"
echo ""
echo "To expose via cloudflared tunnel:"
echo "  cloudflared tunnel --url http://localhost:5173"
echo ""
echo "To analyze a reference track:"
echo "  python scripts/analyze_audio.py references/your-track.mp3"
echo ""
echo "Edit compositions/current.js and the web app will hot-reload!"
