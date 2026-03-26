// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nclkgn.github.io',
  integrations: [sitemap()],
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
});
