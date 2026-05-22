# ============================================================
#  ARAM ERP - Auto GitHub Sync
#  GitHub: https://github.com/reychel0418/aram-erp
#  30분 간격 자동 실행 (Task Scheduler 등록됨)
# ============================================================

$gitPath     = "C:\Program Files\Git\bin\git.exe"
$projectPath = "C:\Users\user\Desktop\에이전트\클로드\시스템구축\회사포털ERP.V3\회사포털ERP.V3"
$logFile     = "$projectPath\auto_commit.log"

if (-not (Test-Path $gitPath)) { $gitPath = "git" }

function Log($msg) {
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Add-Content -Path $logFile -Value $line -Encoding UTF8
    # 로그 200줄 제한
    $lines = Get-Content $logFile -ErrorAction SilentlyContinue
    if ($lines -and $lines.Count -gt 200) {
        $lines[-200..-1] | Set-Content $logFile -Encoding UTF8
    }
}

# 프로젝트 폴더 이동
Set-Location $projectPath -ErrorAction SilentlyContinue

# 원격 저장소 확인 및 자동 설정
$remotes = & $gitPath remote 2>&1
if (-not ($remotes -match "origin")) {
    & $gitPath remote add origin "https://github.com/reychel0418/aram-erp.git" 2>&1 | Out-Null
    Log "원격 저장소 자동 설정: github.com/reychel0418/aram-erp"
}

# 변경 사항 확인
$status = & $gitPath status --porcelain 2>&1
if (-not $status) {
    Log "변경 없음 - 동기화 불필요"
    exit 0
}

# 변경 파일 목록
$files = $status -split "`n" | Where-Object { $_.Trim() }
$count = $files.Count
$names = ($files | Select-Object -First 3 | ForEach-Object { ($_ -replace '^.{3}','').Trim() }) -join ", "

# git add & commit
& $gitPath add -A 2>&1 | Out-Null
$dt  = Get-Date -Format "yyyy-MM-dd HH:mm"
$msg = "Auto-save [$dt] $count 파일: $names"
& $gitPath commit -m $msg 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Log "커밋 실패"
    exit 1
}
Log "커밋: $msg"

# push
& $gitPath push origin HEAD 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Log "GitHub push 완료 ✓"
} else {
    Log "push 실패 (로컬 커밋 유지) - 인증 필요시 run_push.bat 실행"
}
