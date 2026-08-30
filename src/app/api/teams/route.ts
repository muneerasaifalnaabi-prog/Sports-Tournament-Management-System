import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { withApiHandler } from "@/lib/api-utils";
import { createTeamSchema } from "@/lib/validation/team";

export async function GET(req: NextRequest) {
  return withApiHandler(async () => {
    const q = req.nextUrl.searchParams.get("q");
    const teams = await prisma.team.findMany({
      where: q ? { name: { contains: q } } : undefined,
      include: { _count: { select: { players: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ teams });
  });
}

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = requireRole(await getSessionUser(), ["ADMIN", "ORGANIZER", "TEAM_MANAGER"]);
    const body = createTeamSchema.parse(await req.json());

    const team = await prisma.team.create({
      data: {
        name: body.name,
        shortName: body.shortName || null,
        logoUrl: body.logoUrl || null,
        ...(session.role === "TEAM_MANAGER"
          ? { managers: { connect: { id: session.sub } } }
          : {}),
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  });
}
