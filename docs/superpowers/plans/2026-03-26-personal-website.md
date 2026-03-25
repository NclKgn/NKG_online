# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Nicolas Kogane's personal website using Astro 5 — editorial + minimalist design with terracotta accent, deployed on GitHub Pages.

**Architecture:** Astro 5 static site with content collections (glob loader for markdown, file loader for YAML data). Component-based with reusable blocks per section. Existing Jekyll files kept alongside during build, removed at the end. i18n-ready from day one.

**Tech Stack:** Astro 5, TypeScript, CSS custom properties, Google Fonts (Instrument Serif, Inter, JetBrains Mono), `@astrojs/rss`, `@astrojs/sitemap`, GitHub Pages via GitHub Actions

**Design Spec:** `docs/superpowers/specs/2026-03-25-personal-website-design.md`

---

## File Map

### New files (Astro)
```
astro.config.mjs                     ← Astro config (site, i18n, integrations)
tsconfig.json                        ← TypeScript config
package.json                         ← Node dependencies
src/
├── content.config.ts                ← Content collection schemas
├── layouts/
│   ├── BaseLayout.astro             ← HTML shell, fonts, nav, footer
│   └── PostLayout.astro             ← Newsletter post wrapper
├── components/
│   ├── Nav.astro                    ← Frosted-glass navbar + mobile
│   ├── Hero.astro                   ← Atmospheric hero section
│   ├── SectionPreview.astro         ← Homepage section block
│   ├── TimelineEntry.astro          ← CV timeline item
│   ├── ProjectCard.astro            ← Project grid card
│   ├── StackLayer.astro             ← Pipeline row
│   ├── LabCard.astro                ← Lab affiliation card
│   ├── MiscCard.astro               ← Misc entry card
│   └── ProgressBar.astro            ← PhD progress display
├── pages/
│   ├── index.astro                  ← Landing (hero + previews)
│   ├── cv.astro                     ← CV timeline
│   ├── phd/
│   │   ├── index.astro              ← PhD narrative + progress
│   │   └── newsletter/
│   │       ├── index.astro          ← Newsletter listing
│   │       └── [...slug].astro      ← Individual post
│   ├── projects/
│   │   ├── index.astro              ← Project grid
│   │   └── [...slug].astro          ← Individual project
│   ├── stack.astro                  ← Pipeline visualization
│   ├── labs.astro                   ← Lab affiliations
│   ├── misc.astro                   ← Catch-all grid
│   └── rss.xml.js                   ← RSS feed
├── content/
│   ├── newsletter/                  ← Weekly digest .md files
│   ├── projects/                    ← Project .md files
│   └── misc/                        ← Misc entry .md files
├── data/
│   ├── cv.yaml                      ← CV entries
│   ├── stack.yaml                   ← Pipeline layers
│   ├── labs.yaml                    ← Lab affiliations
│   └── phd-progress.yaml            ← PhD metrics
├── styles/
│   └── global.css                   ← Design tokens + base styles
├── assets/
│   └── skull-base-motif.svg         ← Hero background SVG
└── i18n/
    ├── en.ts                        ← English UI strings
    └── fr.ts                        ← French UI strings (placeholder)
```

### Files to delete (after Astro is confirmed working)
```
_config.yml, Gemfile, _layouts/, _includes/, _data/,
_posts/, _lab-entries/, _meetings/, assets/, blog/,
dashboard/, lab-notebook/, meetings/, thesis/,
index.html, feed.xml, deploy_github.sh,
new-entry.sh, new-meeting.sh, new-post.sh,
update_dashboard.py, données_phd.xlsx,
{_layouts,_includes,_posts,assets
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.nvmrc`

- [ ] **Step 1: Initialize Astro project**

Run inside the repo root (alongside existing Jekyll files):

```bash
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

If prompted about existing files, choose to keep them. Astro writes to `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json` — no conflicts with Jekyll directories.

- [ ] **Step 2: Configure astro.config.mjs**

Replace the generated config:

```javascript
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
```

- [ ] **Step 3: Install dependencies**

```bash
npm install @astrojs/rss @astrojs/sitemap
```

- [ ] **Step 4: Add .nvmrc for Node version**

```
22
```

- [ ] **Step 5: Update .gitignore**

Append Astro-specific entries to the existing `.gitignore`:

```gitignore
# Astro
dist/
node_modules/
.astro/
```

- [ ] **Step 6: Verify the project builds**

```bash
npm run build
```

Expected: Build succeeds with a minimal Astro site.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .nvmrc .gitignore src/
git commit -m "chore: scaffold Astro project alongside Jekyll"
```

---

## Task 2: Design System

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create the global stylesheet with design tokens**

```css
/* src/styles/global.css */

/* ── Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Design Tokens ── */
:root {
  /* Typography */
  --font-heading: 'Instrument Serif', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Colors */
  --c-bg: #fafaf9;
  --c-surface: #ffffff;
  --c-text: #1c1917;
  --c-text-2: #78716c;
  --c-text-3: #a8a29e;
  --c-border: #e7e5e4;
  --c-border-light: #f5f5f4;
  --c-accent: #b05e3a;
  --c-accent-light: #fdf2ed;

  /* Spacing */
  --max-w: 1100px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;
  --space-2xl: 96px;

  /* Radii */
  --radius: 10px;
  --radius-sm: 6px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow: 0 2px 8px rgba(28, 25, 23, 0.06);
  --shadow-lg: 0 8px 24px rgba(28, 25, 23, 0.08);

  /* Nav */
  --nav-h: 60px;
}

/* ── Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background: var(--c-bg);
  color: var(--c-text);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Base Typography ── */
h1, h2, h3 {
  font-family: var(--font-heading);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h1 { font-size: 2.5rem; font-weight: 400; }
h2 { font-size: 1.5rem; font-weight: 400; }
h3 { font-size: 1.15rem; font-weight: 400; }

a {
  color: var(--c-accent);
  text-decoration: none;
  transition: opacity 0.15s;
}

a:hover {
  opacity: 0.8;
}

img {
  max-width: 100%;
  display: block;
}

/* ── Utility ── */
.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: var(--space-2xl) 0;
}

.section + .section {
  border-top: 1px solid var(--c-border-light);
}

.small-caps {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mono {
  font-family: var(--font-mono);
  font-size: 0.85em;
}

/* ── Cards ── */
.card {
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-lg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-grid {
  display: grid;
  gap: var(--space-lg);
}

.card-grid-2 { grid-template-columns: repeat(2, 1fr); }
.card-grid-3 { grid-template-columns: repeat(3, 1fr); }

/* ── Responsive ── */
@media (max-width: 768px) {
  h1 { font-size: 1.8rem; }
  h2 { font-size: 1.3rem; }

  .card-grid-2,
  .card-grid-3 {
    grid-template-columns: 1fr;
  }

  .section {
    padding: var(--space-xl) 0;
  }
}
```

- [ ] **Step 2: Build to verify CSS compiles**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add design system with terracotta accent"
```

---

## Task 3: Base Layout & Footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the base layout**

```astro
---
// src/layouts/BaseLayout.astro
interface Props {
  title: string;
  description?: string;
  noindex?: boolean;
}

