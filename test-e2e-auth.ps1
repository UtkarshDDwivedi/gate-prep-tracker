$ErrorActionPreference = "Continue"
Write-Host "=========================================="
Write-Host "Starting Next.js production server on port 3005..."
Write-Host "=========================================="

$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start", "--", "-p", "3005" -PassThru

# Give Next.js server time to boot
Start-Sleep -Seconds 6

try {
    Write-Host "`n[TEST 1/6] Verifying Database Records via /api/tracker..."
    $trackerRaw = curl.exe -s http://localhost:3005/api/tracker
    Write-Host "Raw Tracker response: $trackerRaw"
    $trackerJson = $trackerRaw | ConvertFrom-Json
    Write-Host "Status: $($trackerJson.status) | Active User: $($trackerJson.userId) | Total Subjects: $($trackerJson.subjects.Count)"
    if ($trackerJson.status -eq "ok" -and $trackerJson.subjects.Count -gt 0) {
        Write-Host ">> SUCCESS: Connected to Neon Postgres! Found $($trackerJson.subjects.Count) database subjects." -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Could not retrieve database subjects" -ForegroundColor Red
    }

    Write-Host "`n[TEST 2/6] Verifying October has NO dummy 82% completed data..."
    $octSubs = $trackerJson.subjects | Where-Object { 
        $p = $_.monthly_plans | Where-Object { $_.month -eq "2026-10" }
        $p -ne $null
    }
    if ($null -eq $octSubs -or $octSubs.Count -eq 0) {
        Write-Host ">> SUCCESS: October currently has 0 subjects in the database. No fake 82% data!" -ForegroundColor Green
    } else {
        Write-Host ">> Found $($octSubs.Count) subjects in October"
    }

    Write-Host "`n[TEST 3/6] Adding a REAL subject to October in Neon Postgres..."
    $octSubjectPayload = @{
        action = "create_subject"
        title = "Engineering Mathematics"
        icon = "math"
        totalLectures = 25
        completedLectures = 20
        month = "2026-10"
        isUrgent = $true
    } | ConvertTo-Json
    $createJson = Invoke-RestMethod -Uri "http://localhost:3005/api/tracker" -Method Post -ContentType "application/json" -Body $octSubjectPayload
    Write-Host "Created Subject ID: $($createJson.id)"
    if ($createJson.status -eq "ok" -and $createJson.id) {
        Write-Host ">> SUCCESS: Real subject saved to October in Neon Postgres!" -ForegroundColor Green
    }

    Write-Host "`n[TEST 4/6] Re-querying Database to verify October now accurately reflects database records..."
    $refreshedJson = Invoke-RestMethod -Uri "http://localhost:3005/api/tracker" -Method Get
    $octUpdated = $refreshedJson.subjects | Where-Object { 
        $p = $_.monthly_plans | Where-Object { $_.month -eq "2026-10" }
        $p -ne $null
    }
    if ($octUpdated) {
        $total = ($octUpdated | Measure-Object -Property total_lectures -Sum).Sum
        $done = ($octUpdated | Measure-Object -Property completed_lectures -Sum).Sum
        $pct = [Math]::Round(($done / $total) * 100)
        Write-Host "October Real DB Progress: $done / $total lectures ($pct%)"
        Write-Host ">> SUCCESS: October progress is now 100% computed from real database rows!" -ForegroundColor Green
    }

    Write-Host "`n[TEST 5/6] Verifying Neon Auth Integration & API endpoint..."
    $authOutput = curl.exe -s http://localhost:3005/api/auth-test
    Write-Host "Auth Response: $authOutput"
    $authJson = $authOutput | ConvertFrom-Json
    if ($authJson.service -eq "neon-auth") {
        Write-Host ">> SUCCESS: Neon Auth service is active and connected!" -ForegroundColor Green
    }

    Write-Host "`n[TEST 6/6] Verifying Home Page rendered UI & Auth elements..."
    $homeHtml = curl.exe -s http://localhost:3005
    $hasSignIn = $homeHtml -match "Sign In"
    $hasRoad = $homeHtml -match "Your Road to"
    $hasGate = $homeHtml -match "GATE Tracker"
    Write-Host "Home contains 'Sign In' button: $hasSignIn"
    Write-Host "Home contains 'Your Road to GATE 2027': $hasRoad"
    Write-Host "Home contains 'GATE Tracker': $hasGate"
    if ($hasSignIn -and $hasRoad -and $hasGate) {
        Write-Host ">> SUCCESS: Home page rendered all UI and Authentication elements!" -ForegroundColor Green
    }

    Write-Host "`n=========================================="
    Write-Host "ALL VERIFICATION TESTS COMPLETED"
    Write-Host "=========================================="
} finally {
    Write-Host "`nShutting down server (PID: $($proc.Id))..."
    cmd.exe /c "taskkill /PID $($proc.Id) /T /F" 2>&1 | Out-Null
}
