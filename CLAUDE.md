# CLAUDE.md — NKG_online

## Projet

Site personnel et PhD dashboard de Nicolas Kogane — chirurgien maxillo-facial, doctorant en sciences biomédicales (3e année+, phase rédaction). Sujet : rôle des synchondroses de la base du crâne dans le développement craniofacial.

**Ce repo (NKG_online) :** Dashboard + vitrine web (statique, partageable)
**Repo compagnon (PhD_Notebook) :** App labo locale (FastAPI + SQLite, saisie quotidienne)
**Pont :** `scripts/notebook-export.py` — exporte SQLite → YAML pour Astro

**URL site :** https://nclkgn.github.io/NKG_online/
**Repo site :** NclKgn/NKG_online
**Repo labo :** PhD_Notebook (local, pas sur GitHub public)

## Stack

- **Framework :** Astro 5 + TypeScript
- **Hébergement :** GitHub Pages (deploy via `.github/workflows/deploy.yml`)
- **CMS :** Sveltia CMS (`public/admin/`)
- **Style :** CSS vanilla avec design tokens (pas de Tailwind, pas de CSS-in-JS)
- **i18n :** Système maison (`src/i18n/`) — EN par défaut, FR disponible
- **Données :** YAML dans `src/data/`, collections Astro dans `src/content/`

## Design system

### Fonts
- **Titres :** `Cormorant Garamond` (serif, élégant)
- **Corps :** `IBM Plex Sans` (sans-serif, lisible)
- **Mono :** `JetBrains Mono` (code, chiffres, badges)

### Couleurs (tokens CSS dans `src/styles/global.css`)
```
--c-accent: #b05e3a        (terracotta — couleur principale)
--c-success: #7a8a6a       (vert olive)
--c-bg: #fafaf9             (light) / #0e0d0c (dark)
--c-surface: #ffffff        (light) / #171615 (dark)
--c-text: #1c1917           (light) / #cbc7c3 (dark)
--c-text-2: #78716c         (secondaire)
--c-text-3: #a8a29e         (tertiaire)
--c-border: #e7e5e4         (light) / #282523 (dark)
```

### Couleurs par axe de recherche
```
Biologie:      #6080a0
Biomécanique:  #e07b2a
Données Humaines: #c0392b
```

### Conventions CSS
- Utiliser les tokens CSS (`var(--c-accent)`, `var(--space-lg)`, etc.)
- Classes utilitaires : `.card`, `.container`, `.section`, `.mono`, `.small-caps`
- Responsive : mobile-first, breakpoint à 768px
- Dark mode : via `[data-theme="dark"]` sur `<html>`
- Pas de !important sauf cas justifié

## Architecture des fichiers

```
src/
├── components/          ← Composants Astro (.astro)
├── content/             ← Collections Markdown
│   ├── experiments/     ← Fiches expériences structurées
│   ├── lab-entries/     ← Cahier de labo (private)
│   ├── meetings/        ← Notes de réunion (private)
│   ├── newsletter/      ← Billets hebdo (public)
│   ├── projects/        ← Projets de recherche
│   └── misc/
├── content.config.ts    ← Schémas Zod des collections
├── data/                ← Données YAML (collections file)
│   ├── cv.yaml
│   ├── hero.yaml
│   ├── labs.yaml
│   ├── phd-progress.yaml
│   ├── stack.yaml
│   └── visibility.yaml  ← Contrôle d'accès 3 niveaux
├── i18n/                ← Traductions EN/FR
├── layouts/
│   ├── BaseLayout.astro
│   ├── ExperimentLayout.astro
│   └── PostLayout.astro
├── lib/
│   └── visibility.ts    ← Logique d'accès (public/guest/private)
├── pages/               ← Routes Astro
│   ├── index.astro
│   ├── phd/
│   │   ├── index.astro
│   │   ├── dashboard.astro    ← PhD Dashboard (à implémenter)
│   │   ├── experiments/
│   │   ├── lab/               ← Private
│   │   ├── meetings/          ← Private
│   │   └── newsletter/
│   ├── projects/
│   └── ...
└── styles/
    └── global.css       ← Tokens, reset, utilitaires
```

## Système de visibilité (EPIC 9)

Trois niveaux d'accès définis dans `src/data/visibility.yaml` :

