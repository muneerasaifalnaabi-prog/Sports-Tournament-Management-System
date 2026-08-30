import { describe, it, expect } from "vitest";
import { calculateStandings } from "@/lib/standings/calculate";

const teams = [
  { id: "t1", name: "Alpha" },
  { id: "t2", name: "Bravo" },
  { id: "t3", name: "Charlie" },
];

const config = { pointsWin: 3, pointsDraw: 1, pointsLoss: 0 };

describe("calculateStandings", () => {
  it("awards win/draw/loss points correctly", () => {
    const matches = [
      { status: "COMPLETED", homeTeamId: "t1", awayTeamId: "t2", homeScore: 2, awayScore: 1 },
      { status: "COMPLETED", homeTeamId: "t2", awayTeamId: "t3", homeScore: 1, awayScore: 1 },
    ];
    const rows = calculateStandings(teams, matches, config);
    const t1 = rows.find((r) => r.teamId === "t1")!;
    const t2 = rows.find((r) => r.teamId === "t2")!;
    const t3 = rows.find((r) => r.teamId === "t3")!;

    expect(t1.points).toBe(3);
    expect(t1.wins).toBe(1);
    expect(t2.points).toBe(1);
    expect(t2.draws).toBe(1);
    expect(t2.losses).toBe(1);
    expect(t3.points).toBe(1);
  });

  it("ignores unplayed matches", () => {
    const matches = [
      { status: "SCHEDULED", homeTeamId: "t1", awayTeamId: "t2", homeScore: null, awayScore: null },
    ];
    const rows = calculateStandings(teams, matches, config);
    rows.forEach((r) => expect(r.played).toBe(0));
  });

  it("breaks ties by goal difference then goals for then name", () => {
    const matches = [
      { status: "COMPLETED", homeTeamId: "t1", awayTeamId: "t2", homeScore: 3, awayScore: 0 },
      { status: "COMPLETED", homeTeamId: "t3", awayTeamId: "t2", homeScore: 2, awayScore: 0 },
    ];
    const rows = calculateStandings(teams, matches, config);
    // t1 and t3 both have 3 points, t1 has better GD (+3 vs +2)
    expect(rows[0].teamId).toBe("t1");
    expect(rows[1].teamId).toBe("t3");
  });

  it("respects configurable point values", () => {
    const matches = [
      { status: "COMPLETED", homeTeamId: "t1", awayTeamId: "t2", homeScore: 1, awayScore: 0 },
    ];
    const rows = calculateStandings(teams, matches, { pointsWin: 2, pointsDraw: 1, pointsLoss: 0 });
    expect(rows.find((r) => r.teamId === "t1")!.points).toBe(2);
  });
});
