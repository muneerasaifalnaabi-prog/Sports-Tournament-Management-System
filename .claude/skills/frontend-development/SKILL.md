---
name: frontend-development
description: React/Next.js component conventions for STMS — use when building any page or component under src/app or src/components.
---

# Frontend Development Checklist

- Server components by default. Add `"use client"` only where interactivity or hooks are actually needed.
- Prefer fetching data directly in server components (via `src/lib` / Prisma) over client-side `fetch` where possible; client components fetch via `fetch('/api/...')` only when interactivity requires it.
- Forms: controlled inputs, client-side Zod validation mirroring the API schema, field-level error messages, disabled submit while pending.
- Every list/table has explicit loading, empty, and error states — never a blank screen.
- Reusable, presentation-only UI goes in `components/ui/*`; feature-specific composed components go in `components/<feature>/*`.
- Use `next/navigation` (`useRouter`, `redirect`) for navigation — never `window.location`.
- No `any` types; explicit prop types/interfaces for every component.
- Shared types live in `src/types`; small feature-local types are co-located with usage.
- Role-based UI conditionals read from the `useSession()` hook/`SessionProvider` context — never hardcode role checks inline more than once; reuse a helper.
