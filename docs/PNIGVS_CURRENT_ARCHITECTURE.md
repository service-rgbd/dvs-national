# PNIGVS — Audit technique et gel de l'existant

**Date de l'audit :** 19 août 2026  
**Statut :** Document de référence — **aucune modification de code** effectuée lors de cet audit  
**Périmètre :** Dépôt `Visual-Style-Replication` (monorepo pnpm)  
**Stratégie :** Web-first strict — aucune application mobile native à cette phase

---

## 1. Synthèse exécutive

Le projet PNIGVS dispose d'un **portail public Web fonctionnel** (React 19 + Vite 7 + TypeScript), avec identité institutionnelle alignée sur le cahier des charges v1.0 (DVS / MENA / PNIGVS), Design System partiel, contenu externalisé et infrastructure backend **préparée mais vide**.

| Couche | Maturité | Commentaire |
|--------|----------|-------------|
| Portail public | ~40 % | 1 page live (`/`), navigation majoritairement en ancres |
| Design System | ~80 % | Tokens PNIGVS + shadcn/ui, pas de doc formelle |
| Configuration / contenu | ~90 % | Centralisé, branché au runtime |
| API métier | ~5 % | `/api/healthz` uniquement |
| Base de données | ~5 % | Neon configurée, schéma Drizzle vide |
| Web Application métier | 0 % | Non démarrée |
| Auth / RBAC / 2FA | 0 % | Non démarré |
| Import Excel | ~10 % | Analyse partielle, pas de pipeline |
| Tests automatisés | 0 % | Aucun fichier `*.test.*` / `*.spec.*` |

**Niveau global estimé :** fin de l'**Étape 01–02** du plan directeur (audit + amorce Design System), **avant** portail multi-pages, modèle de données et API établissements.

---

## 2. Structure du monorepo

```
Visual-Style-Replication/
├── artifacts/
│   ├── education-portal/     ← APPLICATION PNIGVS (frontend principal)
│   ├── api-server/           ← API Express 5
│   └── mockup-sandbox/       ← Sandbox maquettes (hors prod PNIGVS)
├── lib/
│   ├── api-spec/             ← OpenAPI + Orval codegen
│   ├── api-client-react/     ← Hooks client générés
│   ├── api-zod/              ← Schémas Zod générés
│   └── db/                   ← Drizzle ORM + PostgreSQL
├── docs/                     ← Documentation projet (ce fichier)
├── attached_assets/          ← Spec française initiale (référence UX)
├── .env                      ← DATABASE_URL (présent localement)
├── package.json              ← Scripts racine
└── pnpm-workspace.yaml       ← Workspaces + catalog + overrides plateforme
```

### Packages workspace

| Package | Nom npm | Rôle |
|---------|---------|------|
| `artifacts/education-portal` | `@workspace/education-portal` | Portail public PNIGVS |
| `artifacts/api-server` | `@workspace/api-server` | Serveur API Express |
| `artifacts/mockup-sandbox` | `@workspace/mockup-sandbox` | Prévisualisation maquettes |
| `lib/db` | `@workspace/db` | Accès PostgreSQL / Drizzle |
| `lib/api-spec` | `@workspace/api-spec` | Contrat OpenAPI |
| `lib/api-client-react` | `@workspace/api-client-react` | Client React généré |
| `lib/api-zod` | `@workspace/api-zod` | Validation Zod API |
| `scripts` | `@workspace/scripts` | Scripts utilitaires |

---

## 3. Architecture frontend

### 3.1 Stack

| Technologie | Version / détail |
|-------------|------------------|
| React | 19.1.0 |
| TypeScript | 5.9.3 |
| Vite | 7.3.x |
| Routing | Wouter 3.x |
| Styles | Tailwind CSS 4 + CSS custom `.education-page` |
| UI kit | shadcn/ui (style `new-york`) — **55 composants** dans `components/ui/` |
| Data fetching | TanStack React Query 5.x — **installé, non utilisé métier** |
| Formulaires | react-hook-form + zod — **disponible, non utilisé sur l'accueil** |
| Icônes | lucide-react, react-icons |
| Build | Vite → `artifacts/education-portal/dist/public` |

