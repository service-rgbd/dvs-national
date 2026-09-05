#!/usr/bin/env node
/**
 * Build + déploiement Cloudflare Pages — vitrine publique PNIGVS
 * (accueil, activités, galerie, établissements, statistiques).
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

const distDir = path.join(root, 'artifacts/education-portal/dist/public');
const portalDir = path.join(root, 'artifacts/education-portal');

const apiOrigin = (process.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '');

const env = {
  ...process.env,
  NODE_ENV: 'production',
  BASE_PATH: '/',
  PORT: '4173',
  VITE_PORTAL_SURFACE: 'discover',
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

console.log('\n→ Build vitrine publique (sans accès connexion)\n');
if (apiOrigin) {
  console.log(`→ API distante : ${apiOrigin}\n`);
}
run('pnpm', ['--filter', '@workspace/education-portal', 'run', 'build']);

cpSync(
  path.join(root, 'deploy/redirects/discover/_redirects'),
  path.join(distDir, '_redirects'),
);

console.log('\n→ Déploiement Cloudflare Pages (pnigvs-decouvrir)\n');
const deployArgs = [
  'pages',
  'deploy',
  distDir,
  '--project-name=pnigvs-decouvrir',
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

console.log('\n✓ Vitrine publique déployée.\n');
