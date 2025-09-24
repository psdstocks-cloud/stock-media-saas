# Brand Tokens & Theming

This app uses CSS variables (HSL) with Tailwind dark class to power light/dark themes.

- Source: src/app/globals.css
- Toggle: src/components/ui/theme-toggle.tsx (persists to localStorage, respects system preference)

## Core Tokens

- --primary: brand purple
- --secondary: brand orange
- --background / --foreground
- --card / --card-foreground
- --muted / --muted-foreground
- --accent / --accent-foreground
- --border, --input, --ring

Light vs Dark variants are defined under :root and .dark.

## Utilities

- .brand-surface: brand-aligned surface (light/dark)
- .brand-muted: muted text (light/dark)

## Components

- BrandButton (dark/light variants)
- Global links inherit text-foreground and emphasize contrast via hover.

## Usage Examples

```
<button className="bg-primary text-primary-foreground">Buy</button>
<div className="brand-surface p-6 rounded-xl">Content</div>
<p className="brand-muted">Secondary information</p>
```

## Accessibility

- Contrast checked for primary/action states against backgrounds.
- Inline script in layout.tsx prevents FOUC during theme init.
