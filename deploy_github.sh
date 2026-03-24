#!/bin/bash
set -e

REPO="NclKgn/phd-dashboard"

echo "🚀 Déploiement du PhD Dashboard v2 sur GitHub Pages..."

# Clean up lock files
if [ -f ".git/index.lock" ]; then
  rm -f ".git/index.lock"
fi

# Init git if needed
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Stage everything
git add -A
git commit -m "update: $(date +%Y-%m-%d) — PhD Dashboard" 2>/dev/null || echo "Nothing new to commit"

# Create GitHub repo and push
if ! git remote | grep -q origin; then
  gh repo create "$REPO" --public --description "PhD Dashboard — Développement craniofacial" --source=. --remote=origin --push
else
  git push -u origin main
fi

# Enable GitHub Pages with Jekyll
gh api repos/$REPO/pages --method POST --field source[branch]=main --field source[path]=/ 2>/dev/null || echo "Pages already enabled."

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 https://nclkgn.github.io/phd-dashboard/"
echo ""
echo "GitHub Pages va builder le site Jekyll automatiquement (~2min)."
