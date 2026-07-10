/**
 * Sync all @page-component-object/* package.json versions from scripts/release-version.json.
 *
 * Usage: pnpm version:sync
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptsDir, '..');
const versionFile = join(scriptsDir, 'release-version.json');

export function readReleaseVersion() {
  if (!existsSync(versionFile)) {
    throw new Error(`Missing ${versionFile}`);
  }
  const { version } = JSON.parse(readFileSync(versionFile, 'utf8'));
  if (!version || typeof version !== 'string') {
    throw new Error(`${versionFile} must contain a "version" string`);
  }
  return version;
}

function collectPackageJsonPaths(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist') continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      collectPackageJsonPaths(full, results);
    } else if (entry === 'package.json') {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const version = readReleaseVersion();
  const paths = collectPackageJsonPaths(join(root, 'packages'));
  let count = 0;
  for (const pkgPath of paths) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!pkg.name?.startsWith('@page-component-object/')) continue;
    if (pkg.version === version) continue;
    pkg.version = version;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`  ${pkg.name} -> ${version}`);
    count += 1;
  }
  console.log(`Release version: ${version} (${count} updated)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
