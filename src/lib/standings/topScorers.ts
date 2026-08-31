export interface GoalInput {
  playerId: string;
  ownGoal: boolean;
}

export interface PlayerInput {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

export interface TopScorerRow {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
}

export function calculateTopScorers(goals: GoalInput[], players: PlayerInput[]): TopScorerRow[] {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const tally = new Map<string, number>();

  for (const goal of goals) {
    if (goal.ownGoal) continue;
    tally.set(goal.playerId, (tally.get(goal.playerId) ?? 0) + 1);
  }

  const rows: TopScorerRow[] = [];
  for (const [playerId, goalCount] of tally.entries()) {
    const player = playerById.get(playerId);
    if (!player) continue;
    rows.push({
      playerId,
      playerName: player.name,
      teamId: player.teamId,
      teamName: player.teamName,
      goals: goalCount,
    });
  }

  return rows.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.playerName.localeCompare(b.playerName);
  });
}
