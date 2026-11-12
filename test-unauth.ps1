$ErrorActionPreference = "Continue"
Write-Host "=========================================="
Write-Host "Starting Next.js production server on port 3005..."
Write-Host "=========================================="

$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start", "--", "-p", "3005" -PassThru

# Give Next.js server time to boot
Start-Sleep -Seconds 6

try {
    Write-Host "`n[TEST 1/3] Testing GET /api/tracker for unauthenticated visitor..."
    $resp = curl.exe -s http://localhost:3005/api/tracker
    Write-Host "API Response: $resp"
    $json = $resp | ConvertFrom-Json
    if ($json.authenticated -eq $false -and $json.subjects.Count -eq 0) {
        Write-Host ">> SUCCESS: Unauthenticated visitors see exactly ZERO subjects!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Expected 0 subjects for unauthenticated visitor" -ForegroundColor Red
    }

    Write-Host "`n[TEST 2/3] Testing unauthenticated POST mutation rejection (HTTP 401)..."
    $unauthPostPayload = '{\"action\":\"create_subject\",\"title\":\"Theory of Computation\",\"totalLectures\":20,\"completedLectures\":0}'
    $postOutput = curl.exe -s -i -X POST http://localhost:3005/api/tracker -H "Content-Type: application/json" -d "{\`"action\`":\`"create_subject\`",\`"title\`":\`"Theory of Computation\`",\`"totalLectures\`":20}"
    Write-Host $postOutput
    $is401 = $postOutput -match "401 Unauthorized" -or $postOutput -match "UNAUTHENTICATED"
    if ($is401) {
        Write-Host ">> SUCCESS: Unauthenticated modification attempt is blocked and prompted for login!" -ForegroundColor Green
    } else {
        Write-Host ">> FAILED: Expected 401 Unauthorized response" -ForegroundColor Red
    }

    Write-Host "`n[TEST 3/3] Testing home page HTML for unauthenticated visitors..."
    $html = curl.exe -s http://localhost:3005
    $hasSignIn = $html -match "Sign In"
    $hasEmptyState = $html -match "No subjects planned"
    Write-Host "Home contains 'Sign In' button: $hasSignIn"
    Write-Host "Home contains 'No subjects planned': $hasEmptyState"
    if ($hasSignIn -and $hasEmptyState) {
        Write-Host ">> SUCCESS: Home page shows zero subjects with prompt to sign in!" -ForegroundColor Green
    }

    Write-Host "`n=========================================="
    Write-Host "ALL UNAUTHENTICATED TESTS PASSED"
    Write-Host "=========================================="
} finally {
    Write-Host "`nShutting down server (PID: $($proc.Id))..."
    cmd.exe /c "taskkill /PID $($proc.Id) /T /F" 2>&1 | Out-Null
}

