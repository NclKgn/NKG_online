# PhD Dashboard — Backlog de features

> **Repo :** NclKgn/NKG_online (Astro 5 + GitHub Pages)
> **Scope :** Réimplémentation complète du PhD Dashboard + nouveaux modules
> **Date :** 12 avril 2026
> **Statut :** Planification

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

## EPIC 1 — Fondations du dashboard

> Remettre en place la structure de base du PhD Dashboard
> dans l'architecture Astro actuelle.

### 1.1 Page hub `/phd/dashboard`
- **Priorité :** P0 | **Complexité :** M
- **Description :** Page centrale du dashboard avec navigation vers
  les sous-sections (collecte, rédaction, scoping review, timeline).
  Breadcrumb, lien depuis `/phd/index.astro`.
- **Fichiers :** `src/pages/phd/dashboard.astro`
- **Statut :** ✅ Prototype livré (package scoping review)

### 1.2 Données collecte — migration Excel → YAML
- **Priorité :** P0 | **Complexité :** M
- **Description :** Recréer `src/data/collecte.yaml` à partir de la
  structure de l'ancien Excel `données_phd.xlsx` (3 axes, 15 sous-parties).
  Format : statut (non démarré / en cours / terminé) + pourcentage +
  deadline + notes. Script Python de migration optionnel.
- **Fichiers :** `src/data/collecte.yaml`, `scripts/migrate-excel.py`
- **Dépendances :** L'Excel original ou les données manuellement saisies
- **Notes :** L'Excel avait les colonnes : Partie, Sous-partie, Statut,
  %, Deadline, Notes. Les 3 parties : Biologie (Coloration, RNA-scope/IF,
  Light Sheet, Analyse LS rat), Biomécanique (Conception système,
  Validation, Culture ex vivo, Mesures morphocentriques, RNA-seq),
  Données Humaines (Acquisition, Contrôle & aplasie post-natal,
  Contrôle & aplasie anté-natal, Validation landmarks, Stats croissance,
  Caractérisation paternes fermeture).

### 1.3 Collection Astro `collecte`
- **Priorité :** P0 | **Complexité :** S
- **Description :** Ajouter la collection YAML dans `content.config.ts`
  avec schéma Zod (partie, sous-partie, statut enum, value number,
  deadline date optional, notes string optional, color string optional).
- **Fichiers :** `src/content.config.ts`, `src/data/collecte.yaml`

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

### 2.2 Enrichissement du `phd-progress.yaml` existant
- **Priorité :** P1 | **Complexité :** S
- **Description :** Relier les valeurs du `phd-progress.yaml` existant
  (overall, biology, biomechanics, human-data) aux données calculées
  automatiquement depuis `collecte.yaml` plutôt qu'en dur.
- **Option :** Script de calcul ou logique dans le composant Astro.
- **Fichiers :** `src/data/phd-progress.yaml` (ou calcul dynamique)

---

## EPIC 3 — Tracker de rédaction

> Suivi de l'avancement de la rédaction de thèse et des publications.

### 3.1 Données rédaction `src/data/thesis.yaml`
- **Priorité :** P1 | **Complexité :** S
- **Description :** Fichier YAML avec :
  - Chapitres de thèse (titre, statut, %, deadline)
  - Articles / publications (titre, journal cible, statut soumission)
  - Jalons administratifs (CSI, comité suivi, soutenance)
- **Format :**
  ```yaml
  chapters:
    - title: "Introduction générale"
      status: "en cours"
      value: 40
      deadline: "2026-06-01"
    - title: "Matériel & Méthodes — Biologie"
      status: "non démarré"
      value: 0
  publications:
    - title: "Synchondrose SOS et développement craniofacial"
      journal: "J Craniofac Surg"
      status: "en préparation"
  ```

### 3.2 Composant `ThesisTracker.astro`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Visualisation de l'avancement de la rédaction :
  - Barre de progression par chapitre
  - Statut des publications (pipeline visuel)
  - Pourcentage global de rédaction
