import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readReleaseVersion } from './sync-package-versions.mjs';

const versionFile = join(dirname(fileURLToPath(import.meta.url)), 'pack-version.json');

/** @returns {string} e.g. `0.1.0-dev.42` — bumped on every `pnpm pack:dist` */
export function bumpPackVersion() {
  const release = readReleaseVersion();
  let build = 1;
  if (existsSync(versionFile)) {
    const current = JSON.parse(readFileSync(versionFile, 'utf8'));
    build = (current.build ?? 0) + 1;
  }
  writeFileSync(versionFile, `${JSON.stringify({ build }, null, 2)}\n`);
  return `${release}-dev.${build}`;
}

/** @returns {string | null} */
export function readPackVersion() {
  if (!existsSync(versionFile)) return null;
  const { build } = JSON.parse(readFileSync(versionFile, 'utf8'));
  const release = readReleaseVersion();
  return build ? `${release}-dev.${build}` : null;
}