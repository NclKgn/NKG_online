# PhD Dashboard — Backlog de features

> **Repos :**
> - `NclKgn/NKG_online` — Site Astro 5 + GitHub Pages (dashboard, vitrine)
> - `PhD_Notebook` — App FastAPI + SQLite locale (saisie labo)
>
> **Scope :** Système intégré PhD = saisie labo (local) + dashboard (web)
> **Date :** 12 avril 2026
> **Statut :** Planification

---

## Architecture à deux repos

```
PhD_Notebook (local, quotidien)          NKG_online (GitHub Pages, partagé)
┌──────────────────────────┐              ┌──────────────────────────┐
│ FastAPI + SQLite + Alembic│   export    │ Astro 5 + YAML           │
│                           │────────────▶│                          │
│ SAISIE & CRUD             │  script     │ VISUALISATION & PARTAGE  │
│ • Samples / Litters       │  Python     │ • PhD Dashboard          │
│ • Expériences (CRUD)      │  (auto ou   │ • Mode présentation      │
│ • Protocoles ex vivo      │   manuel)   │ • Mode guest             │
│ • RNAscope / IF / LS      │             │ • Scoping review tracker │
│ • Réactifs / anticorps    │             │ • Figures / pipelines    │
│ • Quick log               │             │ • Timeline / PRISMA      │
│ localhost:8000             │             │ • Newsletter auto        │
└──────────────────────────┘              └──────────────────────────┘
         ▲                                            ▲
         │                                            │
   Saisie quotidienne                          Consultation / partage
   au labo (Nicolas)                           (directeur thèse, jury,
                                                collaborateurs via guest)
```

**Principe :** PhD_Notebook est la **source de vérité** pour les données
de labo. NKG_online est la **couche de présentation**. Le pont est un
script d'export `scripts/notebook-export.py` qui lit la base SQLite et
génère les fichiers YAML pour Astro.