| Niveau | Build prod | Sitemap | Accès |
|--------|-----------|---------|-------|
| `public` | ✅ | ✅ | Tous |
| `guest` | ✅ | ❌ | Avec code invité (sessionStorage) |
| `private` | ❌ | ❌ | `astro dev` uniquement |

**Héritage :** `phd/dashboard` hérite de `phd` si pas de clé spécifique.
**Rétrocompat :** `true` → public, `false` → private.

Fichier de référence : `docs/spec-epic9-access-system.md`

## Collections Astro

Définies dans `src/content.config.ts`. Les principales :

- **Markdown (glob)** : `newsletter`, `projects`, `experiments`, `lab-entries`, `meetings`, `misc`
- **YAML (file)** : `cv`, `stack`, `labs`, `phd-progress`, `hero`, `visibility`

Chaque collection a un schéma Zod strict — le respecter.

## Conventions de code

### Astro
- Composants dans `src/components/`, un fichier par composant
- Pages dans `src/pages/`, structure = route
- Styles scoped dans chaque composant (balise `<style>`)
- Pas de composants React/Vue sauf besoin d'interactivité complexe
- Scripts client : `<script>` en bas du composant ou `<script define:vars={...}>`

### Nommage
- Composants : PascalCase (`ScopingDashboard.astro`)
- Pages : kebab-case ou `index.astro` dans un dossier
- Données YAML : kebab-case (`phd-progress.yaml`)
- CSS classes : préfixées par contexte (`sr-` pour scoping review, `guest-` pour accès)

### Langue
- Code, commentaires, noms de variables : anglais
- Contenu visible, labels UI : français prioritaire (via i18n)
- Commits : anglais, format conventionnel (`feat:`, `fix:`, `chore:`)

## PhD_Notebook (repo compagnon)

App locale FastAPI pour la saisie quotidienne au labo.

### Stack
- FastAPI + SQLAlchemy 2.0 + Alembic + Jinja2
- SQLite (`data/notebook.db`)
- Python 3.13 (conda base)

### Modèle de données existant
- `litters` — portées (code, date sacrifice, mère)
- `samples` — échantillons (code, stade [E14.5/E16.5/P0/P1/P14], génotype [WT/Het/Homo], statut)
- `experiments` — expériences (type [ex vivo/IF/RNAscope/Lightsheet/Analyse/RNAseq], dates, params JSON)
- `sample_experiments` — junction table avec ordre pipeline

### Ce qui existe
- Module Échantillons complet (CRUD, filtres, stats, fiche détail + timeline)
- Module Expériences en cours de développement

### Ce qui reste à créer (dans PhD_Notebook)
- Tables : `reagents`, `protocols` (versionnés), `pipelines`
- Modules UI correspondants

### Pont vers NKG_online
Le script `scripts/notebook-export.py` (dans NKG_online) lit
`PhD_Notebook/data/notebook.db` et génère les YAML pour Astro.
Variable d'env : `NOTEBOOK_DB=~/Code/PhD_Notebook/data/notebook.db`

## Backlog et specs

Les documents de planification sont dans `docs/` :

- `docs/backlog-phd-dashboard.md` — Backlog complet (16 EPICs, 5 phases)
- `docs/spec-epic9-access-system.md` — Spec détaillé du système d'accès

### EPICs en bref
0. **Bridge : PhD_Notebook → NKG_online** (script export SQLite → YAML) 🔗
1. Fondations dashboard 🌐
2. Dashboard collecte de données 🌐
3. Tracker de rédaction 🌐
4. Scoping Review (Rayyan) — ⏸️ en attente accès API
5. Timeline de thèse 🌐
6. Expériences enrichies 🌐
7. Alertes et notifications 🌐
8. i18n et finitions 🌐
9. Système d'accès 3 niveaux — **spec détaillé dispo** 🌐
10. Mode présentation du dashboard 🌐
11. Newsletter auto-générée 🔗🌐
12. Smoke tests CI 🌐
13. Planificateur d'expériences 🔬🌐
14. Tracker de spécimens (CRUD existe dans PhD_Notebook) 🔬🔗🌐
15. Intégration Zotero 🔗🌐
16. Productivité (blocages, actions, export PDF, quick log, calendrier) 🌐🔬
17. Versionning de protocoles 🔬🌐
18. Tracker de pipelines d'analyse 🔬🔗🌐
19. Tracker de figures 🌐
20. Radar littérature PubMed 🔗🌐
21. Statut de partage des données (FAIR) 🔬🌐
22. Base de réactifs + checklist soutenance 🔬🔗🌐

