---
name: testing
description: Test coverage conventions for STMS — use when writing tests for fixtures/standings logic, API routes, or components.
---

# Testing Checklist

- Pure logic (round-robin, knockout seeding, standings calc, top scorers) gets unit tests covering edge cases: odd team counts, a single team, tie-breaker scenarios, own goals, unplayed matches.
- API route tests hit the real handler against a dedicated test SQLite database, reset between test files/suites — never mock Prisma piecemeal.
- At least one component test per complex interactive component (form validation, role-gated rendering).
- Tests live under `tests/` mirroring the source structure (`tests/unit`, `tests/api`, `tests/components`).
- Descriptive test names: `it('does X when Y')`, not `it('works')`.
- Test your own logic, not framework internals (don't test that Next.js routes correctly, or that Prisma saves a field).
- Run `npm test` before considering a phase's work done.
