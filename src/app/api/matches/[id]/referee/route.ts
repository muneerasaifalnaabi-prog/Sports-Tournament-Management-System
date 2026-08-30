import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { withApiHandler, NotFoundError, ConflictError } from "@/lib/api-utils";
import { assignRefereeSchema } from "@/lib/validation/match";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    requireRole(await getSessionUser(), ["ADMIN", "ORGANIZER"]);
    const body = assignRefereeSchema.parse(await req.json());

    const [match, referee] = await Promise.all([
      prisma.match.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: body.refereeId } }),
    ]);
    if (!match) throw new NotFoundError("Match not found");
    if (!referee || referee.role !== "REFEREE") {
      throw new ConflictError("The selected user is not a referee");
    }

    const assignment = await prisma.refereeAssignment.upsert({
      where: { matchId: id },
      update: { refereeId: body.refereeId },
      create: { matchId: id, refereeId: body.refereeId },
      include: { referee: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ assignment });
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    requireRole(await getSessionUser(), ["ADMIN", "ORGANIZER"]);
    await prisma.refereeAssignment.deleteMany({ where: { matchId: id } });
    return NextResponse.json({ ok: true });
  });
}