Ordre d'implémentation : **Phase 1 d'abord** (fondations + EPIC 9), puis Phase 2 (dashboard core), etc.
Total : 23 EPICs (0–22), ~80 features, 6 phases, ~15-22 sessions Claude Code.

## Commandes utiles

```bash
npm run dev          # Serveur de dev (toutes pages visibles)
npm run build        # Build production
npm run preview      # Preview du build
```

## Points d'attention

- **Ne pas casser la rétrocompat** de `isSectionVisible()` et `getVisibleSections()` — beaucoup de pages en dépendent.
- **Le base path est `/NKG_online`** — toujours utiliser `base()` de `src/i18n/` pour les liens internes. Oublier le base path = liens cassés en prod.
- **Dark mode** — tester chaque composant en light ET dark.
- **Mobile** — le site est responsive, tester à 768px.
- **Pas de localStorage dans les artifacts** — utiliser sessionStorage pour le guest access.
- **L'Excel `données_phd.xlsx`** contenait les données de collecte (3 axes, 15 sous-parties). Si le fichier est disponible, utiliser `scripts/migrate-excel.py` pour générer `collecte.yaml`. Sinon, créer le YAML manuellement.

## Pièges courants sur ce projet

- **Astro collections YAML** : le loader `file()` crée des entrées dont l'`id` est la clé YAML (ex: `phd` dans visibility.yaml). Les clés avec `/` (ex: `phd/dashboard`) peuvent poser problème selon la version d'Astro — tester.
- **`define:vars`** : les variables passées via `<script define:vars={...}>` sont sérialisées en JSON. Pas de fonctions, pas de dates brutes.
- **Sitemap vs visibilité** : `astro.config.mjs` lit visibility.yaml au boot (pas via Astro collections). S'assurer que les deux restent synchronisés.
- **Fonts** : déjà importées via Google Fonts dans `global.css`. Ne pas les réimporter dans les composants.
- **Sveltia CMS** : les collections ajoutées doivent aussi être déclarées dans `public/admin/config.yml` si on veut les éditer via le CMS.

## Workflow recommandé pour Claude Code

### Démarrage de session
```bash
# Toujours commencer par vérifier que le build passe
npm run build

# Puis lire le backlog pour savoir où on en est
cat docs/backlog-phd-dashboard.md
```

### Pendant l'implémentation
- **Un composant à la fois** — build + preview entre chaque
- **Tester en dev ET en build** — les comportements diffèrent (visibilité, env vars)
- **Commiter souvent** — un commit par feature/composant

### Vérification avant de clore une feature
```bash
npm run build          # Pas d'erreur de build
npm run preview        # Vérifier le rendu
# Tester manuellement : dark mode, mobile, guest gate
```

### Structure de commit recommandée
```
feat(dashboard): add CollecteDashboard component
feat(visibility): implement 3-tier access system
fix(nav): filter private pages from navigation
chore(rayyan): sync scoping review data
docs: update backlog with completed features
```

## Scripts utiles

```bash
# Lancer le fetcher Rayyan (nécessite creds.json)
python scripts/rayyan-fetch.py --creds creds.json --review-id <ID>

# Prévisualiser le build de prod
npm run build && npm run preview

# Chercher tous les usages du système de visibilité
grep -rn "isSectionVisible\|shouldBuild\|isGuestOnly\|visibility" src/
```

## Dépendances externes

- **Rayyan SDK** : `pip install rayyan-sdk` — pour `scripts/rayyan-fetch.py`
- **PyYAML** : `pip install pyyaml` — pour la génération YAML
- **Tokens Rayyan** : `creds.json` (gitignored) — récupérables sur https://rayyan.ai/users/edit
- **Variable env** : `PUBLIC_GUEST_CODE` — code d'accès invité (dans `.env` local, secret GitHub en prod)

## Serena

Le projet a une config Serena dans `.serena/project.yml` (outil de dev AI alternatif). Ne pas y toucher, c'est indépendant de Claude Code.

