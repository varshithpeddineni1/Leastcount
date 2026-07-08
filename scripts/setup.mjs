#!/usr/bin/env node
// npm run setup — install, copy .env.example -> .env, start Postgres, run migrations (OP-2).
import { existsSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

run('npm install');

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('Created .env from .env.example — fill in real values before running the app.');
} else {
  console.log('.env already exists, leaving it untouched.');
}

try {
  run('docker-compose up -d db');
} catch {
  console.error('Could not start Postgres via docker-compose. Is Docker running?');
  process.exit(1);
}

run('npm run migrate -- up');

console.log('Setup complete. Run `npm run dev` to start the server and client.');