### 3.2 Point d'entrée et composition

| Fichier | Rôle |
|---------|------|
| `src/main.tsx` | Bootstrap React + ErrorBoundary racine |
| `src/App.tsx` | **Monolithe UI** : page d'accueil (~430 lignes), routing, providers |
| `src/index.css` | Styles globaux + import `config/design-tokens.css` |
| `src/pages/not-found.tsx` | Page 404 (anglais, shadcn Card) |

### 3.3 Providers actifs

```tsx
QueryClientProvider → TooltipProvider → WouterRouter → Router
```

- `QueryClient` instancié avec configuration par défaut (pas de queries métier).
- `Toaster` monté globalement.

### 3.4 Alias Vite

| Alias | Cible |
|-------|-------|
| `@/` | `src/` |
| `@assets/` | `attached_assets/` |

### 3.5 Variables d'environnement requises (frontend)

| Variable | Obligatoire | Usage |
|----------|-------------|-------|
| `PORT` | Oui | Port dev/preview Vite |
| `BASE_PATH` | Oui | Base URL de déploiement |
| `NODE_ENV` | Non | Plugins Replit conditionnels |
| `REPL_ID` | Non | Active plugins Replit en dev |

**Note :** le frontend ne consomme pas encore `DATABASE_URL` ni d'URL API explicite.

---

## 4. Routing

### 4.1 Routes implémentées

| Route | Composant | Statut |
|-------|-----------|--------|
| `/` | `EducationHomepage` (inline dans `App.tsx`) | ✅ Fonctionnel |
| `*` (catch-all) | `not-found.tsx` | ✅ Fonctionnel |

### 4.2 Routes prévues (plan directeur) — **absentes**

```
/ministere          /vie-scolaire       /etablissements
/services           /actualites         /documents
/statistiques       /contact            /recherche
/espace-agents      /login              /app/*
/etablissements/:id /actualites/:slug   /documents/:id
```

### 4.3 Navigation actuelle vs routes réelles

La navigation principale (`content/navigation.ts`) utilise **exclusivement des ancres HTML** sur la page d'accueil :

| Rubrique | href actuel | Type |
|----------|-------------|------|
| Accueil | `#main-content` | Ancre |
| La DVS | `#footer` | Placeholder |
| Vie scolaire | `#services` | Ancre section |
| Établissements | `#contact` | Placeholder |
| Services | `#services` | Ancre section |
| Actualités | `#main-content` | Ancre |
| Documents | `#footer` | Placeholder |
| Statistiques | `#footer` | Placeholder |
| Contact | `#contact` | Ancre section |
| Connexion PNIGVS | `#contact` | Placeholder (pas de login) |

**Risque :** les utilisateurs croient naviguer entre rubriques ; en réalité ils restent sur une seule page.

---

## 5. Composants

### 5.1 Composants métier (portail)

| Composant | Fichier | Rôle | Branché |
|-----------|---------|------|---------|
| `EducationHomepage` | `App.tsx` | Page complète header→footer | ✅ |
| `ArrowLink` | `App.tsx` | Lien CTA avec flèche | ✅ |
| `Visual` | `App.tsx` | Illustrations CSS hero/people | ✅ |
| `Router` / `RoutedErrorBoundary` | `App.tsx` | Routage + reset erreur | ✅ |
| `ErrorBoundary` | `components/error-boundary.tsx` | Capture erreurs React | ✅ |

### 5.2 Sections de la page d'accueil (ordre DOM)

1. Skip links (accessibilité)
2. Header (brand MENA, utilitaires, recherche, menu)
3. Navigation desktop + menu mobile
4. Hero éditorial
5. À la une (actualités)
6. Services vie scolaire
7. Calendrier / rentrée
8. Espaces professionnels PNIGVS
9. Types d'activités suivies
10. Contact + réseaux sociaux
11. Footer éditorial + légal
12. Bandeau cookies