- **Fichiers :** `src/components/ThesisTracker.astro`

### 3.3 Collection Astro `thesis`
- **Priorité :** P1 | **Complexité :** S
- **Description :** Enregistrer la collection dans `content.config.ts`.
- **Fichiers :** `src/content.config.ts`

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
- **Description :** Liste de jalons avec date, type, statut :
  ```yaml
  - date: "2023-10-01"
    label: "Début du PhD"
    type: "milestone"
    status: "done"
  - date: "2026-06-15"
    label: "Soumission Article 1"
    type: "publication"
    status: "upcoming"
  - date: "2026-12-01"
    label: "Soutenance (prévue)"
    type: "milestone"
    status: "upcoming"
  ```

### 5.2 Composant `PhDTimeline.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Composant visuel type Gantt simplifié ou
  timeline verticale. Indicateur "vous êtes ici". Couleurs par
  type de jalon (milestone, publication, comité, deadline admin).
  Réutilise le composant `TimelineEntry.astro` existant si adapté.
- **Fichiers :** `src/components/PhDTimeline.astro`

---

## EPIC 6 — Expériences enrichies

> Amélioration de la section expériences existante.

### 6.1 Composant `ExperimentCard.astro`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Fiche expérience visuelle avec :
  - Badge de statut coloré (planned → ongoing → completed)
  - Résumé des hypothèses
  - Tags cliquables
  - Liens entre expériences liées
- **Notes :** Le schéma Zod existant est déjà très riche (hypothèses,
  variables, protocole, interprétation, next_actions…). Le composant
  doit en tirer parti visuellement.
- **Fichiers :** `src/components/ExperimentCard.astro`

### 6.2 Vue galerie des expériences
- **Priorité :** P2 | **Complexité :** S
- **Description :** Améliorer `src/pages/phd/experiments/index.astro`
  avec des filtres par statut et par tag, et une vue grille de cards.
- **Fichiers :** `src/pages/phd/experiments/index.astro`

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

