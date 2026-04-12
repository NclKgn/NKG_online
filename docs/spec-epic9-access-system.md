# EPIC 9 — Système d'accès à 3 niveaux
## Spec technique d'implémentation

> **Objectif :** Remplacer le système de visibilité fragmenté actuel
> par un mécanisme unifié à 3 niveaux (public / guest / private)
> avec granularité par page.
>
> **Repo :** NclKgn/NKG_online (Astro 5 + GitHub Pages)
> **Date :** 12 avril 2026

---

## 1. État actuel (à remplacer)

Le système actuel est fragmenté en 3 mécanismes indépendants :

### 1a. `visibility.yaml` (booléen, par section)
```yaml
# Actuel
phd: true     # → visible
misc: true    # → visible
```
- Utilisé par `isSectionVisible()` dans les pages principales
- Schéma Zod : `z.boolean()`

### 1b. `alwaysHidden` (hardcodé dans astro.config.mjs)
```js
// Actuel
const alwaysHidden = ['/phd/lab', '/phd/meetings', '/admin'];
```
- Utilisé uniquement pour le sitemap
- PAS relié à la logique de visibilité des pages

### 1c. `noindex` + bannière manuelle
```astro
<!-- Actuel — src/pages/phd/lab/index.astro -->
<BaseLayout title="Lab Notebook (Private)" noindex={true}>
  <div class="private-banner">Private — not indexed</div>
```
- Pas de redirect, pas de protection, juste un signal visuel
- Pas connecté à visibility.yaml

### Points faibles
- Pas de granularité par sous-page (seulement par section)
- Pas de niveau intermédiaire (guest)
- 3 systèmes déconnectés → maintenance fragile
- Les pages "private" sont quand même buildées et accessibles

---

## 2. Architecture cible

### Principe
```
visibility.yaml (source unique de vérité)
       │
       ├── astro.config.mjs  → sitemap (exclut private + guest)
       ├── visibility.ts     → logique build-time (redirect private)
       ├── Nav.astro          → filtrage des liens
       ├── GuestGate.astro    → protection client-side des pages guest
       └── BaseLayout.astro   → noindex auto pour guest + private
```

### Les 3 niveaux

| Niveau    | Buildé en prod | Sitemap | Indexé | Accès                          |
|-----------|----------------|---------|--------|--------------------------------|
| `public`  | ✅              | ✅       | ✅      | Tout le monde                  |
| `guest`   | ✅              | ❌       | ❌      | Visiteurs avec code invité     |
| `private` | ❌ (redirect)   | ❌       | ❌      | `astro dev` uniquement         |

---

## 3. Implémentation fichier par fichier

### 3.1 `src/data/visibility.yaml`

```yaml
# ─── Sections principales ───
phd: public
projects: public
cv: public
stack: public
labs: public
misc: public

# ─── Sous-pages PhD ───
# Granularité fine. Si une sous-page n'est pas listée,
# elle hérite du niveau de sa section parente.
phd/dashboard: guest
phd/experiments: guest
phd/lab: private
phd/meetings: private
phd/newsletter: public

# ─── Pages spéciales ───
admin: private
```

**Règle d'héritage :** `phd/newsletter` cherche d'abord la clé
`phd/newsletter`, puis `phd`. Si aucune clé n'existe, défaut = `public`.

**Rétrocompatibilité :** `true` est traité comme `public`,
`false` comme `private`.


### 3.2 `src/content.config.ts` — schema visibility

```ts
const visibility = defineCollection({
  loader: file('./src/data/visibility.yaml'),
  schema: z.union([
    z.boolean(),                                    // rétrocompat
    z.enum(['public', 'guest', 'private']),         // nouveau
  ]),
});
```

Pas d'autre changement dans content.config.ts.


### 3.3 `src/lib/visibility.ts` — refactor complet

