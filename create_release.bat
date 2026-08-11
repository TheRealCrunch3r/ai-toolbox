@echo off
REM Get GitHub token from Windows Credential Store and create release 

echo Retrieving GitHub Token from Windows Credential Store...

REM Check if credentials exist
cmdkey /list > temp_list.txt 2>&1
findstr /i "github" temp_list.txt > nul

if %errorlevel% equ 0 (
    echo Found GitHub credentials in Windows Credential Store!
    
    REM Create credential input file
    echo protocol=https > temp_cred_input.txt
    echo host=github.com >> temp_cred_input.txt
    echo url=https://github.com/TheRealCrunch3r/ai-toolbox >> temp_cred_input.txt
    echo username=TheRealCrunch3r >> temp_cred_input.txt
    
    REM Try to get credentials using git credential manager
    git -c credential.helper="manager" credential fill < temp_cred_input.txt > temp_creds.txt 2>&1
    
    REM Extract password from output
    findstr /i "password:" temp_creds.txt > nul
    
    if %errorlevel% equ 0 (
        for /f "tokens=2,* delims=: " %%A in ('findstr /i "password:" temp_creds.txt') do (
            set TOKEN=%%B
            echo Token found!
            echo Token: !TOKEN:~0,12!...!TOKEN:~-4!
            
            REM Set environment variable for release script
            set GITHUB_TOKEN=!TOKEN!
            
            REM Now run the release creation script with the token
            echo.
            echo Creating GitHub Release v1.9.3...
            powershell -Command "$env:GITHUB_TOKEN = '!TOKEN!'; & create_release_api.ps1" 2>&1
            
        )
    ) else (
        echo Failed to extract password from git credentials.
        type temp_creds.txt
    )
    
) else (
    echo No GitHub credentials found in Windows Credential Store.
)

REM Cleanup temp files
del /q temp_list.txt > nul 2>&1
del /q temp_cred_input.txt > nul 2>&1
del /q temp_creds.txt > nul 2>&1

echo.
pause
