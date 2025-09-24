# Brand Tokens & Theming

This app uses CSS variables (HSL) with Tailwind’s `dark` class to power light/dark themes. Tokens live in CSS and are consumed via Tailwind utilities and small brand helper classes.

- Source: `src/app/globals.css`
- Toggle: `src/components/ui/theme-toggle.tsx` (persists to localStorage; respects system preference)
- FOUC prevention: inline theme init in `src/app/layout.tsx`

## Token Model

Tokens are defined as CSS custom properties (HSL values) with light defaults under `:root` and dark overrides under `.dark`.

### Core Semantic Tokens
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--muted` / `--muted-foreground` (contrast-tuned)
- `--accent` / `--accent-foreground`
- `--destructive` / `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius` (border radius scale)

### Brand Extension Tokens
- Hex aliases (useful for icons/images):
  - `--brand-purple-hex`, `--brand-orange-hex`, `--brand-text-hex`, `--brand-muted-hex`
- Surfaces and muted in HSL for utility use:
  - `--brand-surface` (light/dark-safe surface)
  - `--brand-muted` (muted text ramp)

## Utilities and Brand Helpers
The following classes encapsulate common brand styles:
- `.brand-surface`: branded surface that adapts to theme
- `.brand-muted`: muted text that passes contrast in both themes
- `.brand-gradient`: gradient background from primary→secondary
- `.brand-text-gradient`: gradient text (primary→secondary)
- `.brand-shadow`: soft on-brand shadow
- `.brand-border`: on-brand border

## Tailwind Usage Patterns
Use Tailwind color utilities with HSL tokens via arbitrary values:

```tsx
// Backgrounds and text
<div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" />

// Buttons
<button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-[var(--radius)]">
  Get started
</button>

// Cards/Surfaces
<div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))] rounded-[var(--radius)]" />

// Brand helpers
<div className="brand-surface p-6 rounded-xl">Content</div>
<p className="brand-muted">Secondary information</p>
```

### Gradients
```tsx
// Background gradient
<div className="brand-gradient text-white p-6 rounded-xl" />

// Text gradient
<h2 className="brand-text-gradient text-4xl font-bold">Stock Media SaaS</h2>
```

### Focus and Rings
```tsx
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-[var(--radius)]">
  Focusable
</button>
```

## Component Recipes

### Brand Button (outline)
```tsx
<button className="border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] rounded-[var(--radius)] px-4 py-2 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]">
  Outline CTA
</button>
```

### Alert (destructive)
```tsx
<div className="border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200 rounded-[var(--radius)] px-4 py-3">
  Something went wrong.
</div>
```

## Dark Mode
- Toggle uses class strategy: `<html class="dark">`.
- All tokens have dark overrides in `.dark`.
- Prevent FOUC by applying the stored theme before hydration (inline script in `layout.tsx`).

## Accessibility and Contrast
- Muted text has been tuned to meet WCAG AA for both themes.
- Prefer `focus-visible` rings using `--ring` for keyboard users.
- Maintain a minimum contrast ratio of 4.5:1 for body text, 3:1 for large text.
- Respect `prefers-reduced-motion`; avoid essential content relying solely on motion.

## Naming and Best Practices
- Prefer semantic tokens (`--primary`, `--background`) over raw hex in components.
- Use brand helpers for common surfaces and gradients for consistency.
- Keep spacing/radius responsive to `--radius` where appropriate.
- When in doubt, use semantic tokens; only drop to brand hex for assets (icons, images).

## Examples in this Codebase
- Header uses focus-visible rings and improved contrast.
- Order v3 uses skeletons and polite/assertive `aria-live` announcements.
- Landing sections use gradients and brand surfaces.

## Quick Reference
```txt
Background: bg-[hsl(var(--background))]
Foreground: text-[hsl(var(--foreground))]
Primary:    bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
Border:     border-[hsl(var(--border))]
Ring:       focus-visible:ring-[hsl(var(--ring))]
Radius:     rounded-[var(--radius)]
Surface:    brand-surface
Muted:      brand-muted
```
