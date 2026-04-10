#!/usr/bin/env node
// Dependency-free generator for Chrome Web Store promo tiles.
//
// Produces two 24-bit RGB PNGs (no alpha, color type 2) which is what
// the Web Store requires for promo tiles:
//
//   store-listing/promo-small.png    440 x 280
//   store-listing/promo-marquee.png 1400 x 560
//
// No external deps; draws directly into an RGB pixel buffer with a
// small hand-rolled 5x7 bitmap font for the title/tagline.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---- PNG encoder (RGB, 8-bit, no alpha) ----

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

function encodePngRgb(w, h, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type 2 = RGB (no alpha)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc(h * (1 + w * 3));
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0; // filter type: none
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      raw[o++] = pixels[i];
      raw[o++] = pixels[i + 1];
      raw[o++] = pixels[i + 2];
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- 5x7 bitmap font (hand-coded) ----

const FONT_ROWS = {
  "A": ["01110","10001","10001","11111","10001","10001","10001"],
  "B": ["11110","10001","10001","11110","10001","10001","11110"],
  "C": ["01110","10001","10000","10000","10000","10001","01110"],
  "D": ["11100","10010","10001","10001","10001","10010","11100"],
  "E": ["11111","10000","10000","11110","10000","10000","11111"],
  "F": ["11111","10000","10000","11110","10000","10000","10000"],
  "G": ["01110","10001","10000","10111","10001","10001","01111"],
  "H": ["10001","10001","10001","11111","10001","10001","10001"],
  "I": ["01110","00100","00100","00100","00100","00100","01110"],
  "J": ["00111","00010","00010","00010","00010","10010","01100"],
  "K": ["10001","10010","10100","11000","10100","10010","10001"],
  "L": ["10000","10000","10000","10000","10000","10000","11111"],
  "M": ["10001","11011","10101","10101","10001","10001","10001"],
  "N": ["10001","11001","10101","10011","10001","10001","10001"],
  "O": ["01110","10001","10001","10001","10001","10001","01110"],
  "P": ["11110","10001","10001","11110","10000","10000","10000"],
  "Q": ["01110","10001","10001","10001","10101","10010","01101"],
  "R": ["11110","10001","10001","11110","10100","10010","10001"],
  "S": ["01111","10000","10000","01110","00001","00001","11110"],
  "T": ["11111","00100","00100","00100","00100","00100","00100"],
  "U": ["10001","10001","10001","10001","10001","10001","01110"],
  "V": ["10001","10001","10001","10001","10001","01010","00100"],
  "W": ["10001","10001","10001","10101","10101","11011","10001"],
  "X": ["10001","10001","01010","00100","01010","10001","10001"],
  "Y": ["10001","10001","01010","00100","00100","00100","00100"],
  "Z": ["11111","00001","00010","00100","01000","10000","11111"],
  "0": ["01110","10001","10011","10101","11001","10001","01110"],
  "1": ["00100","01100","00100","00100","00100","00100","01110"],
  "2": ["01110","10001","00001","00110","01000","10000","11111"],
  "3": ["11110","00001","00001","01110","00001","00001","11110"],
  "4": ["00010","00110","01010","10010","11111","00010","00010"],
  "5": ["11111","10000","11110","00001","00001","10001","01110"],
  "6": ["00110","01000","10000","11110","10001","10001","01110"],
  "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "8": ["01110","10001","10001","01110","10001","10001","01110"],
  "9": ["01110","10001","10001","01111","00001","00010","01100"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
  ".": ["00000","00000","00000","00000","00000","00100","00100"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"],
};

const FONT = (() => {
  const out = {};
  for (const [ch, rows] of Object.entries(FONT_ROWS)) {
    out[ch] = rows.map(r => parseInt(r, 2));
  }
  return out;
})();

const GLYPH_W = 5;
const GLYPH_H = 7;

function measureText(text, scale) {
  // 5-wide glyph + 1-wide spacing between glyphs, times scale
  if (!text.length) return 0;
  return (text.length * GLYPH_W + (text.length - 1)) * scale;
}

function drawChar(buf, w, h, x, y, ch, scale, color) {
  const glyph = FONT[ch] || FONT[" "];
  for (let row = 0; row < GLYPH_H; row++) {
    const bits = glyph[row];
    for (let col = 0; col < GLYPH_W; col++) {
      if (!(bits & (1 << (GLYPH_W - 1 - col)))) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = x + col * scale + dx;
          const py = y + row * scale + dy;
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const i = (py * w + px) * 3;
          buf[i]     = color[0];
          buf[i + 1] = color[1];
          buf[i + 2] = color[2];
        }
      }
    }
  }
}

function drawText(buf, w, h, x, y, text, scale, color) {
  const up = text.toUpperCase();
  let cx = x;
  for (const ch of up) {
    drawChar(buf, w, h, cx, y, ch, scale, color);
    cx += (GLYPH_W + 1) * scale;
  }
}

function drawTextCentered(buf, w, h, cy, text, scale, color) {
  const tw = measureText(text.toUpperCase(), scale);
  drawText(buf, w, h, Math.round((w - tw) / 2), cy, text, scale, color);
}

// ---- Drawing primitives ----

function fillGradient(buf, w, h) {
  // Diagonal dark gradient: deep navy → deep forest green.
  // Top-left:     #0b1220
  // Bottom-right: #0d2a1a
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = (x / (w - 1) * 0.55) + (y / (h - 1) * 0.45);
      const r = Math.round(0x0b + (0x0d - 0x0b) * t);
      const g = Math.round(0x12 + (0x2a - 0x12) * t);
      const b = Math.round(0x20 + (0x1a - 0x20) * t);
      const i = (y * w + x) * 3;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
    }
  }
}