const {
  title,
  description = 'Nicolas Kogane — Surgeon · Scientist · Engineer',
  noindex = false,
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Nicolas Kogane</title>
  <meta name="description" content={description} />
  {noindex && <meta name="robots" content="noindex, nofollow" />}
  <link rel="sitemap" href="/sitemap-index.xml" />
  <link rel="alternate" type="application/rss+xml" title="PhD Newsletter" href="/rss.xml" />
  <link rel="stylesheet" href="/src/styles/global.css" />
</head>
<body>
  <slot name="nav" />

  <main>
    <slot />
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <span>Nicolas Kogane</span>
      <span class="footer-sep">&middot;</span>
      <span>Surgeon &middot; Scientist &middot; Engineer</span>
    </div>
  </footer>

  <style>
    .site-footer {
      border-top: 1px solid var(--c-border);
      margin-top: var(--space-2xl);
    }

    .footer-inner {
      padding: var(--space-lg) 0;
      text-align: center;
      font-size: 0.78rem;
      color: var(--c-text-3);
    }

    .footer-sep {
      margin: 0 6px;
    }
  </style>
</body>
</html>
```

- [ ] **Step 2: Create a minimal index page to test the layout**

Replace `src/pages/index.astro` with:

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Home">
  <div class="container section">
    <h1>Nicolas Kogane</h1>
    <p>Site under construction.</p>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Build and preview**

```bash
npm run build && npm run preview
```

Open http://localhost:4321 — verify the page renders with correct fonts, colors, and footer.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add base layout with footer"
```

---

## Task 4: Navigation

**Files:**
- Create: `src/components/Nav.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the navigation component**

```astro
---
// src/components/Nav.astro
const navLinks = [
  { href: '/phd', label: 'PhD' },
  { href: '/projects', label: 'Projects' },
  { href: '/cv', label: 'CV' },
  { href: '/stack', label: 'Stack' },
  { href: '/labs', label: 'Labs' },
  { href: '/misc', label: 'Misc' },
];

const currentPath = Astro.url.pathname;
---

<nav class="site-nav" id="site-nav">
  <div class="container nav-inner">
    <a href="/" class="nav-wordmark">Nicolas Kogane</a>

    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="nav-links" id="nav-links">
      {navLinks.map(({ href, label }) => (
        <a
          href={href}
          class:list={['nav-link', { active: currentPath.startsWith(href) }]}
        >
          {label}
        </a>
      ))}
      <span class="nav-lang">
        <a href="#" class="nav-link nav-lang-active">EN</a>
        <span class="nav-lang-sep">/</span>
        <a href="#" class="nav-link nav-lang-inactive">FR</a>
      </span>
    </div>
  </div>
</nav>

<style>
  .site-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: var(--nav-h);
    transition: background 0.3s, box-shadow 0.3s;
  }

  .site-nav.scrolled {
    background: rgba(250, 250, 249, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 var(--c-border);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    height: var(--nav-h);
  }

  .nav-wordmark {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    color: var(--c-text);
    text-decoration: none;
    margin-right: auto;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .nav-link {
    color: var(--c-text-2);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    transition: color 0.15s, background 0.15s;
  }

  .nav-link:hover {
    color: var(--c-text);
    background: var(--c-border-light);
  }

  .nav-link.active {
    color: var(--c-accent);
  }

  .nav-lang {
    display: flex;
    align-items: center;
    margin-left: 12px;
    padding-left: 14px;
    border-left: 1px solid var(--c-border);
  }

  .nav-lang-sep {
    font-size: 0.7rem;
    color: var(--c-text-3);
  }

  .nav-lang-active {
    color: var(--c-text) !important;
    font-weight: 600;
  }

  .nav-lang-inactive {
    color: var(--c-text-3) !important;
  }

  .nav-toggle {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .nav-toggle span {
    display: block;
    width: 18px;
    height: 1.5px;
    background: var(--c-text);
    border-radius: 1px;
    transition: transform 0.2s, opacity 0.2s;
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
      position: absolute;
      top: var(--nav-h);
      left: 0;
      right: 0;
      flex-direction: column;
      padding: var(--space-md) 24px var(--space-lg);
      background: rgba(250, 250, 249, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: var(--shadow-lg);
      gap: 0;
    }

    .nav-links.open {
      display: flex;
    }

    .nav-link {
      padding: 10px 12px;
      width: 100%;
    }

    .nav-lang {
      margin-left: 0;
      padding-left: 0;
      border-left: none;
      padding-top: var(--space-sm);
      margin-top: var(--space-sm);
      border-top: 1px solid var(--c-border);
    }

    .nav-toggle {
      display: flex;
    }
  }
</style>

<script>
  // Scroll-based frosted glass effect
  const nav = document.getElementById('site-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle?.addEventListener('click', () => {
    links?.classList.toggle('open');
  });
</script>
```

- [ ] **Step 2: Wire navigation into BaseLayout**

In `src/layouts/BaseLayout.astro`, add the Nav import and replace the `<slot name="nav" />`:

Add to the frontmatter:
```typescript
import Nav from '../components/Nav.astro';
```

Replace `<slot name="nav" />` with:
```astro
<Nav />
```

Add padding-top to main so content isn't hidden behind the fixed nav:
```html
<main style="padding-top: var(--nav-h);">
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Check: nav is transparent, becomes frosted on scroll, mobile hamburger works. Active link highlights in terracotta.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.astro src/layouts/BaseLayout.astro
git commit -m "feat: add frosted-glass navigation with mobile menu"
```

---

## Task 5: Content Collections Schema

**Files:**
- Create: `src/content.config.ts`
- Create: `src/data/cv.yaml`
- Create: `src/data/stack.yaml`
- Create: `src/data/labs.yaml`
- Create: `src/data/phd-progress.yaml`
- Create: sample content files for each collection

- [ ] **Step 1: Define content collection schemas**

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Markdown collections (glob) ──

const newsletter = defineCollection({
  loader: glob({ base: './src/content/newsletter', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['ongoing', 'completed', 'upcoming']),
    domain: z.array(z.enum(['research', 'clinical', 'engineering'])),
    summary: z.string(),
    collaborators: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const misc = defineCollection({
  loader: glob({ base: './src/content/misc', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.coerce.date().optional(),
  }),
});

// ── YAML data collections (file) ──

const cv = defineCollection({
  loader: file('./src/data/cv.yaml'),
  schema: z.object({
    id: z.string(),
    section: z.enum(['education', 'clinical', 'research', 'skills']),
    year: z.string(),
    title: z.string(),
    institution: z.string(),
    description: z.string(),
  }),
});

const stack = defineCollection({
  loader: file('./src/data/stack.yaml'),
  schema: z.object({
    id: z.string(),
    layer: z.string(),
    methods: z.string(),
    tools: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const labs = defineCollection({
  loader: file('./src/data/labs.yaml'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    pi: z.string(),
    institution: z.string(),
    role: z.string(),
    work: z.string(),
    url: z.string().optional(),
  }),
});

const phdProgress = defineCollection({
  loader: file('./src/data/phd-progress.yaml'),
  schema: z.object({
    id: z.string(),
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  }),
});

// ── Private collections (lab notebook, meetings) ──

const labEntries = defineCollection({
  loader: glob({ base: './src/content/lab-entries', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const meetings = defineCollection({
  loader: glob({ base: './src/content/meetings', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    attendees: z.array(z.string()).default([]),
    decisions: z.array(z.string()).default([]),
    actions: z.array(z.string()).default([]),
  }),
});

export const collections = {
  newsletter,
  projects,
  misc,
  cv,
  stack,
  labs,
  'phd-progress': phdProgress,
  'lab-entries': labEntries,
  meetings,
};
```

- [ ] **Step 2: Create YAML data files with placeholder content**

`src/data/cv.yaml`:
```yaml
- id: phd-arts-metiers
  section: education
  year: "2024–present"
  title: PhD in Biomechanics
  institution: Arts et Métiers Institute of Technology
  description: Role of skull base synchondroses in craniofacial development — multimodal, multiscale approach.

- id: medical-degree
  section: education
  year: "2015–2022"
  title: Medical Degree (MD)
  institution: "[Your University]"
  description: "[Update with your medical school details]"

- id: cmf-necker
  section: clinical
  year: "2023–present"
  title: CMF Surgery Fellow
  institution: Necker Hospital — Maxillo-Facial & Plastic Surgery
  description: Craniofacial surgery, pediatric maxillofacial surgery.

- id: skull-base-phd
  section: research
  year: "2024–present"
  title: Skull Base Synchondroses Project
  institution: Arts et Métiers / Necker Hospital
  description: Multimodal investigation from molecular patterns to clinical atlas.
```

`src/data/stack.yaml`:
```yaml
- id: molecular
  layer: Molecular
  methods: RNAscope, Immunofluorescence
  tools: Confocal microscopy, image analysis pipelines
  description: Mapping gene expression and protein localization in skull base synchondroses.
  order: 1

- id: imaging-3d
  layer: 3D Imaging
  methods: Whole-mount LightSheet Fluorescent Microscopy
  tools: Tissue clearing protocols, Imaris, Fiji/ImageJ
  description: Volumetric visualization of synchondrose architecture in developing mouse skulls.
  order: 2

- id: biomechanics
  layer: Biomechanics
  methods: Ex vivo mechanical stimulation
  tools: Custom culture rigs, force measurement, analysis software
  description: Investigating mechanical response of skull base cartilage under controlled loading.
  order: 3

- id: clinical
  layer: Clinical Atlas
  methods: Human skull base atlas (fetal → end of growth)
  tools: CT/CBCT imaging, 3D Slicer, statistical shape analysis
  description: Building a reference atlas of synchondrose morphology across development, in control and achondroplasia.
  order: 4
```

`src/data/labs.yaml`:
```yaml
- id: lab-placeholder-1
  name: "[Lab Name]"
  pi: "[PI Name]"
  institution: Arts et Métiers Institute of Technology
  role: PhD Candidate
  work: "[Describe your work in this lab]"
  url: ""

- id: lab-placeholder-2
  name: "[Lab/Department Name]"
  pi: "[Department Head]"
  institution: Necker Hospital
  role: CMF Surgery Fellow
  work: "[Describe your clinical and research activities]"
  url: ""
```

`src/data/phd-progress.yaml`:
```yaml
- id: overall
  label: Overall
  value: 0

- id: biology
  label: Biology
  value: 0
  color: "#2d8a4e"

- id: biomechanics
  label: Biomechanics
  value: 0
  color: "#e07b2a"

- id: human-data
  label: Human Data
  value: 0
  color: "#c0392b"
```

- [ ] **Step 3: Create sample content files**

`src/content/newsletter/2026-03-26-first-update.md`:
```markdown
---
title: "First Update — Setting Up"
date: 2026-03-26
summary: "Launching the PhD newsletter. Weekly digests of research progress."
tags: [meta]
---

This is the first entry in the PhD newsletter. Each week, I'll distill the key developments from my research into a short digest.

Stay tuned for updates on skull base synchondrose research — from molecular biology to clinical imaging.
```

`src/content/projects/skull-base-synchondroses.md`:
```markdown
---
title: "Skull Base Synchondroses in Craniofacial Development"
status: ongoing
domain: [research, clinical, engineering]
summary: "Multimodal, multiscale investigation of the role of skull base synchondroses — from molecular patterns to clinical atlas."
collaborators: []
order: 1
---

## Context

Skull base synchondroses are cartilaginous growth plates that play a critical role in craniofacial development. Their dysregulation is central to conditions like achondroplasia, yet their biology and biomechanics remain poorly understood.

## Approach

This project uses a multimodal, multiscale strategy:

- **Molecular**: RNAscope and immunofluorescence to map cell population markers
- **3D Imaging**: Whole-mount LightSheet microscopy on cleared mouse specimens
- **Biomechanics**: Ex vivo mechanical stimulation of mouse skull bases
- **Clinical**: Human atlas from fetal period to end of growth

Both control and achondroplasia models are investigated at each scale.
```

`src/content/misc/placeholder.md`:
```markdown
---
title: "Coming Soon"
category: general
---

Content for the miscellaneous section will be added here.
```

- [ ] **Step 4: Build to verify schemas validate**

```bash
npm run build
```

Expected: Build succeeds. Astro validates all content against schemas. Any schema mismatch will produce a clear error.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/data/ src/content/
git commit -m "feat: add content collections and YAML data schemas"
```

---

## Task 6: Hero & Landing Page

**Files:**
- Create: `src/assets/skull-base-motif.svg`
- Create: `src/components/Hero.astro`
- Create: `src/components/SectionPreview.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create the skull base SVG motif**

A simplified geometric contour suggesting a skull base sagittal cross-section. Thin strokes, abstract, reads as texture at low opacity.

`src/assets/skull-base-motif.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none" stroke="#1c1917" stroke-width="0.5">
  <!-- Cranial vault contour -->
  <path d="M200,400 Q200,200 400,120 Q600,200 600,400" opacity="0.6"/>
  <path d="M220,400 Q220,220 400,145 Q580,220 580,400" opacity="0.4"/>
  <path d="M240,400 Q240,240 400,170 Q560,240 560,400" opacity="0.25"/>

  <!-- Skull base line -->
  <path d="M200,400 Q280,380 340,400 Q400,420 460,400 Q520,380 600,400" opacity="0.6"/>
  <path d="M220,410 Q290,392 345,410 Q400,428 455,410 Q510,392 580,410" opacity="0.35"/>

  <!-- Synchondroses markers (vertical growth plates) -->
  <line x1="340" y1="380" x2="340" y2="420" opacity="0.7" stroke-width="1"/>
  <line x1="400" y1="375" x2="400" y2="425" opacity="0.7" stroke-width="1"/>
  <line x1="460" y1="380" x2="460" y2="420" opacity="0.7" stroke-width="1"/>

  <!-- Subtle concentric arcs around synchondroses -->
  <circle cx="340" cy="400" r="15" opacity="0.15"/>
  <circle cx="340" cy="400" r="25" opacity="0.08"/>
  <circle cx="400" cy="400" r="15" opacity="0.15"/>
  <circle cx="400" cy="400" r="25" opacity="0.08"/>
  <circle cx="460" cy="400" r="15" opacity="0.15"/>
  <circle cx="460" cy="400" r="25" opacity="0.08"/>

  <!-- Nasal / facial contour -->
  <path d="M340,400 Q330,440 350,480 Q370,500 380,520" opacity="0.3"/>
  <path d="M460,400 Q470,430 460,460" opacity="0.2"/>

  <!-- Spinal column hint -->
  <path d="M390,425 Q395,480 400,540 Q405,480 410,425" opacity="0.2"/>

  <!-- Grid reference lines -->
  <line x1="150" y1="400" x2="650" y2="400" opacity="0.06" stroke-dasharray="4 8"/>
  <line x1="400" y1="80" x2="400" y2="560" opacity="0.06" stroke-dasharray="4 8"/>
</svg>
```

- [ ] **Step 2: Create the Hero component**

```astro
---
// src/components/Hero.astro
---

<section class="hero">
  <div class="hero-bg" aria-hidden="true">
    <img src="/src/assets/skull-base-motif.svg" alt="" class="hero-motif" />
  </div>

  <div class="container hero-content">
    <h1 class="hero-name">Nicolas Kogane</h1>
    <p class="hero-tagline small-caps">Surgeon &middot; Scientist &middot; Engineer</p>
    <p class="hero-desc">
      CMF surgeon at Necker Hospital. PhD candidate at Arts et Métiers.<br />
      Exploring how skull base synchondroses shape craniofacial development.
    </p>
  </div>

  <div class="hero-scroll" aria-hidden="true">
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1.5">
      <polyline points="2,2 10,8 18,2" />
    </svg>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    pointer-events: none;
  }

  .hero-motif {
    width: 55%;
    max-width: 600px;
    opacity: 0.06;
    transform: translateX(10%);
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 600px;
  }

  .hero-name {
    font-size: 3rem;
    letter-spacing: -0.03em;
    margin-bottom: var(--space-md);
  }

  .hero-tagline {
    color: var(--c-accent);
    margin-bottom: var(--space-lg);
  }

  .hero-desc {
    font-size: 1.05rem;
    color: var(--c-text-2);
    line-height: 1.7;
  }

  .hero-scroll {
    position: absolute;
    bottom: var(--space-lg);
    left: 50%;
    transform: translateX(-50%);
    color: var(--c-text-3);
    animation: drift 2s ease-in-out infinite;
  }

  @keyframes drift {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(6px); }
  }

  @media (max-width: 768px) {
    .hero-name { font-size: 2.2rem; }
    .hero-motif { width: 80%; opacity: 0.04; }
  }
</style>
```

- [ ] **Step 3: Create the SectionPreview component**

```astro
---
// src/components/SectionPreview.astro
interface Props {
  title: string;
  description: string;
  href: string;
  linkText?: string;
}

const { title, description, href, linkText = 'Explore' } = Astro.props;
---

<div class="section-preview">
  <h3 class="section-preview-title">{title}</h3>
  <p class="section-preview-desc">{description}</p>
  <a href={href} class="section-preview-link">
    {linkText} <span aria-hidden="true">&rarr;</span>
  </a>
</div>

<style>
  .section-preview {
    padding: var(--space-lg) 0;
    border-left: 2px solid var(--c-border-light);
    padding-left: var(--space-lg);
    transition: border-color 0.2s;
  }

  .section-preview:hover {
    border-left-color: var(--c-accent);
  }

  .section-preview-title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    margin-bottom: var(--space-sm);
  }

  .section-preview-desc {
    font-size: 0.9rem;
    color: var(--c-text-2);
    line-height: 1.6;
    margin-bottom: var(--space-md);
  }

  .section-preview-link {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--c-accent);
    text-decoration: none;
  }

  .section-preview-link:hover {
    opacity: 0.8;
  }
</style>
```

- [ ] **Step 4: Assemble the landing page**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import SectionPreview from '../components/SectionPreview.astro';

const sections = [
  {
    title: 'PhD',
    description: 'Exploring how skull base synchondroses shape craniofacial development through a multimodal, multiscale approach.',
    href: '/phd',
  },
  {
    title: 'Projects',
    description: 'Research and clinical projects in craniofacial surgery and development.',
    href: '/projects',
  },
  {
    title: 'CV',
    description: 'Education, clinical experience, and research milestones.',
    href: '/cv',
  },
  {
    title: 'Stack',
    description: 'Methods and tools — from molecular biology to clinical imaging.',
    href: '/stack',
  },
  {
    title: 'Labs',
    description: 'Affiliations, collaborations, and the teams behind the research.',
    href: '/labs',
  },
  {
    title: 'Misc',
    description: 'Teaching, talks, and everything else.',
    href: '/misc',
  },
];
---

<BaseLayout title="Home">
  <Hero />

  <div class="container">
    <div class="sections-grid">
      {sections.map((s) => (
        <SectionPreview
          title={s.title}
          description={s.description}
          href={s.href}
        />
      ))}
    </div>
  </div>
</BaseLayout>

<style>
  .sections-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
    padding: var(--space-2xl) 0;
  }

  @media (max-width: 768px) {
    .sections-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 5: Build and preview**

```bash
npm run dev
```

Verify: full-viewport hero with SVG motif at ~6% opacity, name + tagline in terracotta, scroll indicator animates, section previews below fold in 2-column grid with terracotta left-border on hover.

- [ ] **Step 6: Commit**

```bash
git add src/assets/skull-base-motif.svg src/components/Hero.astro src/components/SectionPreview.astro src/pages/index.astro
git commit -m "feat: add hero with atmospheric motif and landing page"
```

---

## Task 7: CV Page

**Files:**
- Create: `src/components/TimelineEntry.astro`
- Create: `src/pages/cv.astro`

- [ ] **Step 1: Create the TimelineEntry component**

```astro
---
// src/components/TimelineEntry.astro
interface Props {
  year: string;
  title: string;
  institution: string;
  description: string;
}

const { year, title, institution, description } = Astro.props;
---

<div class="timeline-entry">
  <div class="timeline-year mono">{year}</div>
  <div class="timeline-body">
    <h3 class="timeline-title">{title}</h3>
    <div class="timeline-institution">{institution}</div>
    <p class="timeline-desc">{description}</p>
  </div>
</div>

<style>
  .timeline-entry {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-lg);
    padding: var(--space-lg) 0;
    border-bottom: 1px solid var(--c-border-light);
  }

  .timeline-entry:last-child {
    border-bottom: none;
  }

  .timeline-year {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--c-text-2);
    padding-top: 2px;
  }

  .timeline-title {
    font-size: 1.05rem;
    margin-bottom: 2px;
  }

  .timeline-institution {
    font-size: 0.85rem;
    color: var(--c-accent);
    margin-bottom: var(--space-sm);
  }

  .timeline-desc {
    font-size: 0.88rem;
    color: var(--c-text-2);
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .timeline-entry {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
```

- [ ] **Step 2: Create the CV page**

```astro
---
// src/pages/cv.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import TimelineEntry from '../components/TimelineEntry.astro';
import { getCollection } from 'astro:content';

const allEntries = await getCollection('cv');

const sections = [
  { key: 'education', label: 'Education' },
  { key: 'clinical', label: 'Clinical Experience' },
  { key: 'research', label: 'Research' },
  { key: 'skills', label: 'Skills & Certifications' },
];
---

<BaseLayout title="CV" description="Curriculum Vitae — Nicolas Kogane">
  <div class="container section">
    <div class="cv-header">
      <h1>Curriculum Vitae</h1>
      <a href="#" class="cv-download mono">Download PDF &darr;</a>
    </div>

    {sections.map(({ key, label }) => {
      const entries = allEntries
        .filter((e) => e.data.section === key);

      return entries.length > 0 && (
        <section class="cv-section">
          <h2 class="cv-section-label small-caps">{label}</h2>
          {entries.map((entry) => (
            <TimelineEntry
              year={entry.data.year}
              title={entry.data.title}
              institution={entry.data.institution}
              description={entry.data.description}
            />
          ))}
        </section>
      );
    })}
  </div>
</BaseLayout>

<style>
  .cv-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-xl);
  }

  .cv-download {
    font-size: 0.8rem;
    color: var(--c-accent);
  }

  .cv-section {
    margin-bottom: var(--space-xl);
  }

  .cv-section-label {
    color: var(--c-text-3);
    margin-bottom: var(--space-md);
    font-family: var(--font-body);
  }
</style>
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Navigate to http://localhost:4321/cv — verify timeline renders with year on the left, content on the right, clean section grouping.

- [ ] **Step 4: Commit**

```bash
git add src/components/TimelineEntry.astro src/pages/cv.astro
git commit -m "feat: add CV page with timeline layout"
```

---

## Task 8: PhD Page

**Files:**
- Create: `src/components/ProgressBar.astro`
- Create: `src/pages/phd/index.astro`

- [ ] **Step 1: Create the ProgressBar component**

```astro
---
// src/components/ProgressBar.astro
interface Props {
  label: string;
  value: number;
  color?: string;
}

const { label, value, color = 'var(--c-accent)' } = Astro.props;
---

<div class="progress-row">
  <div class="progress-label">{label}</div>
  <div class="progress-track">
    <div class="progress-fill" style={`width: ${value}%; background: ${color};`}></div>
  </div>
  <div class="progress-value mono">{value}%</div>
</div>

<style>
  .progress-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
  }

  .progress-label {
    font-size: 0.85rem;
    font-weight: 500;
    min-width: 100px;
  }

  .progress-track {
    flex: 1;
    height: 6px;
    background: var(--c-border-light);
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.6s ease;
  }

  .progress-value {
    font-size: 0.8rem;
    font-weight: 500;
    min-width: 40px;
    text-align: right;
    color: var(--c-text-2);
  }
</style>
```

- [ ] **Step 2: Create the PhD public page**

```astro
---
// src/pages/phd/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProgressBar from '../../components/ProgressBar.astro';
import { getCollection } from 'astro:content';

const progressEntries = await getCollection('phd-progress');
const overall = progressEntries.find((e) => e.data.id === 'overall');
const metrics = progressEntries.filter((e) => e.data.id !== 'overall');
---

<BaseLayout title="PhD" description="PhD research on skull base synchondroses in craniofacial development">
  <div class="container section">
    <h1>PhD Research</h1>
    <p class="phd-subtitle">Role of Skull Base Synchondroses in Craniofacial Development</p>

    <section class="phd-narrative">
      <h2>Context</h2>
      <p>
        Skull base synchondroses are cartilaginous growth plates situated at the
        junctions of the bones forming the cranial base. They are essential drivers
        of craniofacial growth, yet their biology and biomechanics remain poorly
        understood — particularly in pathological conditions like achondroplasia.
      </p>

      <h2>Approach</h2>
      <p>
        This project uses a multimodal, multiscale strategy to decipher the role
        of these structures. From molecular mapping with RNAscope and
        immunofluorescence, through volumetric 3D imaging via LightSheet
        microscopy on cleared specimens, to ex vivo biomechanical stimulation
        and a clinical atlas of human synchondroses spanning fetal life to
        skeletal maturity — each scale builds on the previous to form a
        comprehensive picture.
      </p>
      <p>
        Both control and achondroplasia models (mouse and human) are
        investigated at every level.
      </p>
    </section>

    <section class="phd-progress">
      <h2>Progress</h2>
      <div class="progress-card card">
        {overall && (
          <div class="progress-overall">
            <span class="progress-overall-value mono">{overall.data.value}%</span>
            <span class="progress-overall-label">overall advancement</span>
          </div>
        )}
        <div class="progress-metrics">
          {metrics.map((m) => (
            <ProgressBar
              label={m.data.label}
              value={m.data.value}
              color={m.data.color}
            />
          ))}
        </div>
      </div>
    </section>

    <section class="phd-newsletter-link">
      <h2>Newsletter</h2>
      <p>
        Weekly digests of research progress, distilled from the lab notebook.
      </p>
      <a href="/phd/newsletter" class="mono">Read the newsletter &rarr;</a>
    </section>
  </div>
</BaseLayout>

<style>
  .phd-subtitle {
    font-size: 1rem;
    color: var(--c-text-2);
    font-style: italic;
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .phd-narrative {
    margin-bottom: var(--space-xl);
  }

  .phd-narrative h2 {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-md);
  }

  .phd-narrative p {
    font-size: 0.95rem;
    color: var(--c-text-2);
    line-height: 1.75;
    margin-bottom: var(--space-md);
  }

  .phd-progress {
    margin-bottom: var(--space-xl);
  }

  .phd-progress h2 {
    margin-bottom: var(--space-lg);
  }

  .progress-card {
    padding: var(--space-lg);
  }

  .progress-overall {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--c-border-light);
  }

  .progress-overall-value {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--c-text);
  }

  .progress-overall-label {
    font-size: 0.85rem;
    color: var(--c-text-3);
  }

  .phd-newsletter-link {
    margin-top: var(--space-xl);
  }

  .phd-newsletter-link h2 {
    margin-bottom: var(--space-sm);
  }

  .phd-newsletter-link p {
    font-size: 0.9rem;
    color: var(--c-text-2);
    margin-bottom: var(--space-md);
  }
