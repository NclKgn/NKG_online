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
  if (isDev) return false; // pas de gate en dev
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
export async function getKeysByLevel(level: AccessLevel): Promise<string[]> {
  const map = await getVisibilityMap();
  return [...map.entries()]
    .filter(([, v]) => v === level)
    .map(([k]) => k);
}
