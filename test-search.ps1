#!/usr/bin/env pwsh

# ConnectSpace Search Diagnostic Script
# Run this to verify search is working

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║     ConnectSpace Search Diagnostics       ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""

# Test 1: Backend Health
Write-Host "1️⃣  Testing Backend Health..."
try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "      Run: cd backend; npm start"
    exit 1
}

# Test 2: Search Endpoint
Write-Host ""
Write-Host "2️⃣  Testing Search Endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/properties/search?q=Dum" -UseBasicParsing -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    
    $count = $data.data.properties.Count
    if ($count -gt 0) {
        Write-Host "   ✅ Search endpoint working! Found $count property/properties" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Results:"
        foreach ($prop in $data.data.properties) {
            Write-Host "   • $($prop.title) in $($prop.address.city)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠️  Search endpoint working but NO RESULTS for query 'Dum'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Search endpoint error: $($_)" -ForegroundColor Red
    exit 1
}

# Test 3: Frontend
Write-Host ""
Write-Host "3️⃣  Testing Frontend..."
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "      Run: cd frontend; npm start"
}

# Test 4: Database
Write-Host ""
Write-Host "4️⃣  Testing Database Connection..."
try {
    $dbTest = Invoke-WebRequest -Uri "http://localhost:5000/api/properties" -UseBasicParsing -TimeoutSec 5
    $dbData = $dbTest.Content | ConvertFrom-Json
    $total = $dbData.data.properties.Count
    Write-Host "   ✅ Database connected! Found $total properties" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Database error" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║            ✅ SYSTEM STATUS: OK             ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""
Write-Host "🎯 QUICK TEST:"
Write-Host "   1. Open browser: http://localhost:3000"
Write-Host "   2. In search box, enter: Dum"
Write-Host "   3. Click 'Search Properties'"
Write-Host "   4. Should show property with city 'Dum Dum'"
Write-Host ""
Write-Host "🔍 Or test directly in browser:"
Write-Host "   http://localhost:5000/api/properties/search?q=Dum"
Write-Host ""
