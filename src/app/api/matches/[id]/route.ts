import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTournamentEditAccess } from "@/lib/rbac";
import { withApiHandler, NotFoundError } from "@/lib/api-utils";
import { updateMatchSchema } from "@/lib/validation/match";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: { select: { id: true, name: true, format: true } },
        round: true,
        homeTeam: true,
        awayTeam: true,
        goals: { include: { player: { select: { id: true, name: true } } } },
        refereeAssignment: {
          include: { referee: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!match) throw new NotFoundError("Match not found");
    return NextResponse.json({ match });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundError("Match not found");
    await requireTournamentEditAccess(await getSessionUser(), match.tournamentId);

    const body = updateMatchSchema.parse(await req.json());
    const updated = await prisma.match.update({
      where: { id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ?? undefined,
        venue: body.venue ?? undefined,
      },
    });

    return NextResponse.json({ match: updated });
  });
}
