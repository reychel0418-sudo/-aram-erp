# ARAM ERP - GitHub Push Script
# GitHub Username: reychel0418
# Repository: https://github.com/reychel0418/aram-erp

$gitPath     = "C:\Program Files\Git\bin\git.exe"
$githubUser  = "reychel0418"
$repoUrl     = "https://github.com/$githubUser/aram-erp.git"

if (-not (Test-Path $gitPath)) { $gitPath = "git" }

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ARAM ERP - GitHub Upload" -ForegroundColor Cyan
Write-Host "  https://github.com/$githubUser/aram-erp" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Move to project folder
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath -ErrorAction SilentlyContinue
Write-Host "[INFO] Project: $projectPath" -ForegroundColor Green

# Show recent commit
Write-Host ""
Write-Host "[1/4] Recent commits:" -ForegroundColor Yellow
& $gitPath log --oneline -3

# Set remote origin
Write-Host ""
Write-Host "[2/4] Setting remote: $repoUrl" -ForegroundColor Yellow
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin $repoUrl
Write-Host "      Remote OK" -ForegroundColor Green

# Rename branch master -> main
Write-Host ""
Write-Host "[3/4] Setting branch to main..." -ForegroundColor Yellow
$branch = & $gitPath rev-parse --abbrev-ref HEAD
if ($branch -eq "master") {
    & $gitPath branch -M main
    Write-Host "      Branch renamed: master -> main" -ForegroundColor Green
} else {
    Write-Host "      Branch: $branch" -ForegroundColor Gray
}

# Stage and commit any new/modified files
$status = & $gitPath status --porcelain 2>&1
if ($status) {
    Write-Host ""
    Write-Host "      Committing new files before push..." -ForegroundColor Yellow
    & $gitPath add -A
    & $gitPath commit -m "Add: GitHub push and auto-save scripts" 2>&1 | Out-Null
}

# Push to GitHub
Write-Host ""
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "      (Browser login window may appear — sign in with GitHub)" -ForegroundColor Cyan
Write-Host ""
& $gitPath push -u origin main 2>&1

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Code is now on GitHub!" -ForegroundColor Green
    Write-Host "  URL: https://github.com/$githubUser/aram-erp" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "  Push failed. Check these:" -ForegroundColor Red
    Write-Host "  1. github.com/new -> create repo 'aram-erp' (no README)" -ForegroundColor White
    Write-Host "  2. Make sure GitHub login succeeded in browser" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host "============================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press ENTER to close"
