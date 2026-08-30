import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTeamEditAccess } from "@/lib/rbac";
import { withApiHandler, NotFoundError } from "@/lib/api-utils";
import { updateTeamSchema } from "@/lib/validation/team";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: { orderBy: { name: "asc" } },
        managers: { select: { id: true, name: true, email: true } },
        tournaments: { include: { tournament: true } },
      },
    });
    if (!team) throw new NotFoundError("Team not found");
    return NextResponse.json({ team });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTeamEditAccess(await getSessionUser(), id);
    const body = updateTeamSchema.parse(await req.json());

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...body,
        shortName: body.shortName || undefined,
        logoUrl: body.logoUrl || undefined,
      },
    });

    return NextResponse.json({ team });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTeamEditAccess(await getSessionUser(), id);
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
