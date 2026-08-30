import type { Prisma } from "@prisma/client";

export interface KnockoutMatchSlot {
  position: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  status: "SCHEDULED" | "COMPLETED";
  winnerTeamId?: string | null;
}

export interface KnockoutRound {
  order: number;
  name: string;
  matches: KnockoutMatchSlot[];
}

export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Standard single-elimination seeding order: for bracket size N, returns the
 * seed numbers in bracket-slot order so top seeds meet as late as possible
 * (e.g. size 8 -> [1,8,4,5,2,7,3,6], i.e. matches 1v8, 4v5, 2v7, 3v6).
 */
export function seedPositions(size: number): number[] {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const s = seeds.length * 2;
    const next: number[] = [];
    for (const seed of seeds) {
      next.push(seed, s + 1 - seed);
    }
    seeds = next;
  }
  return seeds;
}

function roundName(matchCount: number): string {
  if (matchCount === 1) return "Final";
  if (matchCount === 2) return "Semifinal";
  if (matchCount === 4) return "Quarterfinal";
  return `Round of ${matchCount * 2}`;
}

/**
 * Builds an in-memory single-elimination bracket. Teams are assumed already
 * seeded (index 0 = seed 1). Byes (when team count isn't a power of two) are
 * auto-resolved in round 1 and the winner propagated into later rounds.
 */
export function buildKnockoutBracket(teamIds: string[]): KnockoutRound[] {
  if (teamIds.length < 2) return [];

  const bracketSize = nextPowerOfTwo(teamIds.length);
  const order = seedPositions(bracketSize);
  const teamsBySlot: (string | null)[] = order.map((seed) =>
    seed <= teamIds.length ? teamIds[seed - 1] : null,
  );

  const round1Matches: KnockoutMatchSlot[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
    const home = teamsBySlot[2 * i];
    const away = teamsBySlot[2 * i + 1];
    let status: KnockoutMatchSlot["status"] = "SCHEDULED";
    let winnerTeamId: string | null | undefined;
    if (home && !away) {
      status = "COMPLETED";
      winnerTeamId = home;
    } else if (!home && away) {
      status = "COMPLETED";
      winnerTeamId = away;
    }
    round1Matches.push({ position: i, homeTeamId: home, awayTeamId: away, status, winnerTeamId });
  }

  const rounds: KnockoutRound[] = [
    { order: 1, name: roundName(round1Matches.length), matches: round1Matches },
  ];

  const totalRounds = Math.log2(bracketSize);
  let previous = round1Matches;
  for (let r = 2; r <= totalRounds; r++) {
    const matches: KnockoutMatchSlot[] = [];
    for (let i = 0; i < previous.length / 2; i++) {
      const feederA = previous[2 * i];
      const feederB = previous[2 * i + 1];
      const home = feederA.status === "COMPLETED" ? (feederA.winnerTeamId ?? null) : null;
      const away = feederB.status === "COMPLETED" ? (feederB.winnerTeamId ?? null) : null;
      matches.push({ position: i, homeTeamId: home, awayTeamId: away, status: "SCHEDULED" });
    }
    rounds.push({ order: r, name: roundName(matches.length), matches });
    previous = matches;
  }

  return rounds;
}

/**
 * Persists a bracket built by buildKnockoutBracket, wiring up nextMatchId /
 * nextMatchSlot advancement links. Must run inside a $transaction.
 */
export async function persistKnockoutBracket(
  tx: Prisma.TransactionClient,
  tournamentId: string,
  rounds: KnockoutRound[],
) {
  const roundRecords = [];
  for (const round of rounds) {
    roundRecords.push(
      await tx.round.create({
        data: { tournamentId, name: round.name, order: round.order },
      }),
    );
  }

  const matchIdsByRound: string[][] = new Array(rounds.length);

  for (let ri = rounds.length - 1; ri >= 0; ri--) {
    const round = rounds[ri];
    const roundRecord = roundRecords[ri];
    const ids: string[] = [];

    for (const m of round.matches) {
      const hasNextRound = ri < rounds.length - 1;
      const nextMatchId = hasNextRound ? matchIdsByRound[ri + 1][Math.floor(m.position / 2)] : null;
      const nextMatchSlot = hasNextRound ? (m.position % 2 === 0 ? "HOME" : "AWAY") : null;

      const created = await tx.match.create({
        data: {
          tournamentId,
          roundId: roundRecord.id,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          status: m.status,
          bracketPosition: m.position,
          nextMatchId,
          nextMatchSlot,
        },
      });
      ids.push(created.id);
    }

    matchIdsByRound[ri] = ids;
  }

  return roundRecords;
}
