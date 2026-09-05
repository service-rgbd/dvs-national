# PNIGVS — Modèle de données PostgreSQL

**Date :** 19 août 2026  
**ORM :** Drizzle ORM 0.45 + PostgreSQL (Neon)  
**Migration initiale :** `lib/db/drizzle/0000_reflective_lila_cheney.sql`

---

## 1. Objectif

Socle de données normalisé pour le référentiel national des établissements scolaires et les modules métier PNIGVS (auth, workflow, documents, statistiques).

**Stratégie :** schéma évolutif, clés étrangères, index de recherche, UUID internes, codes établissement en `varchar(6)` (zéros préservés).

---

## 2. Inspection pré-migration

| Vérification | Résultat |
|--------------|----------|
| Schéma Drizzle existant | **Vide** (`export {}`) |
| Tables PostgreSQL existantes | **Aucune** (base Neon vierge) |
| Données à préserver | **Aucune** |
| Migration destructive | **Non** — création initiale uniquement |

---

## 3. Entités géographiques et administratives

### `regions`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| code | varchar(32) | NOT NULL, UNIQUE |
| name | varchar(255) | NOT NULL |
| created_at / updated_at | timestamptz | NOT NULL |

### `departments`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| region_id | uuid | FK → regions, RESTRICT |
| code | varchar(32) | nullable |
| name | varchar(255) | NOT NULL |

**Index :** region_id, name, UNIQUE(region_id, code)

### `drena`

Directions Régionales de l'Éducation Nationale et de l'Alphabétisation.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| region_id | uuid | FK → regions |
| code | varchar(64) | NOT NULL — ex. `DREN_ABIDJAN_1` |
| name | varchar(255) | NOT NULL — ex. `DREN Abidjan 1` |

**Index :** UNIQUE(region_id, code), name

### `ddena`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| region_id | uuid | FK → regions |
| drena_id | uuid | FK → drena (nullable) |
| code | varchar(64) | NOT NULL |
| name | varchar(255) | NOT NULL |
| kind | enum | `drena` \| `ddena`, default `ddena` |

### `localities`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK |
| region_id | uuid | FK → regions |
| department_id | uuid | FK → departments (nullable) |
| drena_id | uuid | FK → drena |
| name | varchar(255) | Libellé brut Excel |
| normalized_name | varchar(255) | Normalisation import (étape 05) |

**Index :** name, normalized_name, drena_id

---

## 4. Établissements (`establishments`)

Aligné sur les **9 colonnes Excel** DRENA Abidjan 1 :

| Colonne Excel | Colonne SQL | Type |
|---------------|-------------|------|
| Ordre d'enseignement | teaching_order | varchar(50) |
| N° | list_number | integer |
| Localité | locality_id | uuid FK |
| Code Étab. | establishment_code | **varchar(6)** |
| Établissement | name | varchar(500) |
| Cycle autorisé | authorized_cycle | varchar(20) |
| Cycle reconnu | recognized_cycle | varchar(20) |
| E-mail | email | varchar(255) |
| Contacts | contacts | varchar(255) |

### Clés et relations

- **PK interne :** `id` (UUID) — identifiant canonique API
- **FK :** region_id, drena_id, ddena_id (opt.), department_id (opt.), locality_id
- **Statut :** enum `active` \| `inactive` \| `pending` \| `archived`
- **Traçabilité import :** source_file, source_sheet

### Règle doublon `000218`

Le code établissement **n'est PAS unique** globalement.

Deux établissements distincts partagent le code `000218` dans les fichiers analysés.  
L'API et l'annuaire doivent utiliser l'**UUID interne** comme identifiant canonique.

**Index :** establishment_code, name, drena_id, locality_id, cycles, composite (drena_id, establishment_code)

---

## 5. Valeurs Excel connues (DREN Abidjan 1)

| Champ | Valeurs observées |
|-------|------------------|
| teaching_order | LAIC, CATHOLIQUE, ISLAMIQUE, METHODISTE, AUTRE_CONFESSION |
| authorized_cycle | 1, 1 & 2 |
| recognized_cycle | 1, 1 & 2 |
| establishment_code | 6 caractères string (ex. `039688`, `000218`) |

---

## 6. Entités futures (schéma préparé, logique métier non implémentée)

| Table | Étape | Rôle |
|-------|-------|------|
| users, roles, permissions, role_permissions, user_roles | 08 | Auth + RBAC |
| activities, requests, request_status_history | 10 | Activités + workflow |
| notifications, conversations, messages, conversation_participants | 11 | Notifications + messagerie |
| documents, reports | 11 | Gestion documentaire + rapports |
| audit_logs | 12 | Journal d'audit |

---

## 7. Enums PostgreSQL

- `establishment_status` : active, inactive, pending, archived
- `user_status` : active, inactive, locked, pending_verification
- `request_status` : draft, submitted, under_review, forwarded, approved, rejected, cancelled, archived
- `directorate_kind` : drena, ddena

---

## 8. Fichiers source

```
lib/db/
├── drizzle.config.ts
├── drizzle/
│   └── 0000_reflective_lila_cheney.sql   ← migration SQL
└── src/
    ├── index.ts                           ← pool + drizzle client
    └── schema/
        ├── enums.ts
        ├── geo.ts                         ← regions, departments
        ├── directorates.ts                ← drena, ddena, localities
        ├── establishments.ts
        ├── auth.ts
        ├── workflow.ts
        ├── comms.ts
        ├── documents.ts
        ├── audit.ts
        ├── relations.ts
        └── index.ts
```

---

## 9. Commandes

```bash
# Générer une nouvelle migration après modification du schéma
pnpm --filter @workspace/db run generate

# Appliquer les migrations (requiert DATABASE_URL dans .env racine)
export $(grep -v '^#' .env | xargs)
pnpm --filter @workspace/db run migrate

# Alternative dev uniquement (sans fichier SQL)
pnpm --filter @workspace/db run push
```

⚠️ **Ne pas utiliser `push-force` en production.**

---

## 10. Sécurité

- `DATABASE_URL` **uniquement** dans `.env` local — jamais dans Git
- Ajouter `.env` au `.gitignore` avant tout commit public
- Migrations **non destructives** par défaut
- Suppression en cascade limitée aux tables de jointure (role_permissions, messages, etc.)
- RESTRICT sur les entités référentielles (regions, drena, establishments)

---

## 11. État de déploiement

| Action | Statut |
|--------|--------|
| Schéma Drizzle défini | ✅ |
| Migration SQL générée | ✅ |
| Migration appliquée sur Neon | ✅ (19 août 2026) |
| Données importées (DREN Abidjan 1) | ✅ 140 établissements |

Pour appliquer :

1. Renseigner `DATABASE_URL=postgresql://...` dans `.env` à la racine du monorepo
2. Exécuter `pnpm --filter @workspace/db run migrate`
3. Vérifier : `\dt` dans psql ou console Neon

---

## 12. Prochaine étape

**Étape 05 — Import industriel Excel** : pipeline staging → validation → upsert contrôlé vers `establishments`, `localities`, `drena`.

---

*Document généré dans le cadre de l'Étape 04 — Modèle de données PostgreSQL PNIGVS.*
