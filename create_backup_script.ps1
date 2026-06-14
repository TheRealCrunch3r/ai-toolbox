$backupDir = ".ai_toolbox_backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "project-backup-$timestamp.zip"
$destZip = Join-Path $backupDir $zipName

try {
    Compress-Archive -Path * -DestinationPath $destZip -Force
    Write-Output "Backup created successfully!"
    Write-Output "Location: $destZip"
    
    if (Test-Path $destZip) {
        $file = Get-Item $destZip
        Write-Host ("Size: " + ($file.Length / 1MB).ToString("F2") + " MB") -ForegroundColor Cyan
    }
} catch {
    Write-Output "Error creating backup: $_"
}
