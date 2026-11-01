/*
 * Favicon Generator Script
 * Generates all modern favicon formats from ic_logo.svg
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_SOURCE = 'c:/Users/venko/Downloads/cg/ic_logo.svg';
const PUBLIC_DIR = path.resolve('public');
const ROOT_DIR = path.resolve('.');

if (!fs.existsSync(SVG_SOURCE)) {
  console.error(`SVG source not found at ${SVG_SOURCE}`);
  process.exit(1);
}

const svgBuffer = fs.readFileSync(SVG_SOURCE);

async function generate() {
  console.log('Generating favicon formats...');

  // 1. Copy SVG to public and root
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.svg'), svgBuffer);
  fs.writeFileSync(path.join(ROOT_DIR, 'favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(ROOT_DIR, 'logo.svg'), svgBuffer);

  // 2. Generate PNG formats with sharp
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(PUBLIC_DIR, name), pngBuffer);
    fs.writeFileSync(path.join(ROOT_DIR, name), pngBuffer);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // 3. Generate 32x32 favicon.ico (PNG-encoded ICO format accepted by modern browsers)
  const icoBuffer = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(ROOT_DIR, 'favicon.ico'), icoBuffer);

  // 4. Create site.webmanifest
  const manifest = {
    name: "Classic Generator Web Lite",
    short_name: "ClassicGen",
    icons: [
      {
        src: "./android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "./android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#1e2023",
    background_color: "#141517",
    display: "standalone"
  };

  const manifestStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), manifestStr);
  fs.writeFileSync(path.join(ROOT_DIR, 'site.webmanifest'), manifestStr);

  console.log('Favicon generation completed successfully.');
}

generate().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
