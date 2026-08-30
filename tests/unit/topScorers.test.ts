import { describe, it, expect } from "vitest";
import { calculateTopScorers } from "@/lib/standings/topScorers";

const players = [
  { id: "p1", name: "Zed", teamId: "t1", teamName: "Alpha" },
  { id: "p2", name: "Amy", teamId: "t2", teamName: "Bravo" },
  { id: "p3", name: "Bo", teamId: "t2", teamName: "Bravo" },
];

describe("calculateTopScorers", () => {
  it("aggregates goals per player and sorts by count desc", () => {
    const goals = [
      { playerId: "p1", ownGoal: false },
      { playerId: "p1", ownGoal: false },
      { playerId: "p2", ownGoal: false },
    ];
    const rows = calculateTopScorers(goals, players);
    expect(rows[0]).toMatchObject({ playerId: "p1", goals: 2 });
    expect(rows[1]).toMatchObject({ playerId: "p2", goals: 1 });
  });

  it("excludes own goals from the scorer's personal tally", () => {
    const goals = [
      { playerId: "p1", ownGoal: true },
      { playerId: "p2", ownGoal: false },
    ];
    const rows = calculateTopScorers(goals, players);
    expect(rows.find((r) => r.playerId === "p1")).toBeUndefined();
    expect(rows.find((r) => r.playerId === "p2")?.goals).toBe(1);
  });

  it("breaks ties by player name ascending", () => {
    const goals = [
      { playerId: "p2", ownGoal: false },
      { playerId: "p3", ownGoal: false },
    ];
    const rows = calculateTopScorers(goals, players);
    expect(rows.map((r) => r.playerName)).toEqual(["Amy", "Bo"]);
  });

  it("returns an empty list when there are no goals", () => {
    expect(calculateTopScorers([], players)).toEqual([]);
  });
});
