# Build Release APK Script
# This script sets up the environment and builds the release APK

Write-Host "Starting Release Build Process..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "production"
$env:EXPO_PUBLIC_TAMAGUI_TARGET = "native"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "  NODE_ENV = $env:NODE_ENV"
Write-Host "  EXPO_PUBLIC_TAMAGUI_TARGET = $env:EXPO_PUBLIC_TAMAGUI_TARGET"

# Clean build directories
Write-Host "`nCleaning build directories..." -ForegroundColor Yellow
Remove-Item -Path "android\app\.cxx" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Build directories cleaned" -ForegroundColor Green

# Navigate to android directory and build
Write-Host "`nBuilding Release APK..." -ForegroundColor Yellow
Set-Location android

# Run Gradle build
./gradlew assembleRelease --stacktrace

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "`nAPK Location:" -ForegroundColor Yellow
    Write-Host "  android\app\build\outputs\apk\release\app-release.apk"
    
    # Check if APK exists
    if (Test-Path "app\build\outputs\apk\release\app-release.apk") {
        $apkSize = (Get-Item "app\build\outputs\apk\release\app-release.apk").Length / 1MB
        Write-Host "`nAPK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
}

Set-Location ..

