#!/usr/bin/env node
// Build per-browser extension bundles from shared src/ + manifests/.
// Produces extension/dist/chrome/ and extension/dist/firefox/, each loadable
// as an unpacked extension. Same source, different manifest.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const MANIFESTS = path.join(ROOT, "manifests");

const TARGETS = [
  { name: "chrome", manifest: "chrome.json" },
  { name: "firefox", manifest: "firefox.json" },
];

function rmDir(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

rmDir(DIST);

for (const t of TARGETS) {
  const outDir = path.join(DIST, t.name);
  copyDir(SRC, outDir);
  fs.copyFileSync(path.join(MANIFESTS, t.manifest), path.join(outDir, "manifest.json"));
  console.log(`built → ${path.relative(ROOT, outDir)}`);
}
