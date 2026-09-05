#!/usr/bin/env node
/**
 * Build + déploiement Cloudflare Pages — espace agents (login + /app).
 */
import { cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const node22Bin = path.join(process.env.HOME ?? '', '.nvm/versions/node/v22.22.3/bin');
if (existsSync(node22Bin)) {
  process.env.PATH = `${node22Bin}${path.delimiter}${process.env.PATH ?? ''}`;
}

const portalDir = path.join(root, 'artifacts/education-portal');
const distDir = path.join(portalDir, 'dist/public');

const apiOrigin = (process.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '');

const env = {
  ...process.env,
  NODE_ENV: 'production',
  BASE_PATH: '/',
  PORT: '4173',
  VITE_PORTAL_SURFACE: 'agents',
  ...(apiOrigin ? { VITE_API_ORIGIN: apiOrigin } : {}),
};

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\n→ Build espace agents (login + application métier)\n');
if (apiOrigin) {
  console.log(`→ API directe (build) : ${apiOrigin}\n`);
} else {
  console.log('→ API via proxy Pages /api/* → api-dvs.voyagesdecouvertes-menaet.ci\n');
}
run('pnpm', ['--filter', '@workspace/education-portal', 'run', 'build']);

cpSync(
  path.join(root, 'deploy/redirects/agents/_redirects'),
  path.join(distDir, '_redirects'),
);

console.log('\n→ Déploiement Cloudflare Pages (pnigvs-agents)\n');
const deployArgs = [
  'pages',
  'deploy',
  distDir,
  '--project-name=pnigvs-agents',
  '--commit-dirty=true',
];

if (process.env.CF_PAGES_BRANCH) {
  deployArgs.push(`--branch=${process.env.CF_PAGES_BRANCH}`);
}

run('pnpm', ['exec', 'wrangler', ...deployArgs], portalDir);

if (!existsSync(path.join(distDir, 'index.html'))) {
  console.error('Build incomplet : index.html introuvable.');
  process.exit(1);
}

console.log('\n✓ Espace agents déployé.\n');
