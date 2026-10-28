<#
.SYNOPSIS
  Boyxon Oshxonasi'ni Cloudflare Workers'ga deploy qiladi.

.DESCRIPTION
  1) React SPA'ni `VITE_SITE_URL` bilan build qiladi.
  2) Worker'ni deploy qiladi (birinchi marta Worker yaratiladi).
  3) `.dev.vars` dan production secretlarni bulk yuklaydi:
       CLIENT_URL va GOOGLE_CALLBACK_URL avtomatik SiteUrl'ga almashtiriladi,
       NODE_ENV/PORT/TRUST_PROXY tashlab ketiladi (ular wrangler.jsonc vars'da).
  4) `/health` orqali tekshiradi.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\deploy-cloudflare.ps1 -SiteUrl https://boyxon-server.my-name.workers.dev

.NOTES
  - Avval `npx wrangler login` bajarilgan bo'lishi kerak.
  - `.dev.vars` ichida MONGODB_URI (to'g'ridan-to'g'ri hostlar bilan),
    JWT kalitlari, EMAIL/BREVO kaliti, Cloudinary kalitlari bo'lishi shart.
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$SiteUrl,

  [string]$SecretsFile = ".dev.vars",

  [switch]$SkipBuild,
  [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"

$serverDir = Split-Path -Parent $PSScriptRoot
$clientDir = Join-Path (Split-Path -Parent $serverDir) "client"

$SiteUrl = $SiteUrl.Trim().TrimEnd("/")
if ($SiteUrl -notmatch "^https://") {
  throw "SiteUrl https:// bilan boshlanishi kerak (masalan: https://boyxon-server.siz.workers.dev)"
}
if ($SiteUrl -match "localhost|127\.0\.0\.1") {
  throw "SiteUrl localhost bo'lishi mumkin emas - production domen kerak"
}

# --- 1. Client build ---------------------------------------------------------
if (-not $SkipBuild) {
  Write-Host "`n[1/3] React SPA build qilinmoqda (VITE_SITE_URL=$SiteUrl)..." -ForegroundColor Cyan
  Push-Location $clientDir
  try {
    $env:VITE_SITE_URL = $SiteUrl
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build muvaffaqiyatsiz tugadi" }
  }
  finally {
    Pop-Location
  }
  Write-Host "      Build tayyor." -ForegroundColor Green
}

# --- 2. Worker deploy --------------------------------------------------------
Write-Host "`n[2/3] Worker deploy qilinmoqda..." -ForegroundColor Cyan
Push-Location $serverDir
try {
  npx wrangler deploy
  if ($LASTEXITCODE -ne 0) { throw "wrangler deploy muvaffaqiyatsiz tugadi" }

  # --- 3. Secrets ------------------------------------------------------------
  if (-not $SkipSecrets) {
    $varsPath = Join-Path $serverDir $SecretsFile
    if (-not (Test-Path $varsPath)) {
      throw "$varsPath topilmadi. Secretlarni qo'lda yuklang yoki -SkipSecrets ishlatib qayta deploy qiling."
    }

    Write-Host "`n[3/3] Secretlar yuklanmoqda ($SecretsFile)..." -ForegroundColor Cyan

    $skip = @("NODE_ENV", "PORT", "TRUST_PROXY")
    $secrets = @{}
    foreach ($line in Get-Content $varsPath) {
      if ($line -match "^\s*([A-Z0-9_]+)\s*=\s*(.*)$") {
        $key = $matches[1]
        $value = $matches[2].Trim()
        if ($skip -contains $key) { continue }
        if ([string]::IsNullOrWhiteSpace($value)) { continue }
        $secrets[$key] = $value
      }
    }

    $secrets["CLIENT_URL"] = $SiteUrl
    $secrets["GOOGLE_CALLBACK_URL"] = "$SiteUrl/api/auth/google/callback"

    $wranglerDir = Join-Path $serverDir ".wrangler"
    New-Item -ItemType Directory -Force -Path $wranglerDir | Out-Null
    $jsonPath = Join-Path $wranglerDir "production-secrets.json"
    try {
      $json = $secrets | ConvertTo-Json -Depth 3
      # BOM'siz UTF-8 - Node'ning JSON.parse'i BOM bilan ishlamaydi.
      [System.IO.File]::WriteAllText($jsonPath, $json, (New-Object System.Text.UTF8Encoding($false)))
      npx wrangler secret bulk $jsonPath
      if ($LASTEXITCODE -ne 0) { throw "wrangler secret bulk muvaffaqiyatsiz tugadi" }
      Write-Host "      $($secrets.Keys.Count) ta secret yuklandi: $($secrets.Keys -join ', ')" -ForegroundColor Green
    }
    finally {
      Remove-Item $jsonPath -Force -ErrorAction SilentlyContinue
    }
  }
}
finally {
  Pop-Location
}

# --- 4. Health check ---------------------------------------------------------
Write-Host "`n[4/4] Tekshiruv: $SiteUrl/health" -ForegroundColor Cyan
$ok = $false
for ($i = 1; $i -le 5; $i++) {
  try {
    $res = Invoke-RestMethod -Uri "$SiteUrl/health" -TimeoutSec 60
    $res | ConvertTo-Json -Depth 3
    $ok = $true
    break
  }
  catch {
    Write-Host "      Urinish $i muvaffaqiyatsiz: $($_.Exception.Message)" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
  }
}

if (-not $ok) {
  throw "Health check o'tmadi. Loglarni ko'ring: npx wrangler tail"
}

Write-Host "`nTayyor! Sayt: $SiteUrl" -ForegroundColor Green
Write-Host "Keyingi qadamlar:" -ForegroundColor Cyan
Write-Host "  1) Google OAuth callback: $SiteUrl/api/auth/google/callback"
Write-Host "  2) Mobile: boyxon/mobile/lib/core/config/app_config.dart dagi URL'larni yangilang"
Write-Host "  3) APK'ni R2/GitHub Releases'ga qo'yib, VITE_APK_URL bilan qayta build qiling"
