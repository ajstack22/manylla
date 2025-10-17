# iOS Xcode Configuration Instructions

This document provides step-by-step instructions for completing the iOS configuration manually in Xcode.

## Prerequisites
All files have been created:
- ✅ ios/Config/Qual.xcconfig
- ✅ ios/Config/Stage.xcconfig
- ✅ ios/Config/Beta.xcconfig
- ✅ ios/Config/Prod.xcconfig
- ✅ ios/ManyllaMobile/BuildConfigModule.swift
- ✅ ios/ManyllaMobile/BuildConfigModule.m
- ✅ ios/ManyllaMobile/BuildConfigModule-Bridging-Header.h
- ✅ ios/ManyllaMobile/Info.plist (updated with BUILD_TYPE and API_ENDPOINT)

## Step 1: Add Swift Files to Xcode Project

1. Open `ManyllaMobile.xcworkspace` in Xcode
2. In Project Navigator, right-click on `ManyllaMobile` folder
3. Select "Add Files to ManyllaMobile..."
4. Navigate to `ios/ManyllaMobile/` and select:
   - BuildConfigModule.swift
   - BuildConfigModule.m
5. Make sure "Copy items if needed" is UNCHECKED (files already in place)
6. Make sure "Add to targets: ManyllaMobile" is CHECKED
7. Click "Add"

## Step 2: Configure Bridging Header

1. Click on the project `ManyllaMobile` in Project Navigator
2. Select the `ManyllaMobile` target
3. Go to "Build Settings" tab
4. Search for "Objective-C Bridging Header"
5. Set the value to: `ManyllaMobile/BuildConfigModule-Bridging-Header.h`

## Step 3: Link xcconfig Files to Build Configurations

1. Click on the project `ManyllaMobile` in Project Navigator
2. In the project settings (not target), scroll to "Configurations"
3. You should see "Debug" and "Release" configurations
4. Click the disclosure triangle next to "Debug"
5. For "ManyllaMobile" target under Debug, select: `Config/Qual.xcconfig`
6. Click the disclosure triangle next to "Release"
7. For "ManyllaMobile" target under Release, select: `Config/Prod.xcconfig` (we'll create specific configs next)

## Step 4: Create Additional Build Configurations

1. Still in "Configurations" section
2. Click the "+" button below the configurations list
3. Select "Duplicate 'Debug' Configuration" → Name it "Debug-Stage"
4. Select "Duplicate 'Debug' Configuration" → Name it "Debug-Beta"
5. Select "Duplicate 'Release' Configuration" → Name it "Release-Stage"
6. Select "Duplicate 'Release' Configuration" → Name it "Release-Beta"
7. Link configurations to xcconfig files:
   - Debug → Config/Qual.xcconfig
   - Debug-Stage → Config/Stage.xcconfig
   - Debug-Beta → Config/Beta.xcconfig
   - Release → Config/Prod.xcconfig
   - Release-Stage → Config/Stage.xcconfig
   - Release-Beta → Config/Beta.xcconfig

## Step 5: Create Schemes

### Create "ManyllaMobile QUAL" Scheme
1. Go to Product → Scheme → Manage Schemes...
2. Click "+" to create new scheme
3. Name: "ManyllaMobile QUAL"
4. Target: ManyllaMobile
5. Click "Close"
6. Select the new scheme from dropdown
7. Go to Product → Scheme → Edit Scheme...
8. For "Run" → Set Build Configuration to "Debug"
9. For "Archive" → Set Build Configuration to "Debug"
10. Click "Close"

### Create "ManyllaMobile STAGE" Scheme
1. Repeat above steps with name "ManyllaMobile STAGE"
2. For "Run" → Set Build Configuration to "Release-Stage"
3. For "Archive" → Set Build Configuration to "Release-Stage"

### Create "ManyllaMobile BETA" Scheme
1. Repeat above steps with name "ManyllaMobile BETA"
2. For "Run" → Set Build Configuration to "Release-Beta"
3. For "Archive" → Set Build Configuration to "Release-Beta"

### Update "ManyllaMobile" Scheme to PROD
1. Edit the existing "ManyllaMobile" scheme
2. Rename to "ManyllaMobile PROD"
3. For "Run" → Set Build Configuration to "Release"
4. For "Archive" → Set Build Configuration to "Release"

## Step 6: Verify Configuration

1. Select "ManyllaMobile QUAL" scheme
2. Product → Clean Build Folder
3. Product → Build
4. Check build succeeds and console shows correct BUILD_TYPE

5. Repeat for STAGE, BETA, PROD schemes

## Step 7: Verify Bundle IDs

1. Select each scheme and check Product → Build Settings → Product Bundle Identifier:
   - QUAL: should show `com.manylla.qual`
   - STAGE: should show `com.manylla`
   - BETA: should show `com.manylla`
   - PROD: should show `com.manylla`

## Expected Build Commands

After configuration, you should be able to build with:

```bash
cd ios

# QUAL (Debug)
xcodebuild -workspace ManyllaMobile.xcworkspace -scheme "ManyllaMobile QUAL" -configuration Debug

# STAGE (Release)
xcodebuild -workspace ManyllaMobile.xcworkspace -scheme "ManyllaMobile STAGE" -configuration Release-Stage

# BETA (Release)
xcodebuild -workspace ManyllaMobile.xcworkspace -scheme "ManyllaMobile BETA" -configuration Release-Beta

# PROD (Release)
xcodebuild -workspace ManyllaMobile.xcworkspace -scheme "ManyllaMobile PROD" -configuration Release
```

## Troubleshooting

### Issue: "BuildConfigModule not found"
- Verify BuildConfigModule.swift is added to target
- Verify bridging header path is correct
- Clean build folder and rebuild

### Issue: "$(BUILD_TYPE) not resolved"
- Verify xcconfig files are linked to build configurations
- Check that build configuration is selected correctly in scheme

### Issue: "Code signing failed"
- Verify DEVELOPMENT_TEAM = 84W9WSYQQB in xcconfig files
- Check that Apple Developer account is active
- Try switching to "Automatically manage signing"

## Next Steps

After completing these steps:
1. Test all 4 schemes build successfully
2. Verify JavaScript can read BUILD_TYPE from native module
3. Document any issues encountered
