# iOS Platform Guide

## 1. Build & Configuration

This section covers the essential settings for the iOS build environment using Xcode and CocoaPods.

### CocoaPods (`Podfile`)

-   **`platform :ios`**: Defines the minimum iOS version supported (e.g., '14.0').
-   **New Architecture**: The `Podfile` should be configured to enable the React Native New Architecture (Fabric and TurboModules) for better performance and future compatibility (`:fabric_enabled => true`).
-   **`use_react_native!`**: Manages the core React Native dependencies.
-   **Flipper**: Flipper should be disabled for release/production builds to avoid unnecessary overhead.

### Xcode Project Settings

-   **Bundle Identifier**: The unique app identifier (e.g., `com.company.appname`).
-   **Deployment Target**: Must match the version specified in the `Podfile`.
-   **`Info.plist`**: This file is critical and must contain descriptions for all privacy-related permissions (e.g., `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).

## 2. UI & UX Patterns

-   **Human Interface Guidelines (HIG)**: iOS UI should adhere to Apple's HIG. This includes using native-style navigation, respecting the Safe Area, and using appropriate gestures.
-   **Safe Area**: Always wrap screens in a `SafeAreaView` or use the `useSafeAreaInsets` hook to prevent content from being obscured by the notch, status bar, or home indicator.
-   **Haptic Feedback**: Use the `HapticFeedback` module to provide tactile feedback for user actions like selections or confirmations.
-   **Keyboard Handling**: Use `KeyboardAvoidingView` with `behavior="padding"` to ensure that text inputs are not hidden by the keyboard.

## 3. Performance

-   **Cold Start**: Target a cold start time of < 800ms on a recent iPhone model.
-   **Memory**: Monitor memory usage with Xcode's tools. The app should gracefully handle memory warnings (`applicationDidReceiveMemoryWarning`).
-   **UI Rendering**: Profile the app with Instruments to ensure smooth animations and a consistent 60 FPS.
-   **Launch Screen**: The `LaunchScreen.storyboard` should be simple and static to provide a fast, responsive launch experience.

## 4. Critical Fixes & Gotchas

This section is a living document of hard-won lessons.

-   **Photo URIs**: When displaying photos from the device library, the URI string may need to be prefixed with `file://` to work correctly in an `<Image>` component.
-   **Gesture Conflicts**: Be mindful of gesture conflicts between React Native components (like `ScrollView`) and native iOS gestures (like the swipe-to-go-back gesture).
-   **`Podfile.lock`**: Always commit `Podfile.lock` to version control to ensure all developers and build servers are using the exact same dependency versions.

## 5. App Store Submission

### Submission Checklist

-   **App Icons**: All required app icon sizes must be provided in an `AppIcon.appiconset`.
-   **Screenshots**: High-resolution screenshots for all required device sizes must be prepared.
-   **Privacy Policy**: A URL to a privacy policy is required.
-   **Versioning**: The app's version and build number must be incremented in Xcode.
-   **Archiving**: The app must be archived in Xcode using the "Generic iOS Device" target and uploaded to App Store Connect.

### TestFlight

Always deploy a build to internal and external testers via TestFlight for a final round of real-world testing before submitting for App Store review.
