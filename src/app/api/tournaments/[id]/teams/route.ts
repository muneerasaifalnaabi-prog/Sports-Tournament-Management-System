import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTournamentEditAccess } from "@/lib/rbac";
import { withApiHandler, ConflictError, NotFoundError } from "@/lib/api-utils";
import { registerTeamSchema } from "@/lib/validation/tournament";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const entries = await prisma.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: { include: { _count: { select: { players: true } } } } },
      orderBy: { seed: "asc" },
    });
    return NextResponse.json({ entries });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTournamentEditAccess(await getSessionUser(), id);
    const body = registerTeamSchema.parse(await req.json());

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundError("Tournament not found");
    if (tournament.status !== "DRAFT") {
      throw new ConflictError("Teams can only be registered while the tournament is in draft");
    }

    const existing = await prisma.tournamentTeam.findUnique({
      where: { tournamentId_teamId: { tournamentId: id, teamId: body.teamId } },
    });
    if (existing) throw new ConflictError("This team is already registered for the tournament");

    const entry = await prisma.tournamentTeam.create({
      data: { tournamentId: id, teamId: body.teamId, seed: body.seed },
      include: { team: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
  });
}
