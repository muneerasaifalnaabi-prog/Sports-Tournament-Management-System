import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requireUser, isRefereeForMatch, AuthError } from "@/lib/rbac";
import { withApiHandler, NotFoundError, ConflictError } from "@/lib/api-utils";
import { recordResultSchema } from "@/lib/validation/match";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await params;
    const session = requireUser(await getSessionUser());

    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });
    if (!match) throw new NotFoundError("Match not found");

    const isPrivileged = session.role === "ADMIN" || session.role === "ORGANIZER";
    const isAssignedReferee =
      session.role === "REFEREE" && (await isRefereeForMatch(session.sub, id));
    if (!isPrivileged && !isAssignedReferee) {
      throw new AuthError("Only an organizer or the assigned referee can record this result", 403);
    }

    if (!match.homeTeamId || !match.awayTeamId) {
      throw new ConflictError("Both teams must be set before a result can be recorded");
    }

    const body = recordResultSchema.parse(await req.json());
    const isKnockout = match.tournament.format === "KNOCKOUT";
    const isDraw = body.homeScore === body.awayScore;

    let winnerTeamId: string | null = null;
    if (isKnockout) {
      if (isDraw) {
        const hasPenalties =
          body.homePenaltyScore != null &&
          body.awayPenaltyScore != null &&
          body.homePenaltyScore !== body.awayPenaltyScore;
        if (!hasPenalties) {
          throw new ConflictError(
            "Knockout matches cannot end in a draw — provide a decisive penalty shootout score",
          );
        }
        winnerTeamId =
          body.homePenaltyScore! > body.awayPenaltyScore! ? match.homeTeamId : match.awayTeamId;
      } else {
        winnerTeamId = body.homeScore > body.awayScore ? match.homeTeamId : match.awayTeamId;
      }
    }

    if (body.goals) {
      const validTeamIds = new Set([match.homeTeamId, match.awayTeamId]);
      const playerIds = body.goals.map((g) => g.playerId);
      const players = await prisma.player.findMany({ where: { id: { in: playerIds } } });
      const playerTeamById = new Map(players.map((p) => [p.id, p.teamId]));
      for (const goal of body.goals) {
        const teamId = playerTeamById.get(goal.playerId);
        if (!teamId || !validTeamIds.has(teamId)) {
          throw new ConflictError("All goal scorers must belong to one of the two competing teams");
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.goal.deleteMany({ where: { matchId: id } });

      if (body.goals?.length) {
        const players = await tx.player.findMany({
          where: { id: { in: body.goals.map((g) => g.playerId) } },
        });
        const teamByPlayer = new Map(players.map((p) => [p.id, p.teamId]));
        await tx.goal.createMany({
          data: body.goals.map((g) => ({
            matchId: id,
            playerId: g.playerId,
            teamId: teamByPlayer.get(g.playerId)!,
            minute: g.minute ?? null,
            ownGoal: g.ownGoal ?? false,
          })),
        });
      }

      const savedMatch = await tx.match.update({
        where: { id },
        data: {
          homeScore: body.homeScore,
          awayScore: body.awayScore,
          homePenaltyScore: body.homePenaltyScore ?? null,
          awayPenaltyScore: body.awayPenaltyScore ?? null,
          status: "COMPLETED",
        },
      });

      if (isKnockout && match.nextMatchId && winnerTeamId) {
        const field = match.nextMatchSlot === "HOME" ? "homeTeamId" : "awayTeamId";
        await tx.match.update({
          where: { id: match.nextMatchId },
          data: { [field]: winnerTeamId },
        });
      }

      return savedMatch;
    });

    return NextResponse.json({ match: updated });
  });
}