### 5.3 Composants shadcn/ui (`components/ui/`)

**55 fichiers** — dont : accordion, alert, badge, breadcrumb, button, card, chart, dialog, drawer, form, input, pagination, select, sheet, sidebar, table, tabs, toast, etc.

**Usage actuel sur le portail live :** minimal (`Toaster`, `TooltipProvider`, `Card` sur 404).  
**Disponibilité :** prêts pour Web App métier (dashboards, tableaux, formulaires).

### 5.4 Hooks

| Hook | Fichier | Utilisation portail |
|------|---------|---------------------|
| `useState`, `useEffect`, `useRef` | `App.tsx` | Recherche, menu, cookies |
| `useLocation` | wouter | Reset ErrorBoundary |
| `useIsMobile` | `hooks/use-mobile.tsx` | Sidebar shadcn uniquement |
| `useToast` | `hooks/use-toast.ts` | Toaster uniquement |

---

## 6. Design System PNIGVS

### 6.1 Fichiers tokens

| Fichier | Type | Branché runtime |
|---------|------|-----------------|
| `config/design-tokens.css` | Variables CSS `--pnigvs-*` | ✅ via `index.css` |
| `config/tokens.ts` | Valeurs TS (référence) | ⚠️ Non importé par composants |
| `index.css` `:root` + `.education-page` | Tailwind + alias sémantiques | ✅ |

### 6.2 Palette institutionnelle

| Token | Valeur | Usage |
|-------|--------|-------|
| `--pnigvs-primary` | `#008751` | Vert institutionnel |
| `--pnigvs-accent` | `#F77F00` | Orange ivoirien |
| `--pnigvs-paper` | `#FBFAF7` | Surface neutre |
| `--pnigvs-footer` | `#0D3D2B` | Footer |

### 6.3 Typographie

- **DM Sans** — corps
- **Space Mono** — tags, eyebrow, devise

### 6.4 Double système de styles

1. **Tokens PNIGVS** (`.education-page`, variables `--primary-color`, `--accent-color`)
2. **Tokens shadcn/Tailwind** (`:root` HSL pour composants UI)

**Risque :** divergence visuelle future entre portail custom CSS et composants shadcn si non unifiés (Étape 02).

### 6.5 Couleurs hardcodées résiduelles

Quelques valeurs hex subsistent dans `index.css` (ex. `#1a9d6c`, `#007a49`, `#555`, `#fff`).  
**Recommandation Étape 02 :** migrer vers tokens sémantiques.

---

## 7. Configuration (`config/`)

| Fichier | Contenu | Runtime |
|---------|---------|---------|
| `institution.ts` | MENA, DVS, PNIGVS, devise CI, CDC v1.0 | ✅ Utilisé |
| `roles.ts` | 6 profils CDC, workflow, types activités | ❌ Référence seulement |
| `tokens.ts` | Couleurs/espacements JS | ❌ Non importé |
| `design-tokens.css` | Variables CSS | ✅ Utilisé |
| `index.ts` | Re-exports | ✅ |

### Identité officielle en config (CDC v1.0)

- **PNIGVS :** Plateforme Numérique Intégrée de Gestion de la Vie Scolaire
- **Client :** Direction de la Vie Scolaire (DVS)
- **Ministère :** MENA

---

## 8. Contenu externalisé (`content/`)

| Fichier | Contenu | Source données |
|---------|---------|----------------|
| `homepage.ts` | Hero, actualités, services, rentrée, staff, activités, contact, recherche | Statique TS |
| `navigation.ts` | Menu principal + liens header | Statique TS |
| `footer.ts` | Groupes footer + liens légaux | Statique TS |
| `cookies.ts` | Bandeau cookies | Statique TS |
| `seo.ts` | Métadonnées + structured data | Statique TS |
| `index.ts` | Re-exports | — |

**Prêt CMS :** oui (structure par sections).  
**Données métier réelles :** non — contenus éditoriaux descriptifs du projet, pas de CMS branché.

