import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(process.cwd());
const lockFile = resolve(projectRoot, 'package-lock.json');
const pnpmLock = resolve(projectRoot, 'pnpm-lock.yaml');

// Remove stale lock files
if (existsSync(lockFile)) {
  console.log('Removing stale package-lock.json...');
  unlinkSync(lockFile);
}
if (existsSync(pnpmLock)) {
  console.log('Removing pnpm-lock.yaml...');
  unlinkSync(pnpmLock);
}

// Run npm install to generate a fresh lock file
console.log('Running npm install to generate fresh package-lock.json...');
try {
  execSync('npm install --package-lock-only', {
    cwd: projectRoot,
    stdio: 'inherit',
    timeout: 120000,
  });
  console.log('Successfully generated new package-lock.json');
} catch (err) {
  console.error('npm install --package-lock-only failed, trying npm install...');
  try {
    execSync('npm install', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log('Successfully generated new package-lock.json via npm install');
  } catch (err2) {
    console.error('Failed to generate package-lock.json:', err2.message);
    process.exit(1);
  }
}
