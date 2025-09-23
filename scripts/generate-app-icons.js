#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  // Web favicons
  web: [
    { size: 16, name: 'favicon-16.png', path: 'public' },
    { size: 32, name: 'favicon-32.png', path: 'public' },
    { size: 192, name: 'icon-192.png', path: 'public' },
    { size: 512, name: 'icon-512.png', path: 'public' },
  ],
  // iOS icons (for React Native)
  ios: [
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
  ]
};

async function generateIcons() {
  try {
    // Try to use sharp if available
    let sharp;
    try {
      sharp = require('sharp');
      console.log('Using sharp for icon generation...');
    } catch (e) {
      console.log('Sharp not available. Trying alternative method...');
      // Use puppeteer as fallback
      const puppeteer = require('puppeteer');
      return generateIconsWithPuppeteer();
    }

    const svgBuffer = Buffer.from(svgContent);

    // Generate all icon sizes
    for (const platform of Object.keys(iconSizes)) {
      console.log(`\nGenerating ${platform} icons...`);

      for (const icon of iconSizes[platform]) {
        const outputPath = path.join(__dirname, '..', icon.path, icon.name);

        try {
          await sharp(svgBuffer)
            .resize(icon.size, icon.size)
            .png()
            .toFile(outputPath);

          console.log(`✓ Generated ${icon.size}x${icon.size} -> ${outputPath}`);
        } catch (error) {
          console.log(`✗ Failed to generate ${outputPath}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\nFalling back to manual instructions...');
    printManualInstructions();
  }
}

async function generateIconsWithPuppeteer() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const platform of Object.keys(iconSizes)) {
    console.log(`\nGenerating ${platform} icons with Puppeteer...`);

    for (const icon of iconSizes[platform]) {
      const outputPath = path.join(__dirname, '..', icon.path, icon.name);

      // Create an HTML page with the SVG
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            svg { width: ${icon.size}px; height: ${icon.size}px; }
          </style>
        </head>
        <body>
          ${svgContent.replace('viewBox="0 0 180 180"', `viewBox="0 0 180 180" width="${icon.size}" height="${icon.size}"`)}
        </body>
        </html>
      `;

      await page.setContent(html);
      await page.setViewport({ width: icon.size, height: icon.size });
      await page.screenshot({ path: outputPath, omitBackground: true });

      console.log(`✓ Generated ${icon.size}x${icon.size} -> ${outputPath}`);
    }
  }

  await browser.close();
  console.log('\n✅ Icon generation complete with Puppeteer!');
}

function printManualInstructions() {
  console.log(`
📝 Manual Icon Generation Instructions:
========================================

The new Manylla icon SVG has been saved to:
  public/favicon.svg

To generate PNG icons manually, you'll need to:

1. Install ImageMagick:
   brew install imagemagick

2. Or install sharp:
   npm install sharp --save-dev

3. Then run this script again:
   node scripts/generate-app-icons.js

Alternatively, you can use online tools:
- https://realfavicongenerator.net/ (for web favicons)
- https://appicon.co/ (for iOS/Android app icons)

Upload the SVG file from public/favicon.svg
`);
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  generateIcons();
} catch (e) {
  console.log('Sharp not installed. Installing it now...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    console.log('Sharp installed successfully. Generating icons...');
    generateIcons();
  } catch (installError) {
    console.log('Failed to install sharp automatically.');
    printManualInstructions();
  }
}