// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

// ── Lecture de visibility.yaml ──
const visibilityPath = new URL('./src/data/visibility.yaml', import.meta.url);
let hiddenPaths = [];
try {
  const raw = readFileSync(visibilityPath, 'utf-8');
  const data = parse(raw);
  hiddenPaths = Object.entries(data)
    .filter(([, v]) => {
      // Masquer tout ce qui n'est pas "public" (ou true)
      if (typeof v === 'boolean') return !v;
      return v !== 'public';
    })
    .map(([k]) => {
      // "phd-dashboard" → "/phd/dashboard" (clés CMS sans "/" → URL avec "/")
      const normalized = k.replace(/^(phd)-/, '$1/');
      return `/${normalized}`;
    });
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
