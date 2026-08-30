import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTournamentEditAccess } from "@/lib/rbac";
import { withApiHandler, NotFoundError } from "@/lib/api-utils";
import { updateTournamentSchema } from "@/lib/validation/tournament";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true } },
        teams: { include: { team: true }, orderBy: { seed: "asc" } },
      },
    });
    if (!tournament) throw new NotFoundError("Tournament not found");
    return NextResponse.json({ tournament });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTournamentEditAccess(await getSessionUser(), id);
    const body = updateTournamentSchema.parse(await req.json());

    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ?? undefined,
        endDate: body.endDate ?? undefined,
      },
    });

    return NextResponse.json({ tournament });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTournamentEditAccess(await getSessionUser(), id);
    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
