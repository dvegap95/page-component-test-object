/**
 * Pre-publish checks: all @pco/* packages share release-version.json,
 * and private is cleared for packages that will be published.
 *
 * Run automatically in the publish workflow before `pnpm -r publish`.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readReleaseVersion } from './sync-package-versions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const expectedVersion = readReleaseVersion();

function collectPackageJsonPaths(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist') continue;
    const st = statSync(full);
    if (st.isDirectory()) collectPackageJsonPaths(full, results);
    else if (entry === 'package.json') results.push(full);
  }
  return results;
}

const paths = collectPackageJsonPaths(join(root, 'packages'));
let publishCount = 0;

for (const pkgPath of paths) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (!pkg.name?.startsWith('@pco/')) continue;

  if (pkg.version !== expectedVersion) {
    throw new Error(`${pkg.name}: version ${pkg.version} !== release ${expectedVersion}`);
  }

  if (pkg.private) {
    pkg.private = false;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    publishCount += 1;
    console.log(`  ${pkg.name}: private → false`);
  }
}

console.log(`\nReady to publish ${paths.length} @pco/* packages at ${expectedVersion}`);
