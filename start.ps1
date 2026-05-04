$ErrorActionPreference = "Stop"

Write-Host "Starting Project Hyperion..." -ForegroundColor Cyan

# Install dependencies if node_modules are missing
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing root dependencies (concurrently)..." -ForegroundColor Yellow
    npm install
}

if (-Not (Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install --prefix server
}

if (-Not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install --prefix client
}

Write-Host "Starting both Client and Server concurrently..." -ForegroundColor Green
npm run dev
