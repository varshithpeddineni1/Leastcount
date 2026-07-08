#!/usr/bin/env node
// CI-4 #8: migrations apply cleanly on a fresh DB, names are snake_case, no drift.
// This checks naming; the actual up/down/up cycle is run separately in the workflow.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'server', 'src', 'db', 'migrations');
const SNAKE_CASE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

let files = [];
try {
  files = readdirSync(MIGRATIONS_DIR).filter((f) => /\.(js|cjs|ts)$/.test(f));
} catch {
  console.log('No migrations directory found yet — nothing to check.');
  process.exit(0);
}

let failed = false;

for (const file of files) {
  const nameWithoutExt = file.replace(/\.(js|cjs|ts)$/, '');
  const [, ...nameParts] = nameWithoutExt.split('_'); // strip the leading timestamp segment
  const name = nameParts.join('_');
  if (name && !SNAKE_CASE.test(name)) {
    console.error(`Migration file name is not snake_case: ${file}`);
    failed = true;
  }

  const contents = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
  for (const match of contents.matchAll(/['"]([a-zA-Z][a-zA-Z0-9_]*)['"]\s*:/g)) {
    const identifier = match[1];
    if (/[A-Z]/.test(identifier)) {
      console.error(`Migration ${file} defines a non-snake_case identifier: "${identifier}"`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} migration file(s) — all snake_case.`);