</style>
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Navigate to /phd — verify editorial narrative, progress bars, newsletter link.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProgressBar.astro src/pages/phd/index.astro
git commit -m "feat: add PhD page with narrative and progress overview"
```

---

## Task 9: Newsletter System

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/phd/newsletter/index.astro`
- Create: `src/pages/phd/newsletter/[...slug].astro`
- Create: `src/pages/rss.xml.js`

- [ ] **Step 1: Create the PostLayout**

```astro
---
// src/layouts/PostLayout.astro
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  date: Date;
  tags?: string[];
}

const { title, date, tags = [] } = Astro.props;
const formattedDate = date.toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={title}>
  <article class="container section">
    <header class="post-header">
      <a href="/phd/newsletter" class="post-back mono">&larr; Newsletter</a>
      <h1>{title}</h1>
      <div class="post-meta">
        <time datetime={date.toISOString()}>{formattedDate}</time>
        {tags.length > 0 && (
          <div class="post-tags">
            {tags.map((tag) => (
              <span class="post-tag small-caps">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </header>
    <div class="post-content">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .post-back {
    font-size: 0.8rem;
    color: var(--c-text-3);
    display: inline-block;
    margin-bottom: var(--space-lg);
  }

  .post-back:hover {
    color: var(--c-accent);
  }

  .post-header {
    margin-bottom: var(--space-xl);
  }

  .post-header h1 {
    margin-bottom: var(--space-md);
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    font-size: 0.85rem;
    color: var(--c-text-3);
  }

  .post-tags {
    display: flex;
    gap: var(--space-sm);
  }

  .post-tag {
    font-size: 0.65rem;
    padding: 2px 8px;
    background: var(--c-border-light);
    border-radius: 99px;
    color: var(--c-text-2);
  }

  .post-content {
    font-size: 0.95rem;
    line-height: 1.8;
    color: var(--c-text);
    max-width: 680px;
  }

  .post-content :global(h2) {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    margin: var(--space-xl) 0 var(--space-md);
  }

  .post-content :global(h3) {
    font-size: 1rem;
    font-weight: 600;
    margin: var(--space-lg) 0 var(--space-sm);
  }

  .post-content :global(p) {
    margin-bottom: var(--space-md);
    color: var(--c-text-2);
  }

  .post-content :global(ul),
  .post-content :global(ol) {
    padding-left: 24px;
    margin-bottom: var(--space-md);
    color: var(--c-text-2);
  }

  .post-content :global(blockquote) {
    border-left: 2px solid var(--c-accent);
    padding-left: var(--space-md);
    margin: var(--space-md) 0;
    color: var(--c-text-2);
    font-style: italic;
  }

  .post-content :global(code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    background: var(--c-border-light);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .post-content :global(hr) {
    border: none;
    border-top: 1px solid var(--c-border-light);
    margin: var(--space-xl) 0;
  }
</style>
```

