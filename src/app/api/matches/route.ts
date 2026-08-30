import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withApiHandler(async () => {
    const status = req.nextUrl.searchParams.get("status");
    const unassigned = req.nextUrl.searchParams.get("unassigned") === "true";

    const matches = await prisma.match.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(unassigned ? { refereeAssignment: null } : {}),
        homeTeamId: { not: null },
        awayTeamId: { not: null },
      },
      include: {
        tournament: { select: { id: true, name: true } },
        round: { select: { name: true } },
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        refereeAssignment: { include: { referee: { select: { id: true, name: true } } } },
      },
      orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
      take: 100,
    });

    return NextResponse.json({ matches });
  });
}
