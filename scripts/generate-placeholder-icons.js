const fs = require('fs');
const path = require('path');

// Updated list of icon files based on our cleaned up stock sites
const iconFiles = [
  'shutterstock.png',
  'adobestock.png',
  'gettyimages.png',
  'istockphoto.png',
  'depositphotos.png',
  'dreamstime.png',
  '123rf.png',
  'alamy.png',
  'rawpixel.png',
  'unsplash.png',
  'pexels.png',
  'pixabay.png',
  'freepik.png',
  'flaticon.png',
  'vecteezy.png',
  'iconscout.png',
  'storyblocks.png',
  'motionarray.png',
  'videoblocks.png',
  'pond5.png',
  'epidemicsound.png',
  'soundstripe.png',
  'artlist_sound.png',
  'envato.png',
  'creativefabrica.png',
  'craftwork.png',
  'ui8.png',
  'pixeden.png',
  'pixelbuddha.png',
  'pixelsquid.png',
  'footagecrate.png',
  'yellowimages.png'
];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Clean up old icons first
const existingIcons = fs.readdirSync(iconsDir);
existingIcons.forEach(icon => {
  if (icon.endsWith('.svg')) {
    fs.unlinkSync(path.join(iconsDir, icon));
  }
});

// Create a 2025 trendy SVG placeholder for each icon
iconFiles.forEach(iconFile => {
  const siteName = iconFile.replace('.png', '');
  const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient-${siteName}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#gradient-${siteName})"/>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${siteName.substring(0, 3).toUpperCase()}</text>
  </svg>`;
  
  // Save as SVG for now (we'll convert to PNG later if needed)
  const svgPath = path.join(iconsDir, iconFile.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  
  console.log(`Created placeholder icon: ${iconFile.replace('.png', '.svg')}`);
});

console.log(`\n✅ Created ${iconFiles.length} placeholder icons in ${iconsDir}`);
console.log('Note: These are 2025 trendy SVG placeholders with gradients. You can replace them with actual PNG icons from the API source.');