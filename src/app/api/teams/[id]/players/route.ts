import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireTeamEditAccess } from "@/lib/rbac";
import { withApiHandler } from "@/lib/api-utils";
import { createPlayerSchema } from "@/lib/validation/team";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const players = await prisma.player.findMany({
      where: { teamId: id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ players });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    await requireTeamEditAccess(await getSessionUser(), id);
    const body = createPlayerSchema.parse(await req.json());

    const player = await prisma.player.create({
      data: {
        name: body.name,
        jerseyNo: body.jerseyNo ?? null,
        position: body.position ?? null,
        teamId: id,
      },
    });

    return NextResponse.json({ player }, { status: 201 });
  });
}
