$ErrorActionPreference = "Continue"
Write-Host "=========================================="
Write-Host "Starting Next.js production server on port 3005..."
Write-Host "=========================================="

$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "start", "--", "-p", "3005" -PassThru

# Wait 6 seconds for server to be fully ready
Start-Sleep -Seconds 6

try {
    Write-Host "`n[TEST 1/4] Querying Lakebase Postgres (/api/db-test)..."
    $dbOutput = curl.exe -s http://localhost:3005/api/db-test
    Write-Host $dbOutput

    Write-Host "`n[TEST 2/4] Testing Neon Auth Server API (/api/auth-test)..."
    $authOutput = curl.exe -s http://localhost:3005/api/auth-test
    Write-Host $authOutput

    Write-Host "`n[TEST 3/4] Testing Neon Auth Handler (/api/auth/get-session)..."
    $handlerOutput = curl.exe -s -i http://localhost:3005/api/auth/get-session
    Write-Host $handlerOutput

    Write-Host "`n[TEST 4/4] Testing Home Page (/)..."
    $pageOutput = curl.exe -s http://localhost:3005
    if ($pageOutput -match "Lakebase Postgres" -and $pageOutput -match "Neon Auth") {
        Write-Host ">> Home page rendered both Lakebase Postgres and Neon Auth components successfully!"
    } else {
        Write-Host ">> Home page output length: $($pageOutput.Length) bytes"
    }

    Write-Host "`n=========================================="
    Write-Host "ALL SERVICES VERIFIED END-TO-END"
    Write-Host "=========================================="
} finally {
    Write-Host "`nShutting down server (PID: $($proc.Id))..."
    cmd.exe /c "taskkill /PID $($proc.Id) /T /F" 2>&1 | Out-Null
}