- [ ] **Step 2: Create the newsletter listing page**

```astro
---
// src/pages/phd/newsletter/index.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('newsletter'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="PhD Newsletter" description="Weekly research digests">
  <div class="container section">
    <h1>Newsletter</h1>
    <p class="newsletter-subtitle">Weekly digests of PhD research progress.</p>

    <div class="newsletter-list">
      {posts.map((post) => {
        const formattedDate = post.data.date.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <a href={`/phd/newsletter/${post.id}`} class="newsletter-item">
            <time class="mono">{formattedDate}</time>
            <div class="newsletter-item-body">
              <h3>{post.data.title}</h3>
              <p>{post.data.summary}</p>
            </div>
          </a>
        );
      })}
    </div>

    <div class="newsletter-rss">
      <a href="/rss.xml" class="mono">RSS Feed &rarr;</a>
    </div>
  </div>
</BaseLayout>

<style>
  .newsletter-subtitle {
    font-size: 0.95rem;
    color: var(--c-text-2);
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .newsletter-list {
    display: flex;
    flex-direction: column;
  }

  .newsletter-item {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: var(--space-lg);
    padding: var(--space-lg) 0;
    border-bottom: 1px solid var(--c-border-light);
    text-decoration: none;
    color: var(--c-text);
    transition: background 0.15s;
  }

  .newsletter-item:hover {
    background: var(--c-border-light);
    margin: 0 calc(-1 * var(--space-md));
    padding-left: var(--space-md);
    padding-right: var(--space-md);
    border-radius: var(--radius-sm);
  }

  .newsletter-item time {
    font-size: 0.78rem;
    color: var(--c-text-3);
    padding-top: 3px;
  }

  .newsletter-item h3 {
    font-size: 1.05rem;
    margin-bottom: 4px;
  }

  .newsletter-item p {
    font-size: 0.85rem;
    color: var(--c-text-2);
    line-height: 1.5;
  }

  .newsletter-rss {
    margin-top: var(--space-xl);
    font-size: 0.82rem;
  }

  @media (max-width: 768px) {
    .newsletter-item {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
```

