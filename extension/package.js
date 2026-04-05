#!/usr/bin/env node
// One-command packager. Rebuilds both bundles, then zips them into
// extension/releases/ as .zip (Chrome) and .xpi (Firefox - XPI is a ZIP).
//
// Zero dependencies: shells out to PowerShell's Compress-Archive on Windows,
// and `zip` on macOS / Linux (both are ubiquitous on those platforms).

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "releases");
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const VERSION = PKG.version || "dev";

const isWin = process.platform === "win32";

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function zipDir(srcDir, outFile) {
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
  if (isWin) {
    // PowerShell's Compress-Archive only writes .zip; for .xpi we compress
    // to a sibling .zip then rename.
    const ext = path.extname(outFile).toLowerCase();
    const tmp = ext === ".zip" ? outFile : outFile.replace(/\.[^.]+$/, "") + ".zip";
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    const ps = `Compress-Archive -Path '${srcDir}\\*' -DestinationPath '${tmp}' -Force`;
    run(`powershell -NoProfile -NonInteractive -Command "${ps}"`);
    if (tmp !== outFile) fs.renameSync(tmp, outFile);
  } else {
    // `zip -r -j` would flatten; we want the archive root = dist contents.
    // Run from inside srcDir, archive everything in it.
    run(`zip -r -q "${outFile}" .`, { cwd: srcDir, shell: "/bin/bash" });
  }
}

// 1. Rebuild bundles so the archive is always fresh.
console.log("→ building bundles");
require("./build.js");

// 2. Package.
ensureDir(OUT);
const chromeZip  = path.join(OUT, `productivity-analyser-chrome-${VERSION}.zip`);
const firefoxXpi = path.join(OUT, `productivity-analyser-firefox-${VERSION}.xpi`);

console.log("→ zipping chrome bundle");
zipDir(path.join(DIST, "chrome"), chromeZip);
console.log("→ zipping firefox bundle (.xpi)");
zipDir(path.join(DIST, "firefox"), firefoxXpi);

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

console.log("\n✓ packaged");
for (const p of [chromeZip, firefoxXpi]) {
  const size = fs.statSync(p).size;
  console.log(`  ${path.relative(ROOT, p)}  ${fmtBytes(size)}`);
}
console.log("\nShare the .zip for Chrome/Edge/Brave (load unpacked or upload to Chrome Web Store).");
console.log("Share the .xpi for Firefox (sign at addons.mozilla.org for permanent install).");
