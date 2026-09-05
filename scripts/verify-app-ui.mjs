#!/usr/bin/env node
/**
 * Vérification rapide UI app — login + pages clés (sans Playwright).
 */
const BASE = process.env.PORTAL_URL ?? 'http://localhost:26270';
const API = process.env.API_URL ?? 'http://localhost:5000';

const PAGES = [
  '/app',
  '/app/statistiques',
  '/app/etablissements',
  '/app/activites',
  '/app/demandes',
  '/app/documents',
  '/app/administration',
];

async function main() {
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin.dev@dvs.ci', password: 'DevAdminPass123!' }),
  });
  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw new Error('No session cookie from login');

  console.log('✓ Login OK');

  for (const path of PAGES) {
    const res = await fetch(`${BASE}${path}`, { headers: { cookie } });
    const html = await res.text();
    const checks = [
      ['app-pro-shell', html.includes('app-pro-shell')],
      ['app-pro-nav-group', html.includes('app-pro-nav-group')],
      ['app-pro-page', html.includes('app-pro-page') || html.includes('dash-director')],
    ];
    const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
    console.log(`${failed.length ? '✗' : '✓'} ${path} (${res.status})${failed.length ? ` — manque: ${failed.join(', ')}` : ''}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