function drawSubtleGrid(buf, w, h) {
  // Faint horizontal ticks to suggest a chart baseline.
  const tickY = [Math.round(h * 0.25), Math.round(h * 0.5), Math.round(h * 0.75)];
  for (const y of tickY) {
    for (let x = 0; x < w; x++) {
      if ((x % 6) < 2) continue; // dashed
      const i = (y * w + x) * 3;
      buf[i]     = Math.min(255, buf[i] + 12);
      buf[i + 1] = Math.min(255, buf[i + 1] + 16);
      buf[i + 2] = Math.min(255, buf[i + 2] + 14);
    }
  }
}

function drawRoundedRect(buf, w, h, x0, y0, rw, rh, radius, color) {
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      // Rounded corner test.
      const dx = Math.min(x, rw - 1 - x);
      const dy = Math.min(y, rh - 1 - y);
      if (dx < radius && dy < radius) {
        const rx = radius - dx;
        const ry = radius - dy;
        if (Math.sqrt(rx * rx + ry * ry) > radius) continue;
      }
      const px = x0 + x;
      const py = y0 + y;
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      const i = (py * w + px) * 3;
      buf[i]     = color[0];
      buf[i + 1] = color[1];
      buf[i + 2] = color[2];
    }
  }
}

function drawIconTile(buf, w, h, x0, y0, size) {
  // Green rounded square with a three-bar ascending chart, matching
  // the extension's real icon.
  const GREEN = [0x4a, 0xde, 0x80];
  const WHITE = [0xff, 0xff, 0xff];
  const radius = Math.round(size * 0.22);
  drawRoundedRect(buf, w, h, x0, y0, size, size, radius, GREEN);

  const pad = Math.round(size * 0.22);
  const chartW = size - pad * 2;
  const chartBase = y0 + size - pad;
  const barW = Math.max(1, Math.floor(chartW / 4));
  const gap = Math.max(1, Math.floor(barW / 2));
  const totalW = barW * 3 + gap * 2;
  const startX = x0 + Math.floor((size - totalW) / 2);
  const heights = [0.35, 0.6, 0.9];

  for (let b = 0; b < 3; b++) {
    const bx = startX + b * (barW + gap);
    const bh = Math.max(2, Math.floor(heights[b] * chartW));
    const topY = chartBase - bh;
    for (let y = topY; y < chartBase; y++) {
      for (let x = bx; x < bx + barW; x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const i = (y * w + x) * 3;
        buf[i]     = WHITE[0];
        buf[i + 1] = WHITE[1];
        buf[i + 2] = WHITE[2];
      }
    }
  }
}

// ---- Tile layouts ----

function buildSmallPromo() {
  const W = 440, H = 280;
  const buf = Buffer.alloc(W * H * 3);
  fillGradient(buf, W, H);
  drawSubtleGrid(buf, W, H);

  // Icon top-center.
  const iconSize = 72;
  const iconX = Math.round((W - iconSize) / 2);
  const iconY = 26;
  drawIconTile(buf, W, H, iconX, iconY, iconSize);

  // Title: two lines stacked and centered.
  const WHITE = [0xff, 0xff, 0xff];
  const GREEN = [0x4a, 0xde, 0x80];
  drawTextCentered(buf, W, H, 126, "PRODUCTIVITY", 3, WHITE); // height 21
  drawTextCentered(buf, W, H, 160, "ANALYSER", 3, WHITE);     // height 21

  // Tagline in green.
  drawTextCentered(buf, W, H, 216, "LOCAL-FIRST ANALYTICS", 2, GREEN); // height 14

  return { w: W, h: H, buf };
}

function buildMarqueePromo() {
  const W = 1400, H = 560;
  const buf = Buffer.alloc(W * H * 3);
  fillGradient(buf, W, H);
  drawSubtleGrid(buf, W, H);

  // Big icon left of center block.
  const iconSize = 200;
  const iconY = Math.round((H - iconSize) / 2);
  const iconX = 140;
  drawIconTile(buf, W, H, iconX, iconY, iconSize);

  const WHITE = [0xff, 0xff, 0xff];
  const GREEN = [0x4a, 0xde, 0x80];

  // Title right of icon.
  const titleScale = 7;
  const title = "PRODUCTIVITY ANALYSER";
  const titleW = measureText(title, titleScale); // 21 chars -> 21*5 + 20 = 125 -> *7 = 875
  const textBlockX = iconX + iconSize + 80;
  drawText(buf, W, H, textBlockX, 200, title, titleScale, WHITE); // height 49

  // Tagline beneath title.
  const taglineScale = 4;
  const tagline = "TRACK YOUR OWN WORK. LOCAL-FIRST.";
  drawText(buf, W, H, textBlockX, 300, tagline, taglineScale, GREEN); // height 28

  // Smaller context line.
  const sub = "CONFIGURABLE PER TEAM. OPTIONAL SYNC.";
  drawText(buf, W, H, textBlockX, 360, sub, 3, [0xb8, 0xc5, 0xd6]); // height 21

  return { w: W, h: H, buf };
}

// ---- Main ----

function writeTile(name, tile) {
  const outDir = path.join(__dirname, "store-listing");
  fs.mkdirSync(outDir, { recursive: true });
  const png = encodePngRgb(tile.w, tile.h, tile.buf);
  const p = path.join(outDir, name);
  fs.writeFileSync(p, png);
  console.log(`wrote ${path.relative(__dirname, p)}  ${tile.w}x${tile.h}  (${png.length} bytes)`);
}

writeTile("promo-small.png", buildSmallPromo());
writeTile("promo-marquee.png", buildMarqueePromo());
