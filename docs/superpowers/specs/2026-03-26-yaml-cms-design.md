# YAML Data CMS Editing — Design Spec

## Goal

Make the four YAML data collections (CV, Stack, Labs, PhD Progress) editable through the existing Sveltia CMS at `/admin/`, so Nicolas can update structured data from any browser without touching YAML files directly.

## Approach

Restructure YAML files from bare arrays to keyed maps, add Sveltia "file" collections to `config.yml`, and update Astro's content config to match. Pages need minimal changes.

## Current State

Four YAML files in `src/data/` use bare arrays:

```yaml
# cv.yaml (current — bare array)
- id: phd-arts-metiers
  section: education
  title: PhD in Biomechanics
  ...
```

Sveltia CMS "file" collections require YAML with named top-level keys, not arrays.

## Changes

### 1. YAML File Restructuring

Convert each file from bare array to map keyed by the current `id` field. The `id` property is removed from each entry since it becomes the key.

**cv.yaml — 4 entries:**
```yaml
phd-arts-metiers:
  section: education
  year: "2024–present"
  title: PhD in Biomechanics
  institution: Arts et Métiers Institute of Technology
  description: Role of skull base synchondroses in craniofacial development — multimodal, multiscale approach.

medical-degree:
  section: education
  year: "2015–2022"
  title: Medical Degree (MD)
  institution: "[Your University]"
  description: "[Update with your medical school details]"

cmf-necker:
  section: clinical
  year: "2023–present"
  title: CMF Surgery Fellow
  institution: Necker Hospital — Maxillo-Facial & Plastic Surgery
  description: Craniofacial surgery, pediatric maxillofacial surgery.

skull-base-phd:
  section: research
  year: "2024–present"
  title: Skull Base Synchondroses Project
  institution: Arts et Métiers / Necker Hospital
  description: Multimodal investigation from molecular patterns to clinical atlas.
```

**stack.yaml — 4 entries:** Same pattern. Key = current `id` (molecular, imaging-3d, biomechanics, clinical).

**labs.yaml — 2 entries:** Key = current `id` (lab-placeholder-1, lab-placeholder-2).

**phd-progress.yaml — 4 entries:** Key = current `id` (overall, biology, biomechanics, human-data).

### 2. Astro Content Config (`src/content.config.ts`)

Remove `id: z.string()` from all four YAML collection schemas. Astro's `file()` loader automatically uses the map key as `entry.id`.

```typescript
const cv = defineCollection({
  loader: file('./src/data/cv.yaml'),
  schema: z.object({
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
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
  }),
});
```

### 3. Sveltia CMS Config (`public/admin/config.yml`)

Add four new "file" collections. Each points to a single YAML file and defines typed fields.

```yaml
# ── CV (public) ───────────────────────────────────
- name: cv
  label: "CV"
  file: src/data/cv.yaml
  fields:
    - { label: Section, name: section, widget: select, options: [education, clinical, research, skills] }
    - { label: Year, name: year, widget: string }
    - { label: Title, name: title, widget: string }
    - { label: Institution, name: institution, widget: string }
    - { label: Description, name: description, widget: text }

# ── Stack (public) ────────────────────────────────
- name: stack
  label: "Stack"
  file: src/data/stack.yaml
  fields:
    - { label: Layer, name: layer, widget: string }
    - { label: Methods, name: methods, widget: string }
    - { label: Tools, name: tools, widget: string }
    - { label: Description, name: description, widget: text }
    - { label: Order, name: order, widget: number, value_type: int }

# ── Labs (public) ─────────────────────────────────
- name: labs
  label: "Labs"
  file: src/data/labs.yaml
  fields:
    - { label: Name, name: name, widget: string }
    - { label: PI, name: pi, widget: string }
    - { label: Institution, name: institution, widget: string }
    - { label: Role, name: role, widget: string }
    - { label: Work, name: work, widget: text }
    - { label: URL, name: url, widget: string, required: false }

# ── PhD Progress (public) ─────────────────────────
- name: phd-progress
  label: "PhD Progress"
  file: src/data/phd-progress.yaml
  fields:
    - { label: Label, name: label, widget: string }
    - { label: Value, name: value, widget: number, value_type: int, min: 0, max: 100 }
    - { label: Color, name: color, widget: color, required: false }
```

### 4. Page Changes

Only one page references `data.id` directly:

**`src/pages/phd/index.astro`** — change `e.data.id` to `e.id`:
```typescript
const overall = progressEntries.find((e) => e.id === 'overall');
const metrics = progressEntries.filter((e) => e.id !== 'overall');
```

All other pages (`cv.astro`, `stack.astro`, `labs.astro`) iterate over entries without referencing `id` — no changes needed.

## Constraints

- **Sveltia "file" collections are single-entry editors**: They show all fields of the file as one form. This works well for small collections (4-10 entries). For larger collections in the future, folder-based Markdown might be better.
- **Adding/removing entries**: Sveltia's file collection editor edits the existing structure but may not support adding new top-level keys via the UI. To add a new CV entry or progress metric, you'd edit the YAML directly (or via GitHub). Existing entries are fully editable through the CMS.
- **No draft workflow**: Data collections don't need drafts — they're always "live" (same as before).

## Files Changed

| File | Change |
|------|--------|
| `src/data/cv.yaml` | Array → keyed map |
| `src/data/stack.yaml` | Array → keyed map |
| `src/data/labs.yaml` | Array → keyed map |
| `src/data/phd-progress.yaml` | Array → keyed map |
| `src/content.config.ts` | Remove `id` from 4 schemas |
| `public/admin/config.yml` | Add 4 file collections |
| `src/pages/phd/index.astro` | `e.data.id` → `e.id` (2 lines) |
