/**
 * CI guard: release-version.json must match the git tag (v*) or workflow_dispatch input.
 *
 * Usage:
 *   node scripts/verify-release-version.mjs              # tag push — reads GITHUB_REF
 *   node scripts/verify-release-version.mjs 0.1.0        # manual dispatch input
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readReleaseVersion } from './sync-package-versions.mjs';

const inputVersion = process.argv[2]?.trim() || '';
const ref = process.env.GITHUB_REF ?? '';
const tagVersion = ref.startsWith('refs/tags/v') ? ref.slice('refs/tags/v'.length) : '';
const expected = readReleaseVersion();

const actual = inputVersion || tagVersion;

if (!actual) {
  console.error('No version to verify — expected a v* tag or workflow_dispatch input.');
  process.exit(1);
}

if (actual !== expected) {
  console.error(
    `Version mismatch: release-version.json is ${expected}, but publish target is ${actual}.`,
  );
  process.exit(1);
}

console.log(`Release version verified: ${expected}`);
