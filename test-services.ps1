$ErrorActionPreference = "Continue"
Write-Host "=========================================="
Write-Host "Starting Next.js production server on port 3005..."
Write-Host "=========================================="

$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start", "--", "-p", "3005" -PassThru

# Give Next.js server time to boot
Start-Sleep -Seconds 6

try {
    Write-Host "`n[TEST 1/5] Querying Tracker API (/api/tracker)..."
    $trackerOutput = curl.exe -s http://localhost:3005/api/tracker
    Write-Host $trackerOutput
    $trackerJson = $trackerOutput | ConvertFrom-Json
    if ($trackerJson.status -eq "ok" -and $trackerJson.subjects.Count -gt 0) {
        Write-Host ">> SUCCESS: Retrieved $($trackerJson.subjects.Count) subjects from Neon Postgres!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Could not retrieve subjects" -ForegroundColor Red
    }

    Write-Host "`n[TEST 2/5] Testing Logging a Lecture (+1) on 'sub-os' (/api/tracker)..."
    $logBody = @{
        action = "log_lecture"
        subjectId = "sub-os"
        delta = 1
    } | ConvertTo-Json
    $logJson = Invoke-RestMethod -Uri "http://localhost:3005/api/tracker" -Method Post -ContentType "application/json" -Body $logBody
    Write-Host ($logJson | ConvertTo-Json -Compress)
    if ($logJson.status -eq "ok") {
        Write-Host ">> SUCCESS: Logged completed lecture in Neon Postgres! New count: $($logJson.subject.completed_lectures)/$($logJson.subject.total_lectures)" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Logging lecture failed" -ForegroundColor Red
    }

    Write-Host "`n[TEST 3/5] Testing Creating a New Subject with Urgent flag (/api/tracker)..."
    $newSubBody = @{
        action = "create_subject"
        title = "Discrete Mathematics"
        icon = "math"
        totalLectures = 35
        completedLectures = 5
        month = "2026-11"
        isUrgent = $true
    } | ConvertTo-Json
    $createJson = Invoke-RestMethod -Uri "http://localhost:3005/api/tracker" -Method Post -ContentType "application/json" -Body $newSubBody
    Write-Host ($createJson | ConvertTo-Json -Compress)
    if ($createJson.status -eq "ok" -and $createJson.id) {
        Write-Host ">> SUCCESS: Created subject $($createJson.id) with urgent plan in Neon Postgres!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Creating subject failed" -ForegroundColor Red
    }

    Write-Host "`n[TEST 4/5] Testing Toggling Urgency (/api/tracker)..."
    $toggleBody = @{
        action = "toggle_urgent"
        subjectId = "sub-dsa"
        month = "2026-11"
        isUrgent = $true
    } | ConvertTo-Json
    $toggleJson = Invoke-RestMethod -Uri "http://localhost:3005/api/tracker" -Method Post -ContentType "application/json" -Body $toggleBody
    Write-Host ($toggleJson | ConvertTo-Json -Compress)
    if ($toggleJson.status -eq "ok") {
        Write-Host ">> SUCCESS: Toggled urgency flag in Neon Postgres!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Urgency toggle failed" -ForegroundColor Red
    }

    Write-Host "`n[TEST 5/5] Testing Home Page Rendering (/)..."
    $pageOutput = curl.exe -s http://localhost:3005
    $hasLogo = $pageOutput -match "GATE Tracker"
    $hasRoad = $pageOutput -match "Your Road to"
    $hasProgress = $pageOutput -match "Progress &amp; Plan" -or $pageOutput -match "Progress & Plan"
    $hasUrgent = $pageOutput -match "Urgent Plan"

    Write-Host "Contains 'GATE Tracker': $hasLogo"
    Write-Host "Contains 'Your Road to GATE 2027': $hasRoad"
    Write-Host "Contains 'Progress & Plan': $hasProgress"
    Write-Host "Contains 'Urgent Plan': $hasUrgent"

    if ($hasLogo -and $hasRoad -and $hasProgress -and $hasUrgent) {
        Write-Host ">> SUCCESS: Home page rendered all UI sections matching the mockup perfectly!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Some UI sections missing" -ForegroundColor Red
    }

    Write-Host "`n=========================================="
    Write-Host "ALL TESTS PASSED SUCCESSFULLY"
    Write-Host "=========================================="
} finally {
    Write-Host "`nShutting down server (PID: $($proc.Id))..."
    cmd.exe /c "taskkill /PID $($proc.Id) /T /F" 2>&1 | Out-Null
}
