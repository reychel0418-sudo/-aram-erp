@echo off
chcp 65001 >nul
echo ============================================
echo   ARAM ERP - Auto GitHub Save Setup
echo ============================================
echo.
echo This will register a Windows Task Scheduler job
echo that automatically saves code to GitHub every 30 minutes.
echo.
powershell.exe -ExecutionPolicy Bypass -Command ^
  "& { ^
    $taskName = 'ARAM_ERP_AutoGitSync'; ^
    $ps1 = 'C:\Users\user\Desktop\에이전트\클로드\시스템구축\회사포털ERP.V3\회사포털ERP.V3\auto_commit.ps1'; ^
    $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument \"-ExecutionPolicy Bypass -WindowStyle Hidden -File \`\"$ps1\`\"\"; ^
    $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 30) -Once -At (Get-Date); ^
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -StartWhenAvailable; ^
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited; ^
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue; ^
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force; ^
    Write-Host '' -ForegroundColor Green; ^
    Write-Host '  Auto-save task registered!' -ForegroundColor Green; ^
    Write-Host '  Name: ' $taskName -ForegroundColor Cyan; ^
    Write-Host '  Interval: Every 30 minutes' -ForegroundColor Cyan; ^
    Write-Host '  Script: auto_commit.ps1' -ForegroundColor Cyan; ^
  }"
echo.
echo ============================================
echo   DONE! Auto-save is now active.
echo   Log file: auto_commit.log (in project folder)
echo ============================================
echo.
pause
