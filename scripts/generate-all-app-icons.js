#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG content for the Manylla icon
const svgContent = `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="squircle-clip">
      <rect x="0" y="0" width="180" height="180" rx="40" ry="40"/>
    </clipPath>
  </defs>
  <g clip-path="url(#squircle-clip)">
    <rect width="180" height="75" fill="#C4A66B"/>
    <rect y="75" width="180" height="105" fill="#D4B896"/>
    <path d="M90 50 L115 75 L90 100 L65 75 Z" fill="#C73E3E"/>
  </g>
</svg>`;

// Icon sizes needed for different platforms
const iconSizes = {
  // iOS App Icon sizes (all required by Xcode)
  ios: [
    // iPhone Notification
    { size: 40, name: 'Icon-40.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },
    { size: 60, name: 'Icon-60.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },

    // iPhone Settings
    { size: 58, name: 'Icon-58.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },
    { size: 87, name: 'Icon-87.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },

    // iPhone Spotlight
    { size: 80, name: 'Icon-80.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },
    { size: 120, name: 'Icon-120.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },

    // iPhone App
    { size: 120, name: 'Icon-120-1.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },
    { size: 180, name: 'Icon-180.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },

    // App Store
    { size: 1024, name: 'Icon-1024.png', path: 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset' },
  ],

  // Android icons
  android: [
    { size: 48, name: 'ic_launcher.png', path: 'android/app/src/main/res/mipmap-mdpi' },
    { size: 72, name: 'ic_launcher.png', path: 'android/app/src/main/res/mipmap-hdpi' },
    { size: 96, name: 'ic_launcher.png', path: 'android/app/src/main/res/mipmap-xhdpi' },
    { size: 144, name: 'ic_launcher.png', path: 'android/app/src/main/res/mipmap-xxhdpi' },
    { size: 192, name: 'ic_launcher.png', path: 'android/app/src/main/res/mipmap-xxxhdpi' },
    // Round versions for Android
    { size: 48, name: 'ic_launcher_round.png', path: 'android/app/src/main/res/mipmap-mdpi' },
    { size: 72, name: 'ic_launcher_round.png', path: 'android/app/src/main/res/mipmap-hdpi' },
    { size: 96, name: 'ic_launcher_round.png', path: 'android/app/src/main/res/mipmap-xhdpi' },
    { size: 144, name: 'ic_launcher_round.png', path: 'android/app/src/main/res/mipmap-xxhdpi' },
    { size: 192, name: 'ic_launcher_round.png', path: 'android/app/src/main/res/mipmap-xxxhdpi' },
  ],

  // Web favicons
  web: [
    { size: 16, name: 'favicon-16.png', path: 'public' },
    { size: 32, name: 'favicon-32.png', path: 'public' },
    { size: 192, name: 'icon-192.png', path: 'public' },
    { size: 512, name: 'icon-512.png', path: 'public' },
  ]
};

async function generateIcons() {
  const svgBuffer = Buffer.from(svgContent);

  // Generate all icon sizes
  for (const platform of Object.keys(iconSizes)) {
    console.log(`\nGenerating ${platform} icons...`);

    for (const icon of iconSizes[platform]) {
      const outputPath = path.join(__dirname, '..', icon.path, icon.name);

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      try {
        await sharp(svgBuffer)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);

        console.log(`✓ Generated ${icon.size}x${icon.size} -> ${icon.name}`);
      } catch (error) {
        console.log(`✗ Failed to generate ${outputPath}: ${error.message}`);
      }
    }
  }

  // Update iOS Contents.json to reference the new icons
  const iosContentsPath = path.join(__dirname, '..', 'ios/ManyllaMobile/Images.xcassets/AppIcon.appiconset/Contents.json');
  const iosContents = {
    "images": [
      {
        "filename": "Icon-40.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "Icon-60.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "20x20"
      },
      {
        "filename": "Icon-58.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "Icon-87.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "29x29"
      },
      {
        "filename": "Icon-80.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "Icon-120.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "40x40"
      },
      {
        "filename": "Icon-120-1.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "60x60"
      },
      {
        "filename": "Icon-180.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "60x60"
      },
      {
        "filename": "Icon-1024.png",
        "idiom": "ios-marketing",
        "scale": "1x",
        "size": "1024x1024"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };

  fs.writeFileSync(iosContentsPath, JSON.stringify(iosContents, null, 2));
  console.log('\n✓ Updated iOS Contents.json');

  console.log('\n✅ Icon generation complete!');
  console.log('\nNote: You may need to:');
  console.log('1. Clean build folders (Xcode: Product > Clean Build Folder)');
  console.log('2. Restart Metro bundler');
  console.log('3. Rebuild the app');
}

generateIcons().catch(console.error);