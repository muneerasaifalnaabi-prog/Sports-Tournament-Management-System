import type { Role } from "@prisma/client";
import type { SessionPayload } from "./auth";
import { prisma } from "./prisma";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function requireUser(user: SessionPayload | null): SessionPayload {
  if (!user) throw new AuthError("Authentication required", 401);
  return user;
}

export function requireRole(
  user: SessionPayload | null,
  allowed: Role[],
): SessionPayload {
  const u = requireUser(user);
  if (!allowed.includes(u.role)) {
    throw new AuthError("You do not have permission to perform this action", 403);
  }
  return u;
}

export async function isTeamManagerOf(
  userId: string,
  teamId: string,
): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: { id: teamId, managers: { some: { id: userId } } },
    select: { id: true },
  });
  return !!team;
}

export async function isTournamentOrganizer(
  userId: string,
  tournamentId: string,
): Promise<boolean> {
  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, organizerId: userId },
    select: { id: true },
  });
  return !!tournament;
}

export async function requireTeamEditAccess(
  user: SessionPayload | null,
  teamId: string,
): Promise<SessionPayload> {
  const u = requireRole(user, ["ADMIN", "ORGANIZER", "TEAM_MANAGER"]);
  if (u.role === "ADMIN" || u.role === "ORGANIZER") return u;
  const manager = await isTeamManagerOf(u.sub, teamId);
  if (!manager) {
    throw new AuthError("You do not have permission to manage this team", 403);
  }
  return u;
}

export async function requireTournamentEditAccess(
  user: SessionPayload | null,
  tournamentId: string,
): Promise<SessionPayload> {
  const u = requireRole(user, ["ADMIN", "ORGANIZER"]);
  if (u.role === "ADMIN") return u;
  const owner = await isTournamentOrganizer(u.sub, tournamentId);
  if (!owner) {
    throw new AuthError("You do not have permission to manage this tournament", 403);
  }
  return u;
}

export async function isRefereeForMatch(
  userId: string,
  matchId: string,
): Promise<boolean> {
  const assignment = await prisma.refereeAssignment.findFirst({
    where: { matchId, refereeId: userId },
    select: { id: true },
  });
  return !!assignment;
}