- [ ] **Step 3: Create the individual post page**

```astro
---
// src/pages/phd/newsletter/[...slug].astro
import PostLayout from '../../../layouts/PostLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('newsletter');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<PostLayout title={post.data.title} date={post.data.date} tags={post.data.tags}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: Create the RSS feed**

```javascript
// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('newsletter');
  return rss({
    title: 'Nicolas Kogane — PhD Newsletter',
    description: 'Weekly digests of PhD research on skull base synchondroses.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: `/phd/newsletter/${post.id}/`,
      })),
  });
}
```

- [ ] **Step 5: Build and preview**

```bash
npm run dev
```

Check: /phd/newsletter lists posts, clicking one opens the full post, /rss.xml returns valid XML.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/PostLayout.astro src/pages/phd/newsletter/ src/pages/rss.xml.js
git commit -m "feat: add newsletter system with listing, posts, and RSS"
```

---

## Task 10: Projects Page

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[...slug].astro`

- [ ] **Step 1: Create the ProjectCard component**

```astro
---
// src/components/ProjectCard.astro
interface Props {
  title: string;
  summary: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  domain: string[];
  href: string;
}

const { title, summary, status, domain, href } = Astro.props;

const statusColors = {
  ongoing: 'var(--c-accent)',
  completed: '#2d8a4e',
  upcoming: 'var(--c-text-3)',
};
---

<a href={href} class="project-card card">
  <div class="project-card-top">
    <span class="project-status small-caps" style={`color: ${statusColors[status]}`}>
      {status}
    </span>
  </div>
  <h3 class="project-title">{title}</h3>
  <p class="project-summary">{summary}</p>
  <div class="project-domains">
    {domain.map((d) => (
      <span class="project-domain small-caps">{d}</span>
    ))}
  </div>
</a>

