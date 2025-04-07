// build.js - Helper script for building the extension (ES Module version)
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isProd = args.includes('--prod');
const isWatch = args.includes('--watch');
const isZip = args.includes('--zip');

// Determine build mode
const mode = isProd ? 'production' : 'development';
console.log(`🚀 Building extension in ${mode} mode...`);

// Build command
let buildCommand = `vite build --mode ${mode}`;

// Add watch flag if needed
if (isWatch && !isProd) {
  buildCommand += ' --watch';
}

try {
  // Run TypeScript compilation for production builds
  //if (isProd) {
   // console.log('🔍 Running TypeScript type checking...');
   // execSync('tsc -b', { stdio: 'inherit' });
 // }
  
  // Run the build
  console.log(`🛠️ Running build: ${buildCommand}`);
  execSync(buildCommand, { stdio: 'inherit' });
  
  // Build CSS
  console.log('🎨 Building CSS...');
  execSync('node build-css.js', { stdio: 'inherit' });
  
  // Create zip file for production builds if requested
  if (isProd && isZip) {
    console.log('📦 Creating zip file for Chrome Web Store submission...');
    const zipCommand = 'cd dist && zip -r ../jaydai-extension.zip *';
    execSync(zipCommand, { stdio: 'inherit' });
    console.log('📦 Created jaydai-extension.zip');
  }
  
  console.log('✅ Build completed successfully!');
  
  // Display environment info
  const envFile = isProd ? '.env.production' : '.env.development';
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log(`\n📝 Using environment from ${envFile}:`);
    console.log(envContent.trim());
  }
  
  // Display API URL
  const apiUrl = isProd 
    ? 'https://api-prod-sw5cmqbraq-od.a.run.app' 
    : 'http://localhost:8000';
  console.log(`\n🔌 API URL: ${apiUrl}`);
  
  // Display next steps
  console.log('\n📋 Next steps:');
  if (isProd) {
    console.log('1. Open Chrome Extensions page (chrome://extensions/)');
    console.log('2. Enable Developer Mode');
    console.log('3. Load unpacked extension from the "dist" folder');
    if (isZip) {
      console.log('4. Upload jaydai-extension.zip to Chrome Web Store');
    }
  } else {
    console.log('1. Open Chrome Extensions page (chrome://extensions/)');
    console.log('2. Enable Developer Mode');
    console.log('3. Load unpacked extension from the "dist" folder');
    console.log('4. Make sure your localhost:8000 backend is running');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}