```ts
// src/lib/visibility.ts
import { getCollection } from 'astro:content';

export type AccessLevel = 'public' | 'guest' | 'private';

const isDev = import.meta.env.DEV;

// ── Normalisation (rétrocompat booléen → enum) ──

function normalize(value: boolean | AccessLevel): AccessLevel {
  if (typeof value === 'boolean') return value ? 'public' : 'private';
  return value;
}

// ── Cache interne ──

let _cache: Map<string, AccessLevel> | null = null;

async function getVisibilityMap(): Promise<Map<string, AccessLevel>> {
  if (_cache) return _cache;
  const vis = await getCollection('visibility');
  _cache = new Map(vis.map((e) => [e.id, normalize(e.data)]));
  return _cache;
}

// ── Résolution avec héritage hiérarchique ──
//    "phd/dashboard" → cherche "phd/dashboard", puis "phd", puis défaut "public"

export async function getAccessLevel(key: string): Promise<AccessLevel> {
  const map = await getVisibilityMap();

  // Cherche la clé exacte
  if (map.has(key)) return map.get(key)!;

  // Cherche la clé parente (ex: "phd/dashboard" → "phd")
  const parent = key.split('/')[0];
  if (parent !== key && map.has(parent)) return map.get(parent)!;

  // Défaut
  return 'public';
}

// ── API publique ──

/** La page doit-elle être buildée ? (false = redirect en prod) */
export async function shouldBuild(key: string): Promise<boolean> {
  if (isDev) return true;
  const level = await getAccessLevel(key);
  return level !== 'private';
}

/** La page nécessite-t-elle le GuestGate ? */
export async function isGuestOnly(key: string): Promise<boolean> {
  if (isDev) return false;  // pas de gate en dev
  return (await getAccessLevel(key)) === 'guest';
}

/** La page doit-elle avoir noindex ? */
export async function shouldNoIndex(key: string): Promise<boolean> {
  const level = await getAccessLevel(key);
  return level !== 'public';
}

/** Rétrocompat — true si public OU guest (= buildé) */
export async function isSectionVisible(key: string): Promise<boolean> {
  if (isDev) return true;
  return await shouldBuild(key);
}

/** Sections visibles dans la nav (public + guest, pas private) */
export async function getVisibleSections(): Promise<string[]> {
  if (isDev) return ['phd', 'projects', 'cv', 'stack', 'labs', 'misc'];
  const map = await getVisibilityMap();
  // Ne retourne que les sections principales (pas les sous-pages)
  return [...map.entries()]
    .filter(([key, level]) => !key.includes('/') && level !== 'private')
    .map(([key]) => key);
}

/** Toutes les clés par niveau (utile pour sitemap, debug) */
export async function getKeysByLevel(
  level: AccessLevel
): Promise<string[]> {
  const map = await getVisibilityMap();
  return [...map.entries()]
    .filter(([, v]) => v === level)
    .map(([k]) => k);
}
```

**Points clés :**
- `isSectionVisible()` et `getVisibleSections()` gardent leur signature
  → aucune page existante ne casse
- Le cache `_cache` évite de recharger la collection à chaque appel
- L'héritage est à 1 niveau (sous-page → section). Pas de profondeur
  infinie — pas besoin pour ce site.


### 3.4 `astro.config.mjs` — sitemap unifié

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

// ── Lecture de visibility.yaml ──
const visibilityPath = new URL('./src/data/visibility.yaml', import.meta.url);
let hiddenPaths: string[] = [];
try {
  const raw = readFileSync(visibilityPath, 'utf-8');
  const data: Record<string, boolean | string> = parse(raw);
  hiddenPaths = Object.entries(data)
    .filter(([, v]) => {
      // Masquer tout ce qui n'est pas "public" (ou true)
      if (typeof v === 'boolean') return !v;
      return v !== 'public';
    })
    .map(([k]) => `/${k}`);
} catch {}

// NOTE : plus besoin de alwaysHidden — tout est dans visibility.yaml

