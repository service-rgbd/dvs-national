#!/usr/bin/env node
/**
 * Build + déploiement Cloudflare Pages — portail public (sans login).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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

const agentsOrigin = (
  process.env.VITE_AGENTS_PORTAL_URL ?? 'https://pnigvs-agents.pages.dev'
).replace(/\/$/, '');

const env = {
  ...process.env,
  NODE_ENV: 'production',
  BASE_PATH: '/',
  PORT: '4173',
  VITE_PORTAL_SURFACE: 'public',
  VITE_AGENTS_PORTAL_URL: agentsOrigin,
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

console.log(`\n→ Build portail public (agents → ${agentsOrigin})\n`);
run('pnpm', ['--filter', '@workspace/education-portal', 'run', 'build']);

const templatePath = path.join(root, 'deploy/redirects/public/_redirects.template');
const redirects = readFileSync(templatePath, 'utf8').replaceAll('{{AGENTS_ORIGIN}}', agentsOrigin);
writeFileSync(path.join(distDir, '_redirects'), redirects);

console.log('\n→ Déploiement Cloudflare Pages (pnigvs-portail)\n');
const deployArgs = [
  'pages',
  'deploy',
  distDir,
  '--project-name=pnigvs-portail',
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

console.log('\n✓ Portail public déployé.\n');
