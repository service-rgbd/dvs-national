# PNIGVS — Import industriel des fichiers Excel

**Date :** 19 août 2026  
**Périmètre :** référentiel établissements DRENA → PostgreSQL  
**Script :** `scripts/src/import-establishments/`

---

## 1. Objectif

Pipeline fiable et traçable pour intégrer les fichiers Excel officiels des établissements scolaires dans PostgreSQL, **sans import direct non validé**.

```
Excel → lecture → validation → normalisation → doublons → rapport → staging (mémoire) → upsert PostgreSQL
```

---

## 2. Structure des fichiers Excel (DREN Abidjan 1)

Analyse confirmée sur 5 fichiers (pages 98–102) :

| Colonne Excel | Champ import | Règle |
|---------------|--------------|-------|
| Ordre d'enseignement | `teaching_order` | LAIC, CATHOLIQUE, ISLAMIQUE, METHODISTE, AUTRE_CONFESSION |
| N° | `list_number` | Entier |
| Localité | `locality.name` | Texte brut conservé |
| Code Étab. | `establishment_code` | **String 6 chiffres**, zéros préservés |
| Établissement | `name` | Obligatoire |
| Cycle autorisé | `authorized_cycle` | ex. `1`, `1 & 2` |
| Cycle reconnu | `recognized_cycle` | ex. `1`, `1 & 2` |
| E-mail | `email` | Optionnel, format validé (avertissement) |
| Contacts | `contacts` | Optionnel |

**Feuille :** `Page N - DREN Abidjan 1` → DRENA déduite du nom de feuille.

---

## 3. Commandes

```bash
# Simulation (aucune écriture)
pnpm --filter @workspace/scripts run import:establishments -- --dry-run \
  /chemin/DREN_ABIDJAN_1_Page_98.xlsx \
  /chemin/DREN_ABIDJAN_1_Page_99.xlsx

# Import réel (requiert DATABASE_URL dans .env racine)
pnpm --filter @workspace/scripts run import:establishments -- \
  /chemin/DREN_ABIDJAN_1_Page_*.xlsx

# Rapport JSON personnalisé
pnpm --filter @workspace/scripts run import:establishments -- \
  --report-dir=artifacts/import-reports \
  fichier.xlsx
```

---

## 4. Pipeline détaillé

### 4.1 Lecture (`read-excel.ts`)

- Librairie `xlsx`, lecture en **string** (`raw: false`)
- Vérification des **9 colonnes obligatoires**
- Normalisation code : padding 6 chiffres (`039688`, `000218`)
- Extraction DRENA depuis le nom de feuille

### 4.2 Validation (`validate.ts`)

| Code | Niveau | Description |
|------|--------|-------------|
| `MISSING_NAME` | error | Nom établissement absent |
| `MISSING_CODE` | error | Code absent |
| `INVALID_CODE_FORMAT` | error | Code ≠ 6 chiffres |
| `MISSING_LOCALITY` | error | Localité absente |
| `INVALID_LIST_NUMBER` | error | N° invalide |
| `MISSING_LIST_NUMBER` | warning | N° absent |
| `INVALID_EMAIL` | warning | E-mail suspect |
| `DUPLICATE_ESTABLISHMENT_CODE` | warning | Code partagé (non bloquant) |

**Règle :** toute erreur bloquante **interdit** l'écriture PostgreSQL.

### 4.3 Doublons

Le code **`000218`** est partagé par 2 établissements distincts :

- COLLEGE ANDRE MALRAUX COCODY RIVIERA
- COLLEGE LE PANTHEON WILLIAMSVILLE

**Politique :** les deux lignes sont **conservées**.  
Clé d'upsert : `(drena_id, establishment_code, name)`.

### 4.4 Upsert PostgreSQL (`persist.ts`)

Transaction unique par import :

1. Upsert `regions` (Abidjan → `ABIDJAN`)
2. Upsert `drena` (ex. `DREN_ABIDJAN_1`)
3. Upsert `localities` par `(drena_id, name)`
4. Upsert `establishments` par `(drena_id, code, name)`

**Idempotent :** réimport = mises à jour, pas de suppression massive.

---

## 5. Résultat du premier import (19 août 2026)

| Métrique | Valeur |
|----------|--------|
| Fichiers | 5 (pages 98–102) |
| Lignes lues | 140 |
| Valides | 140 |
| Erreurs | 0 |
| Avertissements | 3 |
| Codes dupliqués | 1 (`000218`) |
| Insérées | 140 |
| Région créée | ABIDJAN |
| DRENA créée | DREN Abidjan 1 |

Réimport partiel (2 fichiers) : **0 insert, 65 update** — upsert confirmé.

Rapports JSON : `artifacts/import-reports/import-*.json`

---

## 6. Limites connues

| Limite | Détail |
|--------|--------|
| Export partiel | N° 31–170 seulement ; pages 1–97 absentes |
| Autres DRENA | Non importées à ce stade |
| Départements | Non présents dans Excel — `department_id` null |
| Normalisation localités | 23 variantes brutes ; `normalized_name` = uppercase simple |
| Staging SQL | Staging en mémoire (pas de table `import_staging` yet) |

---

## 7. Sécurité

- Aucune donnée inventée pour combler les cellules vides
- `DATABASE_URL` dans `.env` (gitignored)
- Import transactionnel
- Aucune suppression d'établissements existants lors d'un réimport

---

## 8. Prochaine étape

**Étape 06 — API métier** : `GET /api/establishments` paginé + filtres, puis connexion page `/etablissements`.

---

*Document généré dans le cadre de l'Étape 05 — Import industriel Excel PNIGVS.*