export default defineConfig({
  site: 'https://nclkgn.github.io',
  base: '/NKG_online',
  integrations: [
    sitemap({
      filter: (page) => !hiddenPaths.some((p) => page.includes(p)),
    }),
  ],
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
});
```

**Changement :** suppression de `alwaysHidden` hardcodé. Tout passe
par `visibility.yaml`.


### 3.5 Pages existantes — pattern de migration

Le pattern actuel dans les pages :
```astro
// AVANT
if (!(await isSectionVisible('phd'))) {
  return Astro.redirect('/');
}
```

Reste **inchangé** — `isSectionVisible()` retourne toujours un boolean,
et redirige correctement les pages `private` en prod.

Pour les pages guest, le pattern devient :
```astro
---
// src/pages/phd/dashboard.astro
import { shouldBuild, isGuestOnly, shouldNoIndex } from '../../lib/visibility';
import GuestGate from '../../components/GuestGate.astro';

const pageKey = 'phd/dashboard';

// Private → redirect (pas buildé en prod)
if (!(await shouldBuild(pageKey))) {
  return Astro.redirect('/');
}

const needsGate = await isGuestOnly(pageKey);
const noindex = await shouldNoIndex(pageKey);
---

<BaseLayout title="PhD Dashboard" noindex={noindex}>
  {needsGate ? (
    <GuestGate returnTo="/phd/dashboard">
      <!-- contenu protégé -->
    </GuestGate>
  ) : (
    <!-- contenu direct -->
  )}
</BaseLayout>
```

Pour les pages qui étaient dans `alwaysHidden` (lab, meetings),
ajouter le check `shouldBuild()` :
```astro
---
// src/pages/phd/lab/index.astro — MIGRATION
import { shouldBuild } from '../../../lib/visibility';

if (!(await shouldBuild('phd/lab'))) {
  return Astro.redirect('/');
}
// ... le reste inchangé
---
```


### 3.6 `src/pages/guest.astro` — page de login invité

```astro
---
// src/pages/guest.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { base } from '../i18n';

// Le code invité est injecté au build via variable d'environnement
// Pour GitHub Pages, le set dans le workflow deploy.yml
// ou dans un fichier .env local
const guestCode = import.meta.env.PUBLIC_GUEST_CODE || 'phd2026';
---

<BaseLayout title="Accès invité" noindex={true}>
  <div class="container section">
    <div class="guest-login-card card">
      <h1>Accès invité</h1>
      <p>
        Cette section est réservée aux collaborateurs et invités.
        Entrez le code d'accès qui vous a été communiqué.
      </p>

      <div class="guest-form" id="guest-form">
        <input
          type="password"
          id="guest-code-input"
          placeholder="Code d'accès"
          autocomplete="off"
        />
        <button id="guest-submit" type="button">
          Accéder
        </button>
        <p class="guest-error" id="guest-error">
          Code incorrect.
        </p>
      </div>
    </div>
  </div>
</BaseLayout>

<script define:vars={{ guestCode }}>
  // Hash simple du code pour ne pas le stocker en clair dans le HTML
  // (reste du security-through-obscurity, pas du vrai auth)
  async function hashCode(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const expectedHash = await hashCode(guestCode);

  const input = document.getElementById('guest-code-input');
  const btn = document.getElementById('guest-submit');
  const error = document.getElementById('guest-error');

  async function tryLogin() {
    const value = input.value.trim();
    const hash = await hashCode(value);

    if (hash === expectedHash) {
      sessionStorage.setItem('nkg-guest', hash);
      // Redirect vers la page demandée ou le dashboard
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo') || '/NKG_online/phd/dashboard';
      window.location.href = returnTo;
    } else {
      error.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  }

  btn.addEventListener('click', tryLogin);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryLogin();
    error.style.display = 'none';
  });
</script>

