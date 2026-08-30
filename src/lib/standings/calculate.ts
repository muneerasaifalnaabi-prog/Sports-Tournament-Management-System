export interface StandingsMatchInput {
  status: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface StandingsTeamInput {
  id: string;
  name: string;
}

export interface StandingsPointsConfig {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function calculateStandings(
  teams: StandingsTeamInput[],
  matches: StandingsMatchInput[],
  config: StandingsPointsConfig,
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const team of teams) {
    rows.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.status !== "COMPLETED" ||
      !match.homeTeamId ||
      !match.awayTeamId ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore === match.awayScore) {
      home.draws++;
      away.draws++;
      home.points += config.pointsDraw;
      away.points += config.pointsDraw;
    } else if (match.homeScore > match.awayScore) {
      home.wins++;
      away.losses++;
      home.points += config.pointsWin;
      away.points += config.pointsLoss;
    } else {
      away.wins++;
      home.losses++;
      away.points += config.pointsWin;
      home.points += config.pointsLoss;
    }
  }

  for (const row of rows.values()) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}
