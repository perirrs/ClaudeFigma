#!/bin/bash
# Build Chrome extension package for enterprise deployment.
# Usage: bash build-crx.sh [chrome|firefox]
#
# Produces:
#   dist/productivity-analyser-chrome.zip   (for Chrome Web Store or CRX packing)
#   dist/productivity-analyser-firefox.zip  (for Firefox Add-ons or sideload)

set -e

TARGET="${1:-chrome}"
VERSION=$(grep -o '"version": "[^"]*"' "extension/manifests/${TARGET}.json" | head -1 | cut -d'"' -f4)
OUTDIR="dist"
TMPDIR="$(mktemp -d)"

echo "Building Productivity Analyser v${VERSION} for ${TARGET}..."

# Copy source files
cp extension/src/*.js extension/src/*.html "$TMPDIR/"

# Copy correct manifest
cp "extension/manifests/${TARGET}.json" "$TMPDIR/manifest.json"

# Create output directory
mkdir -p "$OUTDIR"

# Package as zip
ZIPNAME="productivity-analyser-${TARGET}-v${VERSION}.zip"
(cd "$TMPDIR" && zip -r - .) > "${OUTDIR}/${ZIPNAME}"

echo "Built: ${OUTDIR}/${ZIPNAME}"
echo ""
echo "Next steps:"
echo "  Chrome: Upload to Chrome Web Store, or pack as CRX with chrome://extensions"
echo "  Firefox: Upload to addons.mozilla.org, or sideload via about:debugging"

rm -rf "$TMPDIR"
