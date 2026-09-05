# PNIGVS — État actuel du projet

**Date :** 27 août 2026  
**Périmètre :** Monorepo `Visual-Style-Replication`  
**Objectif :** Point de référence pour recadrer le projet avant la suite du développement

> **Note importante :** Le document `PNIGVS_CURRENT_ARCHITECTURE.md` (audit du 19 août 2026) est **obsolète**. Il décrivait un portail à ~40 % avec une API quasi vide. L'état réel du code est nettement plus avancé — ce fichier en fait la photographie à jour.

---

## 1. Synthèse exécutive

PNIGVS (*Plateforme Numérique Intégrée de Gestion de la Vie Scolaire*) est une application web pour la **Direction de la Vie Scolaire (DVS)** du MENA, Côte d'Ivoire.

| Couche | Maturité | Commentaire |
|--------|----------|-------------|
| Portail public | **~85 %** | 13 pages + fiche établissement, contenu statique + données API |
| Application métier | **~75 %** | 16 routes authentifiées, modules workflow opérationnels |
| API Express | **~80 %** | 35 endpoints OpenAPI implémentés |
| Base de données | **~85 %** | Schéma PostgreSQL riche (~25 tables), 3 migrations appliquées |
| Auth / RBAC | **~60 %** | Sessions cookie, 7 rôles, périmètre geo — pas de 2FA ni CRUD comptes |
| Design System | **~85 %** | Tokens PNIGVS + 55 composants shadcn/ui |
| Tests automatisés | **0 %** | Aucun fichier `*.test.*` / `*.spec.*` |
| Administration comptes | **~15 %** | UI de conformité CDC, pas d'API CRUD utilisateurs |

**Stratégie produit :** Web-first strict — pas d'application mobile native à cette phase.

---

## 2. Structure du monorepo

```
Visual-Style-Replication/
├── artifacts/
│   ├── education-portal/     ← Frontend principal PNIGVS (React + Vite)
│   ├── api-server/           ← API Express 5
│   └── mockup-sandbox/       ← Sandbox maquettes (hors prod)
├── lib/
│   ├── db/                   ← Drizzle ORM + schéma PostgreSQL
│   ├── api-spec/             ← Contrat OpenAPI 3.1 + Orval
│   ├── api-client-react/     ← Hooks TanStack Query générés
│   └── api-zod/              ← Schémas Zod générés (validation serveur)
├── scripts/                  ← Import Excel, bootstrap auth, vérif UI
├── docs/                     ← Documentation projet
├── uploads/                  ← Stockage local fichiers (documents, médias)
├── attached_assets/          ← Spécification UX initiale (référence)
├── .env                      ← Variables locales (non commité)
└── pnpm-workspace.yaml       ← Workspaces + catalog de versions
```

### Packages workspace

| Package | Nom npm | Rôle |
|---------|---------|------|
| `artifacts/education-portal` | `@workspace/education-portal` | Portail public + app métier |
| `artifacts/api-server` | `@workspace/api-server` | Serveur API Express |
| `artifacts/mockup-sandbox` | `@workspace/mockup-sandbox` | Prévisualisation maquettes |
| `lib/db` | `@workspace/db` | Accès PostgreSQL / Drizzle |
| `lib/api-spec` | `@workspace/api-spec` | Contrat OpenAPI v0.6.0 |
| `lib/api-client-react` | `@workspace/api-client-react` | Client React généré |
| `lib/api-zod` | `@workspace/api-zod` | Validation Zod API |
| `scripts` | `@workspace/scripts` | Scripts CLI utilitaires |

---

## 3. Démarrage local

### Prérequis

- Node.js 24 (Replit) / Node 20+ en local
- pnpm (obligatoire — le `preinstall` racine bloque npm/yarn)
- PostgreSQL (Neon) — `DATABASE_URL` dans `.env`

### Variables d'environnement (`.env.example`)

| Variable | Usage |
|----------|-------|
| `DATABASE_URL` | Connexion PostgreSQL — **obligatoire** |
| `PNIGVS_ADMIN_EMAIL` | Bootstrap admin initial (CLI) |
| `PNIGVS_ADMIN_PASSWORD` | Bootstrap admin initial (CLI) |
| `PNIGVS_ADMIN_FULL_NAME` | Bootstrap admin initial (CLI) |
| `PORT` | API : `5000` |
| `CORS_ORIGIN` | Origine frontend : `http://localhost:26270` |

Variables additionnelles (code) :

