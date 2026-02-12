import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(process.cwd(), '..');

console.log('Project root:', projectRoot);

// Delete existing lock files
const lockFiles = ['package-lock.json', 'pnpm-lock.yaml'];
for (const f of lockFiles) {
  const p = resolve(projectRoot, f);
  if (existsSync(p)) {
    unlinkSync(p);
    console.log(`Deleted ${f}`);
  }
}

// Run npm install in the project root to generate a fresh package-lock.json
try {
  console.log('Running npm install --package-lock-only...');
  execSync('npm install --package-lock-only', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' }
  });
  console.log('Successfully generated package-lock.json');
} catch (err) {
  console.error('npm install --package-lock-only failed, trying npm install...');
  try {
    execSync('npm install', {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' }
    });
    console.log('Successfully generated package-lock.json via npm install');
  } catch (err2) {
    console.error('Both approaches failed:', err2.message);
  }
}

// Verify lock file exists
if (existsSync(resolve(projectRoot, 'package-lock.json'))) {
  console.log('package-lock.json exists and is ready');
} else {
  console.error('package-lock.json was NOT created');
}
