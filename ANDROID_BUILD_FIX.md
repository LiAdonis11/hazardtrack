# Android Build Fix - CMake Codegen Error

## Problem Summary

The Android build was failing with CMake errors related to missing codegen directories for React Native modules:

```
CMake Error: add_subdirectory given source
"C:/xampp/htdocs/hazardTrackV2/hazardtrack-mobile/node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni/"
which is not an existing directory.
```

This error occurred for multiple modules:
- `@react-native-async-storage/async-storage`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-webview`
- `react-native-worklets`
- `react-native-worklets-core`

## Root Cause

The issue was caused by React Native's New Architecture requiring codegen directories that weren't being generated before the build process. Additionally, the EAS build configuration was missing required environment variables.

## Solution Applied

### 1. Updated EAS Build Configuration (`eas.json`)

Added environment variables and prebuild hooks to both `preview` and `production` profiles:

```json
{
  "preview": {
    "distribution": "internal",
    "android": {
      "buildType": "apk",
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_TAMAGUI_TARGET": "native"
      }
    },
    "prebuildCommand": "chmod +x eas-build-pre-install.sh && ./eas-build-pre-install.sh"
  }
}
```

### 2. Created Pre-Install Hook (`eas-build-pre-install.sh`)

This script runs before the build to:
- Set required environment variables
- Clean any existing build artifacts
- Ensure a fresh build environment

### 3. Added NPM Scripts (`package.json`)

Added convenience scripts:
- `clean:android` - Clean Android build directories
- `build:preview` - Build preview APK using EAS

### 4. Created Build Helper Script (`build-release.ps1`)

PowerShell script for local Windows builds that:
- Sets environment variables
- Cleans build directories
- Runs Gradle build with proper configuration
- Reports build status and APK location

## How to Build

### Option 1: EAS Build (Recommended)

```bash
# Preview build
npm run build:preview

# Or directly
eas build --platform android --profile preview
```

### Option 2: Local Build (Windows)

```powershell
# Using the helper script
.\build-release.ps1

# Or manually
cd android
./gradlew assembleRelease
```

### Option 3: Local Build (Linux/Mac)

```bash
# Set environment variables
export NODE_ENV=production
export EXPO_PUBLIC_TAMAGUI_TARGET=native

# Clean and build
npm run clean:android
cd android
./gradlew assembleRelease
```

## Build Output Location

After a successful build, the APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### If build still fails with codegen errors:

1. **Clean everything:**
   ```bash
   npm run clean:android
   rm -rf node_modules
   npm install
   ```

2. **Verify gradle.properties:**
   Ensure `newArchEnabled=true` in `android/gradle.properties`

3. **Check environment variables:**
   ```bash
   echo $NODE_ENV  # Should be "production"
   echo $EXPO_PUBLIC_TAMAGUI_TARGET  # Should be "native"
   ```

### If build fails with "assertNewArchitectureEnabledTask":

This means some packages require the new architecture. Ensure:
- `newArchEnabled=true` in `android/gradle.properties`
- Environment variables are set correctly
- Build directories are cleaned before building

### If EAS build fails:

1. Check the build logs at the provided URL
2. Ensure the prebuild hook has execute permissions
3. Verify all environment variables are set in `eas.json`

## Files Modified

1. `eas.json` - Added environment variables and prebuild hooks
2. `package.json` - Added build scripts
3. `android/gradle.properties` - Kept `newArchEnabled=true`

## Files Created

1. `eas-build-pre-install.sh` - Pre-install hook for EAS builds
2. `build-release.ps1` - Local build helper script for Windows
3. `ANDROID_BUILD_FIX.md` - This documentation

## Next Steps

1. Try building with EAS: `npm run build:preview`
2. If successful, the APK will be available for download from the EAS dashboard
3. Test the APK on a physical device or emulator
4. If everything works, you can proceed with production builds

## Important Notes

- The new architecture (`newArchEnabled=true`) is required for `react-native-reanimated` and `react-native-worklets`
- Always clean build directories when switching between debug and release builds
- EAS builds are more reliable than local builds as they use a consistent environment
- Local builds on Windows may have path length limitations - use EAS if you encounter issues

## Support

If you continue to experience issues:
1. Check the EAS build logs for specific error messages
2. Verify all dependencies are compatible with React Native 0.81.4
3. Ensure your Android SDK and NDK versions match the requirements
4. Try building with `--clear-cache` flag: `eas build --platform android --profile preview --clear-cache`

