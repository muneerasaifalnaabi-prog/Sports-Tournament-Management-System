import type { Prisma } from "@prisma/client";

export interface RoundRobinPairing {
  homeTeamId: string;
  awayTeamId: string;
}

export interface RoundRobinRound {
  order: number;
  name: string;
  pairings: RoundRobinPairing[];
}

const BYE = null;

/**
 * Generates a round-robin schedule using the circle method.
 * Odd team counts get a synthetic bye slot that produces no fixture that round.
 */
export function generateRoundRobin(
  teamIds: string[],
  options: { doubleRoundRobin?: boolean } = {},
): RoundRobinRound[] {
  if (teamIds.length < 2) {
    return [];
  }

  const slots: (string | null)[] = [...teamIds];
  if (slots.length % 2 !== 0) {
    slots.push(BYE);
  }

  const n = slots.length;
  const roundsPerLeg = n - 1;
  const fixed = slots[0];
  let rotating = slots.slice(1);

  const legOneRounds: RoundRobinRound[] = [];

  for (let r = 0; r < roundsPerLeg; r++) {
    const full = [fixed, ...rotating];
    const pairings: RoundRobinPairing[] = [];

    for (let i = 0; i < n / 2; i++) {
      const a = full[i];
      const b = full[n - 1 - i];
      if (a === BYE || b === BYE) continue;

      // Alternate home/away polarity each round to balance home games.
      const swap = r % 2 === 1;
      pairings.push(swap ? { homeTeamId: b, awayTeamId: a } : { homeTeamId: a, awayTeamId: b });
    }

    legOneRounds.push({ order: r + 1, name: `Matchday ${r + 1}`, pairings });

    // Rotate all but the fixed slot.
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  if (!options.doubleRoundRobin) {
    return legOneRounds;
  }

  const legTwoRounds: RoundRobinRound[] = legOneRounds.map((round, idx) => ({
    order: roundsPerLeg + idx + 1,
    name: `Matchday ${roundsPerLeg + idx + 1}`,
    pairings: round.pairings.map((p) => ({ homeTeamId: p.awayTeamId, awayTeamId: p.homeTeamId })),
  }));

  return [...legOneRounds, ...legTwoRounds];
}

/**
 * Persists a schedule built by generateRoundRobin. Must run inside a $transaction.
 */
export async function persistRoundRobin(
  tx: Prisma.TransactionClient,
  tournamentId: string,
  rounds: RoundRobinRound[],
) {
  const roundRecords = [];
  for (const round of rounds) {
    const roundRecord = await tx.round.create({
      data: { tournamentId, name: round.name, order: round.order },
    });
    for (const pairing of round.pairings) {
      await tx.match.create({
        data: {
          tournamentId,
          roundId: roundRecord.id,
          homeTeamId: pairing.homeTeamId,
          awayTeamId: pairing.awayTeamId,
          status: "SCHEDULED",
        },
      });
    }
    roundRecords.push(roundRecord);
  }
  return roundRecords;
}
