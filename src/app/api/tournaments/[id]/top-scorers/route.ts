import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler, NotFoundError } from "@/lib/api-utils";
import { calculateTopScorers } from "@/lib/standings/topScorers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundError("Tournament not found");

    const goals = await prisma.goal.findMany({
      where: { match: { tournamentId: id } },
      select: { playerId: true, ownGoal: true },
    });

    const teamEntries = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: { include: { players: true } } },
    });

    const players = teamEntries.flatMap((entry) =>
      entry.team.players.map((p) => ({
        id: p.id,
        name: p.name,
        teamId: entry.team.id,
        teamName: entry.team.name,
      })),
    );

    const topScorers = calculateTopScorers(goals, players);
    return NextResponse.json({ topScorers });
  });
}
