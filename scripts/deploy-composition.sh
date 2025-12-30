#!/usr/bin/env bash
#
# deploy-composition.sh - Deploy a generated composition to the webapp
#
# Usage:
#   ./deploy-composition.sh <composition.js>     # Deploy specific file
#   ./deploy-composition.sh --latest             # Deploy most recent from output/analysis/
#   ./deploy-composition.sh --list               # List available compositions
#
# After deploying locally, push to Vercel with:
#   cd webapp && git add . && git commit -m "Update composition" && git push
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/output/analysis"
WEBAPP_DIR="$PROJECT_DIR/webapp"
TARGET="$WEBAPP_DIR/public/compositions/current.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <composition.js|--latest|--list>"
    echo ""
    echo "Commands:"
    echo "  <file.js>   Deploy a specific composition file"
    echo "  --latest    Deploy the most recently modified .js from output/analysis/"
    echo "  --list      List available compositions in output/analysis/"
    echo ""
    echo "After deploying, to update Vercel:"
    echo "  cd $WEBAPP_DIR && git add -A && git commit -m 'Update composition' && git push"
    exit 1
}

list_compositions() {
    echo -e "${BLUE}Available compositions in $OUTPUT_DIR:${NC}"
    echo ""
    if [ -d "$OUTPUT_DIR" ]; then
        ls -lt "$OUTPUT_DIR"/*.js 2>/dev/null | while read -r line; do
            echo "  $line"
        done || echo "  (none found)"
    else
        echo "  Output directory not found: $OUTPUT_DIR"
    fi
}

get_latest() {
    if [ ! -d "$OUTPUT_DIR" ]; then
        echo -e "${RED}Error: Output directory not found: $OUTPUT_DIR${NC}" >&2
        exit 1
    fi

    local latest
    latest=$(ls -t "$OUTPUT_DIR"/*.js 2>/dev/null | head -1)

    if [ -z "$latest" ]; then
        echo -e "${RED}Error: No .js files found in $OUTPUT_DIR${NC}" >&2
        echo "Run extract_music.py on an audio file first." >&2
        exit 1
    fi

    echo "$latest"
}

deploy() {
    local source="$1"

    if [ ! -f "$source" ]; then
        echo -e "${RED}Error: File not found: $source${NC}" >&2
        exit 1
    fi

    # Create target directory if needed
    mkdir -p "$(dirname "$TARGET")"

    # Copy the composition
    cp "$source" "$TARGET"

    echo -e "${GREEN}Deployed:${NC} $(basename "$source")"
    echo -e "${GREEN}Target:${NC}   $TARGET"
    echo ""
    echo -e "${YELLOW}Preview locally:${NC}"
    echo "  cd $WEBAPP_DIR && bun run dev"
    echo ""
    echo -e "${YELLOW}Deploy to Vercel:${NC}"
    echo "  cd $WEBAPP_DIR && git add -A && git commit -m 'Update composition: $(basename "$source")' && git push"
}

# Main
if [ $# -eq 0 ]; then
    usage
fi

case "$1" in
    --list|-l)
        list_compositions
        ;;
    --latest)
        source=$(get_latest)
        echo -e "${BLUE}Latest composition:${NC} $source"
        deploy "$source"
        ;;
    --help|-h)
        usage
        ;;
    *)
        # Check if it's a path or just a filename
        if [ -f "$1" ]; then
            deploy "$1"
        elif [ -f "$OUTPUT_DIR/$1" ]; then
            deploy "$OUTPUT_DIR/$1"
        else
            echo -e "${RED}Error: File not found: $1${NC}" >&2
            echo "Try: $0 --list" >&2
            exit 1
        fi
        ;;
esac
