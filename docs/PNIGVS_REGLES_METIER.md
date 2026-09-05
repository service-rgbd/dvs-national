# PNIGVS — Règles métier officielles

**Date :** 27 août 2026  
**Source :** Validation métier DVS + comparaison avec l'implémentation  
**Statut :** Document de référence pour le développement

---

## 1. Comptes utilisateurs

### Règle métier

Seuls les **directeurs ou fondateurs d'école** peuvent disposer d'un compte opérationnel établissement.

| Élément | Règle |
|---------|-------|
| Créateurs autorisés | Directeur / fondateur d'établissement (primaire ou secondaire) |
| Validation | Compte provisionné ou validé par la DVS |
| Profils exclus | Pas d'auto-inscription publique |
| Admin initial | Directeur DVS via bootstrap CLI (`PNIGVS_ADMIN_*`) |

### Implémentation cible

- Rôles : `school_head_primary`, `school_head_secondary`
- Le rôle `education_officer` (responsable éducatif) : **à confirmer** — hors périmètre « directeur/fondateur » si règle stricte
- Module admin comptes : CRUD API + UI (planifié)

---

## 2. Rattachement DRENA ↔ établissement

### Règle métier

L'association DRENA / établissement est définie dans les **fichiers Excel officiels** DRENA (9 colonnes, une feuille par DRENA).

### Implémentation

| Élément | Statut |
|---------|--------|
| Colonne `drena_id` sur `establishments` | ✅ En place |
| Import Excel (`import:establishments`) | ✅ En place |
| Documentation | `docs/PNIGVS_EXCEL_IMPORT.md`, `docs/PNIGVS_DATABASE.md` |

---

## 3. Permissions par rôle

### Règle métier (principe)

**Seule la DVS** modifie les paramètres système et prend les **décisions finales** d'autorisation.

| Action | Établissement | DRENA | DVS |
|--------|---------------|-------|-----|
| Créer activité / dossier brouillon | ✅ | ❌ | ❌ |
| Soumettre demande | ✅ | ❌ | ❌ |
| Instruire (analyse) | ❌ | ✅ | ✅ |
| Transmettre à la DVS | ❌ | ✅ | ✅ |
| **Renvoyer pour correction** | ❌ | ❌ | ✅ |
| **Rejeter définitivement** | ❌ | ❌ | ✅ |
| **Valider (autoriser)** | ❌ | ❌ | ✅ |
| **Révoquer activité validée** | ❌ | ❌ | ✅ |
| Resoumettre après correction | ✅ | ❌ | ❌ |
| Statistiques nationales | ❌ | ❌ | ✅ |
| Administration plateforme | ❌ | ❌ | ✅ |

---

## 4. Workflow « Voyage découverte » / sorties scolaires

### 4.1 Documents et étapes préalables (établissement)

Avant toute soumission à la DREN, l'établissement doit :

| # | Étape | Description |
|---|-------|-------------|
| 1 | Entretien Voyage Découverte | Consultation du **service Voyage Découverte** de la DVS |
| 2 | Formulaire DVS | Remplir le formulaire de demande d'autorisation au niveau DVS |

**Checklist obligatoire à la soumission** (cases à cocher dans le dossier).

### 4.2 Étapes de validation DVS (internes)

Avant décision favorable, la DVS vérifie :

| # | Contrôle | Responsable |
|---|----------|-------------|
| 1 | Prospection du lieu de la sortie | DVS |
| 2 | Vérification du TDR (Termes de référence) | DVS |
| 3 | Vérification du certificat de formation voyages scolaires (délivré **uniquement par la DVS**) | DVS |

Ces contrôles sont enregistrés dans le dossier avant validation.

### 4.3 Après autorisation DVS

| Niveau | Établissement | Autorisation complémentaire |
|--------|---------------|----------------------------|
| **Secondaire (collège)** | Cycle 2 | Autorisation auprès de la **DREN** |
| **Primaire** | Cycle 1 | Autorisation auprès de l'**inspection** |

Information affichée dans le dossier validé selon le cycle de l'établissement.

### 4.4 Renvoi pour correction

| Élément | Règle |
|---------|-------|
| Qui | DVS uniquement |
| Statut | `returned_for_correction` — « Renvoyé pour correction » |
| Orientation établissement | Se référer **uniquement au service Voyage Découverte** de la DVS |
| Resoumission | L'établissement corrige et resoumet |

### 4.5 Rejet définitif

