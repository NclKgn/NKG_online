#!/usr/bin/env bash
# scripts/sync-notebook.sh
# EPIC 0.3 — Pipeline local : PhD_Notebook SQLite → YAML → git push → rebuild
#
# Usage :
#   bash scripts/sync-notebook.sh
#   bash scripts/sync-notebook.sh --db /autre/chemin/notebook.db
#   bash scripts/sync-notebook.sh --dry-run   (export sans commit)
#   bash scripts/sync-notebook.sh --only specimens

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$ROOT"

echo "═══════════════════════════════════════════"
echo "  PhD Notebook Sync"
echo "═══════════════════════════════════════════"
echo

# ── 1. Export SQLite → YAML ──────────────────────────────────────────────────
echo "▶  Export SQLite → YAML…"
python "${SCRIPT_DIR}/notebook-export.py" "$@"
echo

# En mode dry-run le script Python a déjà affiché le YAML — on s'arrête là
if [[ " $* " == *" --dry-run "* ]]; then
  echo "(dry-run) Aucun fichier écrit, aucun commit effectué."
  exit 0
fi

# ── 2. Détection des changements ─────────────────────────────────────────────
TARGETS="src/data/specimens.yaml src/data/experiments-live.yaml"

CHANGED=$(git diff --name-only $TARGETS 2>/dev/null || true)
NEW=$(git ls-files --others --exclude-standard $TARGETS 2>/dev/null || true)

if [[ -z "$CHANGED" && -z "$NEW" ]]; then
  echo "✓  Aucun changement — données déjà à jour."
  echo "   Le site ne sera pas rebuilté."
  exit 0
fi

echo "Fichiers modifiés :"
for f in $CHANGED $NEW; do
  echo "   • $f"
done
echo

# ── 3. Commit ────────────────────────────────────────────────────────────────
echo "▶  Commit…"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
git add $TARGETS
git commit -m "chore(data): sync notebook → YAML (${TIMESTAMP})"

# ── 4. Push → déclenche GitHub Actions automatiquement ───────────────────────
echo "▶  Push…"
git push

echo
echo "✓  Synchronisation terminée."
echo "   Rebuild GitHub Pages en cours :"
echo "   → https://github.com/NclKgn/NKG_online/actions"
