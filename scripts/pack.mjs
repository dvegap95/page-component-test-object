/**
 * Build all @page-component-object/* packages and emit versioned tarballs under dist/packs/.
 *
 * Each run bumps scripts/pack-version.json to {release}-dev.N (release from scripts/release-version.json) so consumers get
 * new filenames and Yarn lockfile checksums stay valid after a repack.
 *
 * See dist/packs/manifest.json for the tarball list to wire in consumer package.json.
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { bumpPackVersion } from './pack-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packsDir = join(root, 'dist', 'packs');

/** @type {{ dir: string; tarball: string }[]} */
const PACKAGES = [
  { dir: 'packages/core', tarball: 'pco-core' },
  { dir: 'packages/queries', tarball: 'pco-queries' },
  { dir: 'packages/msw', tarball: 'pco-msw' },
  { dir: 'packages/router-react', tarball: 'pco-router-react' },
  { dir: 'packages/react', tarball: 'pco-react' },
  { dir: 'packages/adapters/vitest', tarball: 'pco-adapter-vitest' },
  { dir: 'packages/adapters/storybook', tarball: 'pco-adapter-storybook' },
  { dir: 'packages/adapters/cypress', tarball: 'pco-adapter-cypress' },
];

function rewriteWorkspaceDeps(pkgJson, packVersion) {
  const rewriteRecord = (record) => {
    if (!record) return record;
    const next = { ...record };
    for (const [name, version] of Object.entries(next)) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        next[name] = packVersion;
      }
    }
    return next;
  };

  return {
    ...pkgJson,
    version: packVersion,
    private: false,
    dependencies: rewriteRecord(pkgJson.dependencies),
    peerDependencies: rewriteRecord(pkgJson.peerDependencies),
    optionalDependencies: rewriteRecord(pkgJson.optionalDependencies),
  };
}

function packOne({ dir, tarball }, packVersion) {
  const packageDir = join(root, dir);
  const pkgPath = join(packageDir, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const stagingDir = mkdtempSync(join(packsDir, '.staging-'));

  try {
    cpSync(join(packageDir, 'dist'), join(stagingDir, 'dist'), { recursive: true });

    const files = pkgJson.files ?? ['dist'];
    for (const entry of files) {
      if (entry === 'dist') continue;
      const source = join(packageDir, entry);
      try {
        cpSync(source, join(stagingDir, entry), { recursive: true });
      } catch {
        // Optional extra files (README, etc.) â€” skip if missing.
      }
    }

    const packedPkg = rewriteWorkspaceDeps(pkgJson, packVersion);
    writeFileSync(join(stagingDir, 'package.json'), `${JSON.stringify(packedPkg, null, 2)}\n`);

    execSync('npm pack --pack-destination .', { cwd: stagingDir, stdio: 'pipe' });

    const generated = readdirSync(stagingDir).find((name) => name.endsWith('.tgz'));
    if (!generated) {
      throw new Error(`npm pack produced no tarball in ${stagingDir}`);
    }

    const filename = `${tarball}-${packVersion}.tgz`;
    const target = join(packsDir, filename);
    cpSync(join(stagingDir, generated), target);
    return { filename, name: packedPkg.name, version: packVersion, path: target };
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}

function main() {
  const packVersion = bumpPackVersion();
  console.log(`Pack version: ${packVersion}`);

  console.log('Building packagesâ€¦');
  execSync('pnpm run build', { cwd: root, stdio: 'inherit' });

  rmSync(packsDir, { recursive: true, force: true });
  mkdirSync(packsDir, { recursive: true });

  const packages = [];
  for (const entry of PACKAGES) {
    const result = packOne(entry, packVersion);
    packages.push({
      name: result.name,
      version: result.version,
      tarball: result.filename,
      file: `file:./vendor/pco/${result.filename}`,
    });
    console.log(`  ${entry.tarball} â†’ dist/packs/${result.filename}`);
  }

  const manifest = {
    version: packVersion,
    createdAt: new Date().toISOString(),
    packages,
  };
  writeFileSync(join(packsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nPacked ${packages.length} tarballs â†’ dist/packs/manifest.json`);
}

main();