| Variable | Défaut | Usage |
|----------|--------|-------|
| `HOST` | `0.0.0.0` | Hôte API |
| `BASE_PATH` | — | **Obligatoire** pour le portail Vite (`/`) |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Proxy `/api` en dev |
| `PNIGVS_SESSION_COOKIE` | `pnigvs_session` | Nom cookie session |
| `PNIGVS_SESSION_TTL_MS` | 7 jours | Durée session |
| `LOG_LEVEL` | `info` | Niveau logs API |

### Commandes de développement

**Terminal 1 — API (port 5000) :**
```bash
set -a && source .env && set +a
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Portail (port 26270) :**
```bash
PORT=26270 BASE_PATH=/ pnpm --filter @workspace/education-portal run dev
```

| Service | URL |
|---------|-----|
| Portail | http://localhost:26270/ |
| API | http://localhost:5000 |
| Health check | http://localhost:5000/api/healthz |

Le frontend proxy les requêtes `/api` vers le backend en développement.

### Autres commandes utiles

```bash
pnpm run typecheck                              # Typecheck global
pnpm run build                                  # Build complet
pnpm --filter @workspace/api-spec run codegen   # Regénérer hooks + Zod depuis OpenAPI
pnpm --filter @workspace/db run push            # Pousser schéma DB (dev)
pnpm --filter @workspace/scripts run import:establishments  # Import Excel établissements
pnpm --filter @workspace/scripts run bootstrap:auth         # Créer admin initial
```

---

## 4. Stack technique

| Technologie | Version |
|-------------|---------|
| Node.js | 24 (prod Replit) / 20+ local |
| pnpm | 10.x |
| TypeScript | ~5.9.3 |
| React / React DOM | 19.1.0 |
| Vite | ^7.3.2 |
| Tailwind CSS | ^4.1.14 |
| Wouter (routing) | ^3.3.5 |
| TanStack React Query | ^5.90.21 |
| Express | ^5.2.1 |
| Drizzle ORM | ^0.45.2 |
| Zod | ^3.25.76 |
| Orval (codegen) | ^8.23.0 |
| esbuild | 0.27.3 |
| bcryptjs | ^3.0.3 |
| pino | ^9.14.0 |
| Recharts | ^2.15.x |
| Framer Motion | ^12.23.24 |

---

## 5. Frontend — `@workspace/education-portal`

### Architecture

| Élément | Chemin | Rôle |
|---------|--------|------|
| Entry | `src/main.tsx` | Bootstrap React |
| Router | `src/App.tsx` | Routes publiques + app |
| Routes canoniques | `src/content/routes.ts` | Source unique des URLs |
| Layout public | `src/layouts/PublicLayout.tsx` | Enveloppe portail institutionnel |
| Layout app | `src/layouts/AppLayout.tsx` | Shell application métier |
| Design tokens | `src/config/design-tokens.css` | Palette PNIGVS (#008751, #F77F00) |
| Composants UI | `src/components/ui/` | 55 composants shadcn/ui |
| Composants portail | `src/components/portal/` | 16 composants institutionnels |
| Composants app | `src/components/app/` | Modules métier (dashboard, demandes, etc.) |
| Contenu statique | `src/content/*` | Navigation, homepage, actualités, SEO |
| Guards auth | `src/components/auth/` | `RequireAuth`, guards modules |
| Config modules | `src/config/app-modules.ts` | Visibilité navigation par rôle |

### Routes publiques (13 + détail)

| Route | Page | Source de données |
|-------|------|-------------------|
| `/` | `pages/public/home.tsx` | Statique + aperçu établissements API |
| `/ministere` | `pages/public/ministere.tsx` | Statique |
| `/vie-scolaire` | `pages/public/vie-scolaire.tsx` | Statique |
| `/etablissements` | `pages/public/etablissements.tsx` | API `listEstablishments` |
| `/etablissements/:id` | `pages/public/etablissement-detail.tsx` | API `getEstablishmentById` |
| `/services` | `pages/public/services.tsx` | Statique |
| `/actualites` | `pages/public/actualites.tsx` | Statique |
| `/galerie-sorties` | `pages/public/galerie-sorties.tsx` | API médias publics + albums statiques |
| `/documents` | `pages/public/documents.tsx` | API `listPublicDocuments` |
| `/statistiques` | `pages/public/statistiques.tsx` | API `getPublicStatistics` |
| `/contact` | `pages/public/contact.tsx` | Statique |
| `/recherche` | `pages/public/recherche.tsx` | Statique (UI recherche) |
| `/espace-agents` | `pages/public/espace-agents.tsx` | Statique (landing connexion) |

### Routes application métier (16 + détails)

| Route | Page | Fonctionnalités |
|-------|------|-----------------|
| `/login` | `pages/app/auth/login.tsx` | Connexion email/mot de passe |
| `/app` | `pages/app/dashboard.tsx` | KPIs, feeds, dashboard directeur DVS |
| `/app/etablissements` | `pages/app/establishments.tsx` | Annuaire filtré RBAC |
| `/app/etablissements/:id` | `pages/app/establishment-detail.tsx` | Fiche établissement |
| `/app/activites` | `pages/app/activities.tsx` | Liste + création activités |
| `/app/demandes` | `pages/app/requests.tsx` | Liste demandes d'autorisation |
| `/app/demandes/:id` | `pages/app/request-detail.tsx` | Détail + transitions workflow |
| `/app/publications-medias` | `pages/app/media-publications.tsx` | Dossiers média |
| `/app/publications-medias/:id` | `pages/app/media-publication-detail.tsx` | Validation, incident, transitions |
| `/app/documents` | `pages/app/documents.tsx` | Liste + upload documents |
| `/app/statistiques` | `pages/app/statistics.tsx` | KPIs, graphiques, rapports |
| `/app/administration` | `pages/app/administration.tsx` | Hub admin |
| `/app/administration/comptes` | `pages/app/admin/accounts.tsx` | Doc cycle de vie comptes (CDC) |
| `/app/administration/roles` | `pages/app/admin/roles.tsx` | Matrice RBAC |
| `/app/administration/parametres` | `pages/app/admin/settings.tsx` | Paramètres + déconnexion |
| `/app/administration/journal` | `pages/app/admin/audit-log.tsx` | Règles audit + liste activités |
| `/app/profil` | `pages/app/profile.tsx` | Identité, rôles, notifications |

### Navigation app (groupes)

Config : `src/config/app-nav-groups.ts`

- **Pilotage** — Tableau de bord, Statistiques
- **Opérations** — Établissements, Activités, Demandes, Médias, Documents
- **Système** — Administration, Profil

---

## 6. Backend — `@workspace/api-server`

### Architecture

| Couche | Chemin |
|--------|--------|
| Bootstrap | `src/index.ts`, `src/app.ts` |
| Routes | `src/routes/*.ts` (11 fichiers) |
| Repositories | `src/repositories/*.ts` (12 fichiers) |
| Middleware | `src/middleware/auth.ts`, `error-handler.ts` |
| Métier | `src/lib/workflow.ts`, `media-workflow.ts`, `file-storage.ts`, `serializers.ts` |
| Auth | Sessions cookie HttpOnly, bcrypt, rate-limit login |
| Build | `build.mjs` → `dist/index.mjs` (esbuild) |
| Stockage | Dossier `uploads/` à la racine (max 5 Mo) |

### Endpoints API (35 opérations)

Base : `/api` — Spec : `lib/api-spec/openapi.yaml` v0.6.0

| Domaine | Endpoints |
|---------|-----------|
| **Health** | `GET /healthz` |
| **Établissements (public)** | `GET /establishments`, `GET /establishments/{id}` |
| **Auth** | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| **App dashboard** | `GET /app/dashboard` |
| **App établissements** | `GET /app/establishments`, `GET /app/establishments/{id}` |
| **Activités** | `GET /activities`, `POST /activities`, `GET /activities/{id}` |
| **Demandes** | `GET /requests`, `POST /requests`, `GET /requests/{id}`, `POST /requests/{id}/transitions` |
| **Médias publics** | `GET /media-publications/public`, `GET /media-publications/public/{id}`, `GET /media-publications/files/{id}/download` |
| **Médias app** | `GET /media-publications`, `POST /media-publications`, `GET /media-publications/{id}`, `POST /media-publications/{id}/incident`, `POST /media-publications/{id}/transitions` |
| **Notifications** | `GET /notifications`, `POST /notifications/{id}/read` |
| **Statistiques** | `GET /statistics/public`, `GET /app/statistics`, `GET /app/reports`, `POST /app/reports/generate` |
| **Documents** | `GET /documents/public`, `GET /app/documents`, `POST /app/documents`, `GET /documents/{id}/download` |

La spec OpenAPI et l'implémentation serveur sont **alignées**.

---

## 7. Base de données — `@workspace/db`

**ORM :** Drizzle 0.45 + PostgreSQL (Neon)

### Schéma (`lib/db/src/schema/`)

| Domaine | Tables | Fichier |
|---------|--------|---------|
| Géographie | `regions`, `departments` | `geo.ts` |
| Administration | `drena`, `ddena`, `localities` | `directorates.ts` |
| Référentiel | `establishments` | `establishments.ts` |
| Auth / RBAC | `users`, `roles`, `permissions`, `role_permissions`, `user_roles` | `auth.ts` |
| Sessions | `sessions`, `login_events` | `sessions.ts` |
| Workflow | `activities`, `requests`, `request_status_history` | `workflow.ts` |
| Médias | `media_publications`, `media_publication_files`, `media_publication_status_history` | `media-publications.ts` |
| Documents | `documents`, `reports` | `documents.ts` |
| Communications | `notifications`, `conversations`, `messages`, `conversation_participants` | `comms.ts` |
| Audit | `audit_logs` | `audit.ts` |

### Enums (`enums.ts`)

`establishment_status`, `user_status`, `request_status`, `media_publication_status`, `media_type`, `directorate_kind`

### Migrations appliquées

| Fichier | Contenu |
|---------|---------|
| `0000_reflective_lila_cheney.sql` | Socle (géo, établissements, auth, workflow, docs, comms, audit) |
| `0001_auth_sessions.sql` | Sessions + login_events |
| `0002_media_publications.sql` | Publications média |
| `0003_media_publication_incidents.sql` | Incidents média — **fichier présent, non référencé dans `_journal.json`** |

---

## 8. Rôles et RBAC

### 7 profils utilisateurs (CDC §3 et §4.10)

| Code rôle | Label | Périmètre |
|-----------|-------|-----------|
| `dvs_director` | Directeur DVS | National — tous accès |
| `dvs_staff` | Collaborateur DVS | National — étendu |
| `drena_manager` | Responsable DREN | Régional |
| `school_head_primary` | Chef établissement primaire | Établissement |
| `school_head_secondary` | Chef établissement secondaire | Établissement |
| `education_officer` | Responsable éducatif | Établissement / encadrement |
| `external_partner` | Partenaire externe | Restreint |

Config frontend : `artifacts/education-portal/src/config/roles.ts`  
Config modules : `artifacts/education-portal/src/config/app-modules.ts`

### Workflow demandes d'autorisation

```
Établissement → soumet
DREN → analyse
DVS → valide ou rejette
Système → notification automatique
```

Implémenté côté API (`src/lib/workflow.ts`) et UI (`RequestDetailView`, transitions).

### Limites RBAC actuelles

- Périmètre basé sur **codes de rôle**, pas sur la table `permissions` / `role_permissions` (schéma présent, non seedé)
- Pas de CRUD utilisateurs via API
- Pas de 2FA (champ `two_factor_enabled` en schéma, marqué phase 2)

---

## 9. Packages partagés et codegen

### Pipeline OpenAPI → client

```
lib/api-spec/openapi.yaml
        │
        ▼  pnpm --filter @workspace/api-spec run codegen
        ├── lib/api-client-react/src/generated/  (hooks TanStack Query)
        └── lib/api-zod/src/generated/           (schémas Zod validation)
```

Le frontend consomme l'API via `@workspace/api-client-react` avec cookies session (`custom-fetch.ts`).

---

## 10. Scripts utilitaires

| Script | Commande | Rôle |
|--------|----------|------|
| Import établissements | `pnpm --filter @workspace/scripts run import:establishments` | Import Excel DRENA (9 colonnes) — voir `docs/PNIGVS_EXCEL_IMPORT.md` |
| Bootstrap auth | `pnpm --filter @workspace/scripts run bootstrap:auth` | Créer l'admin initial |
| Vérif UI | `node scripts/verify-app-ui.mjs` | Smoke test login + pages app |
| Demo users | `scripts/src/bootstrap-demo-users/index.ts` | Utilisateurs démo — **pas de script npm dédié** |

---

## 11. Documentation existante

| Fichier | Contenu | Statut |
|---------|---------|--------|
| `docs/PNIGVS_ETAT_ACTUEL.md` | **Ce document** — état réel août 2026 | ✅ À jour |
| `docs/PNIGVS_CURRENT_ARCHITECTURE.md` | Audit initial 19 août 2026 | ⚠️ Obsolète |
| `docs/PNIGVS_DATABASE.md` | Modèle entités, enums, index | ✅ Aligné schéma |
| `docs/PNIGVS_DESIGN_SYSTEM.md` | Tokens, palette, typo, RGAA | ✅ Référence design |
| `docs/PNIGVS_EXCEL_IMPORT.md` | Pipeline import Excel DRENA | ✅ Opérationnel |
| `replit.md` | Template run/operate | ⚠️ Peu rempli |

---

## 12. Ce qui fonctionne aujourd'hui

| Domaine | Détail |
|---------|--------|
| Portail public multi-pages | 13 routes + layout institutionnel PNIGVS |
| Référentiel établissements | API paginée + filtres + pages publiques/app + import Excel |
| Authentification | Login/logout/me, cookie HttpOnly, rate-limit, bootstrap admin |
| RBAC par rôle | 7 rôles, périmètre geo/établissement, guards frontend |
| Workflow demandes | CRUD + transitions Établissement → DREN → DVS |
| Activités scolaires | List / create / detail |
| Publications média | Workflow complet + galerie publique + signalement incident |
| Documents | Upload base64, download, filtres catégorie, pages publique/app |
| Statistiques & rapports | KPIs publics/app, génération rapports DVS |
| Notifications | API + dashboard + profil |
| Design system | Tokens PNIGVS + shadcn (55 composants UI) |
| Codegen API | OpenAPI → Zod + hooks React Query synchronisés |
| Stockage fichiers | Local `uploads/` (5 Mo max) |

---

## 13. Ce qui reste à faire

### Priorité haute (bloquant production)

| Élément | Statut actuel |
|---------|---------------|
| **Administration comptes** | UI documentation CDC — pas de CRUD utilisateurs API |
| **Journal audit (`audit_logs`)** | Table en schéma, aucune route — page admin réutilise activités |
| **Migration 0003** | Fichier SQL orphelin — à intégrer au journal Drizzle |
| **Tests automatisés** | Aucun test unitaire/intégration/E2E |

### Priorité moyenne (phase 2)

| Élément | Statut actuel |
|---------|---------------|
| **2FA** | Champ schéma, marqué « phase 2 » dans `admin-rules.ts` |
| **Réinit mot de passe / import masse comptes** | `status: 'planned'` dans `ACCOUNT_LIFECYCLE_RULES` |
| **Permissions granulaires** | Tables présentes, RBAC par code rôle seulement |
| **Messagerie** | Schéma `conversations`/`messages` — pas d'API ni UI |
| **Actualités / contact / recherche** | Contenu statique — pas de CMS |
| **Stockage cloud** | Fichiers locaux uniquement (pas S3/blob) |
| **Doc architecture** | `PNIGVS_CURRENT_ARCHITECTURE.md` à archiver ou mettre à jour |

### Dette technique

- `bootstrap-demo-users` : script présent, absent des scripts npm
- Commentaire obsolète dans `roles.ts` (« implémentation à venir » alors que RBAC est partiellement actif)
- `mockup-sandbox` : sandbox isolée, hors périmètre prod

---

## 14. Prochaines étapes suggérées

Ordre indicatif pour la suite du projet :

1. **Mettre à jour / archiver** `PNIGVS_CURRENT_ARCHITECTURE.md` (éviter la confusion)
2. **Régulariser migration 0003** dans le journal Drizzle
3. **Définir la prochaine priorité métier** parmi :
   - CRUD administration comptes (API + UI)
   - Journal audit opérationnel
   - Messagerie interne
   - CMS actualités
   - Tests automatisés (smoke E2E minimum)
4. **Valider le périmètre** avec le CDC avant d'implémenter la 2FA ou le stockage cloud

---

## 15. Références rapides

| Besoin | Fichier / commande |
|--------|-------------------|
| Routes frontend | `artifacts/education-portal/src/content/routes.ts` |
| Contrat API | `lib/api-spec/openapi.yaml` |
| Schéma DB | `lib/db/src/schema/` |
| Règles admin CDC | `artifacts/education-portal/src/config/admin-rules.ts` |
| Workflow demandes UI | `artifacts/education-portal/src/config/request-status-filters.ts` |
| Workflow médias UI | `artifacts/education-portal/src/config/media-publication-workflow-ui.ts` |
| Design tokens | `artifacts/education-portal/src/config/design-tokens.css` |
| Regénérer client API | `pnpm --filter @workspace/api-spec run codegen` |

---

*Document généré pour recadrage du projet — base de travail pour les prochaines itérations.*