### 9.6 Filtrage de la navigation
- **Priorité :** P1 | **Complexité :** S
- **Description :** Mettre à jour `Nav.astro` pour ne pas afficher
  les liens vers les pages `private` en production. Les pages
  `guest` restent dans la nav (le GuestGate gère l'accès).
  Optionnel : badge "invité" discret à côté des liens guest.
- **Fichiers :** `src/components/Nav.astro`

### 9.7 Indicateur de mode invité
- **Priorité :** P2 | **Complexité :** S
- **Description :** Petit badge discret dans le header ou footer
  quand le visiteur est en mode invité, avec un lien pour se
  déconnecter (supprime le flag sessionStorage).
- **Fichiers :** `src/components/GuestBadge.astro`

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
- **Description :** Étape dans `deploy.yml`, après `astro build`,
  qui vérifie :
  - Les pages public retournent du HTML valide (200)
  - Les pages private ne sont PAS dans le build (`dist/`)
  - Les pages guest contiennent le GuestGate
  - Le sitemap ne contient pas de pages guest/private
  - Les liens internes ne sont pas cassés (base path ok)
- **Implémentation :** Script bash ou Node simple :
  ```bash
  # Pages public existent
  test -f dist/NKG_online/index.html || exit 1
  test -f dist/NKG_online/phd/index.html || exit 1

  # Pages private N'existent PAS
  test ! -f dist/NKG_online/phd/lab/index.html || exit 1
  test ! -f dist/NKG_online/phd/meetings/index.html || exit 1

  # Pages guest contiennent le gate
  grep -q "guest-protected" dist/NKG_online/phd/dashboard/index.html || exit 1

  # Sitemap ne contient pas de pages guest/private
  ! grep -q "phd/dashboard" dist/NKG_online/sitemap-index.xml || exit 1
  ```
- **Fichiers :** `scripts/smoke-test.sh`, `.github/workflows/deploy.yml`

### 12.2 Notification d'échec de deploy
- **Priorité :** P3 | **Complexité :** S
- **Description :** Si le build ou les smoke tests échouent,
  envoyer une notification Slack via webhook.
- **Fichiers :** `.github/workflows/deploy.yml` (step conditionnel)

---

## EPIC 13 — Planificateur d'expériences

> Outil de planification rétro-chronologique pour les expériences
> de wet lab. L'utilisateur entre une date cible (ex: "RNA-scope
> le 15 mai"), l'outil calcule automatiquement toutes les dates
> en amont et en aval selon le protocole.

### 13.1 Données protocoles `src/data/protocols.yaml`
- **Priorité :** P1 | **Complexité :** M
- **Description :** Définition des protocoles avec leurs étapes
  et délais relatifs. Chaque protocole est une séquence d'étapes
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

## EPIC 14 — Tracker de spécimens / souris

> Suivi des accouplements, portées, génotypages et disponibilité
> des animaux. Connecté au planificateur d'expériences.

### 14.1 Données spécimens `src/data/specimens.yaml`
- **Priorité :** P2 | **Complexité :** M
- **Description :** Base de données YAML des accouplements
  et portées :
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

## EPIC 17 — Versionning de protocoles

> Chaque protocole évolue au fil de la thèse. Tracer les
> modifications, les raisons, et lier chaque expérience à la
> version exacte du protocole utilisé. Critique pour la
> reproductibilité et la rédaction du Matériel & Méthodes.

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

## EPIC 18 — Tracker de pipelines d'analyse

> Suivi de l'état des analyses bioinformatiques et morphométriques.
> Quel dataset est passé par quel pipeline, à quel stade.

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

## EPIC 22 — Base de réactifs et checklist soutenance

> Outils pratiques pour la fin de thèse.

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
Phase 1 — Fondations (P0)                               ~1-2 sessions
  9.1  Extension visibility.yaml (3 niveaux)
  9.2  Refactor visibility.ts
  9.3  Collection Astro schema étendu
  1.1  Page hub /phd/dashboard
  1.2  Migration Excel → collecte.yaml
  1.3  Collection Astro collecte
  8.2  Lien dans la navigation

Phase 2 — Dashboard core + accès invité (P1)            ~2-3 sessions
  9.4  Page de login invité /guest
  9.5  Composant GuestGate
  9.6  Filtrage de la navigation
  2.1  Composant CollecteDashboard
  2.2  Enrichissement phd-progress
  3.1  Données thesis.yaml
  3.2  Composant ThesisTracker
  3.3  Collection thesis
  4.1  Script rayyan-fetch.py                    ✅
  4.2  Composant ScopingDashboard                ✅

Phase 3 — Présentation, planning, protocoles (P1)       ~3-4 sessions
  10.1 Toggle mode présentation
  17.1 Système de versions protocols.yaml
  17.3 Lien expérience → version protocole
  13.1 Données protocols.yaml
  13.2 Composant ExperimentPlanner
  13.3 Paramétrage stades embryonnaires
  13.4 Création d'expérience depuis planificateur
  19.1 Données figures.yaml
  19.2 Composant FigureTracker
  11.1 Script newsletter auto-générée
  12.1 Smoke tests post-build

Phase 4 — Tracking avancé (P2)                           ~4-5 sessions
  4.3  GitHub Action rayyan-sync                 ✅
  4.4  PRISMA auto-généré
  5.1  Données timeline.yaml
  5.2  Composant PhDTimeline
  6.1  Composant ExperimentCard
  6.2  Vue galerie expériences
  14.1 Données specimens.yaml
  14.2 Composant SpecimenTracker
  14.3 Lien planificateur → tracker
  18.1 Données pipelines.yaml
  18.2 Composant PipelineTracker
  18.3 Lien pipeline → figures → expériences
  19.3 Détection auto "à refaire" figures
  20.1 Script veille PubMed
  20.2 Widget radar dashboard
  21.1 Données datasets.yaml (FAIR)
  21.2 Composant DataSharingStatus
  22.3 Checklist soutenance defense.yaml
  22.4 Widget soutenance dashboard
  22.5 Statut des sauvegardes
  15.1 Export Zotero → YAML

Phase 5 — Productivité et UX (P2)                       ~2-3 sessions
  8.1  Traductions i18n
  9.7  Indicateur mode invité
  10.2 URL directe mode présentation
  16.1 Vue "Blocages" dashboard
  16.2 Actions items réunions → dashboard
  16.3 Export PDF du dashboard
  16.4 Quick log mobile
  17.2 Affichage changelog protocoles
  22.1 Base de réactifs reagents.yaml
  22.2 Composant ReagentDatabase

Phase 6 — Extras et polish (P3)                          ~2-3 sessions
  4.5  Script pré-dédoublonnage
  7.1  Alertes scoping review
  11.2 GitHub Action newsletter hebdo
  11.3 Page brouillons CMS
  12.2 Notification échec deploy
  13.5 Export iCal planificateur
  14.4 Alertes spécimens
  15.2 Composant bibliographie
  15.3 GitHub Action Zotero sync
  16.5 Vue calendrier expériences
  16.6 Notification Slack deploy
  20.3 GitHub Action PubMed hebdo
```

**Total estimé : 14–20 sessions de 2-3h avec Claude Code**
**soit ~5-7 semaines à 3 sessions/semaine.**

---

## Notes techniques

- **Stack :** Astro 5, TypeScript, CSS vanilla (design tokens)
- **Données :** YAML dans `src/data/`, collections Astro
- **CI/CD :** GitHub Actions (deploy.yml existant + rayyan-sync.yml + newsletter-draft.yml)
- **Outil recommandé :** Claude Code pour l'implémentation dans le repo
- **Excel original :** `données_phd.xlsx` à fournir ou recréer les
  données manuellement dans `collecte.yaml`

### Dépendances Python (scripts/)
- `rayyan-sdk` + `pyyaml` — Rayyan sync
- `pyzotero` — Zotero sync (EPIC 15)
- `biopython` — PubMed radar (EPIC 20)
- `openpyxl` — migration Excel (optionnel)

### Secrets GitHub requis
- `RAYYAN_ACCESS_TOKEN` / `RAYYAN_REFRESH_TOKEN` — API Rayyan
- `GUEST_CODE` — code d'accès invité
- `ZOTERO_API_KEY` — API Zotero (EPIC 15, optionnel)
- `SLACK_WEBHOOK_URL` — notifications (EPIC 16.6, optionnel)

### Variables GitHub
- `RAYYAN_REVIEW_ID` — ID numérique de la review

### Fichiers YAML clés (src/data/)
| Fichier | EPIC | Description |
|---------|------|-------------|
| `visibility.yaml` | 9 | Contrôle d'accès 3 niveaux |
| `collecte.yaml` | 1-2 | Avancement collecte (3 axes, 15 sous-parties) |
| `phd-progress.yaml` | 2 | Barres de progression globales (existant) |
| `thesis.yaml` | 3 | Chapitres, publications, jalons |
| `scoping-review.yaml` | 4 | Données Rayyan (auto-généré) |
| `timeline.yaml` | 5 | Jalons chronologiques du PhD |
| `protocols.yaml` | 13+17 | Protocoles wet lab versionnés |
| `specimens.yaml` | 14 | Accouplements, portées, stock souris |
| `bibliography.yaml` | 15 | Export Zotero (auto-généré) |
| `figures.yaml` | 19 | Registre des figures (statut, source) |
| `pipelines.yaml` | 18 | Pipelines d'analyse (RNA-seq, morpho) |
| `pubmed-alerts.yaml` | 20 | Veille PubMed (auto-généré) |
| `datasets.yaml` | 21 | Datasets + statut FAIR / backup |
| `reagents.yaml` | 22 | Anticorps, sondes, primers validés |
| `defense.yaml` | 22 | Checklist soutenance |

### Compteur total
- **22 EPICs**
- **~75 features**
- **6 phases**
- **~14–20 sessions Claude Code estimées**

