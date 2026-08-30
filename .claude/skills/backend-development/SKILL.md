---
name: backend-development
description: API route conventions for STMS — use when writing or editing any file under src/app/api/**.
---

# Backend Development Checklist

- Validate every request body/query with a Zod schema from `src/lib/validation/*` before touching Prisma.
- Every mutating route: authenticate via `getSessionUser(req)`, then authorize via `requireRole`/ownership check from `src/lib/rbac.ts`, before any DB write.
- Never trust a client-supplied user ID for ownership checks — always re-derive the acting user from the session.
- Use `prisma.$transaction` for any multi-step write (fixture generation, result recording + bracket advancement, referee assignment swaps).
- Wrap handlers in a shared error helper that returns a consistent `{ error: string }` JSON body with correct status codes: 400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict, 500 unexpected. Never leak Prisma error internals or stack traces to the client.
- Keep route handlers thin — business logic (fixtures, standings, top scorers) lives in `src/lib/*` and is unit-testable independent of HTTP.
- List endpoints that can grow unbounded (matches, teams) should support basic pagination/filtering query params.
- Log unexpected errors server-side (`console.error`) before returning the generic 500.
