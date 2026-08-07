# Add GitHub CLI to PATH
$env:PATH += ";C:\Program Files\GitHub CLI"

# Check if gh is available
try {
    $ghVersion = & "gh.exe" --version 2>&1
    Write-Host "gh CLI found: $ghVersion"
} catch {
    Write-Host "ERROR: gh CLI not found at C:\Program Files\GitHub CLI"
    Write-Host "Checking other locations..."
    
    # Try to find gh.exe anywhere
    $ghPath = Get-ChildItem -Path "C:\" -Filter "gh.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    
    if ($ghPath) {
        Write-Host "Found gh.exe at: $ghPath"
        & $ghPath --version
    } else {
        Write-Host "ERROR: gh.exe not found anywhere on C:\"
        exit 1
    }
}

# Check authentication
Write-Host "`nChecking GitHub authentication..."
try {
    $authStatus = & "gh" auth status 2>&1
    if ($authStatus -match "You are already logged in") {
        Write-Host "Already authenticated!"
    } else {
        Write-Host "Not authenticated. Attempting login with git credentials..."
        # Try to authenticate using existing git credentials
        try {
            & "gh" auth login --with-git-credentials 2>&1 | Out-Null
            Write-Host "Authentication successful!"
        } catch {
            Write-Host "ERROR: Could not authenticate. Please run manually:"
            Write-Host "  gh auth login --with-git-credentials"
            exit 1
        }
    }
} catch {
    Write-Host "ERROR: Authentication check failed"
    exit 1
}

# Create release
Write-Host "`nCreating GitHub Release v1.9.2..."
try {
    $releaseResult = & "gh" release create `
        "v1.9.2" `
        --title "v1.9.2 - grep_files ReDoS Fix: Top-Level Alternation Detection & Split-Regex Processing" `
        --notes "Top-level alternation detection (hasTopLevelAlternation), split-regex processing to eliminate cross-branch backtracking in V8's NFA engine, and patternMode transparency." `
        --target HEAD `
        2>&1
    
    Write-Host "Release created successfully!"
    Write-Host $releaseResult
    
    # Verify
    Write-Host "`nVerifying release..."
    & "gh" release view v1.9.2 --json tagName,name,url 2>&1
} catch {
    Write-Host "ERROR: Failed to create release"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "`nRelease v1.9.2 created!"
Write-Host "View at: https://github.com/TheRealCrunch3r/ai-toolbox/releases"
