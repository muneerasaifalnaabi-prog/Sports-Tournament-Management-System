import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTournamentEditAccess } from "@/lib/rbac";
import { withApiHandler, ConflictError, NotFoundError } from "@/lib/api-utils";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> },
) {
  return withApiHandler(async () => {
    const { id, teamId } = await params;
    await requireTournamentEditAccess(await getSessionUser(), id);

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) throw new NotFoundError("Tournament not found");
    if (tournament.status !== "DRAFT") {
      throw new ConflictError("Teams can only be withdrawn while the tournament is in draft");
    }

    await prisma.tournamentTeam.delete({
      where: { tournamentId_teamId: { tournamentId: id, teamId } },
    });

    return NextResponse.json({ ok: true });
  });
}