---

## 9. Architecture backend

### 9.1 Stack API

| Technologie | Détail |
|-------------|--------|
| Express | 5.2.x |
| TypeScript | Build esbuild → `dist/index.mjs` |
| Logging | Pino + pino-http |
| CORS | Activé (`cors()`) — **sans restriction d'origine documentée** |
| Validation | Zod via `@workspace/api-zod` |
| ORM | Drizzle (dépendance présente, **non utilisée dans routes**) |

### 9.2 Structure API

```
artifacts/api-server/src/
├── app.ts              ← Express app (CORS, JSON, routes)
├── index.ts            ← Entry point
├── routes/
│   ├── index.ts        ← Agrégateur
│   └── health.ts       ← GET /healthz
└── lib/logger.ts       ← Pino (masque authorization headers)
```

### 9.3 Endpoints

| Méthode | Path | Statut | Réponse |
|---------|------|--------|---------|
| GET | `/api/healthz` | ✅ | `{ "status": "ok" }` |

**Aucun autre endpoint métier.**

### 9.4 OpenAPI / Orval

- Spec : `lib/api-spec/openapi.yaml` (health uniquement)
- Codegen : `pnpm --filter @workspace/api-spec run codegen`
- Génère : `lib/api-client-react`, `lib/api-zod`

---

## 10. PostgreSQL / Drizzle

| Élément | Statut |
|---------|--------|
| `DATABASE_URL` | Configurée dans `.env` local (Neon PostgreSQL) |
| `lib/db/src/index.ts` | Pool pg + drizzle client |
| `lib/db/src/schema/index.ts` | **Vide** (`export {}`) |
| Migrations | Aucune |
| Scripts | `pnpm --filter @workspace/db run push` (dev only) |
| Données métier | **Aucune table, aucune donnée** |

**Inspection pré-migration (Étape 04) :** schéma vide → aucune donnée existante à préserver, mais toute migration future doit être non destructive par défaut.

---

## 11. React Query

| Aspect | État |
|--------|------|
| Installation | ✅ `@tanstack/react-query` |
| Provider | ✅ Monté dans `App.tsx` |
| `useQuery` / `useMutation` | ❌ Aucun usage |
| Configuration cache | Défaut |
| Connexion API | ❌ |

**Prévu Étape 06–07 :** annuaire établissements.

---

## 12. Client API Orval

| Aspect | État |
|--------|------|
| Package | `@workspace/api-client-react` (dépendance workspace) |
| Import dans portail | ❌ Aucun |
| `setBaseUrl()` | ❌ Non appelé |
| `setAuthTokenGetter()` | ❌ Non appelé |
| Hooks générés | `healthCheck` uniquement |

---

## 13. Authentification

| Fonctionnalité | État |
|----------------|------|
| Login / logout | ❌ |
| Sessions / JWT | ❌ |
| RBAC | ❌ (défini dans `config/roles.ts` seulement) |
| 2FA | ❌ |
| Route `/login`, `/app` | ❌ |
| `cookie-parser` API | Installé, **non utilisé** |
| Infrastructure token | `setAuthTokenGetter` prêt côté client |

---

## 14. Variables d'environnement

| Variable | Où | Git |
|----------|-----|-----|
| `DATABASE_URL` | `.env` racine | ⚠️ **`.env` NON listé dans `.gitignore`** |
| `PORT` | Replit / shell dev | — |
| `BASE_PATH` | Replit / shell dev | — |
| `NODE_ENV` | Runtime | — |

### ⚠️ Risque sécurité critique

Le fichier `.env` contient des credentials PostgreSQL Neon et **n'est pas ignoré par Git** (`.gitignore` ne contient pas `.env`).  
**Action recommandée avant tout commit :** ajouter `.env` au `.gitignore` et vérifier l'historique Git.

---

## 15. Scripts npm / pnpm

### Racine

| Script | Commande |
|--------|----------|
| `build` | typecheck libs + build récursif artifacts |
| `typecheck` | TSC workspace |
| `preinstall` | Force pnpm |

