#!/usr/bin/env node
/**
 * AquaERP Deploy Packager
 * This script runs the Next.js production build, gathers all files needed
 * for a standalone Phusion Passenger (cPanel) environment, and packages them
 * into a single zip archive.
 * 
 * Usage: node scripts/build-deploy-zip.mjs
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const TEMP_DIR = path.join(root, 'deploy_temp');
const ZIP_FILE = path.join(root, 'deploy.zip');

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true, ...opts });
  if (r.status !== 0) {
    console.error(`Error executing: ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

async function main() {
  console.log('=== AquaERP Deploy Packager ===\n');

  // 1. Clean previous build runs
  console.log('Cleaning old build folders...');
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(ZIP_FILE)) {
    fs.rmSync(ZIP_FILE, { force: true });
  }

  // 2. Build Next.js project
  console.log('Running Next.js production build...');
  run('npm', ['run', 'build']);

  const standalonePath = path.join(root, '.next/standalone');
  if (!fs.existsSync(standalonePath)) {
    console.error('Error: Standalone build directory not found at .next/standalone.');
    console.error('Make sure "output: \'standalone\'" is configured in next.config.mjs');
    process.exit(1);
  }

  try {
    // 3. Assemble deployment directory
    console.log('\nAssembling deployment folder...');
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    // Copy standalone server and minimal node_modules
    console.log('Copying Next.js standalone runtime...');
    fs.cpSync(standalonePath, TEMP_DIR, { recursive: true });

    // Copy public assets
    const publicSrc = path.join(root, 'public');
    if (fs.existsSync(publicSrc)) {
      console.log('Copying public assets...');
      fs.cpSync(publicSrc, path.join(TEMP_DIR, 'public'), { recursive: true });
    }

    // Copy compiled static files
    const staticSrc = path.join(root, '.next/static');
    if (fs.existsSync(staticSrc)) {
      console.log('Copying static build bundles...');
      const destStatic = path.join(TEMP_DIR, '.next/static');
      fs.mkdirSync(path.dirname(destStatic), { recursive: true });
      fs.cpSync(staticSrc, destStatic, { recursive: true });
    }

    // Copy database schemas and migrations (critical for first setup and upgrade)
    const dbSrc = path.join(root, 'database');
    if (fs.existsSync(dbSrc)) {
      console.log('Copying database schemas...');
      fs.cpSync(dbSrc, path.join(TEMP_DIR, 'database'), { recursive: true });
    }

    // Copy utility scripts (like migration runner)
    const scriptsSrc = path.join(root, 'scripts');
    if (fs.existsSync(scriptsSrc)) {
      console.log('Copying setup/migration scripts...');
      fs.cpSync(scriptsSrc, path.join(TEMP_DIR, 'scripts'), { recursive: true });
    }

    // Copy configuration templates and startup wrapper
    console.log('Copying environment template and startup wrapper...');
    fs.copyFileSync(path.join(root, '.env.example'), path.join(TEMP_DIR, '.env.example'));
    fs.copyFileSync(path.join(root, 'app.js'), path.join(TEMP_DIR, 'app.js'));

    // Copy deployment documentation as root README
    const cpanelDoc = path.join(root, 'docs/CPANEL_DEPLOYMENT.md');
    if (fs.existsSync(cpanelDoc)) {
      fs.copyFileSync(cpanelDoc, path.join(TEMP_DIR, 'README.md'));
    }

    // 4. Compress the deployment folder
    console.log('\nCreating deployment ZIP archive...');
    
    const hasZip = spawnSync('which', ['zip'], { shell: true }).status === 0;
    const hasPython3 = spawnSync('which', ['python3'], { shell: true }).status === 0;
    const hasPython = spawnSync('which', ['python'], { shell: true }).status === 0;

    if (hasZip) {
      console.log('Using "zip" command utility...');
      run('zip', ['-r', '../deploy.zip', '.'], { cwd: TEMP_DIR });
    } else if (hasPython3) {
      console.log('Using "python3" to create ZIP archive...');
      const zipBase = path.join(root, 'deploy');
      run('python3', ['-c', `import shutil; shutil.make_archive('${zipBase}', 'zip', '${TEMP_DIR}')`], { shell: false });
    } else if (hasPython) {
      console.log('Using "python" to create ZIP archive...');
      const zipBase = path.join(root, 'deploy');
      run('python', ['-c', `import shutil; shutil.make_archive('${zipBase}', 'zip', '${TEMP_DIR}')`], { shell: false });
    } else {
      throw new Error('Neither "zip" nor "python/python3" utilities are installed on the system.');
    }
  } finally {
    // 5. Clean up temporary directory
    console.log('\nCleaning up temporary files...');
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }

  console.log('\n======================================');
  console.log('SUCCESS: deploy.zip is ready at project root!');
  console.log('Size of deploy.zip:', (fs.statSync(ZIP_FILE).size / (1024 * 1024)).toFixed(2), 'MB');
  console.log('======================================');
}

main().catch((err) => {
  console.error('Unexpected build failure:', err);
  process.exit(1);
});
