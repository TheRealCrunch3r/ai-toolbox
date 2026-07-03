@echo off
echo === Git Debug Information ===
echo.
echo Current Directory: %CD%
if exist ".git" (echo .git exists: YES) else (echo .git exists: NO)
echo.

echo --- Git Version ---
call git --version 2>&1
echo.

echo --- Git Status ---
call git -C "%CD%" status 2>&1
echo.

echo --- Git Remote ---
call git -C "%CD%" remote -v 2>&1
echo.

echo --- Git Branch ---
call git -C "%CD%" branch -a 2>&1
echo.

echo --- Git Log (last 3) ---
call git -C "%CD%" log -3 --oneline 2>&1
echo.
