# Create GitHub Release using raw HTTP API (no gh CLI dependency)
Add-Type -AssemblyName System.Net.Http
$httpClient = New-Object System.Net.Http.HttpClient

# Get authentication from git credentials or environment
$token = $env:GITHUB_TOKEN
if (-not $token) {
    $token = $env:GH_TOKEN
}

if (-not $token) {
    Write-Host "No GITHUB_TOKEN found in environment." -ForegroundColor Red
    
    # Try to get token from git credential store if available
    try {
        $gitProtocol = "https"
        $gitHost = "github.com"
        
        # Check if we can use git credential helper
        $credHelperResult = cmd /c "git config --get credential.helper" 2>$null
        
        if ($credHelperResult -match "manager|store|osxkeychain") {
            Write-Host "Using git credential helper to retrieve token..." -ForegroundColor Yellow
            
            # Try to get credentials via git credential fill
            $credentialInput = @"
protocol=$gitProtocol
host=$gitHost
url=https://$gitHost/TheRealCrunch3r/ai-toolbox
"@
            
            $credFillResult = cmd /c "echo `"$credentialInput`" | git -c credential.helper='!' credential fill 2>$null" 2>$null
            
            if ($credFillResult) {
                # Parse username and password from output
                $usernameMatch = [regex]::Matches($credFillResult, 'username=(.+)')
                $passwordMatch = [regex]::Matches($credFillResult, 'password=(.+)')
                
                if ($usernameMatch.Count -gt 0 -and $passwordMatch.Count -gt 0) {
                    # Extract password (may contain special chars)
                    $passStr = $passwordMatch[0].Groups[1].Value
                    
                    # Try to decode if it looks encoded
                    try {
                        # Check if it's base64
                        if ($passStr.Length -gt 20 -and [regex]::IsMatch($passStr, '^[A-Za-z0-9+/=]+$')) {
                            $decodedBytes = [Convert]::FromBase64String($passStr)
                            $token = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
                        } else {
                            $token = $passStr
                        }
                    } catch {
                        Write-Host "Could not decode password from git credentials" -ForegroundColor Yellow
                        exit 1
                    }
                }
            }
        }
    } catch {
        Write-Host "Failed to retrieve git credentials: $_" -ForegroundColor Red
        exit 1
    }
}

if (-not $token) {
    Write-Host "ERROR: No authentication token available." -ForegroundColor Red
    Write-Host "Please set GITHUB_TOKEN environment variable or configure git credential helper." -ForegroundColor Yellow
    Write-Host "`nExample:" -ForegroundColor Cyan
    Write-Host '  $env:GITHUB_TOKEN = "your_token_here"' -ForegroundColor White
    exit 1
}

# Configure auth header
$httpClient.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("token", $token)

# Create release payload
$releaseData = @{
    tag_name = "v1.9.2"
    name = "v1.9.2 — grep_files ReDoS Fix: Top-Level Alternation Detection & Split-Regex Processing"
    body = @"
## v1.9.2 — grep_files ReDoS Fix

Critical Regex Denial of Service (ReDoS) vulnerability fix for `grep_files` tool:

- 🔥 **Top-level alternation detection**: Added `hasTopLevelAlternation()` scanner tracking parenthesis depth to catch `\|` at root level
- ✅ **Split-regex processing**: Pattern split into independent `RegExp[]` branches — each tested separately with early-exit, eliminating cross-branch backtracking in V8's NFA engine
- 📊 **PatternMode transparency**: Return data now includes `'auto_escaped'` mode for top-level alternation cases

All 371 tests pass across 23 suites — zero regressions.

### Changed Files
- `src/tools/fileSystemTools.ts` — hasTopLevelAlternation(), split-regex processing, processWithRegex updates
- Documentation updated: CHANGELOG.md, SECURITY.md, README.md, package.json, manifest.json
"@
    target_commitish = "HEAD"
    draft = $false
    prerelease = $false
} | ConvertTo-Json -Depth 10

Write-Host "Creating GitHub Release v1.9.2..." -ForegroundColor Green
Write-Host "Payload: $($releaseData.Substring(0, [Math]::Min(200, $releaseData.Length)))..." -ForegroundColor Gray

# Make API call
$apiUrl = "https://api.github.com/repos/TheRealCrunch3r/ai-toolbox/releases"
$contentType = "application/json; charset=utf-8"

try {
    # Use PowerShell's Invoke-RestMethod for better error handling
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType $contentType -Body ([System.Text.Encoding]::UTF8.GetBytes($releaseData))
    
    Write-Host "`n✅ Release created successfully!" -ForegroundColor Green
    Write-Host "HTML URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host "API URL: $($response.url)" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ Failed to create release:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    
    # Try to get error details from response body if available
    $errorBody = $_.Exception.Response?.GetResponseStream() | ForEach-Object { 
        $reader = New-Object System.IO.StreamReader($_)
        $reader.ReadToEnd()
    }
    
    if ($errorBody) {
        Write-Host "Error details: $errorBody" -ForegroundColor DarkRed
    }
    
    exit 1
}

Write-Host "`n🎉 Release v1.9.2 is now live!" -ForegroundColor Green
Write-Host "View at: https://github.com/TheRealCrunch3r/ai-toolbox/releases" -ForegroundColor Cyan
