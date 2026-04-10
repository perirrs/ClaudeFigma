#!/usr/bin/env node
// Dependency-free PNG icon generator.
// Produces rounded green squares with a white ascending bar chart,
// matching the extension's accent color (#4ade80). Output lands in
// src/icons/ at the sizes Chrome Web Store requires.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---- Minimal PNG encoder (RGBA, no palette) ----

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type = RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Filtered raw scanlines: one 0x00 filter byte per row, then RGBA pixels.
  const raw = Buffer.alloc(size * (1 + size * 4));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      raw[o++] = pixels[i];
      raw[o++] = pixels[i + 1];
      raw[o++] = pixels[i + 2];
      raw[o++] = pixels[i + 3];
    }
  }
  const idatData = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Icon drawing ----
// Rounded green square with a white bar chart silhouette inside.

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const radius = Math.max(2, Math.round(size * 0.22));
  const BG = [0x4a, 0xde, 0x80]; // #4ade80
  const FG = [0xff, 0xff, 0xff];

  // Anti-aliased rounded square mask [0..255].
  function maskAt(x, y) {
    // Distance from nearest straight edge.
    const dx = Math.min(x, size - 1 - x);
    const dy = Math.min(y, size - 1 - y);
    if (dx >= radius || dy >= radius) return 255;
    const rx = radius - dx;
    const ry = radius - dy;
    const dist = Math.sqrt(rx * rx + ry * ry);
    if (dist <= radius - 1) return 255;
    if (dist >= radius + 1) return 0;
    // Soft edge over 2px for anti-aliasing.
    return Math.round(255 * (1 - (dist - (radius - 1)) / 2));
  }

  // Paint the background rounded square.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const a = maskAt(x + 0.5, y + 0.5);
      pixels[i] = BG[0];
      pixels[i + 1] = BG[1];
      pixels[i + 2] = BG[2];
      pixels[i + 3] = a;
    }
  }

  // Draw 3 ascending white bars. Geometry scales with size.
  const pad = Math.max(2, Math.round(size * 0.22));
  const chartW = size - pad * 2;
  const chartBase = size - pad;
  // 3 bars with 2 gaps: barW * 3 + gap * 2 = chartW; gap = barW/2
  const barW = Math.max(1, Math.floor(chartW / 4));
  const gap = Math.max(1, Math.floor(barW / 2));
  const totalW = barW * 3 + gap * 2;
  const startX = Math.floor((size - totalW) / 2);
  const heights = [0.35, 0.6, 0.9];

  for (let b = 0; b < 3; b++) {
    const bx = startX + b * (barW + gap);
    const bh = Math.max(2, Math.floor(heights[b] * chartW));
    const topY = chartBase - bh;
    for (let y = topY; y < chartBase; y++) {
      for (let x = bx; x < bx + barW; x++) {
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const i = (y * size + x) * 4;
        // Composite white onto whatever's there (respect rounded mask).
        if (pixels[i + 3] === 0) continue;
        pixels[i] = FG[0];
        pixels[i + 1] = FG[1];
        pixels[i + 2] = FG[2];
        // Keep the mask alpha for smooth corner clipping.
      }
    }
  }

  return pixels;
}

// ---- Main ----

const sizes = [16, 32, 48, 128];
const outDir = path.join(__dirname, "src", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const s of sizes) {
  const png = encodePng(s, drawIcon(s));
  const p = path.join(outDir, `icon-${s}.png`);
  fs.writeFileSync(p, png);
  console.log(`wrote ${path.relative(__dirname, p)}  (${png.length} bytes)`);
}