<style>
  .project-card {
    text-decoration: none;
    color: var(--c-text);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .project-card-top {
    margin-bottom: var(--space-xs);
  }

  .project-status {
    font-size: 0.65rem;
  }

  .project-title {
    font-size: 1.1rem;
  }

  .project-summary {
    font-size: 0.85rem;
    color: var(--c-text-2);
    line-height: 1.6;
    flex: 1;
  }

  .project-domains {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }

  .project-domain {
    font-size: 0.6rem;
    padding: 2px 8px;
    background: var(--c-border-light);
    border-radius: 99px;
    color: var(--c-text-3);
  }
</style>
```

- [ ] **Step 2: Create the projects listing page**

```astro
---
// src/pages/projects/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects'))
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Projects" description="Research and clinical projects">
  <div class="container section">
    <h1>Projects</h1>
    <p class="projects-subtitle">Research, clinical, and engineering projects.</p>

    <div class="card-grid card-grid-2 projects-grid">
      {projects.map((project) => (
        <ProjectCard
          title={project.data.title}
          summary={project.data.summary}
          status={project.data.status}
          domain={project.data.domain}
          href={`/projects/${project.id}`}
        />
      ))}
    </div>
  </div>
</BaseLayout>

<style>
  .projects-subtitle {
    font-size: 0.95rem;
    color: var(--c-text-2);
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .projects-grid {
    margin-top: var(--space-lg);
  }
</style>
```

- [ ] **Step 3: Create the individual project page**

```astro
---
// src/pages/projects/[...slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);

const statusColors = {
  ongoing: 'var(--c-accent)',
  completed: '#2d8a4e',
  upcoming: 'var(--c-text-3)',
};
---

<BaseLayout title={project.data.title} description={project.data.summary}>
  <div class="container section">
    <a href="/projects" class="back-link mono">&larr; Projects</a>

    <header class="project-header">
      <span class="small-caps" style={`color: ${statusColors[project.data.status]}`}>
        {project.data.status}
      </span>
      <h1>{project.data.title}</h1>
      <div class="project-meta">
        {project.data.domain.map((d) => (
          <span class="project-domain small-caps">{d}</span>
        ))}
      </div>
    </header>

    <div class="post-content">
      <Content />
    </div>
  </div>
</BaseLayout>

<style>
  .back-link {
    font-size: 0.8rem;
    color: var(--c-text-3);
    display: inline-block;
    margin-bottom: var(--space-lg);
  }

  .back-link:hover {
    color: var(--c-accent);
  }

  .project-header {
    margin-bottom: var(--space-xl);
  }

  .project-header h1 {
    margin: var(--space-sm) 0 var(--space-md);
  }

  .project-meta {
    display: flex;
    gap: var(--space-sm);
  }

  .project-domain {
    font-size: 0.65rem;
    padding: 2px 8px;
    background: var(--c-border-light);
    border-radius: 99px;
    color: var(--c-text-2);
  }
</style>
```

- [ ] **Step 4: Build and preview**

```bash
npm run dev
```

Check: /projects shows a card grid, clicking a card opens the project detail page with full markdown content.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.astro src/pages/projects/
git commit -m "feat: add projects page with card grid and detail pages"
```

---

## Task 11: Stack Page

**Files:**
- Create: `src/components/StackLayer.astro`
- Create: `src/pages/stack.astro`

- [ ] **Step 1: Create the StackLayer component**

```astro
---
// src/components/StackLayer.astro
interface Props {
  layer: string;
  methods: string;
  tools: string;
  description: string;
  isLast?: boolean;
}

const { layer, methods, tools, description, isLast = false } = Astro.props;
---

<div class="stack-layer">
  <div class="stack-connector" aria-hidden="true">
    <div class="stack-dot"></div>
    {!isLast && <div class="stack-line"></div>}
  </div>

  <div class="stack-content card">
    <div class="stack-header">
      <h3 class="stack-layer-name">{layer}</h3>
    </div>
    <div class="stack-body">
      <div class="stack-col">
        <div class="stack-col-label small-caps">Methods</div>
        <div class="stack-col-value">{methods}</div>
      </div>
      <div class="stack-col">
        <div class="stack-col-label small-caps">Tools</div>
        <div class="stack-col-value mono">{tools}</div>
      </div>
    </div>
    <p class="stack-desc">{description}</p>
  </div>
</div>

<style>
  .stack-layer {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: var(--space-md);
  }

  .stack-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: var(--space-lg);
  }

  .stack-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c-accent);
    flex-shrink: 0;
  }

  .stack-line {
    width: 1.5px;
    flex: 1;
    background: var(--c-border);
    margin-top: var(--space-sm);
  }

  .stack-content {
    margin-bottom: var(--space-md);
  }

  .stack-header {
    margin-bottom: var(--space-md);
  }

  .stack-layer-name {
    font-size: 1.15rem;
  }

  .stack-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
    margin-bottom: var(--space-md);
  }

  .stack-col-label {
    color: var(--c-text-3);
    margin-bottom: var(--space-xs);
    font-family: var(--font-body);
  }

  .stack-col-value {
    font-size: 0.88rem;
    color: var(--c-text-2);
    line-height: 1.5;
  }

  .stack-desc {
    font-size: 0.85rem;
    color: var(--c-text-3);
    line-height: 1.6;
    border-top: 1px solid var(--c-border-light);
    padding-top: var(--space-md);
  }

  @media (max-width: 768px) {
    .stack-body {
      grid-template-columns: 1fr;
      gap: var(--space-md);
    }
  }
</style>
```

- [ ] **Step 2: Create the Stack page**

```astro
---
// src/pages/stack.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import StackLayer from '../components/StackLayer.astro';
import { getCollection } from 'astro:content';

const layers = (await getCollection('stack'))
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Stack" description="Research methods and tools pipeline">
  <div class="container section">
    <h1>Stack</h1>
    <p class="stack-subtitle">Methods and tools — from molecular biology to clinical imaging.</p>

    <div class="stack-pipeline">
      {layers.map((layer, i) => (
        <StackLayer
          layer={layer.data.layer}
          methods={layer.data.methods}
          tools={layer.data.tools}
          description={layer.data.description}
          isLast={i === layers.length - 1}
        />
      ))}
    </div>
  </div>
</BaseLayout>

<style>
  .stack-subtitle {
    font-size: 0.95rem;
    color: var(--c-text-2);
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .stack-pipeline {
    max-width: 700px;
  }
</style>
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Check: /stack shows a vertical pipeline with terracotta dots and connecting lines, each layer as a card with methods/tools split.

- [ ] **Step 4: Commit**

```bash
git add src/components/StackLayer.astro src/pages/stack.astro
git commit -m "feat: add stack page with pipeline visualization"
```

---

## Task 12: Labs Page

**Files:**
- Create: `src/components/LabCard.astro`
- Create: `src/pages/labs.astro`

- [ ] **Step 1: Create the LabCard component**

```astro
---
// src/components/LabCard.astro
interface Props {
  name: string;
  pi: string;
  institution: string;
  role: string;
  work: string;
  url?: string;
}

const { name, pi, institution, role, work, url } = Astro.props;
---

<div class="lab-card card">
  <h3 class="lab-name">{name}</h3>
  <div class="lab-meta">
    <span class="lab-pi">{pi}</span>
    <span class="lab-sep">&middot;</span>
    <span class="lab-institution">{institution}</span>
  </div>
  <div class="lab-role small-caps">{role}</div>
  <p class="lab-work">{work}</p>
  {url && (
    <a href={url} class="lab-link mono" target="_blank" rel="noopener">
      Visit lab &rarr;
    </a>
  )}
</div>

<style>
  .lab-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .lab-name {
    font-size: 1.1rem;
  }

  .lab-meta {
    font-size: 0.85rem;
    color: var(--c-text-2);
  }

  .lab-sep {
    margin: 0 6px;
    color: var(--c-text-3);
  }

  .lab-role {
    color: var(--c-accent);
    font-size: 0.65rem;
    font-family: var(--font-body);
  }

  .lab-work {
    font-size: 0.88rem;
    color: var(--c-text-2);
    line-height: 1.6;
    flex: 1;
  }

  .lab-link {
    font-size: 0.78rem;
    margin-top: var(--space-sm);
  }
</style>
```

- [ ] **Step 2: Create the Labs page**

```astro
---
// src/pages/labs.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import LabCard from '../components/LabCard.astro';
import { getCollection } from 'astro:content';

const labEntries = await getCollection('labs');
---

<BaseLayout title="Labs" description="Lab affiliations and collaborations">
  <div class="container section">
    <h1>Labs</h1>
    <p class="labs-subtitle">Affiliations, collaborations, and the teams behind the research.</p>

    <div class="card-grid card-grid-2 labs-grid">
      {labEntries.map((lab) => (
        <LabCard
          name={lab.data.name}
          pi={lab.data.pi}
          institution={lab.data.institution}
          role={lab.data.role}
          work={lab.data.work}
          url={lab.data.url}
        />
      ))}
    </div>
  </div>
</BaseLayout>

<style>
  .labs-subtitle {
    font-size: 0.95rem;
    color: var(--c-text-2);
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .labs-grid {
    margin-top: var(--space-lg);
  }
</style>
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Check: /labs shows cards with lab info, role in terracotta, clean 2-column grid.

- [ ] **Step 4: Commit**

```bash
git add src/components/LabCard.astro src/pages/labs.astro
git commit -m "feat: add labs page with affiliation cards"
```

---

## Task 13: Misc Page

**Files:**
- Create: `src/components/MiscCard.astro`
- Create: `src/pages/misc.astro`

- [ ] **Step 1: Create the MiscCard component**

```astro
---
// src/components/MiscCard.astro
interface Props {
  title: string;
  category: string;
  href: string;
}

const { title, category, href } = Astro.props;
---

<a href={href} class="misc-card card">
  <span class="misc-category small-caps">{category}</span>
  <h3 class="misc-title">{title}</h3>
</a>

<style>
  .misc-card {
    text-decoration: none;
    color: var(--c-text);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-lg);
  }

  .misc-category {
    font-size: 0.6rem;
    color: var(--c-accent);
    font-family: var(--font-body);
  }

  .misc-title {
    font-size: 1rem;
  }
</style>
```

- [ ] **Step 2: Create the Misc page**

```astro
---
// src/pages/misc.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import MiscCard from '../components/MiscCard.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('misc'))
  .sort((a, b) => {
    const dateA = a.data.date?.getTime() ?? 0;
    const dateB = b.data.date?.getTime() ?? 0;
    return dateB - dateA;
  });

// Group by category
const categories = [...new Set(entries.map((e) => e.data.category))];
---

<BaseLayout title="Misc" description="Teaching, talks, and everything else">
  <div class="container section">
    <h1>Misc</h1>
    <p class="misc-subtitle">Teaching, talks, and everything else.</p>

    {categories.map((cat) => {
      const catEntries = entries.filter((e) => e.data.category === cat);
      return (
        <section class="misc-section">
          <h2 class="misc-section-label small-caps">{cat}</h2>
          <div class="card-grid card-grid-3">
            {catEntries.map((entry) => (
              <MiscCard
                title={entry.data.title}
                category={entry.data.category}
                href={`#${entry.id}`}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
</BaseLayout>

<style>
  .misc-subtitle {
    font-size: 0.95rem;
    color: var(--c-text-2);
    margin-top: var(--space-sm);
    margin-bottom: var(--space-xl);
  }

  .misc-section {
    margin-bottom: var(--space-xl);
  }

  .misc-section-label {
    color: var(--c-text-3);
    margin-bottom: var(--space-lg);
    font-family: var(--font-body);
  }
</style>
```

- [ ] **Step 3: Build and preview**

```bash
npm run dev
```

Check: /misc shows entries grouped by category in a 3-column grid.

- [ ] **Step 4: Commit**

```bash
git add src/components/MiscCard.astro src/pages/misc.astro
git commit -m "feat: add misc page with categorized grid"
```

---

## Task 14: Private Backend (Lab Notebook + Meetings)

**Files:**
- Create: `src/content/lab-entries/2026-03-26-example.md`
- Create: `src/content/meetings/2026-03-26-example.md`
- Create: `src/pages/phd/lab/index.astro`
- Create: `src/pages/phd/meetings/index.astro`

- [ ] **Step 1: Create sample private content**

`src/content/lab-entries/2026-03-26-example.md`:
```markdown
---
title: "Example Lab Entry"
date: 2026-03-26
tags: [meta]
---

This is a sample lab notebook entry. Write your daily observations, experiments, and analyses here. These entries are private (noindex) and serve as source material for newsletter digests.
```

`src/content/meetings/2026-03-26-example.md`:
```markdown
---
title: "Example Meeting Notes"
date: 2026-03-26
attendees: [Nicolas Kogane]
decisions: [Set up private meeting notes system]
actions: [Populate with real meeting notes]
---

Sample meeting entry. Record attendees, key decisions, and action items. These are private and not linked from public navigation.
```

- [ ] **Step 2: Create the private lab notebook listing page**

```astro
---
// src/pages/phd/lab/index.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('lab-entries'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="Lab Notebook (Private)" noindex={true}>
  <div class="container section">
    <div class="private-banner">Private — not indexed</div>
    <h1>Lab Notebook</h1>

    <div class="entry-list">
      {entries.map((entry) => {
        const formattedDate = entry.data.date.toLocaleDateString('en-GB', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
        return (
          <div class="entry-item">
            <time class="mono">{formattedDate}</time>
            <div>
              <h3>{entry.data.title}</h3>
              {entry.data.tags.length > 0 && (
                <div class="entry-tags">
                  {entry.data.tags.map((tag) => (
                    <span class="entry-tag small-caps">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</BaseLayout>

<style>
  .private-banner {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--c-text-3);
    background: var(--c-border-light);
    display: inline-block;
    padding: 2px 10px;
    border-radius: 99px;
    margin-bottom: var(--space-lg);
  }

  .entry-list {
    margin-top: var(--space-xl);
  }

  .entry-item {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: var(--space-lg);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--c-border-light);
  }

  .entry-item time {
    font-size: 0.78rem;
    color: var(--c-text-3);
  }

  .entry-item h3 {
    font-size: 0.95rem;
    margin-bottom: 4px;
  }

  .entry-tags {
    display: flex;
    gap: var(--space-xs);
  }

  .entry-tag {
    font-size: 0.6rem;
    padding: 1px 6px;
    background: var(--c-border-light);
    border-radius: 99px;
    color: var(--c-text-3);
  }
</style>
```

- [ ] **Step 3: Create the private meetings listing page**

```astro
---
// src/pages/phd/meetings/index.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const meetingEntries = (await getCollection('meetings'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="Meetings (Private)" noindex={true}>
  <div class="container section">
    <div class="private-banner">Private — not indexed</div>
    <h1>Meetings</h1>

    <div class="meeting-list">
      {meetingEntries.map((meeting) => {
        const formattedDate = meeting.data.date.toLocaleDateString('en-GB', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
        return (
          <div class="meeting-item">
            <time class="mono">{formattedDate}</time>
            <div>
              <h3>{meeting.data.title}</h3>
              {meeting.data.attendees.length > 0 && (
                <p class="meeting-attendees">{meeting.data.attendees.join(', ')}</p>
              )}
              {meeting.data.decisions.length > 0 && (
                <div class="meeting-decisions">
                  <span class="small-caps">Decisions:</span>
                  <ul>
                    {meeting.data.decisions.map((d) => <li>{d}</li>)}
                  </ul>
                </div>
              )}
              {meeting.data.actions.length > 0 && (
                <div class="meeting-actions">
                  <span class="small-caps">Actions:</span>
                  <ul>
                    {meeting.data.actions.map((a) => <li>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</BaseLayout>

<style>
  .private-banner {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--c-text-3);
    background: var(--c-border-light);
    display: inline-block;
    padding: 2px 10px;
    border-radius: 99px;
    margin-bottom: var(--space-lg);
  }

  .meeting-list {
    margin-top: var(--space-xl);
  }

  .meeting-item {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: var(--space-lg);
    padding: var(--space-lg) 0;
    border-bottom: 1px solid var(--c-border-light);
  }

  .meeting-item time {
    font-size: 0.78rem;
    color: var(--c-text-3);
  }

  .meeting-item h3 {
    font-size: 0.95rem;
    margin-bottom: 4px;
  }

  .meeting-attendees {
    font-size: 0.82rem;
    color: var(--c-text-2);
    margin-bottom: var(--space-sm);
  }

  .meeting-decisions,
  .meeting-actions {
    font-size: 0.82rem;
    margin-top: var(--space-sm);
  }

  .meeting-decisions ul,
  .meeting-actions ul {
    padding-left: 18px;
    margin-top: 4px;
    color: var(--c-text-2);
  }

  .meeting-decisions li,
  .meeting-actions li {
    margin-bottom: 2px;
  }
</style>
```

- [ ] **Step 4: Exclude private pages from sitemap**

Update `astro.config.mjs` to filter private routes from the sitemap:

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nclkgn.github.io',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/phd/lab') && !page.includes('/phd/meetings'),
    }),
  ],
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
});
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Check that `/phd/lab/` and `/phd/meetings/` pages are generated with `<meta name="robots" content="noindex, nofollow">` and do NOT appear in `dist/sitemap-*.xml`.

- [ ] **Step 6: Commit**

```bash
git add src/content/lab-entries/ src/content/meetings/ src/pages/phd/lab/ src/pages/phd/meetings/ astro.config.mjs
git commit -m "feat: add private lab notebook and meetings pages (noindex)"
```

---

## Task 15: i18n Foundation

**Files:**
- Create: `src/i18n/en.ts`
- Create: `src/i18n/fr.ts`
- Create: `src/i18n/index.ts`

- [ ] **Step 1: Create English UI strings**

```typescript
// src/i18n/en.ts
export default {
  nav: {
    phd: 'PhD',
    projects: 'Projects',
    cv: 'CV',
    stack: 'Stack',
    labs: 'Labs',
    misc: 'Misc',
  },
  hero: {
    tagline: 'Surgeon · Scientist · Engineer',
    description: 'CMF surgeon at Necker Hospital. PhD candidate at Arts et Métiers. Exploring how skull base synchondroses shape craniofacial development.',
  },
  sections: {
    phd: { title: 'PhD', description: 'Exploring how skull base synchondroses shape craniofacial development through a multimodal, multiscale approach.' },
    projects: { title: 'Projects', description: 'Research and clinical projects in craniofacial surgery and development.' },
    cv: { title: 'CV', description: 'Education, clinical experience, and research milestones.' },
    stack: { title: 'Stack', description: 'Methods and tools — from molecular biology to clinical imaging.' },
    labs: { title: 'Labs', description: 'Affiliations, collaborations, and the teams behind the research.' },
    misc: { title: 'Misc', description: 'Teaching, talks, and everything else.' },
  },
  common: {
    explore: 'Explore',
    back: 'Back',
    downloadPdf: 'Download PDF',
    readMore: 'Read more',
    newsletter: 'Newsletter',
    rssFeed: 'RSS Feed',
    overallAdvancement: 'overall advancement',
  },
  footer: {
    name: 'Nicolas Kogane',
    tagline: 'Surgeon · Scientist · Engineer',
  },
} as const;
```

- [ ] **Step 2: Create French placeholder**

```typescript
// src/i18n/fr.ts
// Placeholder — to be filled when bilingual content is ready
export default {
  nav: {
    phd: 'Thèse',
    projects: 'Projets',
    cv: 'CV',
    stack: 'Stack',
    labs: 'Labos',
    misc: 'Divers',
  },
  hero: {
    tagline: 'Chirurgien · Scientifique · Ingénieur',
    description: 'Chirurgien CMF à l\'hôpital Necker. Doctorant aux Arts et Métiers. Étude du rôle des synchondroses de la base du crâne dans le développement craniofacial.',
  },
  sections: {
    phd: { title: 'Thèse', description: 'Explorer le rôle des synchondroses de la base du crâne dans le développement craniofacial via une approche multimodale et multi-échelle.' },
    projects: { title: 'Projets', description: 'Projets de recherche et cliniques en chirurgie et développement craniofacial.' },
    cv: { title: 'CV', description: 'Formation, expérience clinique et jalons de recherche.' },
    stack: { title: 'Stack', description: 'Méthodes et outils — de la biologie moléculaire à l\'imagerie clinique.' },
    labs: { title: 'Labos', description: 'Affiliations, collaborations et équipes de recherche.' },
    misc: { title: 'Divers', description: 'Enseignement, conférences et tout le reste.' },
  },
  common: {
    explore: 'Explorer',
    back: 'Retour',
    downloadPdf: 'Télécharger le PDF',
    readMore: 'Lire la suite',
    newsletter: 'Newsletter',
    rssFeed: 'Flux RSS',
    overallAdvancement: 'avancement global',
  },
  footer: {
    name: 'Nicolas Kogane',
    tagline: 'Chirurgien · Scientifique · Ingénieur',
  },
} as const;
```

- [ ] **Step 3: Create the i18n utility**

```typescript
// src/i18n/index.ts
import en from './en';
import fr from './fr';

const translations = { en, fr } as const;
type Locale = keyof typeof translations;

export function t(locale: Locale = 'en') {
  return translations[locale];
}

export function getLocale(): Locale {
  return 'en'; // For now, always English. Will use Astro.currentLocale in bilingual phase.
}
```

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: Build succeeds. The i18n module is importable but not yet wired into components (that's the bilingual phase).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n foundation with EN/FR UI strings"
```

---

## Task 16: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` (if needed)
- Modify: `.gitignore`

- [ ] **Step 1: Create the GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify Astro config has the correct site URL**

The `astro.config.mjs` should already have:
```javascript
site: 'https://nclkgn.github.io',
```

If deploying as a project page (e.g. `/phd-dashboard`), add:
```javascript
base: '/phd-dashboard',
```

For a user page (root), no `base` is needed.

**Note for Nicolas**: To deploy at the root (`nclkgn.github.io`), the repository must be named `nclkgn.github.io`. If you want to keep the current repo name, add `base: '/PhD-Dashboard'` (or whatever the repo name is) to the config. Alternatively, configure a custom domain in GitHub Pages settings.

- [ ] **Step 3: Build locally to verify everything works end-to-end**

```bash
npm run build
```

Expected: Clean build with all pages generated in `dist/`. Check the output for any warnings.

```bash
npm run preview
```

Navigate through all pages: /, /cv, /phd, /phd/newsletter, /projects, /stack, /labs, /misc. Verify navigation, links, and styles.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task 17: Cleanup — Remove Jekyll Files

**Files:**
- Delete: all Jekyll-specific files (see list below)
- Modify: `.gitignore` (remove Jekyll entries if any)

- [ ] **Step 1: Verify Astro site is fully working**

```bash
npm run build && npm run preview
```

Navigate every page one final time. If everything works, proceed.

- [ ] **Step 2: Remove Jekyll files**

```bash
rm -rf _config.yml Gemfile _layouts _includes _data _posts _lab-entries _meetings
rm -rf assets blog dashboard lab-notebook meetings thesis
rm -f index.html feed.xml deploy_github.sh new-entry.sh new-meeting.sh new-post.sh
rm -f update_dashboard.py données_phd.xlsx
rm -rf "{_layouts,_includes,_posts,assets"
```

- [ ] **Step 3: Clean up .gitignore**

Keep only the Astro-relevant entries:

```gitignore
# Astro
dist/
node_modules/
.astro/

# Environment
.env
.env.*

# OS
.DS_Store
```

- [ ] **Step 4: Final build verification**

```bash
npm run build
```

Expected: Clean build, no references to old Jekyll files.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Jekyll files — Astro migration complete"
```

---

## Summary

| Task | Description | Key files |
|------|-------------|-----------|
| 1 | Project scaffolding | `package.json`, `astro.config.mjs` |
| 2 | Design system | `src/styles/global.css` |
| 3 | Base layout + footer | `src/layouts/BaseLayout.astro` |
| 4 | Navigation | `src/components/Nav.astro` |
| 5 | Content collections | `src/content.config.ts`, `src/data/*.yaml` |
| 6 | Hero + landing page | `Hero.astro`, `SectionPreview.astro`, `index.astro` |
| 7 | CV page | `TimelineEntry.astro`, `cv.astro` |
| 8 | PhD page | `ProgressBar.astro`, `phd/index.astro` |
| 9 | Newsletter | `PostLayout.astro`, newsletter pages, `rss.xml.js` |
| 10 | Projects | `ProjectCard.astro`, project pages |
| 11 | Stack | `StackLayer.astro`, `stack.astro` |
| 12 | Labs | `LabCard.astro`, `labs.astro` |
| 13 | Misc | `MiscCard.astro`, `misc.astro` |
| 14 | Private backend | Lab notebook + meetings pages (noindex) |
| 15 | i18n foundation | `src/i18n/` |
| 16 | GitHub Pages deployment | `.github/workflows/deploy.yml` |
| 17 | Jekyll cleanup | Remove old files |
