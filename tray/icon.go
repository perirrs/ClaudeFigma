package main

// Minimal 16x16 ICO embedded as bytes so the binary has no asset files to
// ship alongside it. Generated once from a solid purple square with "PA" in
// white — functional rather than beautiful.
//
// The format is: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + BMP payload.
// This is a 16x16 32-bpp icon, generated procedurally at init().
var iconCache []byte

func iconBytes() []byte {
	if iconCache != nil {
		return iconCache
	}
	iconCache = buildICO()
	return iconCache
}

func buildICO() []byte {
	const w, h = 16, 16
	// Solid purple (#a855f7) background, two vertical white bars for "P A".
	pixels := make([]byte, w*h*4)
	purple := [4]byte{0xf7, 0x55, 0xa8, 0xff} // BGRA
	white := [4]byte{0xff, 0xff, 0xff, 0xff}
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			c := purple
			// Two bars: x=4..5 and x=10..11 for simple glyph.
			if (x == 4 || x == 5 || x == 10 || x == 11) && y >= 3 && y <= 12 {
				c = white
			}
			// top of P and A
			if (x >= 4 && x <= 6 && y == 3) || (x >= 10 && x <= 12 && y == 3) {
				c = white
			}
			// crossbars
			if (x >= 4 && x <= 6 && y == 8) || (x >= 10 && x <= 12 && y == 8) {
				c = white
			}
			i := ((h-1-y)*w + x) * 4 // bottom-up
			pixels[i] = c[0]
			pixels[i+1] = c[1]
			pixels[i+2] = c[2]
			pixels[i+3] = c[3]
		}
	}

	// AND mask: all transparent off (1 bit per pixel, row size rounded to 4).
	maskRowBytes := ((w + 31) / 32) * 4
	mask := make([]byte, maskRowBytes*h)

	// BITMAPINFOHEADER (40 bytes).
	biSize := uint32(40)
	biWidth := int32(w)
	biHeight := int32(h * 2) // doubled per ICO spec (XOR + AND)
	bmpSize := uint32(40 + len(pixels) + len(mask))

	icoSize := 6 + 16 + bmpSize
	out := make([]byte, 0, icoSize)

	// ICONDIR
	out = append(out, 0, 0) // reserved
	out = append(out, 1, 0) // type=icon
	out = append(out, 1, 0) // count=1
	// ICONDIRENTRY
	out = append(out, byte(w), byte(h), 0, 0) // width, height, 0 colors, reserved
	out = append(out, 1, 0)                   // planes
	out = append(out, 32, 0)                  // bpp
	// bytes in resource
	out = appendUint32(out, bmpSize)
	// offset
	out = appendUint32(out, 6+16)

	// BITMAPINFOHEADER
	out = appendUint32(out, biSize)
	out = appendInt32(out, biWidth)
	out = appendInt32(out, biHeight)
	out = append(out, 1, 0)    // planes
	out = append(out, 32, 0)   // bpp
	out = appendUint32(out, 0) // compression
	out = appendUint32(out, uint32(len(pixels)+len(mask)))
	out = appendUint32(out, 0) // xppm
	out = appendUint32(out, 0) // yppm
	out = appendUint32(out, 0) // clr used
	out = appendUint32(out, 0) // clr important

	out = append(out, pixels...)
	out = append(out, mask...)
	return out
}

func appendUint32(b []byte, v uint32) []byte {
	return append(b, byte(v), byte(v>>8), byte(v>>16), byte(v>>24))
}
func appendInt32(b []byte, v int32) []byte {
	return appendUint32(b, uint32(v))
}
