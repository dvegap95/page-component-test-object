/**
 * Point @pco/* file: deps in a consumer package.json at the latest pack tarballs.
 * Usage: node scripts/apply-pack-manifest.mjs <target-package.json> [manifest.json]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetPath = resolve(process.argv[2] ?? '');
const manifestPath = resolve(process.argv[3] ?? join(root, 'dist', 'packs', 'manifest.json'));

if (!targetPath) {
  console.error('Usage: node scripts/apply-pack-manifest.mjs <package.json> [manifest.json]');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pkg = JSON.parse(readFileSync(targetPath, 'utf8'));
const packsDir = dirname(manifestPath);
const targetDir = dirname(targetPath);

const tarballByName = Object.fromEntries(manifest.packages.map((p) => [p.name, p]));

for (const section of ['dependencies', 'devDependencies']) {
  const deps = pkg[section];
  if (!deps) continue;
  for (const name of Object.keys(deps)) {
    if (!name.startsWith('@pco/')) continue;
    const entry = tarballByName[name];
    if (!entry) continue;
    const tarballPath = join(packsDir, entry.tarball);
    const rel = relative(targetDir, tarballPath).replace(/\\/g, '/');
    deps[name] = `file:${rel}`;
  }
}

writeFileSync(targetPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Updated ${targetPath} → pack ${manifest.version}`);
