import fs from "fs";
import path from "path";

// Definitively copy the avatar image to a safe ASCII filename
try {
  const mediaPath = "C:\\Users\\claud\\.gemini\\antigravity-ide\\brain\\d9b70cb4-0e20-4f75-91bf-9ffecc217eb5\\media__1779859090069.png";
  const srcPath = path.join(process.cwd(), "public", "images", "Flávio Almeida.png");
  const destPath = path.join(process.cwd(), "public", "images", "flavio-almeida.png");
  
  if (fs.existsSync(mediaPath)) {
    fs.copyFileSync(mediaPath, destPath);
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
} catch (err) {
  // Silent fallback
}

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
