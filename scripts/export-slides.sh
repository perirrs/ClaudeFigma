#!/usr/bin/env bash
# Exports each slide/frame from a Figma file as PNG images.
#
# Usage:
#   ./scripts/export-slides.sh <FIGMA_FILE_KEY> [FIGMA_TOKEN]
#
# Requires: jq, curl

set -euo pipefail

FILE_KEY="${1:?Usage: $0 <FIGMA_FILE_KEY> [FIGMA_TOKEN]}"
TOKEN="${2:-${FIGMA_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
  echo "Error: Figma token required. Pass as second arg or set FIGMA_TOKEN env var."
  exit 1
fi

OUTPUT_DIR="$(dirname "$0")/../figma-data/slides"
mkdir -p "$OUTPUT_DIR"

# Get all top-level frame IDs
echo "Fetching file structure..."
FILE_DATA=$(curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY?depth=2")

# Extract frame node IDs from the first page
FRAME_IDS=$(echo "$FILE_DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
pages = data.get('document', {}).get('children', [])
if pages:
    for child in pages[0].get('children', []):
        print(child['id'])
")

if [ -z "$FRAME_IDS" ]; then
  echo "No frames found in the file."
  exit 1
fi

# Join IDs with commas
IDS_PARAM=$(echo "$FRAME_IDS" | tr '\n' ',' | sed 's/,$//')

echo "Exporting $(echo "$FRAME_IDS" | wc -l | tr -d ' ') slides as PNG..."
EXPORT_DATA=$(curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$IDS_PARAM&format=png&scale=2")

# Download each image
echo "$EXPORT_DATA" | python3 -c "
import json, sys, subprocess, os
data = json.load(sys.stdin)
images = data.get('images', {})
output_dir = '$OUTPUT_DIR'
for i, (node_id, url) in enumerate(images.items(), 1):
    if url:
        filename = os.path.join(output_dir, f'slide_{i:02d}.png')
        print(f'  Downloading slide {i}...')
        subprocess.run(['curl', '-s', '-o', filename, url], check=True)
        print(f'  Saved: {filename}')
"

echo ""
echo "Done! Slides exported to figma-data/slides/"
echo ""
echo "Now open Claude Code and say:"
echo "  'Look at the slide images in figma-data/slides/ and recreate them as a web presentation'"
