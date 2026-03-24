# 🎓 PhD Dashboard

> Tableau de bord doctoral — Développement craniofacial  
> Site Jekyll hébergé sur GitHub Pages

## Structure du site

```
phd-dashboard/
├── _config.yml              ← Configuration Jekyll
├── _layouts/                ← Templates de mise en page
│   ├── default.html
│   └── post.html
├── _includes/
│   └── nav.html             ← Barre de navigation
├── _data/
│   ├── collecte.yml         ← Données collecte (généré par Python ou édité manuellement)
│   └── thesis.yml           ← Données rédaction thèse (édité manuellement)
├── _posts/                  ← Billets de blog (Phase 3)
├── assets/css/
│   └── style.css            ← Feuille de style globale
├── index.html               ← Page d'accueil / hub
├── dashboard/index.html     ← Suivi collecte de données
├── thesis/index.html        ← Suivi rédaction de thèse
├── lab-notebook/index.html  ← Index du cahier de labo
├── blog/index.html          ← Index du blog
├── meetings/index.html      ← Index des réunions (Phase 4)
├── données_phd.xlsx         ← Source Excel (optionnel)
├── update_dashboard.py      ← Génère _data/collecte.yml depuis Excel
├── deploy_github.sh         ← Script de déploiement
└── Gemfile                  ← Dépendances Ruby/Jekyll
```

## Utilisation rapide

### Mettre à jour la collecte de données

**Option A — Via YAML (recommandé) :**
```bash
# Édite directement _data/collecte.yml
git add _data/collecte.yml
git commit -m "update: collecte données"
git push
```

**Option B — Via Excel + Python :**
```bash
# Modifie données_phd.xlsx
python3 update_dashboard.py
git add _data/collecte.yml
git commit -m "update: collecte données"
git push
```

### Mettre à jour la thèse

```bash
# Édite _data/thesis.yml (chapitres, publications, jalons)
git commit -am "update: avancement thèse"
git push
```

### Ajouter un billet de blog

```bash
# Crée un fichier dans _posts/
echo "---
layout: post
title: Semaine 12 — Avancées coloration et landmarks
date: 2026-03-24
tags: [biologie, données-humaines]
---
Résumé de la semaine..." > _posts/2026-03-24-semaine-12.md
git add . && git commit -m "blog: semaine 12" && git push
```

## Déploiement

Le site est hébergé sur GitHub Pages. Chaque `git push` déclenche un build Jekyll automatique (~2 min).

```bash
# Premier déploiement
chmod +x deploy_github.sh
./deploy_github.sh

# Mises à jour suivantes
git add -A && git commit -m "description" && git push
```

🌐 **URL :** https://nclkgn.github.io/phd-dashboard/