| Élément | Règle |
|---------|-------|
| Qui | DVS uniquement |
| Statut | `rejected` — « Rejeté » |
| Conséquence | L'établissement intègre les remarques et se prépare pour la **rentrée prochaine** |
| Resoumission | **Interdite** pour la même activité (dossier clos pour l'année en cours) |

### 4.6 Annulation d'une activité validée

| Élément | Règle |
|---------|-------|
| Qui | DVS uniquement |
| Condition | Les conditions établies par la DVS ne sont **pas respectées** |
| Action | Révocation (`revoke`) — activité annulée avec motif obligatoire |

---

## 5. Statuts workflow demandes

```
draft
  └─ submit ──► submitted
                  └─ review ──► under_review
                                  └─ forward ──► forwarded
                                                  ├─ approve ──► approved
                                                  ├─ return_for_correction ──► returned_for_correction
                                                  │                              └─ resubmit ──► submitted
                                                  └─ reject ──► rejected (définitif)

approved ── revoke ──► cancelled (conditions non respectées)

draft | submitted ── cancel ──► cancelled (retrait établissement / DVS)
```

---

## 6. Statistiques

| Niveau | Qui | Contenu |
|--------|-----|---------|
| National | **DVS uniquement** | KPIs nationaux, rapports mensuels/annuels |
| Régional | DRENA (optionnel — à valider) | Périmètre DRENA |
| Public | Agrégats non sensibles | Nombre d'établissements actifs |

**Règle stricte validée :** les statistiques **nationales** sont réservées à la DVS.

---

## 7. Archives et médias

| Règle | Valeur |
|-------|--------|
| Conservation archives | **3 ans** |
| Durée maximale vidéos | **3 minutes** (pas une limite de taille fichier) |
| Photos | Formats JPEG, PNG, WebP, GIF |

---

## 8. Sujets à analyser ensemble

| Sujet | État | Notes |
|-------|------|-------|
| Système de sauvegarde | ⏳ À définir | DB Neon + fichiers `uploads/` — stratégie cloud à planifier |
| Réseau indisponible | ⏳ À définir | Pas de mode hors-ligne actuellement |
| Double authentification (2FA) | ⏳ À définir | Champ en base, non activé |
| SMS | ⏳ À définir | Aucun envoi SMS — notifications in-app seulement |

---

## 9. Notifications

### Règle métier

Une notification est envoyée lorsqu'une **activité est en cours** (suivi opérationnel).

### Événements implémentés / cibles

| Événement | Statut |
|-----------|--------|
| Soumission demande → DRENA | ✅ Implémenté |
| Transmission → DVS | ✅ Implémenté |
| Changement statut → créateur | ✅ Implémenté |
| Renvoi pour correction | ✅ Implémenté (v0.7) |
| Rejet définitif | ✅ Implémenté |
| Activité en cours (J-7, J-1, jour J) | ⏳ Planifié |
| SMS | ⏳ À définir |

---

## 10. Matrice d'écarts (référence implémentation)

| Règle | Avant v0.7 | Cible v0.7+ |
|-------|------------|-------------|
| Renvoi correction | ❌ Rejet seul | ✅ Statut + action dédiés |
| Rejet DVS seulement | ❌ DRENA pouvait rejeter | ✅ DVS seulement |
| Rejet = fin année | ❌ Nouvelle demande possible | ✅ Bloqué |
| Checklist voyage découverte | ❌ Absent | ✅ Checklist soumission |
| Contrôles DVS | ❌ Absent | ✅ Checklist validation |
| Révocation post-approbation | ❌ Absent | ✅ Action `revoke` |
| Création comptes directeurs | ❌ Absent | ✅ API + UI admin DVS |
| Stats nationales DVS | ⚠️ DRENA aussi | ✅ DVS uniquement |
| Vidéos 3 min | ❌ 50 Mo max | ✅ Durée max 180 s |
| Archives 3 ans | ❌ Permanent | ✅ Job au démarrage serveur |
| Notifications activité | ⚠️ Workflow seul | ✅ J-7, J-1, jour J |

---

## 11. Références code

| Fichier | Rôle |
|---------|------|
| `artifacts/api-server/src/lib/workflow.ts` | Transitions serveur |
| `artifacts/api-server/src/config/voyage-decouverte.ts` | Règles checklist |
| `artifacts/education-portal/src/config/voyage-decouverte-rules.ts` | Affichage UI |
| `artifacts/education-portal/src/config/admin-rules.ts` | Règles admin CDC |
| `lib/db/src/schema/workflow.ts` | Schéma demandes |
| `lib/api-spec/openapi.yaml` | Contrat API |

---

*Document vivant — mettre à jour à chaque validation métier.*
