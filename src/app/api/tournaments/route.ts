import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { withApiHandler } from "@/lib/api-utils";
import { createTournamentSchema } from "@/lib/validation/tournament";

export async function GET(req: NextRequest) {
  return withApiHandler(async () => {
    const status = req.nextUrl.searchParams.get("status");
    const format = req.nextUrl.searchParams.get("format");

    const tournaments = await prisma.tournament.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(format ? { format: format as never } : {}),
      },
      include: {
        organizer: { select: { id: true, name: true } },
        teams: { select: { id: true } },
        _count: { select: { teams: true, matches: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tournaments });
  });
}

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = requireRole(await getSessionUser(), ["ADMIN", "ORGANIZER"]);
    const body = createTournamentSchema.parse(await req.json());

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        format: body.format,
        startDate: body.startDate ?? undefined,
        endDate: body.endDate ?? undefined,
        pointsWin: body.pointsWin ?? 3,
        pointsDraw: body.pointsDraw ?? 1,
        pointsLoss: body.pointsLoss ?? 0,
        organizerId: session.sub,
      },
    });

    return NextResponse.json({ tournament }, { status: 201 });
  });
}
