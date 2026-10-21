# Boyxon Oshxonasi — brend rasmlarini generatsiya qilish (Windows PowerShell).
# Ishlatish: powershell -ExecutionPolicy Bypass -File scripts/generate-brand-assets.ps1
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$publicDir = Join-Path $PSScriptRoot '..\public'
$publicDir = [System.IO.Path]::GetFullPath($publicDir)
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null

$orange = [System.Drawing.Color]::FromArgb(230, 126, 34)
$darkOrange = [System.Drawing.Color]::FromArgb(184, 92, 0)
$white = [System.Drawing.Color]::White
$ink = [System.Drawing.Color]::FromArgb(18, 18, 18)
$muted = [System.Drawing.Color]::FromArgb(209, 213, 219)

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Set-HighQuality($g) {
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
}

function Draw-Logo($g, [float]$size, [float]$offsetX, [float]$offsetY, [float]$scale, [bool]$rounded) {
  $bg = if ($rounded) { New-RoundedPath $offsetX $offsetY $size $size ($size * 0.25) } else { $null }
  if ($rounded) {
    $brush = New-Object System.Drawing.SolidBrush($orange)
    $g.FillPath($brush, $bg)
    $brush.Dispose()
    $bg.Dispose()
  } else {
    $brush = New-Object System.Drawing.SolidBrush($orange)
    $g.FillRectangle($brush, $offsetX, $offsetY, $size, $size)
    $brush.Dispose()
  }

  $pen = New-Object System.Drawing.Pen($white, (4 * $scale))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $cx = $offsetX + (32 * $scale)
  $cy = $offsetY + (32 * $scale)
  $r = 14 * $scale
  $g.DrawEllipse($pen, $cx - $r, $cy - $r, $r * 2, $r * 2)

  $g.DrawLine($pen, $cx, $offsetY + (10 * $scale), $cx, $offsetY + (16 * $scale))
  $g.DrawLine($pen, $cx, $offsetY + (48 * $scale), $cx, $offsetY + (54 * $scale))
  $g.DrawLine($pen, $offsetX + (10 * $scale), $cy, $offsetX + (16 * $scale), $cy)
  $g.DrawLine($pen, $offsetX + (48 * $scale), $cy, $offsetX + (54 * $scale), $cy)
  $pen.Dispose()
}

function New-Icon([int]$size, [string]$fileName, [bool]$rounded, [double]$logoRatio = 1.0) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  Set-HighQuality $g
  $g.Clear($ink)

  $logoSize = $size * $logoRatio
  $offset = ($size - $logoSize) / 2
  $scale = $logoSize / 64.0
  Draw-Logo $g $logoSize $offset $offset $scale $rounded

  $path = Join-Path $publicDir $fileName
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Output "wrote $path"
}

New-Icon 192 'icon-192.png' $true
New-Icon 512 'icon-512.png' $true
New-Icon 512 'icon-maskable-512.png' $false 0.86
New-Icon 180 'apple-touch-icon.png' $false 0.88

# --- Open Graph / Twitter karta (1200x630) ---
$og = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($og)
Set-HighQuality $g
$g.Clear($ink)

# Chapdagi ingichka orange chiziq
$accent = New-Object System.Drawing.SolidBrush($orange)
$g.FillRectangle($accent, 0, 0, 12, 630)

# Logo
Draw-Logo $g 200 92 215 (200 / 64.0) $true

$sans = 'Segoe UI'
$brandFont = New-Object System.Drawing.Font($sans, 24, [System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font($sans, 54, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font($sans, 29, [System.Drawing.FontStyle]::Regular)
$infoFont = New-Object System.Drawing.Font($sans, 25, [System.Drawing.FontStyle]::Regular)

$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)
$orangeBrush = New-Object System.Drawing.SolidBrush($orange)

$g.DrawString('BOYXON OSHXONASI', $brandFont, $orangeBrush, 332, 175)
$g.DrawString("O'zbek milliy taomlari", $titleFont, $whiteBrush, 328, 215)
$g.DrawString('Toshkentda 30-45 daqiqada yetkazib berish', $subFont, $mutedBrush, 332, 320)

$g.FillRectangle($accent, 332, 380, 600, 3)
$g.DrawString('Har kuni 9:00-23:00   |   +998 93 958-84-58', $infoFont, $whiteBrush, 332, 410)
$g.DrawString('boyxon-client.onrender.com', $infoFont, $orangeBrush, 332, 460)

$ogPath = Join-Path $publicDir 'og-image.png'
$og.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Png)

$brandFont.Dispose(); $titleFont.Dispose(); $subFont.Dispose(); $infoFont.Dispose()
$whiteBrush.Dispose(); $mutedBrush.Dispose(); $orangeBrush.Dispose()
$accent.Dispose()
$g.Dispose(); $og.Dispose()
Write-Output "wrote $ogPath"
