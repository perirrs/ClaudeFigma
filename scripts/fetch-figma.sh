#!/usr/bin/env bash
# Fetches a Figma file and saves the design data as JSON for Claude Code to work with.
#
# Usage:
#   ./scripts/fetch-figma.sh <FIGMA_FILE_KEY> [FIGMA_TOKEN]
#
# The file key is the ID in your Figma URL:
#   https://www.figma.com/slides/<FILE_KEY>/Some-Name
#
# You can also set FIGMA_TOKEN as an environment variable.

set -euo pipefail

FILE_KEY="${1:?Usage: $0 <FIGMA_FILE_KEY> [FIGMA_TOKEN]}"
TOKEN="${2:-${FIGMA_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
  echo "Error: Figma token required. Pass as second arg or set FIGMA_TOKEN env var."
  echo "Get one at: Figma → Settings → Security → Personal access tokens"
  exit 1
fi

OUTPUT_DIR="$(dirname "$0")/../figma-data"
mkdir -p "$OUTPUT_DIR"

echo "Fetching file metadata..."
curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY?depth=3" \
  -o "$OUTPUT_DIR/file.json"

echo "Fetching image fills..."
curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/images" \
  -o "$OUTPUT_DIR/images.json"

# Extract slide/frame names for quick reference
python3 -c "
import json, sys

with open('$OUTPUT_DIR/file.json') as f:
    data = json.load(f)

print(f\"File: {data.get('name', 'Unknown')}\")
print(f\"Last modified: {data.get('lastModified', 'Unknown')}\")
print()

def walk(node, depth=0):
    t = node.get('type', '')
    name = node.get('name', '')
    if t in ('FRAME', 'SECTION', 'COMPONENT', 'SLIDE', 'PAGE'):
        print(f\"{'  ' * depth}[{t}] {name}\")
    for child in node.get('children', []):
        walk(child, depth + 1)

doc = data.get('document', {})
for page in doc.get('children', []):
    print(f\"Page: {page.get('name', 'Untitled')}\")
    for child in page.get('children', []):
        walk(child, 1)
    print()
" 2>/dev/null || echo "(install python3 to see slide summary)"

echo ""
echo "Done! Design data saved to figma-data/"
echo "  figma-data/file.json   — full file structure (frames, text, styles)"
echo "  figma-data/images.json — image fill references"
echo ""
echo "Now open Claude Code in this project and say:"
echo "  'Read figma-data/file.json and list all the slides with their content'"
