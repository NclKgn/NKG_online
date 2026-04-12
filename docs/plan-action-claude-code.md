# Plan d'action — Passage sur Claude Code

> Checklist pratique pour démarrer l'implémentation
> du PhD Dashboard sur Claude Code.

---

## Étape 1 — Préparer les fichiers (5 min)

Télécharger depuis cette conversation :
- [ ] `CLAUDE.md`
- [ ] `backlog-phd-dashboard.md`
- [ ] `spec-epic9-access-system.md`
- [ ] `scoping-review-dashboard-package.zip`

## Étape 2 — Préparer le repo (10 min)

```bash
cd ~/chemin/vers/NKG_online

# Créer le dossier docs
mkdir -p docs

# Placer les fichiers
cp ~/Downloads/CLAUDE.md ./CLAUDE.md
cp ~/Downloads/backlog-phd-dashboard.md ./docs/
cp ~/Downloads/spec-epic9-access-system.md ./docs/
cp ~/Downloads/scoping-review-dashboard-package.zip ./docs/

# Créer le .env
echo "PUBLIC_GUEST_CODE=changeme" > .env.example
echo "PUBLIC_GUEST_CODE=tonvraicodeici" > .env

# Ajouter .env au gitignore s'il n'y est pas
echo ".env" >> .gitignore
echo "creds.json" >> .gitignore

# Commit
git add -A
git commit -m "docs: add PhD dashboard backlog, specs, and CLAUDE.md"
git push
```

## Étape 3 — Préparer les credentials externes (15 min)

### Rayyan (pour l'EPIC 4)
- [ ] Se connecter sur https://rayyan.ai
- [ ] Aller sur https://rayyan.ai/users/edit
- [ ] Copier access_token et refresh_token
- [ ] Créer `creds.json` à la racine du repo (gitignored) :
  ```json
  {
    "access_token": "...",
    "refresh_token": "..."
  }
  ```
- [ ] Noter l'ID de la review à suivre

### GitHub secrets (pour les GitHub Actions)
- [ ] Repo → Settings → Secrets and variables → Actions
- [ ] Ajouter les secrets :
  - `RAYYAN_ACCESS_TOKEN`
  - `RAYYAN_REFRESH_TOKEN`
  - `GUEST_CODE` (le code invité que tu veux)
- [ ] Ajouter les variables :
  - `RAYYAN_REVIEW_ID`

> Note : les secrets Zotero, Slack, PubMed peuvent attendre
> les phases 4-6. Pas besoin maintenant.

## Étape 4 — Retrouver l'Excel (5 min)

- [ ] Localiser `données_phd.xlsx` (l'ancien fichier de collecte)
- [ ] Le placer dans le repo : `data/données_phd.xlsx`
- [ ] Si introuvable : pas grave, on recréera les données
  manuellement dans `collecte.yaml`

## Étape 5 — Vérifier que le site build (2 min)

```bash
npm install
npm run build
```

Si ça build proprement → prêt pour Claude Code.

## Étape 6 — Lancer Claude Code (0 min)

```bash
cd ~/chemin/vers/NKG_online
claude
```

## Étape 7 — Premier prompt Claude Code (NKG_online)

Copier-coller ce prompt pour la première session :

---

```
Lis CLAUDE.md à la racine, puis docs/backlog-phd-dashboard.md
et docs/spec-epic9-access-system.md.

Architecture : ce site (NKG_online) est la couche dashboard/vitrine.
Il est alimenté par un repo compagnon PhD_Notebook (FastAPI + SQLite
local) via un script d'export. Les EPICs Rayyan (4.x) sont différés
(en attente accès API). L'Excel de collecte est perdu — on recrée
collecte.yaml manuellement.

On commence par la Phase 1 du backlog :
1. EPIC 9.1 → 9.3 : système de visibilité 3 niveaux
   (suis le spec détaillé dans docs/spec-epic9-access-system.md,
   étape 1 "Données + lib")
2. EPIC 1.1 → 1.3 : page hub dashboard + collecte.yaml
3. EPIC 8.2 : lien dans la navigation

Commence par 9.1-9.3. Vérifie que le build passe après
chaque modification.
```

---

## Étape 8 — Sessions PhD_Notebook (en parallèle)

Quand tu travailles sur PhD_Notebook, ouvrir Claude Code
dans ce repo séparément :

```bash
cd ~/Code/PhD_Notebook
claude
```

Prompt :
```
Ce projet est une app FastAPI + SQLAlchemy 2.0 + SQLite pour
mon cahier de labo PhD. Lis docs/session_03_prompt.md pour le
contexte et l'état actuel. Continue le développement du module
Expériences (CRUD par type : ex vivo, RNAscope, IF, Lightsheet).
```

---

## Étape 9 — Sessions suivantes (NKG_online)

### Début de chaque session
```
Lis CLAUDE.md. Rappelle-toi où on en est dans le backlog
(docs/backlog-phd-dashboard.md). Qu'est-ce qu'on avait
terminé la dernière fois, et quelle est la prochaine feature ?
```

### Quand une feature est terminée
Demander à Claude Code de mettre à jour le backlog :
```
Mets à jour docs/backlog-phd-dashboard.md : marque la
feature X.Y comme ✅ terminée.
```

### Quand tu changes de phase
```
On passe à la Phase N du backlog. Lis les features listées
et commence par la première.
```

---

## Planning prévisionnel

| Semaine | Sessions | Phase | Repo | Features clés |
|---------|----------|-------|------|---------------|
| S1 | 1-2 | Phase 1 | 🌐 | Visibilité 3 niveaux, page hub, collecte.yaml |
| S1-2 | 3-4 | Phase 2 | 🌐 | GuestGate, CollecteDashboard, ThesisTracker |
| S2-3 | 5-8 | Phase 3 | 🌐🔗 | Bridge, mode présentation, protocoles, planificateur |
| S3-5 | 9-13 | Phase 4 | 🌐🔗 | Figures, spécimens, pipelines, PubMed, FAIR, timeline |
| S5-6 | 14-16 | Phase 5 | 🌐🔬 | Blocages, actions, quick log, réactifs, i18n |
| S7-8 | 17-20 | Phase 6 | 🌐🔗 | Extras, polish, GitHub Actions |
| — | en parallèle | — | 🔬 | Modules PhD_Notebook (expériences, réactifs, protocoles) |

> Rythme conseillé : 3 sessions / semaine, 2-3h chacune.
> Sessions 🌐 et 🔬 peuvent alterner selon les besoins.
> Ajuster selon la charge de travail thèse / clinique.

---

## Tips

- **Chaque session = 1 thème cohérent.** Ne pas sauter entre
  les EPICs — finir un bloc avant d'en commencer un autre.
- **Tester en dark mode ET mobile** après chaque composant visuel.
- **Commiter souvent** — Claude Code le fait bien si tu lui demandes.
- **Si Claude Code perd le fil** → "Relis CLAUDE.md et reprends."
- **Si un bug résiste** → revenir ici sur claude.ai pour en discuter
  avec plus de recul, puis retourner implémenter sur Claude Code.
