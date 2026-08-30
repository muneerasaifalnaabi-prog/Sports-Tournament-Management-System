---
name: frontend-styling
description: Visual design system for STMS — use when styling any page/component, and for the dedicated polish pass.
---

# Frontend Styling Checklist

- Define design tokens once in `tailwind.config.ts` / `globals.css`: brand color, and status colors (scheduled=slate, live=amber/red with a pulse animation, completed=green, cancelled=gray). Reuse tokens, never ad hoc hex values in components.
- Mobile-first. Verify every page at `sm`, `md`, and `lg` breakpoints.
- Consistent spacing scale (multiples of 4px), consistent card radius/shadow tokens across the app.
- League table styled like a real sports site: zebra-striped rows, position number badge, sortable column headers, sticky header on scroll.
- Knockout bracket: SVG/CSS connector lines between rounds, horizontal scroll container on mobile (never squish columns).
- Status badges are pill-shaped, icon + color, consistent across match cards, tables, and detail pages.
- Loading states use skeleton placeholders shaped like the real content, not a bare spinner, for tables/lists.
- Status and brand colors meet WCAG AA contrast against their background.
- Single icon set (`lucide-react`) throughout — no mixing icon libraries.
- Sidebar/nav collapses to an off-canvas drawer below `md`; never let the top nav overflow horizontally.
