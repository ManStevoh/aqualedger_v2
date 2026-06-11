/**
 * cPanel / Phusion Passenger entry point wrapper.
 * This bridges Passenger (which expects app.js or index.js at the root)
 * with the Next.js standalone production server.
 */

// Load environment variables manually from .env file in production if available
// This avoids relying on the 'dotenv' npm package, which is not bundled in Next.js standalone node_modules.
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const parsedEnv = {};
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.substring(0, index).trim();
      let val = trimmed.substring(index + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      // Process escaped characters inside quotes if any (like \$ or \!)
      val = val.replace(/\\(.)/g, '$1');
      parsedEnv[key] = val;
    });

    // Apply variables to process.env (later lines in the file overwrite earlier ones)
    Object.keys(parsedEnv).forEach((key) => {
      process.env[key] = parsedEnv[key];
    });

    console.log('Environment variables loaded successfully from .env file. Keys:', Object.keys(parsedEnv));
  } else {
    console.warn('.env file not found at app root.');
  }
} catch (e) {
  console.error('Failed to load environment variables from .env file:', e);
}

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

console.log('Starting Next.js standalone server via app.js wrapper...');
require('./server.js');
