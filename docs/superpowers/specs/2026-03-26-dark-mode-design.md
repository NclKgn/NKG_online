# Dark Mode — Design Spec

## Goal

Add a functional dark mode to the PhD Dashboard with manual toggle and OS preference detection, using the existing CSS custom property system.

## Approach

Set `data-theme="dark"` on `<html>` to override CSS custom properties. A tiny inline script in `<head>` prevents flash of wrong theme by reading `localStorage` / `prefers-color-scheme` before paint. A toggle button in the nav cycles between system, light, and dark.

## Color Palette

### Light Mode (existing, with success color change)

| Token | Value | Description |
|-------|-------|-------------|
| `--c-bg` | `#fafaf9` | Page background |
| `--c-surface` | `#ffffff` | Card/surface background |
| `--c-text` | `#1c1917` | Primary text |
| `--c-text-2` | `#78716c` | Secondary text |
| `--c-text-3` | `#a8a29e` | Tertiary text |
| `--c-border` | `#e7e5e4` | Border |
| `--c-border-light` | `#f5f5f4` | Light border/divider |
| `--c-accent` | `#b05e3a` | Primary accent (terracotta) |
| `--c-accent-light` | `#fdf2ed` | Accent background |
| `--c-success` | `#7a8a6a` | Success/completed (slate olive, was `#2d8a4e`) |
| `--shadow-sm` | `0 1px 2px rgba(28,25,23,0.04)` | Small shadow |
| `--shadow` | `0 2px 8px rgba(28,25,23,0.06)` | Medium shadow |
| `--shadow-lg` | `0 8px 24px rgba(28,25,23,0.08)` | Large shadow |

### Dark Mode (new)

| Token | Value | Description |
|-------|-------|-------------|
| `--c-bg` | `#0e0d0c` | Deep gray-brown background |
| `--c-surface` | `#171615` | Card surface |
| `--c-text` | `#cbc7c3` | Primary text |
| `--c-text-2` | `#847e79` | Secondary text |
| `--c-text-3` | `#5c5752` | Tertiary text |
| `--c-border` | `#282523` | Border |
| `--c-border-light` | `#171615` | Light border/divider |
| `--c-accent` | `#a87a5a` | Muted terracotta |
| `--c-accent-light` | `#1e1712` | Accent background |
| `--c-success` | `#8a9a78` | Slate olive (lighter for dark bg) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Small shadow |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.4)` | Medium shadow |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Large shadow |

### Progress Bar Color Change (both modes)

Biology progress bar color changes from `#2d8a4e` (green) to `#6080a0` (dusty steel blue). Updated in `phd-progress.yaml` data. The three progress metrics become:

- Biology: `#6080a0` (dusty steel blue)
- Biomechanics: `#e07b2a` (warm orange, unchanged)
- Human Data: `#c0392b` (muted red, unchanged)

## Theme Detection & Flash Prevention

An inline `<script>` in `<head>` (before any CSS paints) that:
1. Reads `localStorage.getItem('theme')` for a saved preference
2. If no saved preference, checks `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Sets `document.documentElement.dataset.theme = 'dark'` if applicable
4. Listens for OS preference changes and updates if no manual override is set

This runs synchronously before paint — no flash of light theme when dark is expected (or vice versa).

## Toggle Button (ThemeToggle.astro)

A new component placed in the Nav bar. Behavior:

- **Three states:** system (auto) → light (forced) → dark (forced) → system (loop)
- **Icons:** Sun icon (when dark, click to go light), moon icon (when light, click to go dark), system icon (auto mode)
- **Icons are inline SVG** — no icon library dependency
- **Stores preference** in `localStorage` under key `theme` with values: `null` (system), `'light'`, `'dark'`
- **Accessible:** `aria-label` updates with current state, `button` element with focus styles

## Nav Backdrop Fix

The Nav component currently has a hardcoded `rgba(250, 250, 249, 0.85)` for its frosted glass backdrop on scroll. This needs to use a CSS variable so it adapts to dark mode:

- Add `--c-nav-backdrop` token: light = `rgba(250, 250, 249, 0.85)`, dark = `rgba(14, 13, 12, 0.85)`

## Files Changed

| File | Change |
|------|--------|
| `src/styles/global.css` | Update `--c-success` to slate olive; add `[data-theme="dark"]` block with all dark token overrides; add `--c-nav-backdrop` |
| `src/layouts/BaseLayout.astro` | Add inline theme detection `<script>` in `<head>` |
| `src/components/ThemeToggle.astro` | New component: toggle button with sun/moon/system icons and localStorage logic |
| `src/components/Nav.astro` | Add `<ThemeToggle />` to nav bar; replace hardcoded backdrop rgba with `var(--c-nav-backdrop)` |
| `src/data/phd-progress.yaml` | Change biology color from `"#2d8a4e"` to `"#6080a0"` |

## Constraints

- No JavaScript framework needed — vanilla JS in the Astro component's `<script>` tag
- No icon library — inline SVG for sun/moon icons
- No CSS framework — pure CSS custom property overrides
- The theme toggle must work without JavaScript for the OS-preference-only case (CSS `@media (prefers-color-scheme: dark)` as fallback)
- The `/admin/` page (Sveltia CMS) is unaffected — it has its own styling