<style>
  .guest-login-card {
    max-width: 400px;
    margin: var(--space-2xl) auto;
    text-align: center;
  }

  .guest-login-card h1 {
    font-size: 1.6rem;
    margin-bottom: var(--space-md);
  }

  .guest-login-card p {
    font-size: 0.9rem;
    color: var(--c-text-2);
    margin-bottom: var(--space-lg);
    line-height: 1.6;
  }

  .guest-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    align-items: center;
  }

  #guest-code-input {
    font-family: var(--font-mono);
    font-size: 1rem;
    padding: 10px 16px;
    border: 1px solid var(--c-border);
    border-radius: var(--radius-sm);
    background: var(--c-bg);
    color: var(--c-text);
    text-align: center;
    width: 100%;
    max-width: 240px;
    outline: none;
    transition: border-color 0.15s;
  }

  #guest-code-input:focus {
    border-color: var(--c-accent);
  }

  #guest-submit {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 10px 32px;
    background: var(--c-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: opacity 0.15s;
  }

  #guest-submit:hover {
    opacity: 0.85;
  }

  .guest-error {
    display: none;
    font-size: 0.82rem;
    color: #c0392b;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }

  .shake {
    animation: shake 0.4s ease;
  }
</style>
```

**Variable d'environnement :**
- Local : fichier `.env` → `PUBLIC_GUEST_CODE=moncode2026`
- GitHub Actions : secret → injecté dans le workflow deploy.yml

**Pourquoi `PUBLIC_` ?** Convention Astro — les vars préfixées
`PUBLIC_` sont exposées côté client. C'est nécessaire ici car la
vérification est côté client.

**Sécurité :** Le code est hashé (SHA-256) avant comparaison.
Le hash est dans le JS compilé, pas le code en clair. C'est
suffisant pour un site académique (empêcher l'accès casual), pas
pour des données sensibles.


### 3.7 `src/components/GuestGate.astro`

```astro
---
// src/components/GuestGate.astro
import { base } from '../i18n';

interface Props {
  returnTo?: string;  // URL de retour après login
}

const { returnTo } = Astro.props;
const currentPath = Astro.url.pathname;
const loginUrl = `${base('/guest')}?returnTo=${encodeURIComponent(returnTo || currentPath)}`;
---

<!-- Contenu protégé — masqué par défaut, révélé par JS -->
<div class="guest-protected" id="guest-content" style="display: none;">
  <slot />
</div>

<!-- Fallback si pas authentifié -->
<div class="guest-blocked" id="guest-blocked">
  <div class="guest-blocked-inner card">
    <span class="guest-icon">🔒</span>
    <h2>Contenu réservé aux invités</h2>
    <p>
      Cette page nécessite un code d'accès.
      Si vous êtes collaborateur ou invité, utilisez le lien ci-dessous.
    </p>
    <a href={loginUrl} class="guest-login-btn mono">
      Entrer le code d'accès →
    </a>
  </div>
</div>

<script>
  // Vérifie si le visiteur a un token invité valide
  const token = sessionStorage.getItem('nkg-guest');
  const content = document.getElementById('guest-content');
  const blocked = document.getElementById('guest-blocked');

  if (token) {
    // Authentifié → montrer le contenu
    content.style.display = '';
    blocked.style.display = 'none';
  }
  // Sinon : le fallback reste visible (défaut CSS)
</script>

<style>
  .guest-blocked-inner {
    max-width: 420px;
    margin: var(--space-2xl) auto;
    text-align: center;
    padding: var(--space-xl);
  }

  .guest-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .guest-blocked-inner h2 {
    font-size: 1.2rem;
    margin-bottom: var(--space-sm);
  }

  .guest-blocked-inner p {
    font-size: 0.88rem;
    color: var(--c-text-2);
    line-height: 1.6;
    margin-bottom: var(--space-lg);
  }

  .guest-login-btn {
    display: inline-block;
    padding: 10px 24px;
    background: var(--c-accent);
    color: #fff !important;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    font-weight: 500;
    transition: opacity 0.15s;
    text-decoration: none;
  }

  .guest-login-btn:hover {
    opacity: 0.85;
  }
</style>
```

**Note sur la sécurité :** Le contenu HTML EST dans le DOM
(display: none). Un utilisateur technique peut l'inspecter.
C'est acceptable pour un dashboard de thèse. Si tu veux
une protection plus forte à terme, on peut utiliser un
`<template>` tag qui n'est pas rendu dans le DOM, puis le
cloner via JS après vérification.


### 3.8 `src/components/GuestBadge.astro`

```astro
---
// src/components/GuestBadge.astro
// Petit indicateur affiché quand le visiteur est en mode invité.
// À inclure dans BaseLayout.astro ou Nav.astro
import { base } from '../i18n';
---

<div class="guest-badge" id="guest-badge" style="display: none;">
  <span class="guest-badge-label">Invité</span>
  <button class="guest-badge-logout" id="guest-logout" title="Se déconnecter">
    ✕
  </button>
</div>

<script>
  const badge = document.getElementById('guest-badge');
  const logoutBtn = document.getElementById('guest-logout');

  if (sessionStorage.getItem('nkg-guest')) {
    badge.style.display = '';
  }

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('nkg-guest');
    badge.style.display = 'none';
    window.location.reload();
  });
