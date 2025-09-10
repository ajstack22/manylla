#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Manylla theme colors
const primaryColor = '#8B7355'; // Manila brown
const textColor = '#FFFFFF'; // White text

function generateFavicon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Enable antialiasing
  ctx.antialias = 'subpixel';
  
  // Draw background circle
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw the letter 'm'
  ctx.fillStyle = textColor;
  const fontSize = Math.floor(size * 0.55);
  ctx.font = `600 ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text with slight vertical adjustment
  const yOffset = size * 0.02;
  ctx.fillText('m', size/2, size/2 + yOffset);
  
  return canvas.toBuffer('image/png');
}

// Generate all sizes
const sizes = [
  { size: 16, name: 'favicon-16.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 192, name: 'logo192.png' },
  { size: 512, name: 'logo512.png' }
];

const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(({ size, name }) => {
  const buffer = generateFavicon(size);
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${name} (${size}x${size})`);
});

console.log('All favicons generated successfully!');