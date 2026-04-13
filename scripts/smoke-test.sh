#!/usr/bin/env bash
# scripts/smoke-test.sh
# EPIC 12.1 — Smoke tests post-build
#
# Vérifie que le build Astro respecte les règles d'accès :
#   - Pages public   → existent, contenu réel
#   - Pages private  → existent MAIS redirigent vers /
#   - Pages guest    → existent, GuestGate en place
#   - Sitemap        → exclut les pages guest et private
#
# Usage : bash scripts/smoke-test.sh [dist_dir]
# Par défaut, cherche dans ./dist/

set -euo pipefail

DIST="${1:-dist}"
PASS=0
FAIL=0
ERRORS=()

# ── Couleurs (désactivées si pas de TTY) ────────────────────────────────────
if [ -t 1 ]; then
  GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
  BOLD='\033[1m'; RESET='\033[0m'
else
  GREEN=''; RED=''; YELLOW=''; BOLD=''; RESET=''
fi

ok()   { echo -e "  ${GREEN}✓${RESET} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${RESET} $1"; ERRORS+=("$1"); FAIL=$((FAIL + 1)); }
section() { echo -e "\n${BOLD}$1${RESET}"; }

echo -e "${BOLD}Smoke tests — dist: ${DIST}${RESET}"

# ── 1. Pages PUBLIC — doivent exister avec du vrai contenu ──────────────────
section "1. Pages publiques"

PUBLIC_PAGES=(
  "index.html"
  "phd/index.html"
  "cv/index.html"
  "projects/index.html"
  "stack/index.html"
  "labs/index.html"
  "phd/newsletter/index.html"
)

for page in "${PUBLIC_PAGES[@]}"; do
  path="${DIST}/${page}"
  if [ ! -f "$path" ]; then
    fail "${page} — fichier manquant"
  elif grep -q "Redirecting to:" "$path" 2>/dev/null; then
    fail "${page} — contient une redirection (page public ne doit pas rediriger)"
  else
    ok "${page}"
  fi
done

# ── 2. Pages PRIVATE — doivent rediriger (pas de contenu exposé) ────────────
section "2. Pages privées (redirections)"

PRIVATE_PAGES=(
  "phd/lab/index.html"
  "phd/meetings/index.html"
)

for page in "${PRIVATE_PAGES[@]}"; do
  path="${DIST}/${page}"
  if [ ! -f "$path" ]; then
    fail "${page} — fichier manquant (attendu : redirect)"
  elif grep -q "Redirecting to:" "$path" 2>/dev/null; then
    ok "${page} → redirection"
  else
    fail "${page} — contenu exposé (devrait être une redirection)"
  fi
done

# ── 3. Pages GUEST — existent, GuestGate en place ───────────────────────────
section "3. Pages guest (GuestGate)"

GUEST_PAGES=(
  "phd/experiments/index.html"
)

for page in "${GUEST_PAGES[@]}"; do
  path="${DIST}/${page}"
  if [ ! -f "$path" ]; then
    fail "${page} — fichier manquant"
  elif grep -q "Redirecting to:" "$path" 2>/dev/null; then
    fail "${page} — redirige (page guest ne doit pas rediriger en prod)"
  elif ! grep -q "guest-protected" "$path" 2>/dev/null; then
    fail "${page} — GuestGate absent (class 'guest-protected' introuvable)"
  else
    ok "${page} — GuestGate présent"
  fi
done

# Pages guest sans GuestGate obligatoire (existent, pas redirect)
GUEST_PAGES_NOGATEREQ=(
  "phd/dashboard/index.html"
)

for page in "${GUEST_PAGES_NOGATEREQ[@]}"; do
  path="${DIST}/${page}"
  if [ ! -f "$path" ]; then
    fail "${page} — fichier manquant"
  elif grep -q "Redirecting to:" "$path" 2>/dev/null; then
    fail "${page} — redirige (page guest ne doit pas rediriger en prod)"
  else
    ok "${page} — existe"
  fi
done

# ── 4. Sitemap — exclut guest et private ────────────────────────────────────
section "4. Sitemap (exclusions)"

SITEMAP="${DIST}/sitemap-0.xml"

if [ ! -f "$SITEMAP" ]; then
  fail "sitemap-0.xml manquant"
else
  SITEMAP_BANNED=(
    "phd/dashboard"
    "phd/experiments"
    "phd/lab"
    "phd/meetings"
  )

  for pattern in "${SITEMAP_BANNED[@]}"; do
    if grep -q "$pattern" "$SITEMAP" 2>/dev/null; then
      fail "sitemap contient '${pattern}' (page guest/private exposée)"
    else
      ok "sitemap exclut '${pattern}'"
    fi
  done
fi

# ── Résumé ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Résumé${RESET}"
echo -e "  ${GREEN}${PASS} test(s) passé(s)${RESET}"

if [ "${FAIL}" -gt 0 ]; then
  echo -e "  ${RED}${FAIL} test(s) échoué(s)${RESET}"
  echo ""
  echo -e "${RED}${BOLD}Échecs :${RESET}"
  for err in "${ERRORS[@]}"; do
    echo -e "  ${RED}✗${RESET} ${err}"
  done
  echo ""
  exit 1
else
  echo -e "\n${GREEN}${BOLD}Tous les smoke tests sont passés.${RESET}\n"
fi
