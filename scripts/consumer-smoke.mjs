/**
 * Smoke-test tarball install in fixtures/rr7-consumer (outside pnpm workspace).
 */
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = join(root, 'fixtures', 'rr7-consumer');
const fixturePkg = join(fixtureDir, 'package.json');
const manifestPath = join(root, 'dist', 'packs', 'manifest.json');

console.log('Packing @pco/* tarballs…');
execSync('pnpm run pack:dist', { cwd: root, stdio: 'inherit' });

console.log('Syncing fixture package.json from manifest…');
execSync(`node scripts/apply-pack-manifest.mjs "${fixturePkg}" "${manifestPath}"`, {
  cwd: root,
  stdio: 'inherit',
});

for (const artifact of ['node_modules', 'package-lock.json']) {
  const path = join(fixtureDir, artifact);
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
}

console.log('Installing fixture deps from dist/packs/…');
execSync('npm install', { cwd: fixtureDir, stdio: 'inherit' });

console.log('Running Vitest in fixture (RR v7)…');
execSync('npm test', { cwd: fixtureDir, stdio: 'inherit' });

console.log('Consumer smoke test passed.');
