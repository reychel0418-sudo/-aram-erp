@echo off
powershell.exe -ExecutionPolicy Bypass -Command "& { Set-Location '%~dp0'; & 'C:\Program Files\Git\bin\git.exe' add -A; & 'C:\Program Files\Git\bin\git.exe' commit -m 'Add: GitHub push scripts and auto-save setup'; Write-Host 'Commit OK' -ForegroundColor Green; }"
pause
