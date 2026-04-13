# Data Mapping — PhD_Notebook → NKG_online

> Contrat d'interface entre les deux repos.
> Ce document définit exactement quelles données circulent
> et dans quel format.

## Principe

```
PhD_Notebook (SQLite)       →  Bridge script  →  NKG_online (YAML)
source de vérité               transforme         affichage
```

**Règle absolue :** le flux est à sens unique. NKG_online ne
modifie jamais les données de PhD_Notebook.

## Mapping des tables

### litters + samples → `src/data/specimens.yaml`

Schéma SQLite confirmé (`.schema`) :
- `samples` : code, stage VARCHAR(5), genotype VARCHAR(7), sex, litter_id, status VARCHAR(8), status_note, notes
- `litters` : code, sacrifice_date, mother_info, notes

```
SQLite                          YAML (clé top-level : specimens-data)
──────                          ────────────────────────────────────
samples.code              →     specimens[].code
samples.stage             →     specimens[].stage     # E14.5/E16.5/P0/P1/P14
samples.genotype          →     specimens[].genotype  # WT/Het/Homo
samples.sex               →     specimens[].sex       # omis si NULL
litters.code              →     specimens[].litter    # omis si NULL
litters.sacrifice_date    →     specimens[].sacrifice_date
samples.status            →     specimens[].status
samples.status_note       →     specimens[].status_note  # omis si NULL
samples.notes             →     specimens[].notes         # omis si NULL
```

Structure YAML générée :
```yaml
specimens-data:
  generated_at: "2026-04-13T12:00:00"
  count: 42
  specimens:
    - code: "NK-001"
      stage: "P7"
      genotype: "WT"
      sex: "M"
      litter: "L-001"
      sacrifice_date: "2026-03-15"
      status: "used"
```

Collection Astro : `getEntry('specimens', 'specimens-data')` — à déclarer dans `content.config.ts` lors de l'EPIC 14.

### experiments + sample_experiments → `src/data/experiments-live.yaml`

Schéma SQLite confirmé :
- `experiments` : code, experiment_type VARCHAR(10), title, date_start, date_end, status VARCHAR(11), notes, params JSON
- `sample_experiments` : sample_id, experiment_id, order, entry_date, status

```
SQLite                              YAML (clé top-level : experiments-live)
──────                              ──────────────────────────────────────
experiments.code              →     experiments[].code
experiments.experiment_type   →     experiments[].type   # IF/RNAscope/Lightsheet/ex vivo/…
experiments.title             →     experiments[].title  # omis si NULL
experiments.date_start        →     experiments[].date_start
experiments.date_end          →     experiments[].date_end  # omis si NULL
experiments.status            →     experiments[].status
sample_experiments (triés par order) → experiments[].samples  # liste de codes
experiments.notes             →     experiments[].notes  # omis si NULL
experiments.params (JSON)     →     experiments[].params # omis si NULL
```

Structure YAML générée :
```yaml
experiments-live:
  generated_at: "2026-04-13T12:00:00"
  count: 12
  experiments:
    - code: "EXP-001"
      type: "IF"
      title: "Immunofluorescence FGFR3 — coupes P7"
      date_start: "2026-03-10"
      status: "completed"
      samples: ["NK-001", "NK-002"]
      params:
        anticorps: "Anti-FGFR3"
        dilution: "1:200"
```

Collection Astro : `getEntry('experiments-live', 'experiments-live')` — à déclarer lors de l'EPIC 13/14.

### Calcul → `src/data/collecte.yaml`

Pas un mapping direct — c'est un **calcul** basé sur les expériences :

```
Pour chaque axe (Biologie, Biomécanique, Données Humaines) :
  Pour chaque sous-partie :
    compter les expériences par statut
    calculer un % d'avancement pondéré
    déterminer le statut global (non démarré / en cours / terminé)
```

Le mapping axe ↔ ExperimentType :
```
Biologie :
  - Coloration           → params.type == "histologie" (futur)
  - RNA-scope / IF       → ExperimentType.RNASCOPE + IF
  - Light Sheet          → ExperimentType.LIGHTSHEET
  - Analyse LS           → ExperimentType.ANALYSIS + params

Biomécanique :
  - Conception système   → manuel (pas dans la DB)
  - Culture ex vivo      → ExperimentType.EX_VIVO
  - RNA-seq              → ExperimentType.RNASEQ
  - Mesures morpho       → ExperimentType.ANALYSIS + params

Données Humaines :
  - Toutes sous-parties  → manuel pour l'instant
    (pas encore modélisées dans PhD_Notebook)
```

> Note : tant que toutes les sous-parties ne sont pas modélisées
> dans PhD_Notebook, `collecte.yaml` peut contenir un mix de
> données calculées (via bridge) et manuelles.

## Tables futures

Quand ces tables seront créées dans PhD_Notebook, étendre le bridge :

| Table future | → YAML |
|-------------|--------|
| `reagents` | → `src/data/reagents.yaml` |
| `protocols` | → `src/data/protocols.yaml` (versions incluses) |
| `pipelines` | → `src/data/pipelines.yaml` |

## Usage du script

```bash
# Sync complet (depuis la racine de NKG_online)
python scripts/notebook-export.py

# Chemin explicite
python scripts/notebook-export.py --db ~/Code/PhD_Notebook/data/notebook.db

# Via variable d'environnement (dans .env local)
export NOTEBOOK_DB=~/Code/PhD_Notebook/data/notebook.db
python scripts/notebook-export.py

# Prévisualiser sans écrire
python scripts/notebook-export.py --dry-run

# Un seul fichier
python scripts/notebook-export.py --only specimens
python scripts/notebook-export.py --only experiments
```

**Workflow recommandé avant chaque push :**
```bash
python scripts/notebook-export.py
git diff src/data/
git add src/data/specimens.yaml src/data/experiments-live.yaml
git commit -m "chore: sync notebook data $(date +%Y-%m-%d)"
git push   # → GitHub Actions rebuilde automatiquement
```

## Gestion des changements

### Changement safe (pas de MAJ bridge)
- Ajouter une colonne à une table existante
- Ajouter une nouvelle table
- Ajouter une valeur à un enum

### Changement breaking (MAJ bridge requise)
- Renommer une colonne lue par le bridge
- Supprimer une colonne lue par le bridge
- Changer le type d'une colonne
- Modifier la structure du JSON dans `experiments.params`

### Procédure de changement breaking
1. Mettre à jour le modèle dans PhD_Notebook
2. Créer la migration Alembic avec tag BRIDGE: BREAKING
3. Mettre à jour ce document (data-mapping.md)
4. Mettre à jour `scripts/notebook-export.py` dans NKG_online
5. Tester l'export
6. Commiter dans les deux repos
