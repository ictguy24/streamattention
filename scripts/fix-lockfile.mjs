import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(import.meta.dirname, '..');

// Remove stale lock files
const lockFile = resolve(projectRoot, 'package-lock.json');
const pnpmLock = resolve(projectRoot, 'pnpm-lock.yaml');

if (existsSync(lockFile)) {
  console.log('Removing stale package-lock.json...');
  unlinkSync(lockFile);
}

if (existsSync(pnpmLock)) {
  console.log('Removing stale pnpm-lock.yaml...');
  unlinkSync(pnpmLock);
}

// Run npm install to generate a fresh lock file
console.log('Running npm install to generate fresh package-lock.json...');
try {
  execSync('npm install --package-lock-only', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' }
  });
  console.log('Successfully generated fresh package-lock.json!');
} catch (err) {
  console.error('npm install --package-lock-only failed, trying npm install...');
  execSync('npm install', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' }
  });
  console.log('Successfully installed dependencies and generated package-lock.json!');
}
