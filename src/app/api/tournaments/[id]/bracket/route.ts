import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler, NotFoundError, ConflictError } from "@/lib/api-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundError("Tournament not found");
    if (tournament.format !== "KNOCKOUT") {
      throw new ConflictError("Bracket view is only available for knockout tournaments");
    }

    const rounds = await prisma.round.findMany({
      where: { tournamentId: id },
      orderBy: { order: "asc" },
      include: {
        matches: {
          orderBy: { bracketPosition: "asc" },
          include: {
            homeTeam: { select: { id: true, name: true, shortName: true } },
            awayTeam: { select: { id: true, name: true, shortName: true } },
          },
        },
      },
    });

    return NextResponse.json({ rounds });
  });
}
