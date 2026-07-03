# Debug Git Path Resolution Script
Write-Host "=== Git Debug Information ===" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "Current Directory: $currentDir" -ForegroundColor Yellow
Write-Host ".git exists: $(Test-Path '.git')" -ForegroundColor Yellow
Write-Host ""

# Try git version first (should work regardless of repo)
try {
    $version = & git --version 2>&1
    Write-Host "Git Version: $version" -ForegroundColor Green
} catch {
    Write-Host "ERROR running git --version : $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Git Status ---" -ForegroundColor Cyan
try {
    # Use -C flag to explicitly set directory (works even if we're not in it)
    $status = & git -C $currentDir status 2>&1
    Write-Host $status
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Git Remote Info ---" -ForegroundColor Cyan
try {
    $remote = & git -C $currentDir remote -v 2>&1
    Write-Host $remote
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
