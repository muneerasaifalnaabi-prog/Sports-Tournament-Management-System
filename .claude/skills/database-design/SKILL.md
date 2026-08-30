---
name: database-design
description: Prisma schema conventions for STMS — use when adding or changing any model in prisma/schema.prisma.
---

# Database Design Checklist

- Use `cuid()` for all primary keys.
- Name every `@relation` explicitly when two models have more than one relation between them (e.g. Match.homeTeam/awayTeam, User.managedTeams).
- Cascade delete (`onDelete: Cascade`) only where child data is meaningless without its parent (Match, Player, Goal, Round). Never cascade-delete from User.
- Add `@@unique` composite constraints for natural keys (e.g. `[tournamentId, teamId]` on TournamentTeam, `[tournamentId, order]` on Round).
- Use enums for closed state sets (Role, TournamentFormat, TournamentStatus, MatchStatus) instead of free-text strings.
- Do not persist derived/computed data (standings, top-scorer totals) as columns — compute on read from Match/Goal. Avoids sync bugs.
- camelCase field names, PascalCase model names.
- Keep field types Postgres-portable (String, Int, DateTime, Boolean only) so the app can migrate off SQLite later without a rewrite.
- Run `npx prisma format` and `npx prisma validate` before creating a migration.
- Give migrations descriptive names (`npx prisma migrate dev --name add_referee_assignment`), not `update` or `fix`.
