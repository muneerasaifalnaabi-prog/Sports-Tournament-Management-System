import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler, NotFoundError, ConflictError } from "@/lib/api-utils";
import { calculateStandings } from "@/lib/standings/calculate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: { include: { team: true } }, matches: true },
    });
    if (!tournament) throw new NotFoundError("Tournament not found");
    if (tournament.format !== "LEAGUE") {
      throw new ConflictError("Standings are only available for league tournaments");
    }

    const standings = calculateStandings(
      tournament.teams.map((t) => ({ id: t.team.id, name: t.team.name })),
      tournament.matches,
      {
        pointsWin: tournament.pointsWin,
        pointsDraw: tournament.pointsDraw,
        pointsLoss: tournament.pointsLoss,
      },
    );

    return NextResponse.json({ standings });
  });
}