</script>

<style>
  .guest-badge {
    position: fixed;
    bottom: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: 99px;
    padding: 4px 12px 4px 10px;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--c-text-2);
    box-shadow: var(--shadow);
    z-index: 50;
  }

  .guest-badge-label::before {
    content: '🔓 ';
  }

  .guest-badge-logout {
    background: none;
    border: none;
    color: var(--c-text-3);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0 2px;
    line-height: 1;
  }

  .guest-badge-logout:hover {
    color: var(--c-text);
  }
</style>
```


### 3.9 `src/layouts/BaseLayout.astro` — intégration GuestBadge

Ajouter juste avant `</body>` :

```astro
<!-- Après le footer -->
<GuestBadge />
```

Et ajouter l'import :
```astro
import GuestBadge from '../components/GuestBadge.astro';
```


### 3.10 `src/components/Nav.astro` — aucun changement nécessaire

Le code actuel utilise déjà `getVisibleSections()` qui est
rétrocompatible (retourne les sections public + guest).

Les pages guest apparaissent dans la nav — c'est le GuestGate
qui gère la protection. C'est le comportement voulu : le visiteur
voit le lien, clique, et est invité à s'authentifier.


### 3.11 `.env` et `.env.example`

```bash
# .env.example (committé)
PUBLIC_GUEST_CODE=changeme

# .env (gitignored)
PUBLIC_GUEST_CODE=tonvraicodeici
```

Ajouter `.env` au `.gitignore` existant.


### 3.12 `.github/workflows/deploy.yml` — injection du code invité

Ajouter dans le job de build, avant `astro build` :

```yaml
- name: Create .env
  run: |
    echo "PUBLIC_GUEST_CODE=${{ secrets.GUEST_CODE }}" > .env
```

Et ajouter le secret `GUEST_CODE` dans les settings du repo GitHub.

---

## 4. Migration des pages existantes

### Pages à migrer

| Page | Actuel | Cible | Action |
|------|--------|-------|--------|
| `/phd` | `isSectionVisible('phd')` | `public` | Aucune (rétrocompat) |
| `/phd/dashboard` | N'existe pas encore | `guest` | Nouveau — utiliser pattern 3.5 |
| `/phd/experiments` | `noindex + private banner` | `guest` | Ajouter `shouldBuild` + `GuestGate` |
| `/phd/lab` | `alwaysHidden` + `noindex` | `private` | Ajouter `shouldBuild('phd/lab')` |
| `/phd/meetings` | `alwaysHidden` + `noindex` | `private` | Ajouter `shouldBuild('phd/meetings')` |
| `/phd/newsletter` | hérite de `phd` | `public` | Aucune |
| `/cv`, `/projects`… | `isSectionVisible` | `public` | Aucune (rétrocompat) |

### Checklist par page migrée
- [ ] Ajouter la clé dans `visibility.yaml`
- [ ] Remplacer les checks hardcodés par `shouldBuild()` / `isGuestOnly()`
- [ ] Supprimer les `noindex={true}` en dur → utiliser `shouldNoIndex()`
- [ ] Supprimer les `<div class="private-banner">` en dur → automatiser
- [ ] Wrapper le contenu dans `<GuestGate>` si guest
- [ ] Tester en mode dev (tout visible)
- [ ] Tester en mode build (private redirigé, guest protégé)

---

## 5. Diagramme de flux

```
Visiteur arrive sur une page
        │
        ▼
  ┌──────────────┐
  │ getAccessLevel│
  │   (page key) │
  └──────┬───────┘
         │
    ┌────┼────────────┐
    ▼    ▼            ▼
 public  guest      private
    │    │            │
    │    │     ┌──────▼──────┐
    │    │     │ isDev ?      │
    │    │     └──┬───────┬──┘
    │    │      oui      non
    │    │       │        │
    │    │       ▼        ▼
    │    │    Afficher  Redirect /
    │    │
    │    ▼
    │  ┌──────────────┐
    │  │ sessionStorage│
    │  │ nkg-guest ?   │
    │  └──┬────────┬──┘
    │   oui       non
    │    │         │
    │    ▼         ▼
    │  Afficher  ┌──────────┐
    │            │ GuestGate│
    │            │ → /guest │
    │            └──────────┘
    ▼
 Afficher
