# Sports Tournament Management System (STMS) — Implementation Plan

## Context

The repo (`C:\Users\Win11\Documents\STMS`) is currently empty (only `.git`). We're building a complete, professional Sports Tournament Management System from scratch: tournament creation, team/player registration, fixture generation (league + knockout), score entry, automatic points/standings, knockout brackets, top scorer tracking, match history, and referee assignment, with role-based access (Admin, Organizer, Referee, Team Manager). The UI must look like a real sports platform, not a bare CRUD app.

Confirmed stack: **Next.js (App Router, TypeScript, Tailwind CSS)** full-stack app, **SQLite via Prisma**, custom **email+password + JWT session cookie** auth. We'll also author 7 project-local Claude Code skills (`.claude/skills/*`) encoding conventions for DB design, backend, frontend dev, frontend styling, auth, testing, and code quality, and apply them throughout the build.

## Project Scaffolding

- `npx create-next-app@latest .` with TypeScript, Tailwind, ESLint, App Router, `src/` dir, `@/*` alias.
- Deps: `prisma @prisma/client bcryptjs jsonwebtoken jose zod` (+ dev: `prettier`, `vitest`, `@testing-library/react`, `jsdom`, `tsx`).
- `npx prisma init --datasource-provider sqlite`.
- Folder layout: `src/app/(auth)/login|register`, `src/app/(dashboard)/dashboard`, `src/app/tournaments`, `src/app/teams`, `src/app/players`, `src/app/matches`, `src/app/admin`, `src/app/api/**`, `src/components/{ui,layout,tournaments,forms}`, `src/lib/{auth.ts,prisma.ts,rbac.ts,validation,fixtures,standings}`, `src/middleware.ts`, `prisma/schema.prisma` + `seed.ts`, `tests/{unit,api,components}`, `.claude/skills/*`.
- npm scripts: `dev, build, start, lint, typecheck, test, db:push, db:migrate, db:seed, db:studio`.

## Database Schema (Prisma / SQLite)

Models: `User` (role enum: ADMIN/ORGANIZER/REFEREE/TEAM_MANAGER), `Tournament` (format LEAGUE/KNOCKOUT, status, configurable pointsWin/Draw/Loss, organizer relation), `Team` (many-to-many managers via `TeamManagers`), `TournamentTeam` (join table with `seed` for knockout), `Player` (belongs to Team), `Round` (groups matches — matchday or bracket stage, has `order`), `Match` (home/away team, scores, status, `nextMatchId`/`nextMatchSlot`/`bracketPosition` for knockout advancement, optional penalty scores for knockout draws), `Goal` (match+player+team, `ownGoal` flag, for top-scorer tracking), `RefereeAssignment` (1:1 with Match).

Standings and top-scorers are **computed on the fly**, not persisted — avoids sync bugs. Keep types Postgres-portable for future migration off SQLite.

## Core Logic

- **Round-robin fixtures** (`lib/fixtures/roundRobin.ts`): circle method, bye handling for odd counts, optional double round-robin, home/away balancing.
- **Knockout bracket** (`lib/fixtures/knockout.ts`): pad to next power of 2, standard seeding (1 vs N, 2 vs N-1...), bye auto-advancement, `nextMatchId`/`nextMatchSlot` linkage built transactionally.
- **Advancement**: recording a knockout result auto-populates the linked next-round match's team slot in the same transaction; draws in knockout require penalty score fields.
- **Standings** (`lib/standings/calculate.ts`): win/draw/loss points (configurable per tournament), sorted by points → goal difference → goals for → name.
- **Top scorers** (`lib/standings/topScorers.ts`): goals grouped by player, own goals excluded from personal tally.

## API Routes (`src/app/api/**`)

Auth: `POST /auth/register|login|logout`, `GET /auth/me`. Tournaments: CRUD, `/teams`, `/fixtures` (generate + list), `/standings`, `/top-scorers`, `/bracket`. Teams: CRUD, `/players`. Players: CRUD. Matches: `GET/PATCH`, `PUT /result` (triggers standings/advancement), `POST/DELETE /referee`. Users: `GET /users`, `PATCH /users/[id]` (admin role mgmt).

Every mutating route: Zod validation → session auth → role/ownership check (`lib/rbac.ts`) → `prisma.$transaction` for multi-step writes → consistent `{error}` JSON with correct status codes. Logic stays in `lib/*`, routes stay thin.

## Frontend Pages