### `@workspace/education-portal`

| Script | Commande |
|--------|----------|
| `dev` | `vite --host 0.0.0.0` (requiert PORT + BASE_PATH) |
| `build` | `vite build` |
| `serve` | `vite preview` |
| `typecheck` | `tsc --noEmit` |

### `@workspace/api-server`

| Script | Commande |
|--------|----------|
| `dev` | build + start |
| `build` | esbuild bundle |
| `start` | node dist |

### `@workspace/db`

| Script | Commande |
|--------|----------|
| `push` | drizzle-kit push |
| `push-force` | drizzle-kit push --force ⚠️ |

---

## 16. Gestion des erreurs

| Niveau | Mécanisme | Statut |
|--------|-----------|--------|
| React racine | `ErrorBoundary` dans `main.tsx` | ✅ |
| Routing | `RoutedErrorBoundary` avec `resetKey=location` | ✅ |
| API | Pas de middleware erreur global documenté | ⚠️ Minimal |
| 404 frontend | Page dédiée (anglais) | ✅ |
| Toasts | Infrastructure prête | ✅ Non utilisé métier |

---

## 17. Sécurité existante

| Mesure | État |
|--------|------|
| Auth / RBAC | ❌ |
| Rate limiting | ❌ |
| Helmet / security headers | ❌ |
| CSRF | ❌ |
| Validation entrées API | ✅ Health only (Zod) |
| SQL injection | N/A (pas de requêtes SQL métier) |
| Secrets dans code | ❌ Aucun hardcodé détecté |
| Secrets dans Git | ⚠️ `.env` non ignoré |
| CORS | ✅ Ouvert (`cors()` default) |
| Logs sensibles | ✅ Authorization masqué dans logger |
| Cookies HttpOnly | N/A |
| Upload fichiers | ❌ |

---

## 18. Accessibilité

| Fonctionnalité | Implémentation |
|----------------|----------------|
| Skip links | 4 liens (`#main-content`, menu, search, footer) |
| Sémantique HTML | header, nav, main, section, article, footer, aside |
| ARIA | aria-expanded, aria-controls, aria-modal, aria-label, role="search" |
| Focus clavier | `:focus-visible` orange (`--pnigvs-focus`) |
| Hiérarchie titres | 1× h1, h2 sections, h3 cartes |
| Labels formulaires | Label recherche (visually hidden) |
| Menu mobile | Escape, clic extérieur, scroll lock |
| Cibles tactiles | min-height 44px sur actions |
| `data-testid` | ~40 attributs (base E2E) |
| RGAA | Partiellement conforme (déclaration footer) |
| 404 | Anglais — **non localisé fr-CI** |

---

## 19. SEO

| Élément | Valeur / statut |
|---------|-----------------|
| `lang` | `fr-CI` |
| `title` / `description` | PNIGVS / DVS |
| Open Graph | `fr_CI`, site_name PNIGVS |
| Twitter Card | summary_large_image |
| JSON-LD | GovernmentOrganization (DVS → MENA) |
| `robots.txt` | Allow: / |
| Sitemap | ❌ Absent |
| Pages indexables | 1 seule (`/`) |

---

## 20. Responsive

| Breakpoint | Comportement |
|------------|--------------|
| ≤ 800px | Menu plein écran, grilles 1 col., labels recherche masqués |
| 801–1050px | Nav compacte |
| > 1050px | Layout desktop complet |

Grille conteneur : max-width 1240px.  
Animations : `reveal`, `rise` (CSS).

---

## 21. Placeholders et liens fictifs

### 21.1 Inventaire des ancres placeholder

**~50+ liens** dans `content/*` pointent vers `#footer`, `#contact`, `#services` au lieu de routes réelles.

### 21.2 Fonctionnalités simulées (UI only)

