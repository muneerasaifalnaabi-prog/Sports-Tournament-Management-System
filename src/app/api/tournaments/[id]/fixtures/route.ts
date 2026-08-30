import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTournamentEditAccess } from "@/lib/rbac";
import { withApiHandler, ConflictError, NotFoundError } from "@/lib/api-utils";
import { generateRoundRobin, persistRoundRobin } from "@/lib/fixtures/roundRobin";
import { buildKnockoutBracket, persistKnockoutBracket } from "@/lib/fixtures/knockout";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTournamentEditAccess(await getSessionUser(), id);

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: { orderBy: { seed: "asc" }, include: { team: true } }, rounds: true },
    });
    if (!tournament) throw new NotFoundError("Tournament not found");
    if (tournament.rounds.length > 0) {
      throw new ConflictError("Fixtures have already been generated for this tournament");
    }
    if (tournament.teams.length < 2) {
      throw new ConflictError("At least 2 teams must be registered before generating fixtures");
    }

    const teamIds = tournament.teams.map((t) => t.teamId);

    if (tournament.format === "LEAGUE") {
      const rounds = generateRoundRobin(teamIds);
      await prisma.$transaction(async (tx) => {
        await persistRoundRobin(tx, id, rounds);
        await tx.tournament.update({ where: { id }, data: { status: "ONGOING" } });
      });
    } else {
      const rounds = buildKnockoutBracket(teamIds);
      await prisma.$transaction(async (tx) => {
        await persistKnockoutBracket(tx, id, rounds);
        await tx.tournament.update({ where: { id }, data: { status: "ONGOING" } });
      });
    }

    const created = await prisma.round.findMany({
      where: { tournamentId: id },
      orderBy: { order: "asc" },
      include: { matches: { include: { homeTeam: true, awayTeam: true } } },
    });

    return NextResponse.json({ rounds: created }, { status: 201 });
  });
}
