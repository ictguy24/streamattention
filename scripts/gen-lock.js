import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const projectRoot = '/vercel/share/v0-project';

// Create a temp directory
const tempDir = mkdtempSync(join(tmpdir(), 'lock-gen-'));
console.log('Temp dir:', tempDir);

// Copy package.json to temp dir
cpSync(join(projectRoot, 'package.json'), join(tempDir, 'package.json'));

// Run npm install --package-lock-only in temp dir 
try {
  execSync('npm install --package-lock-only --ignore-scripts', {
    cwd: tempDir,
    stdio: 'inherit',
    timeout: 120000,
  });
  
  // Copy the generated lock file back
  const lockContent = readFileSync(join(tempDir, 'package-lock.json'), 'utf-8');
  writeFileSync(join(projectRoot, 'package-lock.json'), lockContent);
  console.log('Successfully wrote package-lock.json to project root!');
  console.log('Lock file size:', lockContent.length, 'bytes');
} catch (err) {
  console.error('Failed:', err.message);
  
  // Fallback: try full npm install  
  try {
    console.log('Trying full npm install...');
    execSync('npm install --ignore-scripts', {
      cwd: tempDir,
      stdio: 'inherit',
      timeout: 180000,
    });
    const lockContent = readFileSync(join(tempDir, 'package-lock.json'), 'utf-8');
    writeFileSync(join(projectRoot, 'package-lock.json'), lockContent);
    console.log('Successfully wrote package-lock.json via full install!');
  } catch (err2) {
    console.error('Full install also failed:', err2.message);
  }
}
