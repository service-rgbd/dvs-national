#!/usr/bin/env node
/**
 * Déploie l'API PNIGVS sur Cloudflare Workers (Neon PostgreSQL).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const node22Bin = path.join(process.env.HOME ?? '', '.nvm/versions/node/v22.22.3/bin');
if (existsSync(node22Bin)) {
  process.env.PATH = `${node22Bin}${path.delimiter}${process.env.PATH ?? ''}`;
}

const wranglerConfig = path.join(root, 'deploy/wrangler.api.toml');

function run(command, args, cwd = root, input) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    input,
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readDatabaseUrl() {
  const envPath = path.join(root, '.env');
  if (!existsSync(envPath)) {
    console.error('Fichier .env introuvable (DATABASE_URL requis).');
    process.exit(1);
  }
  const match = readFileSync(envPath, 'utf8').match(/^DATABASE_URL=(.+)$/m);
  const value = match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (!value) {
    console.error('DATABASE_URL manquant dans .env');
    process.exit(1);
  }
  return value;
}

const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrl();

console.log('\n→ Secret DATABASE_URL (Worker pnigvs-api)\n');
run(
  'pnpm',
  ['exec', 'wrangler', 'secret', 'put', 'DATABASE_URL', `--config=${wranglerConfig}`],
  root,
  databaseUrl,
);

console.log('\n→ Déploiement Worker pnigvs-api\n');
run('pnpm', ['exec', 'wrangler', 'deploy', `--config=${wranglerConfig}`]);

console.log('\n✓ API Worker déployée.\n');