```

---

## 6. Tests à effectuer

### En mode `astro dev`
- [ ] Toutes les pages sont visibles (public, guest, private)
- [ ] Pas de GuestGate affiché
- [ ] Pas de redirect

### En mode `astro build` + `astro preview`
- [ ] Pages public → accessibles normalement
- [ ] Pages guest → GuestGate affiché, contenu masqué
- [ ] Pages guest + code correct → contenu révélé
- [ ] Pages guest + code incorrect → message d'erreur
- [ ] Pages private → redirect vers /
- [ ] Sitemap → ne contient que les pages public
- [ ] noindex → présent sur guest et private
- [ ] Nav → ne montre pas les liens private
- [ ] GuestBadge → visible après login, logout fonctionnel
- [ ] Refresh page guest après login → contenu toujours visible
  (sessionStorage persiste dans l'onglet)
- [ ] Fermer onglet + rouvrir → guest déconnecté
  (sessionStorage détruit)

### Rétrocompatibilité
- [ ] `isSectionVisible('phd')` retourne `true` (public)
- [ ] `getVisibleSections()` retourne les mêmes sections qu'avant
- [ ] Les pages qui n'ont PAS été migrées fonctionnent toujours

---

## 7. Limites connues et évolutions futures

### Limites
- **Pas de vraie auth** — protection côté client uniquement.
  Le HTML guest est dans le build, inspectable par un utilisateur
  technique. Suffisant pour un site académique.
- **sessionStorage** — le login ne persiste pas entre onglets
  ni entre sessions. C'est un choix : pas de cookie persistant,
  l'invité doit re-entrer le code à chaque session.
- **Un seul code invité** — pas de multi-utilisateurs.

### Évolutions possibles (hors scope actuel)
- **Cookie persistant** — si les invités se plaignent de devoir
  re-entrer le code, passer de sessionStorage à un cookie avec
  expiration (7 jours par ex.).
- **Multi-codes** — si besoin de distinguer les invités (directeur
  vs jury vs collabo), stocker plusieurs codes hashés.
- **Contenu dans `<template>`** — pour une meilleure protection,
  le contenu guest pourrait être dans un `<template>` tag (pas dans
  le DOM) et cloné par JS après vérification.
- **Cloudflare Access** — pour une vraie auth, migrer vers
  Cloudflare Pages + Access (gratuit pour 50 utilisateurs).

---

## 8. Ordre d'implémentation (dans Claude Code)

```
Étape 1 — Données + lib (pas de changement visuel)
  → visibility.yaml (nouveau format)
  → content.config.ts (schema union)
  → visibility.ts (refactor complet)
  → astro.config.mjs (suppression alwaysHidden)
  → .env.example + .gitignore
  ✓ Test : astro dev — tout fonctionne comme avant

Étape 2 — Composants
  → GuestGate.astro
  → GuestBadge.astro
  → guest.astro (page login)
  → BaseLayout.astro (intégrer GuestBadge)
  ✓ Test : astro build + preview — page /guest fonctionne

Étape 3 — Migration des pages existantes
  → phd/lab → ajouter shouldBuild()
  → phd/meetings → ajouter shouldBuild()
  → phd/experiments → ajouter GuestGate
  → Supprimer les noindex/private-banner hardcodés
  ✓ Test : build — lab/meetings non accessibles, experiments gated

Étape 4 — CI/CD
  → deploy.yml — injection PUBLIC_GUEST_CODE
  → Secret GUEST_CODE dans GitHub repo settings
  ✓ Test : deploy complet sur GitHub Pages
```
