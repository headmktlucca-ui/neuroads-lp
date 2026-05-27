const fs = require('fs');
const path = require('path');

const mediaPath = "C:\\Users\\claud\\.gemini\\antigravity-ide\\brain\\d9b70cb4-0e20-4f75-91bf-9ffecc217eb5\\media__1779859090069.png";
const srcPath = path.join(__dirname, 'public', 'images', 'Flávio Almeida.png');
const destPath = path.join(__dirname, 'public', 'images', 'flavio-almeida.png');

console.log('--- NeuroAds Avatar Copy Tool ---');
console.log('Source media path:', mediaPath);
console.log('Fallback source path:', srcPath);
console.log('Destination path:', destPath);

try {
  if (fs.existsSync(mediaPath)) {
    fs.copyFileSync(mediaPath, destPath);
    console.log('✅ SUCCESS: Copied high-res avatar from brain attachment to flavio-almeida.png!');
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('✅ SUCCESS: Copied existing Flávio Almeida avatar to flavio-almeida.png!');
  } else {
    console.error('❌ ERROR: Neither the brain source nor public fallback image could be found.');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ ERROR: Failed to copy file:', err);
  process.exit(1);
}
