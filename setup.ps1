# =============================================================================
# Boyxon Oshxonasi — avtomatik o'rnatish skripti (Windows PowerShell)
# =============================================================================
# Bu skript quyidagini bajaradi:
#   1) node/npm mavjudligini tekshiradi
#   2) Root package.json orqali barcha bog'liqliklarni o'rnatadi
#   3) .env fayllarini nusxalaydi (.env.example'dan)
#   4) Docker orqali lokal MongoDB ni ishga tushiradi (agar docker bor bo'lsa)
# =============================================================================

$ErrorActionPreference = "Stop"
Write-Host "🍽️  Boyxon Oshxonasi o'rnatish skripti boshlandi..." -ForegroundColor Cyan

# ── 1) Node.js tekshirish ──
Write-Host "`n[1/5] Node.js tekshirilmoqda..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js topilmadi. https://nodejs.org orqali o'rnating." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $($node.Version) topildi" -ForegroundColor Green

# ── 2) Bog'liqliklarni o'rnatish ──
Write-Host "`n[2/5] Barcha bog'liqliklarni o'rnatish (npm install)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install xatolik qaytardi." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bog'liqliklar o'rnatildi" -ForegroundColor Green

# ── 3) .env fayllarini nusxalash ──
Write-Host "`n[3/5] .env fayllarini nusxalash..." -ForegroundColor Yellow

$serverEnv = "boyxon/server/.env"
$serverExample = "boyxon/server/.env.example"
if (-not (Test-Path $serverEnv) -and (Test-Path $serverExample)) {
    Copy-Item $serverExample $serverEnv
    Write-Host "   ✅ $serverEnv yaratildi" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  $serverEnv allaqachon mavjud, o'tkazib yuborildi" -ForegroundColor Gray
}

$clientEnv = "boyxon/client/.env"
$clientExample = "boyxon/client/.env.example"
if (-not (Test-Path $clientEnv) -and (Test-Path $clientExample)) {
    Copy-Item $clientExample $clientEnv
    Write-Host "   ✅ $clientEnv yaratildi" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  $clientEnv allaqachon mavjud, o'tkazib yuborildi" -ForegroundColor Gray
}

Write-Host "⚠️  boyxon/server/.env ichidagi kalitlarni to'ldirishingiz kerak (JWT_SECRET, MONGODB_URI, ADMIN_PASSWORD)" -ForegroundColor Yellow

# ── 4) Docker orqali MongoDB ──
Write-Host "`n[4/5] Docker tekshiruvi..." -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "   Docker topildi. MongoDB konteynerini ishga tushirish..." -ForegroundColor Gray
    docker compose up -d 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ MongoDB konteyneri ishga tushdi" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Docker compose ishga tushirilmadi (shunchalik dev:local orqali ham ishlaydi)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Docker topilmadi — npm run dev:local orqali xotirada MongoDB ishlatishingiz mumkin" -ForegroundColor Gray
}

# ── 5) Yakun ──
Write-Host "`n[5/5] Tayyor!" -ForegroundColor Green
Write-Host @"

Keyingi qadamlar:
  1) boyxon/server/.env ichidagi kalitlarni to'ldiring (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_RESET_SECRET, ADMIN_PASSWORD)
  2) npm run dev            # client (http://localhost:5173) + server (http://localhost:5000)
  3) Yoki alohida terminalda:
     cd boyxon/server && npm run dev:local   # server (xotirada MongoDB)
     cd boyxon/client && npm run dev          # client

Demo kirish (seed'dan keyin):
  Admin:   admin@boyxon.uz / .env da bergan ADMIN_PASSWORD
  Demo:    aziz@example.com / User123!

Dokumentatsiya:
  README.md        — asosiy qo'llanma
  DESIGN.md        — dizayn tizimi
  SECURITY.md      — xavfsizlik
  CONTRIBUTING.md  — hissa qo'shish

"@ -ForegroundColor Cyan