| Fonctionnalité | Comportement réel |
|----------------|-------------------|
| Recherche header | État React + `?search=` URL, **pas de résultats backend** |
| Navigation rubriques | Scroll ancres, pas de pages |
| Connexion PNIGVS | Lien `#contact`, **pas d'auth** |
| Actualités | Cartes statiques, liens internes ancres |
| Annuaire établissements | Mentionné, **aucune liste** |
| Statistiques / rapports | Liens footer sans contenu |
| Modules PNIGVS footer | Descriptifs CDC, non cliquables métier |
| Cookies | Accept/refuse UI, **pas de persistence** (state React session) |

### 21.3 Données mockées

**Aucun fichier mock API.**  
Contenus éditoriaux statiques dans `content/homepage.ts` (actualités, services) — **non présentés comme données officielles importées**, mais descriptifs projet.

### 21.4 Excel établissements (analyse externe au repo)

| Élément | Statut |
|---------|--------|
| Fichiers analysés | 5 pages DREN Abidjan 1 (98–102) |
| Lignes | 140 établissements |
| Colonnes | 9 (Ordre, N°, Localité, Code, Nom, cycles, email, contacts) |
| En base PostgreSQL | ❌ |
| Pipeline import | ❌ |
| Doublon connu | Code `000218` (2 établissements) |

---

## 22. Artefacts hors périmètre PNIGVS prod

| Artefact | Risque |
|----------|--------|
| `artifacts/mockup-sandbox` | Copie ancienne maquette française — **ne pas synchroniser automatiquement** |
| `attached_assets/Pasted-*.txt` | Spec UX française originale |

---

## 23. Classification : fonctionnel vs visuel vs préparé

### ✅ Réellement fonctionnel

- Serveur dev Vite (PORT + BASE_PATH)
- Page d'accueil `/` complète et responsive
- Header : recherche toggle, menu mobile, navigation
- Bandeau cookies (UI)
- Skip links, focus, ARIA de base
- Error boundaries
- Typecheck TypeScript (portal)
- API health check
- Config institution + contenu branchés

### 🟡 Visuel / placeholder

- Rubriques navigation → ancres
- Connexion PNIGVS
- Résultats recherche
- Liens footer modules métier
- Actualités (contenu statique non CMS)
- Cookie persistence

### 🔵 Préparé non connecté

- React Query
- Orval client API
- Drizzle + Neon
- `config/roles.ts`
- 55 composants shadcn
- cookie-parser (API)
- Infrastructure auth token getter

### ❌ Manquant

- Routes multi-pages
- Schéma DB + migrations
- Import Excel
- API établissements
- Annuaire paginé
- Auth / RBAC / 2FA
- Web App `/app`
- Workflow demandes
- Notifications, messagerie, documents
- Tests automatisés
- Rate limiting, Helmet, sitemap
- Documentation Design System / DB / Import

---

## 24. Risques techniques

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Monolithe `App.tsx` | Moyenne | Extraire pages/composants (Étape 03) |
| Navigation trompeuse (ancres) | Haute | Routes réelles (Étape 03) |
| Double système CSS | Moyenne | Consolidation tokens (Étape 02) |
| `.env` non gitignored | **Critique** | Ajouter `.gitignore` avant commit |
| `push-force` Drizzle disponible | Haute | Interdire en prod, migrations contrôlées |
| CORS ouvert | Moyenne | Restreindre à origines connues |
| Overrides pnpm Replit/macOS | Faible | Corrigé pour darwin dev |
| mockup-sandbox divergence | Faible | Ignorer ou archiver |
| 404 en anglais | Faible | Localiser fr-CI |

---

## 25. Risques sécurité

| Risque | Sévérité |
|--------|----------|
| Credentials Neon dans `.env` exposable via Git | **Critique** |
| Pas d'auth sur API future | Haute (à traiter Étape 08) |
| Pas de rate limiting | Haute |
| Pas de headers sécurité | Moyenne |
| CORS permissif | Moyenne |
| Cookie banner sans persistence consentement | Faible (RGPD) |

---

## 26. Fichiers à modifier — prochaines étapes

### Étape 02 — Design System

