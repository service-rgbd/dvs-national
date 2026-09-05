# PNIGVS — Design System

**Version :** 1.0 (consolidation initiale)  
**Date :** 19 août 2026  
**Périmètre :** Web-first — portail public, Web App métier, dashboards futurs

---

## 1. Identité institutionnelle

| Élément | Valeur |
|---------|--------|
| République | République de Côte d'Ivoire |
| Devise | Union · Discipline · Travail |
| Ministère | Ministère de l'Éducation Nationale et de l'Alphabétisation (MENA) |
| Direction | Direction de la Vie Scolaire (DVS) |
| Plateforme | Plateforme Numérique Intégrée de Gestion de la Vie Scolaire (PNIGVS) |

---

## 2. Principes

1. **Tokens obligatoires** — toute couleur passe par `design-tokens.css` ; pas de hex arbitraire dans les composants.
2. **Double couche CSS** — portail institutionnel (`.education-page`) + shadcn/Tailwind pour la Web App.
3. **Accessibilité RGAA** — focus visible, contraste, navigation clavier, labels explicites.
4. **Web-first** — responsive mobile/tablette/desktop ; pas de composants natifs mobile.
5. **États explicites** — loading, empty, error, disabled documentés via tokens sémantiques.

---

## 3. Fichiers sources

| Fichier | Rôle |
|---------|------|
| `src/config/design-tokens.css` | Variables CSS `--pnigvs-*` (source de vérité visuelle) |
| `src/config/tokens.ts` | Miroir TypeScript pour usage programmatique |
| `src/index.css` | Styles portail + alias `--primary-color`, `--accent-color` |
| `src/components/ui/*` | shadcn/ui — composants dashboard/formulaires |
| `src/components/portal/*` | Composants portail public réutilisables |

---

## 4. Palette

### Couleurs institutionnelles

| Token | Valeur | Usage |
|-------|--------|-------|
| `--pnigvs-primary` | `#008751` | Vert DVS — titres, liens, CTA |
| `--pnigvs-primary-dark` | `#006b40` | Hover boutons primaires |
| `--pnigvs-accent` | `#F77F00` | Orange ivoirien — focus, tags, accents |
| `--pnigvs-accent-light` | `#FFF4E6` | Fond alertes/info |

### Neutres

| Token | Valeur | Usage |
|-------|--------|-------|
| `--pnigvs-ink` | `#1A1A1F` | Texte principal |
| `--pnigvs-muted` | `#5C5C66` | Texte secondaire |
| `--pnigvs-paper` | `#FBFAF7` | Fond page |
| `--pnigvs-surface` | `#FFFFFF` | Cartes, panneaux |
| `--pnigvs-border` | `#D9D9D4` | Bordures |

### Footer

| Token | Valeur |
|-------|--------|
| `--pnigvs-footer` | `#0D3D2B` |
| `--pnigvs-footer-text` | `#E8F5EC` |
| `--pnigvs-footer-muted` | `#C8E6D4` |

### États sémantiques

| Token | Usage |
|-------|-------|
| `--pnigvs-success` | Validation, succès |
| `--pnigvs-warning` | Avertissements |
| `--pnigvs-error` / `--pnigvs-error-bg` | Erreurs |
| `--pnigvs-info` / `--pnigvs-info-bg` | Informations |
| `--pnigvs-disabled` / `--pnigvs-disabled-bg` | Éléments inactifs |
| `--pnigvs-focus` | Outline focus clavier (= accent) |

---

## 5. Typographie

| Token | Police | Usage |
|-------|--------|-------|
| `--pnigvs-font-sans` | DM Sans | Corps, titres portail |
| `--pnigvs-font-mono` | Space Mono | Tags, eyebrow, codes |

Échelle : `--pnigvs-text-xs` à `--pnigvs-text-3xl`.

---

## 6. Espacements et layout

| Token | Valeur | Usage |
|-------|--------|-------|
| `--pnigvs-container-max` | 1240px | Largeur max conteneur |
| `--pnigvs-section-y` | 68px | Padding vertical sections |
| `--pnigvs-space-*` | 4px–48px | Grille d'espacement |

---

## 7. Élévations et rayons

| Token | Usage |
|-------|-------|
| `--pnigvs-shadow-sm` | Cartes portail |
| `--pnigvs-shadow-md` | Hero, modales |
| `--pnigvs-radius-sm/md/lg` | Coins arrondis |

---

## 8. Composants portail (`components/portal/`)

| Composant | Rôle |
|-----------|------|
| `PublicLayout` | Header, nav, footer, cookies, recherche |
| `PublicPage` | Coque page + SEO + breadcrumb |
| `PageShell` | Titre, fil d'Ariane, corps |
| `ArrowLink` | Lien CTA avec flèche |
| `Visual` | Illustrations CSS hero/people |
| `EmptyState` | État vide (API, contenu) |
| `InfoPanel` | Panneau informatif structuré |

### Classes CSS pages internes

- `.page-shell` — conteneur page
- `.breadcrumb` — fil d'Ariane
- `.empty-state` — état vide
- `.info-panel` — panneau info
- `.nav-link-active` — rubrique active dans la nav
- `.legal-button` — lien légal cookies (footer)

---

## 9. Composants shadcn/ui

55 composants disponibles dans `components/ui/`.  
Usage prévu pour la Web App métier (`/app`) : tableaux, formulaires, dialogs, sidebar, charts.

Les tokens Tailwind `:root` (HSL) sont alignés sur le vert `#008751` et l'orange accent.

---

## 10. Accessibilité

- **Focus** : `:focus-visible` avec `--pnigvs-focus` (orange, contraste élevé)
- **Skip links** : 4 liens d'évitement en tête de page
- **Cibles tactiles** : min-height 44px sur actions
- **ARIA** : uniquement quand nécessaire (menu modal, recherche, cookies)
- **Contraste** : texte `--pnigvs-ink` sur `--pnigvs-paper` ; footer clair sur fond sombre

---

## 11. Responsive

| Breakpoint | Comportement |
|------------|--------------|
| ≤ 800px | Menu mobile plein écran, grilles 1 colonne |
| 801–1050px | Navigation compacte |
| > 1050px | Layout desktop complet |

---

## 12. Règles pour les prochaines étapes

1. Ne pas introduire de couleurs hors tokens.
2. Réutiliser `EmptyState`, `InfoPanel`, `PublicPage` pour les nouvelles pages.
3. Dashboards métier : shadcn + tokens `--pnigvs-*` via alias Tailwind.
4. États loading/error : utiliser les tokens `--pnigvs-loading`, `--pnigvs-error`.
5. Ne pas supprimer les composants existants — étendre uniquement.

---

## 13. Vérification

```bash
pnpm run typecheck
PORT=26270 BASE_PATH=/ pnpm --filter @workspace/education-portal run build
```

---

*Document généré dans le cadre de l'Étape 02 — Consolidation du Design System PNIGVS.*
