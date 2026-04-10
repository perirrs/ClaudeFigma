# Resize Chrome Web Store screenshots to 1280x800 24-bit PNG (no alpha).
#
# Chrome Web Store requires:
#   - 1280x800 OR 640x400
#   - PNG (24-bit, no alpha) or JPEG
#   - at least 1, at most 5 screenshots
#
# Usage (PowerShell, from extension\store-listing\):
#
#   # 1. Put your raw captures in .\raw\ with any names ending .png or .jpg
#   # 2. Run:
#   .\resize-screenshots.ps1
#
#   # The resized, alpha-stripped files are written to .\screenshots\
#   # with the recommended Chrome Web Store naming (01-*.png ... 05-*.png).
#
# You can also pass -Width 640 -Height 400 if you want the smaller size,
# or -Source / -Dest to override the folders.

param(
  [int]$Width  = 1280,
  [int]$Height = 800,
  [string]$Source = (Join-Path $PSScriptRoot "raw"),
  [string]$Dest   = (Join-Path $PSScriptRoot "screenshots")
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $Source)) {
  Write-Host "Creating $Source"
  New-Item -ItemType Directory -Path $Source | Out-Null
  Write-Host ""
  Write-Host "Drop your raw screenshots into:"
  Write-Host "  $Source"
  Write-Host "Then re-run this script."
  exit 0
}

if (-not (Test-Path $Dest)) {
  New-Item -ItemType Directory -Path $Dest | Out-Null
}

$files = Get-ChildItem -Path $Source -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg)$' } |
  Sort-Object Name

if ($files.Count -eq 0) {
  Write-Host "No .png / .jpg files found in $Source" -ForegroundColor Yellow
  exit 1
}

if ($files.Count -gt 5) {
  Write-Host "Warning: $($files.Count) files found. Chrome Web Store allows at most 5 — only the first 5 will be processed." -ForegroundColor Yellow
  $files = $files | Select-Object -First 5
}

$index = 0
foreach ($file in $files) {
  $index++
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLower() -replace '[^a-z0-9]+','-'
  $outName = ("{0:D2}-{1}.png" -f $index, $stem)
  $outPath = Join-Path $Dest $outName

  Write-Host "[$index/$($files.Count)] $($file.Name) -> $outName"

  $src = [System.Drawing.Image]::FromFile($file.FullName)
  try {
    # 24bppRgb = no alpha channel. Chrome Web Store rejects 32bpp PNGs
    # on promo tiles and prefers 24-bit for screenshots too.
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Fill with the extension's dark background so any letterbox bars
        # blend in instead of showing flat white.
        $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(11, 18, 32))
        try {
          $g.FillRectangle($bgBrush, 0, 0, $Width, $Height)
        } finally {
          $bgBrush.Dispose()
        }

        # Fit source inside target preserving aspect ratio (letterbox).
        $srcAspect = $src.Width / $src.Height
        $dstAspect = $Width / $Height
        if ($srcAspect -gt $dstAspect) {
          $drawW = $Width
          $drawH = [int]([math]::Round($Width / $srcAspect))
          $drawX = 0
          $drawY = [int][math]::Round(($Height - $drawH) / 2)
        } else {
          $drawH = $Height
          $drawW = [int]([math]::Round($Height * $srcAspect))
          $drawY = 0
          $drawX = [int][math]::Round(($Width - $drawW) / 2)
        }

        $destRect = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
        $g.DrawImage($src, $destRect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $g.Dispose()
      }

      $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bmp.Dispose()
    }
  } finally {
    $src.Dispose()
  }
}

Write-Host ""
Write-Host "Done. Wrote $($files.Count) files to:"
Write-Host "  $Dest"
Write-Host ""
Write-Host "Verify one by running:"
Write-Host "  Add-Type -AssemblyName System.Drawing"
Write-Host "  `$img = [System.Drawing.Image]::FromFile('$Dest\01-*.png')"
Write-Host "  `"`$(`$img.Width)x`$(`$img.Height) `$(`$img.PixelFormat)`""
Write-Host "  # Expect: ${Width}x${Height} Format24bppRgb"