| Fichier | Action prévue |
|---------|---------------|
| `config/design-tokens.css` | Enrichir tokens sémantiques |
| `config/tokens.ts` | Aligner avec CSS |
| `index.css` | Éliminer hex résiduels |
| `components/ui/*` | Vérifier usage tokens (optionnel) |
| **Créer** `docs/PNIGVS_DESIGN_SYSTEM.md` | Documentation |

### Étape 03 — Portail multi-pages

| Fichier | Action prévue |
|---------|---------------|
| `App.tsx` | Extraire accueil, ajouter routes |
| **Créer** `src/pages/public/*` | Pages rubriques |
| **Créer** `src/layouts/PublicLayout.tsx` | Layout partagé |
| `content/navigation.ts` | href → routes réelles |
| `content/homepage.ts` | href → routes réelles |
| `content/footer.ts` | href → routes réelles |
| `pages/not-found.tsx` | Localiser FR |

### Étape 04 — Base de données

| Fichier | Action prévue |
|---------|---------------|
| **Créer** `lib/db/src/schema/*.ts` | Tables geo + establishments |
| `lib/db/src/schema/index.ts` | Exports |
| **Créer** migrations Drizzle |
| **Créer** `docs/PNIGVS_DATABASE.md` | |

### Étape 05 — Import Excel

| Fichier | Action prévue |
|---------|---------------|
| **Créer** `scripts/import-establishments/` | Pipeline |
| **Créer** `docs/PNIGVS_EXCEL_IMPORT.md` | |

### Étape 06 — API

| Fichier | Action prévue |
|---------|---------------|
| `lib/api-spec/openapi.yaml` | Endpoints establishments |
| **Créer** `artifacts/api-server/src/routes/establishments.ts` | |
| **Créer** `artifacts/api-server/src/services/` | Repository layer |

### Étape 07 — Annuaire

| Fichier | Action prévue |
|---------|---------------|
| **Créer** `src/pages/public/establishments/` | |
| `App.tsx` | Brancher React Query |

### Étape 08+ — Auth / App métier

| Fichier | Action prévue |
|---------|---------------|
| **Créer** `src/pages/login`, `src/pages/app/*` | |
| `config/roles.ts` | Brancher RBAC |
| `lib/db/src/schema/users.ts` | |

### Fichiers à NE PAS supprimer

- `App.tsx` (refactor, pas delete)
- Tous `components/ui/*`
- `config/institution.ts`, `content/*`
- `api-server`, `lib/db`, `lib/api-*`

---

## 27. Gel de l'existant — règles de non-régression

Jusqu'à validation explicite des étapes suivantes :

1. **Ne pas supprimer** de routes, composants, API ou hooks existants.
2. **Ne pas modifier** le comportement responsive/accessibilité de l'accueil sans test.
3. **Ne pas introduire** de migrations destructives.
4. **Ne pas hardcoder** de secrets ou de données administratives inventées.
5. **Ne pas développer** d'application mobile native.
6. **Conserver** l'identité CDC (DVS, PNIGVS, MENA, devise CI).
7. **Toute nouvelle page** doit utiliser le Design System PNIGVS (tokens).

---

## 28. Commandes de vérification actuelles

```bash
# Dev portail (requiert PORT et BASE_PATH)
PORT=26270 BASE_PATH=/ pnpm --filter @workspace/education-portal run dev

# Typecheck global
pnpm run typecheck

# Build (peut échouer selon overrides rollup en environnement Replit)
PORT=26270 BASE_PATH=/ pnpm --filter @workspace/education-portal run build

# API health (si api-server démarré)
curl http://localhost:5000/api/healthz
```

---

## 29. Prochaine étape recommandée

**Étape 02 : Consolidation du Design System PNIGVS**

Puis enchaînement **Étape 03** (portail multi-pages) en parallèle préparatoire de **Étape 04** (schéma DB), avant **Étapes 05–07** (import Excel → API → annuaire).

---

*Document généré dans le cadre de l'Étape 01 — Audit technique et gel de l'existant. Aucune modification de code applicatif n'a été effectuée.*
