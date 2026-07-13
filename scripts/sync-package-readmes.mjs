/**
 * Write README.md (and ensure package.json files/description/keywords) for publishable packages.
 *
 * Usage: node scripts/sync-package-readmes.mjs
 * Run before publish; also safe to run after editing scripts/package-readmes.json.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metaPath = join(root, 'scripts', 'package-readmes.json');
const repoWeb = 'https://github.com/dvegap95/page-component-test-object';
const mainReadme = `${repoWeb}#readme`;

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

function readmeBody(name, { summary }) {
  const short = name.replace('@page-component-object/', '');
  return [
    `# ${name}`,
    '',
    `> **Start here:** [Page Component Object (PCO) — main README](${mainReadme})`,
    '',
    summary,
    '',
    '## Install',
    '',
    '```bash',
    `pnpm add ${name}`,
    '```',
    '',
    '## Documentation',
    '',
    'All guides live in the monorepo — this page is a package entry point on npm.',
    '',
    `- [**Main README** — overview, quick example, package list](${mainReadme})`,
    `- [Install](${repoWeb}/blob/master/docs/install.md)`,
    `- [Getting started](${repoWeb}/blob/master/docs/getting-started.md)`,
    `- [Project structure (\`__pco__\`)](${repoWeb}/blob/master/docs/project-structure.md)`,
    `- [Philosophy (query → primitive → intent)](${repoWeb}/blob/master/docs/philosophy.md)`,
    '',
    '## Package',
    '',
    `\`${short}\` in the [page-component-test-object](${repoWeb}) monorepo.`,
    '',
  ].join('\n');
}

function mergeKeywords(shared = [], extra = []) {
  return [...new Set([...shared, ...extra])].sort();
}

if (!existsSync(metaPath)) {
  throw new Error(`Missing ${metaPath}`);
}

const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
const sharedKeywords = meta._shared?.keywords ?? [];
delete meta._shared;

const paths = collectPackageJsonPaths(join(root, 'packages'));
let count = 0;

for (const pkgPath of paths) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const entry = meta[pkg.name];
  if (!entry) continue;

  const pkgDir = dirname(pkgPath);
  if (!entry.preserveReadme) {
    writeFileSync(join(pkgDir, 'README.md'), readmeBody(pkg.name, entry));
  }

  pkg.description = entry.description;
  pkg.keywords = mergeKeywords(sharedKeywords, entry.keywords ?? []);
  const files = new Set(pkg.files ?? ['dist']);
  files.add('README.md');
  files.add('LICENSE');
  pkg.files = [...files];
  pkg.private = true;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  count += 1;
  console.log(`  ${pkg.name}: README.md + ${pkg.keywords.length} keywords`);
}

console.log(`\nSynced ${count} package READMEs`);
