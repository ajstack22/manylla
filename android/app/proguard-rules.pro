# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native ProGuard Rules

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep our application class
-keep class com.manyllamobile.** { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# WebView
-keep class com.reactnativecommunity.webview.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Image Picker
-keep class com.imagepicker.** { *; }

# DateTimePicker
-keep class com.reactcommunity.rndatetimepicker.** { *; }

# SVG
-keep class com.horcrux.svg.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep custom components
-keep public class * extends com.facebook.react.ReactPackage
-keep public class * extends com.facebook.react.bridge.NativeModule
-keep public class * extends com.facebook.react.bridge.JavaScriptModule
-keep public class * extends com.facebook.react.uimanager.ViewManager

# Suppress warnings
-dontwarn com.facebook.react.**
-dontwarn com.swmansion.**
-dontwarn com.google.android.gms.**
