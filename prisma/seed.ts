import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateRoundRobin, persistRoundRobin } from "../src/lib/fixtures/roundRobin";
import { buildKnockoutBracket, persistKnockoutBracket } from "../src/lib/fixtures/knockout";

const prisma = new PrismaClient();

const PASSWORD = "password123";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.user.create({
    data: { name: "Ava Admin", email: "admin@stms.dev", passwordHash, role: "ADMIN" },
  });
  const organizer = await prisma.user.create({
    data: { name: "Omar Organizer", email: "organizer@stms.dev", passwordHash, role: "ORGANIZER" },
  });
  const referees = await Promise.all(
    ["Rita Referee", "Rick Referee"].map((name, i) =>
      prisma.user.create({
        data: { name, email: `referee${i + 1}@stms.dev`, passwordHash, role: "REFEREE" },
      }),
    ),
  );
  const managers = await Promise.all(
    ["Mona Manager", "Milo Manager"].map((name, i) =>
      prisma.user.create({
        data: { name, email: `manager${i + 1}@stms.dev`, passwordHash, role: "TEAM_MANAGER" },
      }),
    ),
  );

  const teamNames = [
    "Falcons FC",
    "Ocean United",
    "Granite City",
    "Sunset Rovers",
    "Ironclad Athletic",
    "Blue Ridge FC",
    "Harbor Town",
    "Summit Wanderers",
  ];

  const teams = [];
  for (const [i, name] of teamNames.entries()) {
    const team = await prisma.team.create({
      data: {
        name,
        shortName: name.split(" ")[0].slice(0, 3).toUpperCase(),
        managers: i < 2 ? { connect: { id: managers[i].id } } : undefined,
      },
    });
    teams.push(team);

    const playerNames = Array.from({ length: 11 }, (_, n) => `${name.split(" ")[0]} Player ${n + 1}`);
    for (const [idx, playerName] of playerNames.entries()) {
      await prisma.player.create({
        data: {
          name: playerName,
          jerseyNo: idx + 1,
          position: idx === 0 ? "Goalkeeper" : idx < 5 ? "Defender" : idx < 9 ? "Midfielder" : "Forward",
          teamId: team.id,
        },
      });
    }
  }

  // League tournament with 4 teams, fixtures generated, a few results recorded
  const leagueTournament = await prisma.tournament.create({
    data: {
      name: "City League 2026",
      format: "LEAGUE",
      status: "DRAFT",
      organizerId: organizer.id,
    },
  });
  const leagueTeams = teams.slice(0, 4);
  for (const [i, team] of leagueTeams.entries()) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: leagueTournament.id, teamId: team.id, seed: i + 1 },
    });
  }

  const leagueRounds = generateRoundRobin(leagueTeams.map((t) => t.id));
  await prisma.$transaction(async (tx) => {
    await persistRoundRobin(tx, leagueTournament.id, leagueRounds);
    await tx.tournament.update({ where: { id: leagueTournament.id }, data: { status: "ONGOING" } });
  });

  const leagueMatches = await prisma.match.findMany({
    where: { tournamentId: leagueTournament.id },
    orderBy: { id: "asc" },
  });
  const allPlayers = await prisma.player.findMany({ where: { teamId: { in: leagueTeams.map((t) => t.id) } } });
  const playersByTeam = new Map<string, typeof allPlayers>();
  for (const p of allPlayers) {
    playersByTeam.set(p.teamId, [...(playersByTeam.get(p.teamId) ?? []), p]);
  }

  for (const match of leagueMatches.slice(0, 3)) {
    if (!match.homeTeamId || !match.awayTeamId) continue;
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 4);
    await prisma.match.update({
      where: { id: match.id },
      data: { homeScore, awayScore, status: "COMPLETED" },
    });
    const homeScorer = playersByTeam.get(match.homeTeamId)?.[3];
    if (homeScore > 0 && homeScorer) {
      await prisma.goal.create({
        data: { matchId: match.id, playerId: homeScorer.id, teamId: match.homeTeamId, minute: 23 },
      });
    }
    const awayScorer = playersByTeam.get(match.awayTeamId)?.[9];
    if (awayScore > 0 && awayScorer) {
      await prisma.goal.create({
        data: { matchId: match.id, playerId: awayScorer.id, teamId: match.awayTeamId, minute: 61 },
      });
    }
  }

  if (leagueMatches[0]) {
    await prisma.refereeAssignment.create({
      data: { matchId: leagueMatches[3]?.id ?? leagueMatches[0].id, refereeId: referees[0].id },
    });
  }

  // Knockout tournament with 6 teams to exercise byes
  const knockoutTournament = await prisma.tournament.create({
    data: {
      name: "Regional Cup 2026",
      format: "KNOCKOUT",
      status: "DRAFT",
      organizerId: organizer.id,
    },
  });
  const knockoutTeams = teams.slice(2, 8);
  for (const [i, team] of knockoutTeams.entries()) {
    await prisma.tournamentTeam.create({
      data: { tournamentId: knockoutTournament.id, teamId: team.id, seed: i + 1 },
    });
  }

  const bracket = buildKnockoutBracket(knockoutTeams.map((t) => t.id));
  await prisma.$transaction(async (tx) => {
    await persistKnockoutBracket(tx, knockoutTournament.id, bracket);
    await tx.tournament.update({ where: { id: knockoutTournament.id }, data: { status: "ONGOING" } });
  });

  console.log("Seed complete.");
  console.log("Login with any of:");
  console.log(`  admin@stms.dev / ${PASSWORD}`);
  console.log(`  organizer@stms.dev / ${PASSWORD}`);
  console.log(`  referee1@stms.dev / ${PASSWORD}`);
  console.log(`  manager1@stms.dev / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
