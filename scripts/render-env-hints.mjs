#!/usr/bin/env node
/**
 * Affiche les variables à coller dans Render (sans lire ni afficher de secrets).
 */
import { PRODUCTION_CORS_ORIGINS } from '../deploy/production-urls.mjs';

console.log('\n=== Variables Render (dashboard → Environment) ===\n');
console.log('NODE_ENV=production');
console.log('NODE_VERSION=22');
console.log('HOST=0.0.0.0');
console.log(`CORS_ORIGIN=${PRODUCTION_CORS_ORIGINS}`);
console.log('DATABASE_URL=<copier depuis votre fichier .env local / Neon — ne pas committer>');

console.log('\nDomaine custom Render : api-dvs.voyagesdecouvertes-menaet.ci');
console.log('DNS Cloudflare : CNAME api-dvs → <service>.onrender.com');
console.log('\nAide locale : pnpm render:env-hints\n');