`/login`, `/register`, `/dashboard` (role-aware stat cards), `/tournaments` (browse/filter), `/tournaments/new`, `/tournaments/[id]` (tabs: Overview/Fixtures/Table-or-Bracket/Top Scorers/Teams/History), `/tournaments/[id]/edit`, `/teams`, `/teams/[id]`, `/teams/[id]/edit` (roster mgmt), `/players/[id]`, `/matches/[id]` (score entry for authorized users), `/admin/users`, `/admin/referees`, `/unauthorized`.

Layout: `AppShell` with responsive `Sidebar` (role-conditional nav, collapses to drawer on mobile) + `TopNav` (user menu).

## Auth & Authorization

- `bcryptjs` password hashing; JWT session in an **HTTP-only, SameSite=Lax, Secure(prod)** cookie (not localStorage).
- `lib/auth.ts`: hash/verify password, sign/verify session, cookie helpers. Use `jose` (edge-compatible) in `middleware.ts`, `jsonwebtoken`/`bcryptjs` in Node-runtime API routes.
- `middleware.ts` protects page routes by path matcher; API routes independently re-check auth+role (defense in depth).
- Ownership checks (not just role) for Team Manager actions via `isTeamManagerOf(userId, teamId)`.
- Client `SessionProvider`/`useSession()` hook drives conditional UI (hide edit/admin controls from unauthorized roles).

## Claude Code Project Skills (`.claude/skills/*/SKILL.md`)

Author all 7 up front in Phase 0, apply throughout: **database-design** (Phase 1), **auth-authorization** + **backend-development** (Phase 2, recurring through 4-8), **frontend-development** + **frontend-styling** (Phases 3-7, styling gets a dedicated polish pass in Phase 7), **testing** (written alongside logic in Phases 5-6, completed in Phase 9), **code-quality** (checklist re-run at the end of every phase). Each SKILL.md is a concise, actionable checklist (not prose) — e.g. frontend-styling covers status-color tokens, responsive breakpoints, skeleton loaders, bracket connector rendering, WCAG contrast; backend-development covers validation-before-DB-write, transactions for multi-step writes, thin routes; auth-authorization covers httpOnly cookies, defense-in-depth checks, generic login-failure messages.

## Testing Strategy

Vitest + React Testing Library (jsdom for components, node for logic). Unit tests for round-robin (byes, no dupes, home/away balance), knockout (bracket shape, seeding, bye advancement, full-bracket simulation), standings (points/tiebreaks/config), top scorers (own-goal exclusion, ties). API tests against a dedicated test SQLite DB for auth flows, role enforcement, fixture generation, and result→standings/advancement. A couple of component tests (LeagueTable rendering, MatchResultForm validation/auth gating). No Playwright/E2E for v1.

## Implementation Order

0. Scaffold + author all 7 skill files.
1. Prisma schema, migration, seed skeleton.
2. Auth (JWT/cookie, middleware, login/register, RBAC helper).
3. App shell + reusable UI kit (Card/Table/Badge/Tabs/EmptyState/Spinner) + dashboard skeleton.
4. Teams & players (API + pages + ownership checks).
5. Tournaments + fixture generation (round-robin & knockout) with unit tests written alongside.
6. Match results, standings calc, knockout advancement, with tests.
7. Bracket visualization + top scorer table, tournament detail tabs wired together, styling polish pass.
8. Referee assignment + admin user management, re-audit role guards across all routes/pages.
9. Fill remaining test gaps (API + component tests).
10. Full responsive/empty-state polish, code-quality pass, final verification.

Each phase ends with lint clean, typecheck clean, relevant tests green, and a dev-server smoke check.

## Final Verification

`typecheck` + `lint` clean → `prisma migrate dev` + `generate` → `db:seed` (admin/organizer/2 managers/2 referees/8 teams×11 players, one league tournament with results, one 6-team knockout to exercise byes) → `npm run dev` manual walkthrough of every core feature across roles + mobile viewport → `npm test` green → `npm run build` succeeds → confirm `.gitignore` covers `node_modules`, `.env`, `*.db`, `.next`.

## Critical Files

- `prisma/schema.prisma`
- `src/lib/fixtures/roundRobin.ts`, `src/lib/fixtures/knockout.ts`
- `src/lib/standings/calculate.ts`, `src/lib/standings/topScorers.ts`
- `src/lib/auth.ts`, `src/middleware.ts`, `src/lib/rbac.ts`
- `src/app/api/matches/[id]/result/route.ts`
- `.claude/skills/*/SKILL.md`

After approval and once plan mode ends, this plan will also be saved as `plan.md` in the project root per the user's request.