**Tags dans le backlog :**
- 🔬 = PhD_Notebook (FastAPI)
- 🌐 = NKG_online (Astro)
- 🔗 = Bridge (script d'export)

---

## PhD_Notebook — État actuel

L'app locale existe déjà avec :

**Modèles (SQLAlchemy 2.0 + Alembic) :**
- `litters` — portées (code, date sacrifice, mère, notes)
- `samples` — échantillons (code, stade, génotype, sexe, portée, statut)
- `experiments` — expériences (code, type, titre, dates, statut, params JSON)
- `sample_experiments` — junction table (sample ↔ experiment, ordre pipeline)

**Enums :**
- Stades : E14.5, E16.5, P0, P1, P14, Autre
- Types expérience : Culture ex vivo, IF, RNAscope wholemount,
  Lightsheet, Analyse, RNAseq
- Statuts : Planifiée, En cours, Terminée, Abandonnée

**UI existante :**
- Module Échantillons complet (CRUD, filtres, stats, timeline)
- Design system propre (base.css)
- Templates Jinja2

**À construire :**
- Module Expériences (CRUD par type) — en cours (session 3)
- Modules supplémentaires (réactifs, protocoles, etc.)

---

## Légende

| Priorité | Signification |
|----------|---------------|
| P0 | Fondation — nécessaire avant tout le reste |
| P1 | Haute — valeur immédiate, à implémenter en premier |
| P2 | Moyenne — améliore significativement l'expérience |
| P3 | Basse — nice-to-have, à planifier plus tard |

| Complexité | Estimation |
|------------|-----------|
| S | < 1h — un fichier, modification simple |
| M | 1–3h — quelques fichiers, logique modérée |
| L | 3–8h — multi-fichiers, intégration, tests |
| XL | > 8h — système complet, pipeline, itérations |

---

## EPIC 0 — Bridge : PhD_Notebook → NKG_online 🔗

> Script d'export qui lit la base SQLite de PhD_Notebook et
> génère les fichiers YAML pour le site Astro. C'est le pont
> central entre les deux repos.

### 0.1 Script d'export `scripts/notebook-export.py`
- **Priorité :** P0 | **Complexité :** L
- **Repo :** 🌐 NKG_online (mais lit la DB de 🔬 PhD_Notebook)
- **Description :** Script Python qui se connecte à la base SQLite
  de PhD_Notebook et génère les fichiers YAML suivants :
  - `src/data/specimens.yaml` ← litters + samples
  - `src/data/experiments-live.yaml` ← expériences + statuts
  - `src/data/collecte.yaml` ← progression calculée par axe
  Le script est idempotent : il peut être relancé à tout moment.
- **Input :** Chemin vers `PhD_Notebook/data/notebook.db`
  (configurable via variable d'environnement ou argument CLI)
- **Output :** Fichiers YAML dans `src/data/`
- **Usage :**
  ```bash
  # Manuel
  python scripts/notebook-export.py --db ~/Code/PhD_Notebook/data/notebook.db

  # Ou avec variable d'env
  export NOTEBOOK_DB=~/Code/PhD_Notebook/data/notebook.db
  python scripts/notebook-export.py
  ```
- **Fichiers :** `scripts/notebook-export.py`
- **Dépendances :** `sqlalchemy`, `pyyaml`

### 0.2 Mapping des données exportées
- **Priorité :** P0 | **Complexité :** S
- **Description :** Documentation du mapping entre les tables
  SQLite et les fichiers YAML :
  ```
  PhD_Notebook (SQLite)          NKG_online (YAML)
  ─────────────────────          ──────────────────
  litters + samples         →    specimens.yaml
  experiments               →    experiments-live.yaml
  sample_experiments        →    (inclus dans les deux ci-dessus)
  Calcul par axe (bio/      →    collecte.yaml (progression %)
    bioméca/humain)
  experiments.params JSON   →    protocols-log.yaml (optionnel)
  ```
  Le schéma Zod correspondant doit être ajouté dans
  `content.config.ts` pour chaque nouveau fichier YAML.
- **Fichiers :** `docs/data-mapping.md`

### 0.3 GitHub Action notebook-sync
- **Priorité :** P2 | **Complexité :** M
- **Description :** Automatisation de l'export. Deux options :
  - **Option A (simple)** : script lancé manuellement avant un push,
    commit des YAML générés.
  - **Option B (avancé)** : PhD_Notebook pousse sa DB (ou un export
    JSON) vers un artifact GitHub / branche dédiée, et une Action
    dans NKG_online la récupère et régénère les YAML.
  Option A recommandée pour commencer.
- **Fichiers :** `.github/workflows/notebook-sync.yml` (si option B)

### 0.4 Export des modules futurs
- **Priorité :** P2 | **Complexité :** M
- **Description :** Au fur et à mesure que des modules sont ajoutés
  à PhD_Notebook (réactifs, protocoles versionnés, etc.), étendre
  le script d'export pour générer les YAML correspondants :
  ```
  reagents (table future)   →    reagents.yaml
  protocols (table future)  →    protocols.yaml (avec versions)
  pipelines (table future)  →    pipelines.yaml
  ```
- **Fichiers :** Extension de `scripts/notebook-export.py`

---

## Répartition des features par repo

> Chaque feature est taggée pour savoir où elle s'implémente.

| EPIC | Feature | 🔬 Notebook | 🔗 Bridge | 🌐 Site |
|------|---------|:-----------:|:---------:|:-------:|
| 0 | Export script | | ● | |
| 1 | Fondations dashboard | | | ● |
| 2 | Dashboard collecte | | ● calcul | ● visu |
| 3 | Tracker rédaction | | | ● |
| 4 | Scoping Review (Rayyan) | | ● fetch | ● visu |
| 5 | Timeline | | | ● |
| 6 | Expériences enrichies | | | ● lecture |
| 7 | Alertes | | | ● |
| 8 | i18n | | | ● |
| 9 | Accès 3 niveaux | | | ● |
| 10 | Mode présentation | | | ● |
| 11 | Newsletter auto | | ● compile | ● |
| 12 | Smoke tests | | | ● |
| 13 | Planificateur expériences | ● modèle | | ● UI planning |
| 14 | Tracker spécimens | ● CRUD existe | ● export | ● visu |
| 15 | Intégration Zotero | | ● fetch | ● visu |
| 16 | Productivité | ● quick log | | ● widgets |
| 17 | Versionning protocoles | ● modèle | ● export | ● affichage |
| 18 | Tracker pipelines | ● modèle | ● export | ● visu |
| 19 | Tracker figures | | | ● |
| 20 | Radar PubMed | | ● fetch | ● widget |
| 21 | FAIR / datasets | ● modèle | ● export | ● visu |
| 22 | Réactifs + soutenance | ● CRUD | ● export | ● visu + widget |

---

## EPIC 1 — Fondations du dashboard 🌐

> Remettre en place la structure de base du PhD Dashboard
> dans l'architecture Astro actuelle.

### 1.1 Page hub `/phd/dashboard`
- **Priorité :** P0 | **Complexité :** M
- **Description :** Page centrale du dashboard avec navigation vers
  les sous-sections (collecte, rédaction, scoping review, timeline).
  Breadcrumb, lien depuis `/phd/index.astro`.
- **Fichiers :** `src/pages/phd/dashboard.astro`
- **Statut :** ✅ Terminé (2026-04-12)

### 1.2 Données collecte — migration vers YAML 🌐🔗
- **Priorité :** P0 | **Complexité :** M
- **Description :** Créer `src/data/collecte.yaml` avec les 3 axes
  et 15 sous-parties. Deux sources possibles :
  - **Via PhD_Notebook** (recommandé) : le script bridge (EPIC 0.1)
    calcule la progression par axe à partir des expériences et
    spécimens dans la base SQLite.
  - **Manuel** : YAML édité à la main si PhD_Notebook pas encore prêt.
  L'ancien Excel `données_phd.xlsx` est perdu — on recrée les données.
- **Fichiers :** `src/data/collecte.yaml`, `scripts/migrate-excel.py`
- **Dépendances :** L'Excel original ou les données manuellement saisies
- **Notes :** L'Excel avait les colonnes : Partie, Sous-partie, Statut,
  %, Deadline, Notes. Les 3 parties : Biologie (Coloration, RNA-scope/IF,
  Light Sheet, Analyse LS rat), Biomécanique (Conception système,
  Validation, Culture ex vivo, Mesures morphocentriques, RNA-seq),
  Données Humaines (Acquisition, Contrôle & aplasie post-natal,
  Contrôle & aplasie anté-natal, Validation landmarks, Stats croissance,
  Caractérisation paternes fermeture).
- **Statut :** ✅ Terminé (2026-04-12) — recréé manuellement, Excel perdu

### 1.3 Collection Astro `collecte`
- **Priorité :** P0 | **Complexité :** S
- **Description :** Ajouter la collection YAML dans `content.config.ts`
  avec schéma Zod (partie, sous-partie, statut enum, value number,
  deadline date optional, notes string optional, color string optional).
- **Fichiers :** `src/content.config.ts`, `src/data/collecte.yaml`
- **Statut :** ✅ Terminé (2026-04-12)

---

## EPIC 2 — Dashboard collecte de données

> Réimplémentation du dashboard de suivi de collecte
> (équivalent amélioré de l'ancien `dashboard.html`).

### 2.1 Composant `CollecteDashboard.astro`
- **Priorité :** P1 | **Complexité :** L
- **Description :** Vue d'ensemble de la collecte avec :
  - Progression globale (barre + pourcentage)
  - Progression par axe (Biologie, Biomécanique, Données Humaines)
  - Progression par sous-partie avec statut coloré
  - Système de couleurs par axe (existant : bio=#6080a0,
    bioméca=#e07b2a, humain=#c0392b)
- **Design :** Cohérent avec le design system existant (tokens CSS,
  composant ProgressBar.astro existant, cards, etc.)
- **Fichiers :** `src/components/CollecteDashboard.astro`
- **Statut :** ✅ Terminé (2026-04-13)

### 2.2 Enrichissement du `phd-progress.yaml` existant
- **Priorité :** P1 | **Complexité :** S
- **Description :** Relier les valeurs du `phd-progress.yaml` existant
  (overall, biology, biomechanics, human-data) aux données calculées
  automatiquement depuis `collecte.yaml` plutôt qu'en dur.
- **Option :** Script de calcul ou logique dans le composant Astro.
- **Fichiers :** `src/data/phd-progress.yaml` (ou calcul dynamique)
- **Statut :** ✅ Terminé (2026-04-13) — calcul dynamique dans `phd/index.astro`

---

## EPIC 3 — Tracker de rédaction

> Suivi de l'avancement de la rédaction de thèse et des publications.

### 3.1 Données rédaction `src/data/thesis.yaml`
- **Priorité :** P1 | **Complexité :** S
- **Description :** Fichier YAML avec :
  - Chapitres de thèse (titre, statut, %, deadline)
  - Articles / publications (titre, journal cible, statut soumission)
  - Jalons administratifs (CSI, comité suivi, soutenance)
- **Fichiers :** `src/data/thesis.yaml`
- **Statut :** ✅ Terminé (2026-04-13) — clé unique `thesis-data` (contrainte file loader)

### 3.2 Composant `ThesisTracker.astro`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Visualisation de l'avancement de la rédaction :
  - Barre de progression par chapitre
  - Statut des publications (pipeline visuel horizontal)
  - Jalons (dot coloré : fait / à venir)
  - Pourcentage global de rédaction
- **Fichiers :** `src/components/ThesisTracker.astro`
- **Statut :** ✅ Terminé (2026-04-13)

### 3.3 Collection Astro `thesis`
- **Priorité :** P1 | **Complexité :** S
- **Description :** Enregistrer la collection dans `content.config.ts`.
- **Fichiers :** `src/content.config.ts`
- **Statut :** ✅ Terminé (2026-04-13)

---

## EPIC 4 — Scoping Review Tracker (Rayyan)

> Intégration des données Rayyan pour le suivi de la scoping review.

### 4.1 Script `scripts/rayyan-fetch.py`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Script Python qui collecte les données via le
  SDK Rayyan (`rayyan-sdk`) et génère `src/data/scoping-review.yaml`.
  Endpoints : `get`, `inclusion_counts`, `facets`, `articles`.
  Inclut les compteurs par reviewer.
- **Fichiers :** `scripts/rayyan-fetch.py`
- **Dépendances :** `rayyan-sdk`, `pyyaml`, tokens API Rayyan
- **Statut :** ✅ Prototype livré

### 4.2 Composant `ScopingDashboard.astro`
- **Priorité :** P1 | **Complexité :** L
- **Description :** Dashboard visuel : stats clés, progression
  screening, avancement par reviewer, flux PRISMA simplifié,
  vélocité hebdomadaire, sources.
- **Fichiers :** `src/components/ScopingDashboard.astro`
- **Statut :** ✅ Prototype livré

### 4.3 GitHub Action `rayyan-sync.yml`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Workflow GitHub Actions quotidien (7h Paris)
  qui exécute le script de collecte, commit le YAML si changé,
  déclenchant le rebuild Astro.
- **Secrets requis :** `RAYYAN_ACCESS_TOKEN`, `RAYYAN_REFRESH_TOKEN`
- **Variables :** `RAYYAN_REVIEW_ID`
- **Fichiers :** `.github/workflows/rayyan-sync.yml`
- **Statut :** ✅ Prototype livré

### 4.4 Diagramme PRISMA auto-généré (SVG/PDF)
- **Priorité :** P2 | **Complexité :** L
- **Description :** Générer un diagramme PRISMA publication-ready
  (SVG ou PDF) à partir des données Rayyan. Conforme aux guidelines
  PRISMA-ScR. Exportable pour la soumission de l'article.
- **Fichiers :** `scripts/generate-prisma.py`, output dans `public/`

### 4.5 Script de pré-dédoublonnage
- **Priorité :** P3 | **Complexité :** L
- **Description :** Script Python standalone qui prend des exports
  RIS/BibTeX de plusieurs bases (PubMed, Scopus, Embase), fait un
  matching DOI + PMID + fuzzy titre/auteur, et produit un fichier
  nettoyé prêt à importer dans Rayyan. Réutilisable pour d'autres reviews.
- **Fichiers :** `scripts/dedup-references.py`
- **Dépendances :** `rispy`, `fuzzywuzzy` ou `rapidfuzz`

---

## EPIC 5 — Timeline de thèse

> Vue chronologique des jalons passés et futurs.

### 5.1 Données timeline `src/data/timeline.yaml`
- **Priorité :** P2 | **Complexité :** S
- **Description :** Liste de jalons avec date, type, statut.
  Types : milestone, publication, experiment, committee.
- **Fichiers :** `src/data/timeline.yaml`
- **Statut :** ✅ Terminé (2026-04-13) — 14 entrées de oct 2023 à déc 2026

### 5.2 Composant `PhDTimeline.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Timeline verticale avec ligne continue, dots colorés
  par type, indicateur "Aujourd'hui" inséré dynamiquement entre le dernier
  passé et le premier futur. Entrées passées vs futures différenciées.
- **Fichiers :** `src/components/PhDTimeline.astro`
- **Note :** `<=` dans le template Astro parse mal — précalcul dans le frontmatter.
- **Statut :** ✅ Terminé (2026-04-13)

---

## EPIC 6 — Expériences enrichies

> Amélioration de la section expériences existante.

### 6.1 Composant `ExperimentCard.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Fiche expérience visuelle avec :
  - Badge de statut coloré (planned → ongoing → completed)
  - Date, titre, objectif (tronqué), hypothèse principale (tronquée)
  - Tags, `data-status` / `data-tags` pour les filtres JS
- **Fichiers :** `src/components/ExperimentCard.astro`
- **Statut :** ✅ Terminé (2026-04-13)

### 6.2 Vue galerie des expériences
- **Priorité :** P2 | **Complexité :** S
- **Description :** Refonte de `experiments/index.astro` :
  - Grille `auto-fill minmax(280px, 1fr)` de `ExperimentCard`
  - Filtres client-side par statut et par tag (boutons pill)
  - Élimination de la duplication GuestGate (prop `enabled` ajoutée)
  - Message "Aucune expérience" si filtres sans résultats
- **Fichiers :** `src/pages/phd/experiments/index.astro`, `src/components/GuestGate.astro`
- **Statut :** ✅ Terminé (2026-04-13)

---

## EPIC 7 — Alertes et notifications

> Système de suivi proactif pour l'équipe.

### 7.1 Alertes scoping review (GitHub Action)
- **Priorité :** P3 | **Complexité :** M
- **Description :** Dans `rayyan-sync.yml`, ajouter des conditions :
  - Si vélocité de screening < seuil → notification
  - Si conflits > seuil → notification
  - Si 100% screené → célébration
- **Canal :** Email (via GitHub notifications) ou Slack webhook
- **Fichiers :** `.github/workflows/rayyan-sync.yml` (extension)

---

## EPIC 8 — i18n et finitions

> Internationalisation et polish du dashboard.

### 8.1 Traductions dashboard
- **Priorité :** P2 | **Complexité :** S
- **Description :** Ajouter les clés FR/EN dans `src/i18n/` pour
  tous les nouveaux composants (dashboard, collecte, thesis, scoping,
  timeline, experiments).
- **Fichiers :** `src/i18n/en.ts`, `src/i18n/fr.ts`

### 8.2 Lien dashboard dans la navigation PhD
- **Priorité :** P0 | **Complexité :** S
- **Description :** Ajouter un lien vers `/phd/dashboard` dans
  `src/pages/phd/index.astro` et potentiellement dans la sous-nav
  de la section PhD.
- **Fichiers :** `src/pages/phd/index.astro`
- **Statut :** ✅ Terminé (2026-04-12)

### 8.3 Visibilité conditionnelle du dashboard
- **Remplacé par EPIC 9** (système d'accès 3 niveaux)

---

## EPIC 9 — Système d'accès à 3 niveaux

> Étendre le système de visibilité actuel (binaire) vers 3 niveaux :
> public, guest (invité) et private (dev uniquement).
> Permet de masquer individuellement chaque page et de partager
> certaines pages avec des invités (directeur de thèse, jury,
> collaborateurs) sans les rendre publiques.

### 9.1 Extension de `visibility.yaml` — format 3 niveaux
- **Priorité :** P0 | **Complexité :** S
- **Description :** Faire évoluer le format de `visibility.yaml`
  de booléen vers un enum à 3 valeurs, avec granularité par page.
  Rétrocompatible (true → public, false → private).
  ```yaml
  # Sections principales
  phd: public
  projects: public
  cv: public
  stack: public
  labs: public
  misc: public

  # Sous-pages PhD (granularité fine)
  phd/dashboard: guest
  phd/experiments: guest
  phd/lab: private
  phd/meetings: private
  phd/newsletter: public
  ```
- **Fichiers :** `src/data/visibility.yaml`
- **Statut :** ✅ Terminé (2026-04-12)

### 9.2 Refactor de `visibility.ts` — logique 3 niveaux
- **Priorité :** P0 | **Complexité :** M
- **Description :** Refactorer `src/lib/visibility.ts` pour gérer
  les 3 niveaux. Logique :
  - `public` → toujours visible, toujours buildé
  - `guest` → buildé en production, mais contenu protégé côté
    client (vérifie un cookie/sessionStorage)
  - `private` → visible uniquement en `astro dev`, PAS buildé
    en production (redirect vers /)
  Fonctions à exposer :
  - `getAccessLevel(key): 'public' | 'guest' | 'private'`
  - `isSectionVisible(key)` (rétrocompat — true si public ou guest)
  - `isGuestOnly(key): boolean`
  - `getVisibleSections()` (filtre les private en prod)
  - Gestion hiérarchique : `phd/dashboard` hérite de `phd` si
    pas de clé spécifique.
- **Fichiers :** `src/lib/visibility.ts`
- **Statut :** ✅ Terminé (2026-04-12)

### 9.3 Collection Astro — schema étendu
- **Priorité :** P0 | **Complexité :** S
- **Description :** Mettre à jour le schéma Zod de la collection
  `visibility` dans `content.config.ts` pour accepter les 3 valeurs.
  ```ts
  const visibility = defineCollection({
    loader: file('./src/data/visibility.yaml'),
    schema: z.union([
      z.boolean(),  // rétrocompat
      z.enum(['public', 'guest', 'private']),
    ]),
  });
  ```
- **Fichiers :** `src/content.config.ts`
- **Statut :** ✅ Terminé (2026-04-12)

### 9.4 Page de login invité `/guest`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Page minimaliste où le visiteur entre un code
  d'accès invité. Si correct, un flag est posé dans `sessionStorage`
  (ou cookie avec expiration). Design cohérent avec le site
  (Cormorant Garamond, accent #b05e3a).
  Le code invité est défini dans une variable d'environnement
  Astro (`PUBLIC_GUEST_CODE`) injectée au build.
- **Fichiers :** `src/pages/guest.astro`
- **UX :** Champ code + bouton → validation JS côté client →
  redirect vers la page demandée ou `/phd/dashboard`.
- **Statut :** ✅ Terminé (2026-04-12)

### 9.5 Composant `GuestGate.astro` — protection des pages guest
- **Priorité :** P1 | **Complexité :** M
- **Description :** Composant wrapper qui vérifie le flag invité
  côté client. Si absent, affiche un message + lien vers `/guest`.
  Utilisable dans n'importe quelle page :
  ```astro
  <GuestGate>
    <!-- contenu protégé -->
    <ScopingDashboard ... />
  </GuestGate>
  ```
  Le contenu HTML est présent dans le DOM (site statique) mais
  masqué par défaut et révélé par JS si authentifié. Pour les
  données sensibles, une approche avec `<template>` est plus sûre.
- **Fichiers :** `src/components/GuestGate.astro`
- **Sécurité :** Ce n'est PAS une vraie authentification — c'est
  un rideau côté client suffisant pour un site personnel/académique.
  Les données restent dans le HTML buildé. Si besoin de vraie
  protection, envisager Cloudflare Access ou Netlify Identity.
- **Statut :** ✅ Terminé (2026-04-12) — appliqué sur `phd/experiments`

### 9.6 Filtrage de la navigation
- **Priorité :** P1 | **Complexité :** S
- **Description :** Mettre à jour `Nav.astro` pour ne pas afficher
  les liens vers les pages `private` en production. Les pages
  `guest` restent dans la nav (le GuestGate gère l'accès).
  Optionnel : badge "invité" discret à côté des liens guest.
- **Fichiers :** `src/components/Nav.astro`
- **Statut :** ✅ Terminé (2026-04-12) — déjà assuré par `getVisibleSections()`, aucun changement nécessaire

### 9.7 Indicateur de mode invité
- **Priorité :** P2 | **Complexité :** S
- **Description :** Petit badge discret dans le header ou footer
  quand le visiteur est en mode invité, avec un lien pour se
  déconnecter (supprime le flag sessionStorage).
- **Fichiers :** `src/components/GuestBadge.astro`
- **Statut :** ✅ Terminé (2026-04-12) — intégré dans `BaseLayout.astro`

---

## EPIC 10 — Mode présentation du dashboard

> Transformer le dashboard en vue optimisée pour présentation
> lors des comités de suivi de thèse, réunions de labo, etc.
> Le directeur de thèse reçoit le lien guest, voit l'avancement
> en temps réel sans PowerPoint.

### 10.1 Toggle mode présentation
- **Priorité :** P1 | **Complexité :** M
- **Description :** Bouton dans `/phd/dashboard` qui bascule
  l'affichage en mode "présentation" :
  - Masque les éléments de navigation (Nav, footer)
  - Agrandit les composants visuels (progress bars, PRISMA)
  - Passe en plein écran (Fullscreen API)
  - Police plus grande, contraste renforcé
  - Optionnel : mode défilement auto (slideshow)
- **UX :** Un bouton discret "Présenter" (icône projecteur)
  en haut du dashboard. Touche Escape pour quitter.
- **Fichiers :** `src/components/PresentationToggle.astro`,
  styles dans `ScopingDashboard.astro` et `CollecteDashboard.astro`

### 10.2 URL directe mode présentation
- **Priorité :** P2 | **Complexité :** S
- **Description :** `/phd/dashboard?mode=presentation` active
  le mode automatiquement. Pratique pour partager un lien
  direct au directeur de thèse.
- **Fichiers :** `src/pages/phd/dashboard.astro` (lecture query param)

---

## EPIC 11 — Newsletter auto-générée

> Script qui compile automatiquement un brouillon de newsletter
> hebdomadaire à partir des activités de la semaine.

### 11.1 Script de compilation newsletter
- **Priorité :** P1 | **Complexité :** L
- **Description :** Script Python ou Node qui chaque vendredi :
  1. Parcourt les `lab-entries` de la semaine
  2. Collecte les expériences mises à jour (changement de statut)
  3. Récupère les deltas du dashboard (progression collecte,
     screening Rayyan)
  4. Compile un fichier Markdown dans `src/content/newsletter/`
     au format brouillon (`draft: true`)
  Le script génère le frontmatter + un squelette de contenu
  avec les sections à compléter.
- **Fichiers :** `scripts/generate-newsletter.py`
- **Output exemple :**
  ```markdown
  ---
  title: "Semaine 16 — 7-12 avril 2026"
  date: 2026-04-12
  summary: "RNA-scope en cours, screening 63%"
  tags: [biologie, scoping-review]
  draft: true
  ---
  ## Lab
  - RNA-scope synchondrose FGFR3 : statut → ongoing
  - 2 entrées de cahier de labo ajoutées

  ## Scoping Review
  - Screening : 1102/1735 (63.5%, +347 cette semaine)
  - 14 conflits à résoudre

  ## Rédaction
  - [aucun changement cette semaine]

  ## Notes
  [À compléter avant publication]
  ```

### 11.2 GitHub Action newsletter hebdo
- **Priorité :** P2 | **Complexité :** S
- **Description :** Workflow déclenché chaque vendredi 18h (Paris).
  Exécute le script, commit le brouillon, ouvre éventuellement
  une PR ou envoie une notification.
- **Fichiers :** `.github/workflows/newsletter-draft.yml`

### 11.3 Page "brouillons" dans le CMS
- **Priorité :** P3 | **Complexité :** S
- **Description :** Ajouter un filtre "brouillons" dans
  `/phd/newsletter` (visible en dev/guest uniquement) pour
  éditer et publier les newsletters auto-générées via Sveltia.
- **Fichiers :** `src/pages/phd/newsletter/index.astro`

---

## EPIC 12 — Smoke tests CI

> Vérifier automatiquement que le build est valide et que
> les règles d'accès sont respectées.

### 12.1 Smoke test post-build
- **Priorité :** P1 | **Complexité :** M
- **Description :** Script bash 15 checks post-build :
  - Pages publiques existent et ne redirigent pas
  - Pages privées (lab, meetings) redirigent vers /
  - Pages guest (experiments, dashboard) existent sans redirection
  - experiments contient `guest-protected` (GuestGate)
  - Sitemap exclut phd/dashboard, phd/experiments, phd/lab, phd/meetings
- **Notes :**
  - dist/ est à la racine (pas dist/NKG_online/) — le base path est pour les URLs, pas le dossier
  - Les pages private sont buildées en tant que redirects (Astro behavior), pas absentes
  - `((VAR++))` avec `set -e` sort si VAR=0 → utiliser `VAR=$((VAR + 1))`
- **Fichiers :** `scripts/smoke-test.sh`, `.github/workflows/deploy.yml`
- **Statut :** ✅ Terminé (2026-04-13) — 15/15 tests passés localement

### 12.2 Notification d'échec de deploy
- **Priorité :** P3 | **Complexité :** S
- **Description :** Si le build ou les smoke tests échouent,
  envoyer une notification Slack via webhook.
- **Fichiers :** `.github/workflows/deploy.yml` (step conditionnel)

---

## EPIC 13 — Planificateur d'expériences 🔬🌐

> Outil de planification rétro-chronologique pour les expériences
> de wet lab. L'utilisateur entre une date cible (ex: "RNA-scope
> le 15 mai"), l'outil calcule automatiquement toutes les dates
> en amont et en aval selon le protocole.
>
> **Architecture :** Le modèle de données des expériences existe
> déjà dans PhD_Notebook (table `experiments`, types enum, params
> JSON). Le planificateur est une UI sur le site Astro (🌐) qui,
> à la création, génère l'expérience dans PhD_Notebook (🔬) via
> le bridge ou un export Markdown.

### 13.1 Données protocoles `src/data/protocols.yaml` 🌐
- **Priorité :** P1 | **Complexité :** M
- **Description :** Définition des protocoles avec leurs étapes
  et délais relatifs. Utilisé par l'UI du planificateur (Astro).
  À terme, pourra aussi être stocké dans PhD_Notebook comme
  table dédiée (EPIC 17).
  Chaque protocole est une séquence d'étapes
  avec un offset en jours par rapport à une date pivot.
  ```yaml
  rna-scope:
    name: "RNA-scope"
    pivot: "jour-sacrifice"
    steps:
      - id: accouplement
        label: "Accouplement / Plug"
        offset: -18.5  # E0 = 18.5j avant sacrifice (pour E18.5)
        notes: "Vérifier le plug le matin"
      - id: plug-check
        label: "Vérification plug"
        offset: -18    # Lendemain matin
      - id: sacrifice
        label: "Sacrifice + prélèvement"
        offset: 0
        duration: 1
        notes: "Fixation PFA 4% immédiate"
      - id: fixation
        label: "Fixation (PFA 4%)"
        offset: 0
        duration: 1
        notes: "24h à 4°C"
      - id: dehydratation
        label: "Déshydratation + inclusion"
        offset: 1
        duration: 2
      - id: coupes
        label: "Coupes au microtome"
        offset: 3
        duration: 1
      - id: rnascope-j1
        label: "RNA-scope Jour 1 — Hybridation"
        offset: 4
        duration: 1
        notes: "Sondes à préparer la veille"
      - id: rnascope-j2
        label: "RNA-scope Jour 2 — Amplification"
        offset: 5
        duration: 1
      - id: rnascope-j3
        label: "RNA-scope Jour 3 — Révélation"
        offset: 6
        duration: 1
      - id: imagerie
        label: "Imagerie"
        offset: 7
        duration: 2
        notes: "Microscopie confocale ou épifluorescence"

  immunofluorescence:
    name: "Immunofluorescence"
    pivot: "jour-sacrifice"
    steps:
      - id: accouplement
        label: "Accouplement / Plug"
        offset: -18.5
      - id: sacrifice
        label: "Sacrifice + prélèvement"
        offset: 0
      - id: fixation
        label: "Fixation + cryo-inclusion"
        offset: 0
        duration: 2
      - id: coupes
        label: "Coupes au cryostat"
        offset: 2
        duration: 1
      - id: if-staining
        label: "IF — Blocage + Ac primaire"
        offset: 3
        duration: 1
        notes: "Overnight 4°C"
      - id: if-secondary
        label: "IF — Ac secondaire + montage"
        offset: 4
        duration: 1
      - id: imagerie
        label: "Imagerie"
        offset: 5
        duration: 2

  light-sheet:
    name: "Light Sheet"
    pivot: "jour-sacrifice"
    steps:
      - id: accouplement
        label: "Accouplement / Plug"
        offset: -18.5
      - id: sacrifice
        label: "Sacrifice + prélèvement"
        offset: 0
      - id: fixation
        label: "Fixation PFA"
        offset: 0
        duration: 1
      - id: clearing
        label: "Clearing (iDISCO / CUBIC)"
        offset: 1
        duration: 7
        notes: "Protocole variable selon méthode"
      - id: immunomarquage
        label: "Immunomarquage whole-mount"
        offset: 8
        duration: 5
      - id: clearing-final
        label: "Clearing final + montage"
        offset: 13
        duration: 2
      - id: acquisition
        label: "Acquisition Light Sheet"
        offset: 15
        duration: 3
        notes: "Réserver le microscope à l'avance"
      - id: analyse
        label: "Analyse 3D (Imaris / napari)"
        offset: 18
        duration: 5

  culture-ex-vivo:
    name: "Culture ex vivo"
    pivot: "jour-sacrifice"
    steps:
      - id: accouplement
        label: "Accouplement / Plug"
        offset: -18.5
      - id: sacrifice
        label: "Sacrifice + dissection"
        offset: 0
        duration: 1
        notes: "Conditions stériles obligatoires"
      - id: mise-en-culture
        label: "Mise en culture"
        offset: 0
        duration: 1
      - id: stimulation
        label: "Stimulation mécanique"
        offset: 1
        duration: 3
        notes: "Selon protocole bioréacteur"
      - id: arret
        label: "Arrêt culture + fixation"
        offset: 4
      - id: analyse
        label: "Analyse (histo / RNA)"
        offset: 5
        duration: 3
  ```
- **Fichiers :** `src/data/protocols.yaml`
- **Notes :** Les offsets sont en jours. Les valeurs décimales
  (ex: -18.5) permettent de gérer les stades embryonnaires.
  Les durées sont optionnelles (défaut = 0, ponctuel).
  Nicolas devra valider et ajuster ces délais selon ses protocoles réels.

### 13.2 Composant `ExperimentPlanner.astro`
- **Priorité :** P1 | **Complexité :** L
- **Description :** Interface interactive (client-side JS) :
  1. L'utilisateur choisit un protocole (dropdown)
  2. Entre une date cible (pivot) + stade embryonnaire souhaité
  3. L'outil calcule toutes les dates automatiquement
  4. Affiche un calendrier/timeline avec toutes les étapes
  5. Surligne les conflits avec d'autres expériences planifiées
  6. Bouton "Créer l'expérience" → génère le fichier Markdown
- **UX :** Formulaire en haut, timeline générée en dessous.
  Les étapes passées sont grisées, les prochaines surlignées.
- **Fichiers :** `src/components/ExperimentPlanner.astro`
- **Page :** `src/pages/phd/planner.astro` (guest)

### 13.3 Paramétrage des stades embryonnaires
- **Priorité :** P1 | **Complexité :** S
- **Description :** Ajout d'un sélecteur de stade (E14.5, E16.5,
  E18.5, P0, P3, P7, adulte) qui ajuste automatiquement les
  offsets d'accouplement. Ex: E14.5 → accouplement 14.5j avant
  le sacrifice au lieu de 18.5j.
- **Données :** Intégré dans `protocols.yaml` :
  ```yaml
  stages:
    E14.5: { gestation_days: 14.5 }
    E16.5: { gestation_days: 16.5 }
    E18.5: { gestation_days: 18.5 }
    P0:    { gestation_days: 19, postnatal: 0 }
    P3:    { gestation_days: 19, postnatal: 3 }
    P7:    { gestation_days: 19, postnatal: 7 }
    adulte: { gestation_days: null }
  ```

### 13.4 Création d'expérience depuis le planificateur
- **Priorité :** P1 | **Complexité :** L
- **Description :** Bouton "Créer l'expérience" dans le
  planificateur qui :
  1. Génère un fichier Markdown dans `src/content/experiments/`
     avec le frontmatter pré-rempli (titre, date, statut=planned,
     tags, protocole, hypothèses à compléter)
  2. Pré-remplit la section `protocol` avec les étapes et dates
  3. Pré-remplit `vigilance_points` depuis les `notes` du protocole
  4. Lie l'expérience aux spécimens du tracker (EPIC 14) si dispo
- **Implémentation :** Côté client, génère le Markdown et
  propose un téléchargement. Alternative : via l'API Sveltia CMS
  ou un push Git (GitHub Action).
- **Fichiers :** Logique dans `ExperimentPlanner.astro`,
  template dans `templates/blocks/`

### 13.5 Intégration calendrier iCal
- **Priorité :** P3 | **Complexité :** M
- **Description :** Export des dates planifiées en format iCal
  (.ics) pour import dans Google Calendar / Apple Calendar.
  Un clic = toutes les étapes dans ton agenda.
- **Fichiers :** Logique dans `ExperimentPlanner.astro`

---

## EPIC 14 — Tracker de spécimens / souris 🔬🔗🌐

> Suivi des accouplements, portées, génotypages et disponibilité
> des animaux. Connecté au planificateur d'expériences.
>
> **Architecture :** Le CRUD des samples et litters **existe déjà**
> dans PhD_Notebook (tables `samples`, `litters`, avec filtres,
> stats, et timeline). Pas besoin de recréer le modèle.
> Le bridge (EPIC 0.1) exporte vers `specimens.yaml` pour la
> visualisation sur le site Astro.

### 14.1 Données spécimens `src/data/specimens.yaml` 🔗🌐
- **Priorité :** P2 | **Complexité :** M → S (grâce au bridge)
- **Description :** Généré automatiquement par le script d'export
  (EPIC 0.1) depuis la base SQLite de PhD_Notebook. Le YAML
  reflète l'état actuel des accouplements et portées.
  ```yaml
  matings:
    - id: M2026-042
      male: "FGFR3-Y367C/+ #12"
      female: "WT C57BL/6 #8"
      plug_date: "2026-04-10"
      expected_birth: "2026-04-29"
      genotype_expected: "50% HET / 50% WT"
      status: "en gestation"  # plug / en gestation / née / sevrée / terminée
      pups: []

    - id: M2026-038
      male: "WT C57BL/6 #5"
      female: "WT C57BL/6 #3"
      plug_date: "2026-04-01"
      expected_birth: "2026-04-20"
      status: "en gestation"
      pups:
        - id: P2026-038-01
          sex: "M"
          genotype: "pending"
          allocated_to: null  # → ID expérience

  # Stock disponible
  stock:
    - id: S-WT-01
      strain: "C57BL/6"
      sex: "F"
      dob: "2026-02-15"
      genotype: "WT"
      available: true
  ```
- **Fichiers :** `src/data/specimens.yaml`

### 14.2 Composant `SpecimenTracker.astro`
- **Priorité :** P2 | **Complexité :** L
- **Description :** Vue dans le dashboard :
  - Accouplements en cours avec dates attendues
  - Portées à génotyper
  - Stock disponible par souche/génotype
  - Animaux alloués à des expériences (lien vers EPIC 13)
- **Page :** Section dans `/phd/dashboard` ou page dédiée
  `/phd/specimens` (guest)
- **Fichiers :** `src/components/SpecimenTracker.astro`

### 14.3 Lien planificateur → tracker
- **Priorité :** P2 | **Complexité :** M
- **Description :** Le planificateur d'expériences (EPIC 13)
  interroge le tracker de spécimens :
  - "Y a-t-il des animaux disponibles au bon stade pour cette date ?"
  - Suggère des accouplements à planifier si rien n'est dispo
  - Alloue automatiquement les animaux quand l'expérience est créée
- **Fichiers :** Logique partagée entre `ExperimentPlanner.astro`
  et `specimens.yaml`

### 14.4 Alertes spécimens
- **Priorité :** P3 | **Complexité :** S
- **Description :** Sur le dashboard, afficher des alertes :
  - Portée attendue dans < 3 jours
  - Génotypage en retard (> 7j après naissance)
  - Stock faible pour une souche

---

## EPIC 15 — Intégration Zotero

> Synchronisation de la bibliographie Zotero avec le site.

### 15.1 Export Zotero → YAML
- **Priorité :** P2 | **Complexité :** M
- **Description :** Script qui exporte une collection Zotero
  (via l'API Zotero ou un export CSL-JSON) et génère
  `src/data/bibliography.yaml` avec les publications en cours,
  les lectures clés, et les références du PhD.
- **Fichiers :** `scripts/zotero-sync.py`,
  `src/data/bibliography.yaml`
- **Dépendances :** `pyzotero` (Python SDK Zotero)

### 15.2 Composant bibliographie
- **Priorité :** P3 | **Complexité :** M
- **Description :** Affichage de la bibliographie sur le site :
  section dans `/phd` ou page dédiée. Filtrable par tag,
  groupée par catégorie (mes publications / lectures clés /
  références thèse).
- **Fichiers :** `src/components/Bibliography.astro`

### 15.3 GitHub Action Zotero sync
- **Priorité :** P3 | **Complexité :** S
- **Description :** Sync hebdomadaire, similaire à rayyan-sync.
- **Fichiers :** `.github/workflows/zotero-sync.yml`

---

## EPIC 16 — Productivité et outils

> Fonctionnalités transverses qui améliorent le workflow quotidien.

### 16.1 Vue "Blocages" sur le dashboard
- **Priorité :** P2 | **Complexité :** M
- **Description :** Encart en haut du dashboard qui agrège
  automatiquement tous les points bloquants :
  - Expériences en attente de matériel/animaux
  - Conflits Rayyan non résolus
  - Deadlines < 7 jours
  - Génotypages en retard
  - Chapitres de thèse en retard sur la deadline
  Lit les données de collecte, scoping, specimens, thesis.
- **Fichiers :** `src/components/BlockersWidget.astro`

### 16.2 Actions items des réunions → dashboard
- **Priorité :** P2 | **Complexité :** M
- **Description :** Les champs `actions` des notes de réunion
  (`src/content/meetings/`) remontent automatiquement sur le
  dashboard comme une todo list. Quand une action est cochée
  (champ `done: true` dans le YAML), elle disparaît.
- **Fichiers :** `src/components/ActionItems.astro`,
  mise à jour du schéma meetings dans `content.config.ts`

### 16.3 Export PDF du dashboard
- **Priorité :** P2 | **Complexité :** M
- **Description :** Bouton "Exporter PDF" qui génère un snapshot
  du dashboard actuel. Utilise `html2canvas` + `jsPDF` côté
  client. Utile pour les rapports administratifs (CSI, etc.).
- **Fichiers :** Logique dans `src/pages/phd/dashboard.astro`
- **Dépendances :** CDN `html2canvas` + `jsPDF`

### 16.4 Quick log mobile `/phd/quicklog`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Page ultra-simplifiée (guest) avec un
  formulaire minimal pour saisir une observation depuis le
  téléphone au labo : date, titre, tags (checkboxes), notes
  (textarea). Génère un fichier Markdown téléchargeable ou
  l'envoie via l'API Sveltia CMS / GitHub.
- **UX :** Gros boutons, peu de texte, optimisé tactile.
  Accessible via QR code affiché au labo.
- **Fichiers :** `src/pages/phd/quicklog.astro`

### 16.5 Vue calendrier des expériences
- **Priorité :** P3 | **Complexité :** L
- **Description :** Page `/phd/calendar` (guest) affichant
  toutes les expériences planifiées/en cours sur une vue
  calendrier mensuelle. Visualiser les chevauchements, les
  semaines chargées, les créneaux libres.
  Lit les données de `experiments` + `specimens` + `protocols`.
- **Fichiers :** `src/pages/phd/calendar.astro`,
  `src/components/ExperimentCalendar.astro`

### 16.6 Notification Slack échec de deploy
- **Priorité :** P3 | **Complexité :** S
- **Description :** Step conditionnel dans `deploy.yml` —
  si le build ou les smoke tests échouent, envoyer un message
  Slack via webhook.
- **Fichiers :** `.github/workflows/deploy.yml`

---

## EPIC 17 — Versionning de protocoles 🔬🔗🌐

> Chaque protocole évolue au fil de la thèse. Tracer les
> modifications, les raisons, et lier chaque expérience à la
> version exacte du protocole utilisé. Critique pour la
> reproductibilité et la rédaction du Matériel & Méthodes.
>
> **Architecture :** À terme, les protocoles et versions seront
> stockés dans PhD_Notebook (nouvelle table `protocols`). Pour
> commencer, le YAML dans NKG_online est suffisant — le bridge
> prendra le relais quand la table existera.

### 17.1 Système de versions dans `protocols.yaml`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Ajouter un champ `versions` à chaque protocole :
  ```yaml
  rna-scope:
    name: "RNA-scope"
    current_version: "v3"
    versions:
      - version: "v1"
        date: "2024-03-01"
        changes: "Protocole initial ACD RNAscope Multiplex"
      - version: "v2"
        date: "2025-06-15"
        changes: "Passage à la fixation 24h au lieu de 48h"
        reason: "Meilleure préservation des ARN longs"
      - version: "v3"
        date: "2026-02-10"
        changes: "Ajout étape protéase IV pour tissu calcifié"
        reason: "Adaptation aux synchondroses minéralisées"
    steps:
      # ... (version courante)
  ```
  Le planificateur (EPIC 13) attache automatiquement la
  `current_version` à chaque nouvelle expérience créée.
- **Fichiers :** `src/data/protocols.yaml`

### 17.2 Affichage changelog protocoles
- **Priorité :** P2 | **Complexité :** S
- **Description :** Dans le planificateur ou une page dédiée
  `/phd/protocols`, afficher l'historique des versions par
  protocole avec date et raison du changement.
- **Fichiers :** `src/components/ProtocolChangelog.astro`
  ou section dans `ExperimentPlanner.astro`

### 17.3 Lien expérience → version protocole
- **Priorité :** P1 | **Complexité :** S
- **Description :** Ajouter `protocol_version` dans le schéma
  des expériences (`content.config.ts`). Pré-rempli à la
  création (EPIC 13.4). Affiché dans la fiche expérience.
  ```ts
  protocol_name: z.string().optional(),
  protocol_version: z.string().optional(),
  ```
- **Fichiers :** `src/content.config.ts`, templates expériences

---

## EPIC 18 — Tracker de pipelines d'analyse 🔬🔗🌐

> Suivi de l'état des analyses bioinformatiques et morphométriques.
> Quel dataset est passé par quel pipeline, à quel stade.
>
> **Architecture :** Les pipelines d'analyse pourraient devenir
> un module de PhD_Notebook (nouvelle table `pipelines`) avec
> export via bridge. En attendant, YAML dans NKG_online est ok.

### 18.1 Données pipelines `src/data/pipelines.yaml`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Base de données des analyses en cours :
  ```yaml
  pipelines:
    - id: rnaseq-batch1
      name: "RNA-seq Batch 1 — FGFR3 vs WT"
      type: "rna-seq"
      experiment: "2026-04-10-exemple-synchondrose-fgfr3"
      status: "aligné"  # raw → QC → aligné → analysé → interprété
      steps:
        - name: "Données brutes"
          status: done
          date: "2026-03-20"
          location: "/data/rnaseq/batch1/raw"
        - name: "QC (FastQC + MultiQC)"
          status: done
          date: "2026-03-22"
        - name: "Alignement (STAR)"
          status: done
          date: "2026-03-25"
        - name: "Comptage (featureCounts)"
          status: in_progress
        - name: "Analyse DE (DESeq2)"
          status: pending
        - name: "Interprétation + figures"
          status: pending
          linked_figures: ["fig-volcano-fgfr3", "fig-heatmap-top50"]

    - id: morpho-achondro-cohort
      name: "Morphométrie — Cohorte achondroplasie"
      type: "morphometrics"
      status: "QC"
      steps:
        - name: "Landmarks digitalisés"
          status: done
        - name: "QC inter-observateur"
          status: in_progress
        - name: "Analyse Procrustes (GPA)"
          status: pending
        - name: "Stats (PCA, CVA, ANOVA)"
          status: pending
  ```
- **Fichiers :** `src/data/pipelines.yaml`

### 18.2 Composant `PipelineTracker.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Vue dans le dashboard : pipeline horizontal
  par analyse avec bulles de statut (done ✓ / in_progress ◉ /
  pending ○). Lien vers l'expérience et les figures associées.
- **Fichiers :** `src/components/PipelineTracker.astro`

### 18.3 Lien pipeline → figures → expériences
- **Priorité :** P2 | **Complexité :** S
- **Description :** Chaque step de pipeline peut référencer
  des figures (EPIC 19) et des expériences, créant un réseau
  de traçabilité : expérience → données → pipeline → figure → chapitre.
- **Fichiers :** Logique dans les composants concernés

---

## EPIC 19 — Tracker de figures

> Suivi de l'état de chaque figure de thèse / article.
> Quand une expérience produit de nouvelles données, les figures
> liées sont automatiquement flaggées "à mettre à jour".

### 19.1 Données figures `src/data/figures.yaml`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Registre de toutes les figures :
  ```yaml
  figures:
    - id: fig-volcano-fgfr3
      title: "Volcano plot — DE genes FGFR3 vs WT"
      target: "article-1"       # article ou chapitre
      chapter: "Résultats Biologie"
      status: "finalisée"       # brouillon / finalisée / à refaire
      source_experiment: "2026-04-10-exemple-synchondrose-fgfr3"
      source_pipeline: "rnaseq-batch1"
      last_updated: "2026-04-05"
      file: "figures/fig-volcano-fgfr3.pdf"
      notes: ""

    - id: fig-prisma-scoping
      title: "PRISMA flow diagram"
      target: "article-2"
      chapter: "Scoping Review"
      status: "à refaire"
      auto_generated: true  # → lié à EPIC 4.4
      notes: "Se met à jour automatiquement avec les données Rayyan"

    - id: fig-growth-curves
      title: "Courbes de croissance synchondroses"
      target: "thesis"
      chapter: "Résultats Données Humaines"
      status: "brouillon"
      source_pipeline: "morpho-achondro-cohort"
  ```
- **Fichiers :** `src/data/figures.yaml`

### 19.2 Composant `FigureTracker.astro`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Vue dans le dashboard :
  - Grille de figures groupées par chapitre/article
  - Badge de statut coloré (brouillon 🟡 / finalisée 🟢 / à refaire 🔴)
  - Nombre de figures par statut
  - Lien vers l'expérience et le pipeline source
- **Fichiers :** `src/components/FigureTracker.astro`

### 19.3 Détection automatique "à refaire"
- **Priorité :** P2 | **Complexité :** M
- **Description :** Quand une expérience liée à une figure
  change de statut (nouvelles données), ou quand un pipeline
  progresse au-delà de l'étape "interprétation", les figures
  associées passent automatiquement en "à refaire".
  Implémentation : logique dans le composant qui compare
  `last_updated` de la figure avec les dates de mise à jour
  des expériences/pipelines liés.
- **Fichiers :** Logique dans `FigureTracker.astro`

---

## EPIC 20 — Radar littérature PubMed

> Surveillance automatique des nouvelles publications sur
> les mots-clés du projet. Widget sur le dashboard.

### 20.1 Script de veille PubMed
- **Priorité :** P2 | **Complexité :** M
- **Description :** Script Python qui interroge l'API PubMed
  (via le MCP PubMed connecté ou l'API E-utilities) avec des
  requêtes prédéfinies :
  - `"skull base synchondrosis" OR "spheno-occipital synchondrosis"`
  - `"achondroplasia" AND "craniofacial"`
  - `"FGFR3" AND ("growth plate" OR "synchondrosis")`
  Filtre les publications de la dernière semaine, génère
  `src/data/pubmed-alerts.yaml`.
- **Fichiers :** `scripts/pubmed-radar.py`,
  `src/data/pubmed-alerts.yaml`
- **Dépendances :** `biopython` ou API E-utilities directe

### 20.2 Widget radar sur le dashboard
- **Priorité :** P2 | **Complexité :** S
- **Description :** Petit encart sur le dashboard :
  "📡 3 nouveaux articles cette semaine" avec titre, auteurs,
  journal. Lien vers PubMed. Marquable comme "lu" ou "à lire".
- **Fichiers :** `src/components/PubMedRadar.astro`

### 20.3 GitHub Action PubMed hebdo
- **Priorité :** P3 | **Complexité :** S
- **Description :** Sync hebdomadaire (lundi matin).
- **Fichiers :** `.github/workflows/pubmed-radar.yml`

---

## EPIC 21 — Statut de partage des données (FAIR)

> Checklist de conformité pour chaque dataset : sauvegarde,
> dépôt, format, métadonnées. De plus en plus exigé par les
> journaux et financeurs.

### 21.1 Données partage `src/data/datasets.yaml`
- **Priorité :** P2 | **Complexité :** S
- **Description :** Registre des datasets avec statut FAIR :
  ```yaml
  datasets:
    - id: rnaseq-batch1
      name: "RNA-seq FGFR3 vs WT — E18.5"
      experiment: "2026-04-10-exemple-synchondrose-fgfr3"
      type: "RNA-seq"
      size: "~12 GB"
      backup:
        local: true
        remote: "NAS labo"
        cloud: false
      sharing:
        repository: null       # GEO, Zenodo, Figshare
        accession: null
        status: "pas déposé"   # pas déposé / en préparation / déposé / public
      fair_checklist:
        findable: false        # DOI, métadonnées indexées
        accessible: false      # protocole d'accès clair
        interoperable: true    # format standard (FASTQ)
        reusable: false        # licence, documentation
      notes: "Déposer sur GEO avant soumission article 1"
  ```
- **Fichiers :** `src/data/datasets.yaml`

### 21.2 Composant `DataSharingStatus.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Tableau dans le dashboard : chaque dataset
  avec 4 pastilles FAIR (vert/rouge), statut de dépôt, alerte
  si un article lié est en soumission mais les données pas
  encore déposées.
- **Fichiers :** `src/components/DataSharingStatus.astro`

---

## EPIC 22 — Base de réactifs et checklist soutenance 🔬🌐

> Outils pratiques pour la fin de thèse.
>
> **Architecture :** La base de réactifs est un candidat naturel
> pour un nouveau module dans PhD_Notebook (table `reagents` liée
> aux expériences et protocoles), avec export via bridge.
> La checklist soutenance reste dans un YAML simple côté NKG_online.

### 22.1 Base de réactifs `src/data/reagents.yaml`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Catalogue des anticorps, sondes, primers
  validés avec conditions optimales :
  ```yaml
  reagents:
    - id: ab-fgfr3
      type: "anticorps primaire"
      target: "FGFR3"
      species: "rabbit"
      supplier: "Abcam"
      ref: "ab133644"
      dilution: "1:200"
      validated_on: ["E18.5 mouse skull base", "P3 mouse"]
      protocol: "immunofluorescence"
      protocol_version: "v3"
      notes: "Fonctionne mieux après démasquage citrate"

    - id: probe-col2a1
      type: "sonde RNA-scope"
      target: "Col2a1"
      supplier: "ACD Bio"
      ref: "Mm-Col2a1-C1"
      channel: "C1"
      validated_on: ["E18.5 mouse", "E16.5 mouse"]
      protocol: "rna-scope"
      protocol_version: "v3"
  ```
- **Fichiers :** `src/data/reagents.yaml`
- **Lien :** Référencé dans les protocoles (EPIC 17) et les
  expériences. Le planificateur (EPIC 13) peut lister les
  réactifs nécessaires pour une expérience planifiée.

### 22.2 Composant `ReagentDatabase.astro`
- **Priorité :** P3 | **Complexité :** M
- **Description :** Page `/phd/reagents` (guest) avec tableau
  filtrable par type, cible, protocole. Recherche rapide.
- **Fichiers :** `src/components/ReagentDatabase.astro`,
  `src/pages/phd/reagents.astro`

### 22.3 Checklist soutenance `src/data/defense.yaml`
- **Priorité :** P2 | **Complexité :** S
- **Description :** Étapes administratives avec statut :
  ```yaml
  target_date: "2026-12-15"
  steps:
    - label: "Inscription en 3e année"
      status: done
      date: "2025-10-01"
    - label: "CSI annuel"
      status: done
      date: "2026-01-20"
    - label: "Comité de suivi de thèse"
      status: upcoming
      deadline: "2026-06-15"
    - label: "Choix pré-rapporteurs"
      status: pending
      deadline: "2026-09-01"
    - label: "Composition jury"
      status: pending
      deadline: "2026-09-15"
    - label: "Soumission manuscrit pré-rapporteurs"
      status: pending
      deadline: "2026-10-01"
    - label: "Dépôt manuscrit école doctorale"
      status: pending
      deadline: "2026-11-01"
    - label: "Soutenance"
      status: pending
      deadline: "2026-12-15"
  ```
- **Fichiers :** `src/data/defense.yaml`

### 22.4 Widget soutenance sur le dashboard
- **Priorité :** P2 | **Complexité :** S
- **Description :** Barre de progression de la checklist
  soutenance + prochaine échéance mise en évidence.
  Intégré dans la timeline (EPIC 5) également.
- **Fichiers :** `src/components/DefenseChecklist.astro`

### 22.5 Statut des sauvegardes
- **Priorité :** P2 | **Complexité :** S
- **Description :** Widget sur le dashboard qui lit les
  infos de backup de `datasets.yaml` (EPIC 21) et affiche
  un indicateur global : 🟢 "Tout sauvegardé" / 🟡
  "Dernière backup > 7j" / 🔴 "Données non sauvegardées".
- **Fichiers :** Section dans `BlockersWidget.astro` (EPIC 16.1)

---

## Ordre d'implémentation recommandé

```
═══════════════════════════════════════════════════════════════
  🌐 = NKG_online (Astro)   🔬 = PhD_Notebook (FastAPI)
  🔗 = Bridge (export script)
  ⏸️  = Différé (en attente Rayyan API)
═══════════════════════════════════════════════════════════════

Phase 1 — Fondations site 🌐                            ~1-2 sessions
  9.1  Extension visibility.yaml (3 niveaux)     🌐
  9.2  Refactor visibility.ts                    🌐
  9.3  Collection Astro schema étendu            🌐
  1.1  Page hub /phd/dashboard                   🌐
  1.2  Collecte.yaml (manuel pour l'instant)     🌐
  1.3  Collection Astro collecte                 🌐
  8.2  Lien dans la navigation                   🌐

Phase 2 — Dashboard core + accès invité 🌐              ~2-3 sessions
  9.4  Page de login invité /guest               🌐
  9.5  Composant GuestGate                       🌐
  9.6  Filtrage de la navigation                 🌐
  2.1  Composant CollecteDashboard               🌐
  2.2  Enrichissement phd-progress               🌐
  3.1  Données thesis.yaml                       🌐
  3.2  Composant ThesisTracker                   🌐
  3.3  Collection thesis                         🌐
  4.1  Script rayyan-fetch.py                    ⏸️ (attente API)
  4.2  Composant ScopingDashboard                🌐 ✅ prototype

Phase 3 — Bridge + planning 🔗🌐🔬                      ~3-4 sessions
  0.1  Script notebook-export.py                 🔗 ← PRIORITAIRE
  0.2  Documentation mapping données             🔗
  10.1 Toggle mode présentation                  🌐
  17.1 Système de versions protocols.yaml        🌐 (puis 🔬)
  17.3 Lien expérience → version protocole       🌐🔬
  13.1 Données protocols.yaml                    🌐
  13.2 Composant ExperimentPlanner               🌐
  13.3 Paramétrage stades embryonnaires          🌐
  13.4 Création d'expérience → PhD_Notebook      🌐🔬
  12.1 Smoke tests post-build                    🌐

Phase 4 — Tracking avancé 🌐🔗                          ~4-5 sessions
  19.1 Données figures.yaml                      🌐
  19.2 Composant FigureTracker                   🌐
  11.1 Script newsletter auto-générée            🔗🌐
  4.3  GitHub Action rayyan-sync                 ⏸️ (attente API)
  4.4  PRISMA auto-généré                        🌐
  5.1  Données timeline.yaml                     🌐
  5.2  Composant PhDTimeline                     🌐
  6.1  Composant ExperimentCard                  🌐
  6.2  Vue galerie expériences                   🌐
  14.1 Specimens.yaml (via bridge)               🔗
  14.2 Composant SpecimenTracker                 🌐
  14.3 Lien planificateur → tracker              🌐🔬
  18.1 Données pipelines.yaml                    🌐 (puis 🔬🔗)
  18.2 Composant PipelineTracker                 🌐
  18.3 Lien pipeline → figures → expériences     🌐
  19.3 Détection auto "à refaire" figures        🌐
  20.1 Script veille PubMed                      🔗
  20.2 Widget radar dashboard                    🌐
  21.1 Données datasets.yaml (FAIR)              🌐 (puis 🔬🔗)
  21.2 Composant DataSharingStatus               🌐
  22.3 Checklist soutenance defense.yaml         🌐
  22.4 Widget soutenance dashboard               🌐
  22.5 Statut des sauvegardes                    🌐
  15.1 Export Zotero → YAML                      🔗

Phase 5 — Productivité et UX 🌐🔬                       ~2-3 sessions
  8.1  Traductions i18n                          🌐
  9.7  Indicateur mode invité                    🌐
  10.2 URL directe mode présentation             🌐
  16.1 Vue "Blocages" dashboard                  🌐
  16.2 Actions items réunions → dashboard        🌐
  16.3 Export PDF du dashboard                   🌐
  16.4 Quick log mobile                          🌐 (ou 🔬)
  17.2 Affichage changelog protocoles            🌐
  22.1 Base de réactifs                          🔬🔗
  22.2 Composant ReagentDatabase                 🌐
  0.3  GitHub Action notebook-sync               🔗
  0.4  Export des modules futurs                 🔗

Phase 6 — Extras et polish (P3)                          ~2-3 sessions
  4.5  Script pré-dédoublonnage                  🔗
  7.1  Alertes scoping review                    🌐
  11.2 GitHub Action newsletter hebdo            🌐
  11.3 Page brouillons CMS                       🌐
  12.2 Notification échec deploy                 🌐
  13.5 Export iCal planificateur                 🌐
  14.4 Alertes spécimens                         🌐
  15.2 Composant bibliographie                   🌐
  15.3 GitHub Action Zotero sync                 🔗
  16.5 Vue calendrier expériences                🌐
  16.6 Notification Slack deploy                 🌐
  20.3 GitHub Action PubMed hebdo                🔗
```

**Deux pistes en parallèle :**
Les phases ci-dessus concernent principalement NKG_online.
En parallèle, PhD_Notebook continue d'évoluer (modules
expériences, réactifs, protocoles) — ces développements se
font dans des sessions Claude Code séparées sur ce repo.

**Total estimé : 15–22 sessions de 2-3h avec Claude Code**
**soit ~5-8 semaines à 3 sessions/semaine.**
**(dont ~80% sur NKG_online, ~20% sur PhD_Notebook)**

---

## Notes techniques

### Architecture deux repos
| | NKG_online | PhD_Notebook |
|---|---|---|
| **Stack** | Astro 5 + TS | FastAPI + SQLAlchemy 2.0 + SQLite |
| **Hébergement** | GitHub Pages (statique) | Local (localhost:8000) |
| **Usage** | Dashboard, vitrine, partage | Saisie quotidienne labo |
| **Données** | YAML (lecture) | SQLite (CRUD) |
| **Pont** | ← `scripts/notebook-export.py` ← | |
| **Claude Code** | Sessions 🌐 | Sessions 🔬 séparées |

### NKG_online
- **Stack :** Astro 5, TypeScript, CSS vanilla (design tokens)
- **Données :** YAML dans `src/data/`, collections Astro
- **CI/CD :** GitHub Actions (deploy.yml + rayyan-sync.yml + newsletter-draft.yml)

### PhD_Notebook
- **Stack :** FastAPI, SQLAlchemy 2.0, Alembic, Jinja2, SQLite
- **DB :** `data/notebook.db`
- **Migrations :** `python db.py new "desc"` → `python db.py upgrade`
- **Serveur :** `bash start.sh` → http://127.0.0.1:8000
- **Python :** 3.13 (conda base)

### Dépendances Python (scripts/ dans NKG_online)
- `sqlalchemy` + `pyyaml` — Bridge export (EPIC 0)
- `rayyan-sdk` + `pyyaml` — Rayyan sync (EPIC 4, en attente API)
- `pyzotero` — Zotero sync (EPIC 15)
- `biopython` — PubMed radar (EPIC 20)

### Secrets GitHub requis (NKG_online)
- `RAYYAN_ACCESS_TOKEN` / `RAYYAN_REFRESH_TOKEN` — API Rayyan (⏸️)
- `GUEST_CODE` — code d'accès invité
- `ZOTERO_API_KEY` — API Zotero (EPIC 15, optionnel)
- `SLACK_WEBHOOK_URL` — notifications (EPIC 16.6, optionnel)

### Variables GitHub
- `RAYYAN_REVIEW_ID` — ID numérique de la review

### Fichiers YAML clés (NKG_online src/data/)
| Fichier | EPIC | Source | Description |
|---------|------|--------|-------------|
| `visibility.yaml` | 9 | Manuel | Contrôle d'accès 3 niveaux |
| `collecte.yaml` | 1-2 | 🔗 Bridge ou manuel | Progression collecte (3 axes) |
| `phd-progress.yaml` | 2 | Manuel (existant) | Barres progression globales |
| `thesis.yaml` | 3 | Manuel | Chapitres, publications, jalons |
| `scoping-review.yaml` | 4 | 🔗 Rayyan fetch | Données screening (⏸️) |
| `timeline.yaml` | 5 | Manuel | Jalons chronologiques |
| `protocols.yaml` | 13+17 | Manuel puis 🔗 | Protocoles wet lab versionnés |
| `specimens.yaml` | 14 | 🔗 Bridge | Export depuis PhD_Notebook |
| `experiments-live.yaml` | 0 | 🔗 Bridge | Export depuis PhD_Notebook |
| `bibliography.yaml` | 15 | 🔗 Zotero fetch | Publications / lectures |
| `figures.yaml` | 19 | Manuel | Registre figures (statut, source) |
| `pipelines.yaml` | 18 | Manuel puis 🔗 | Pipelines d'analyse |
| `pubmed-alerts.yaml` | 20 | 🔗 PubMed fetch | Veille littérature |
| `datasets.yaml` | 21 | Manuel puis 🔗 | Datasets + FAIR + backup |
| `reagents.yaml` | 22 | 🔗 Bridge | Export depuis PhD_Notebook |
| `defense.yaml` | 22 | Manuel | Checklist soutenance |

### Tables SQLite clés (PhD_Notebook data/notebook.db)
| Table | EPIC | Statut | Description |
|-------|------|--------|-------------|
| `litters` | 14 | ✅ Existe | Portées (code, date sacrifice, mère) |
| `samples` | 14 | ✅ Existe | Échantillons (stade, génotype, statut) |
| `experiments` | 13 | ✅ Existe | Expériences (type, dates, params JSON) |
| `sample_experiments` | 13 | ✅ Existe | Junction sample ↔ experiment |
| `reagents` | 22 | 🔲 À créer | Anticorps, sondes, primers |
| `protocols` | 17 | 🔲 À créer | Protocoles versionnés |
| `pipelines` | 18 | 🔲 À créer | Pipelines d'analyse |

### Compteur total
- **23 EPICs** (0–22)
- **~80 features**
- **6 phases**
- **~15–22 sessions Claude Code estimées**
- **2 repos** (NKG_online + PhD_Notebook)

