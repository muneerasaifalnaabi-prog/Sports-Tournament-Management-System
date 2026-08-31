import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTeamEditAccess } from "@/lib/rbac";
import { withApiHandler, NotFoundError } from "@/lib/api-utils";
import { updatePlayerSchema } from "@/lib/validation/team";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true, shortName: true } },
        goals: {
          include: { match: { select: { id: true, tournamentId: true, createdAt: true } } },
        },
      },
    });
    if (!player) throw new NotFoundError("Player not found");
    return NextResponse.json({ player });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundError("Player not found");
    await requireTeamEditAccess(await getSessionUser(), player.teamId);

    const body = updatePlayerSchema.parse(await req.json());
    const updated = await prisma.player.update({
      where: { id },
      data: {
        ...body,
        jerseyNo: body.jerseyNo ?? undefined,
        position: body.position ?? undefined,
      },
    });

    return NextResponse.json({ player: updated });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundError("Player not found");
    await requireTeamEditAccess(await getSessionUser(), player.teamId);

    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
