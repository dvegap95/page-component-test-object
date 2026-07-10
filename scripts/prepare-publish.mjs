/**
 * Pre-publish checks: scoped packages share release-version.json,
 * publish metadata is stamped, and private is cleared for publish.
 *
 * Config: scripts/publish-config.json (npmScope, repository, license, publishAccess)
 * Run automatically in the publish workflow before `pnpm -r publish`.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readReleaseVersion } from './sync-package-versions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const expectedVersion = readReleaseVersion();
const configPath = join(root, 'scripts', 'publish-config.json');

function readPublishConfig() {
  if (!existsSync(configPath)) {
    throw new Error(`Missing ${configPath} — copy from setup-npm-publish-cicd skill templates.`);
  }
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  if (!config.npmScope?.startsWith('@') || !config.npmScope.endsWith('/')) {
    throw new Error(`${configPath}: npmScope must look like "@org/"`);
  }
  if (!config.repository?.url || !config.repository?.web) {
    throw new Error(`${configPath}: repository.url and repository.web are required`);
  }
  return config;
}

const config = readPublishConfig();
const scopePrefix = config.npmScope;

function packageDirectory(pkgPath) {
  return pkgPath.replace(/\\/g, '/').split('/packages/')[1]?.replace('/package.json', '') ?? '';
}

function ensurePublishMetadata(pkg, pkgPath) {
  pkg.license = config.license ?? 'MIT';
  pkg.repository = {
    type: 'git',
    url: `git+${config.repository.url}`,
    directory: `packages/${packageDirectory(pkgPath)}`,
  };
  pkg.homepage = `${config.repository.web}#readme`;
  pkg.bugs = { url: `${config.repository.web}/issues` };
  pkg.publishConfig = { access: config.publishAccess ?? 'public' };
}

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
  const before = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(before);
  if (!pkg.name?.startsWith(scopePrefix)) continue;

  if (pkg.version !== expectedVersion) {
    throw new Error(`${pkg.name}: version ${pkg.version} !== release ${expectedVersion}`);
  }

  ensurePublishMetadata(pkg, pkgPath);

  const pkgDir = dirname(pkgPath);
  const licenseSrc = join(root, 'LICENSE');
  const licenseDest = join(pkgDir, 'LICENSE');
  if (existsSync(licenseSrc)) {
    writeFileSync(licenseDest, readFileSync(licenseSrc));
  }

  if (pkg.private) {
    delete pkg.private;
    console.log(`  ${pkg.name}: cleared private`);
  }

  const after = `${JSON.stringify(pkg, null, 2)}\n`;
  if (after !== before) {
    writeFileSync(pkgPath, after);
    publishCount += 1;
  }
}

const scopedCount = paths.filter((p) => {
  const pkg = JSON.parse(readFileSync(p, 'utf8'));
  return pkg.name?.startsWith(scopePrefix);
}).length;

console.log(
  `\nReady to publish ${scopedCount} ${scopePrefix}* packages at ${expectedVersion} (${publishCount} updated)`,
);
