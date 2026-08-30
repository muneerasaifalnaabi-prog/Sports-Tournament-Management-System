---
name: code-quality
description: General cleanliness checklist for STMS — run at the end of every implementation phase.
---

# Code Quality Checklist

- `npm run lint` and `npm run typecheck` both clean before moving to the next phase.
- No `any` types except a rare, explicitly commented exception.
- No unused imports, variables, or dead/commented-out code left behind.
- Naming: PascalCase components, camelCase functions/variables, kebab-case file names for non-component files.
- No stray `console.log` in committed code — use proper error handling/logging instead.
- Keep functions/components small and single-purpose; split a component once it exceeds ~150 lines.
- `npx prettier --check .` clean before considering a phase finished.
