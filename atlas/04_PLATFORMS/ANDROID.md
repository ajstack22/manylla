# Android Platform Guide

## 1. Build & Configuration

This section covers the non-negotiable settings for the Android build environment.

### Gradle Configuration (`build.gradle`)

-   **`compileSdkVersion`**: Must be set to the latest stable API level (e.g., 35).
-   **`minSdkVersion`**: Defines the minimum Android version supported (e.g., 24 for Android 7.0).
-   **`targetSdkVersion`**: Must target the latest stable API level.
-   **`applicationId`**: The unique package name for the app (e.g., `com.company.appname`).
-   **`versionCode` / `versionName`**: Managed according to the project's release strategy.
-   **`hermesEnabled`**: Should be `true` for performance.

### ProGuard (`proguard-rules.pro`)

Release builds must have `minifyEnabled true`. The ProGuard rules should be configured to keep necessary classes for React Native, Hermes, and any other native modules.

### Java Version

The project must enforce a specific, consistent Java version (e.g., Java 17) across all development and build environments to prevent compatibility issues.

## 2. UI & UX Patterns

-   **Material Design**: Android UI should respect Material Design principles. Use `elevation` for shadows, not `shadow*` properties from iOS.
-   **Ripple Effect**: Use `TouchableNativeFeedback` to provide the native ripple effect on touchable elements.
-   **Keyboard Handling**: The `AndroidManifest.xml` should typically use `android:windowSoftInputMode="adjustResize"` to ensure the screen resizes when the keyboard appears.
-   **Toasts**: Use `ToastAndroid` for short, non-blocking feedback.

## 3. Performance

-   **Cold Start**: Target a cold start time of < 1000ms on a mid-range device.
-   **Memory**: Monitor native heap usage. Aim for < 100-150MB for a typical session.
-   **UI Rendering**: Use the `gfxinfo` tool to ensure frame render times are consistently below 16ms to avoid jank.
-   **Bundle Size**: Use APK splits (`abiFilters`) to create smaller, architecture-specific APKs. Analyze the bundle with tools to find and remove unnecessary dependencies.

## 4. Critical Fixes & Gotchas

This section is a living document of hard-won lessons.

-   **Image Display**: Images in React Native on Android often require explicit `width` and `height` styles to display correctly, unlike on other platforms.
-   **`flexWrap` Rendering**: When using `flexWrap`, child elements may need percentage-based widths to wrap correctly, especially on older Android versions.
-   **Font Weight**: Custom fonts on Android often require using font variants (e.g., `FontFamily-Bold`) rather than the `fontWeight` style property.

## 5. Testing & Debugging

### ADB Command Cheatsheet

-   `adb logcat`: The primary tool for viewing application and system logs.
-   `adb shell dumpsys meminfo <package>`: Check memory usage.
-   `adb shell pm clear <package>`: Clear all application data for a fresh start.
-   `adb install -r <apk_path>`: Install an APK.

### Required Test Devices

A matrix of required physical and emulated devices should be maintained, covering a range of screen sizes, manufacturers (e.g., Google Pixel, Samsung), and Android versions.
