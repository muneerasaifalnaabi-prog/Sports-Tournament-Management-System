import { describe, it, expect } from "vitest";
import { buildKnockoutBracket, nextPowerOfTwo, seedPositions } from "@/lib/fixtures/knockout";

describe("nextPowerOfTwo", () => {
  it("returns the smallest power of two >= n", () => {
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(2)).toBe(2);
    expect(nextPowerOfTwo(3)).toBe(4);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(8)).toBe(8);
    expect(nextPowerOfTwo(9)).toBe(16);
  });
});

describe("seedPositions", () => {
  it("produces the standard seeding order avoiding early top-seed clashes", () => {
    expect(seedPositions(2)).toEqual([1, 2]);
    expect(seedPositions(4)).toEqual([1, 4, 2, 3]);
    expect(seedPositions(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
});

describe("buildKnockoutBracket", () => {
  it("builds a full bracket shape for a power-of-two team count", () => {
    const teams = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rounds = buildKnockoutBracket(teams);
    expect(rounds.map((r) => r.matches.length)).toEqual([4, 2, 1]);
    expect(rounds[0].name).toBe("Quarterfinal");
    expect(rounds[1].name).toBe("Semifinal");
    expect(rounds[2].name).toBe("Final");
    // no round beyond round 1 should be pre-decided
    rounds.slice(1).forEach((r) => r.matches.forEach((m) => expect(m.status).toBe("SCHEDULED")));
  });

  it("gives byes to the top seeds for a non-power-of-two count", () => {
    const teams = ["S1", "S2", "S3", "S4", "S5"]; // bracket size 8, 3 byes
    const rounds = buildKnockoutBracket(teams);
    const round1 = rounds[0];
    expect(round1.matches).toHaveLength(4);

    const byeMatches = round1.matches.filter((m) => m.status === "COMPLETED");
    expect(byeMatches).toHaveLength(3);
    const byeWinners = byeMatches.map((m) => m.winnerTeamId).sort();
    expect(byeWinners).toEqual(["S1", "S2", "S3"].sort());
  });

  it("propagates bye winners into round 2 slots", () => {
    const teams = ["S1", "S2", "S3", "S4", "S5"];
    const rounds = buildKnockoutBracket(teams);
    const round2 = rounds[1];
    const allSlottedTeams = round2.matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
    expect(allSlottedTeams).toContain("S1");
    expect(allSlottedTeams).toContain("S2");
    expect(allSlottedTeams).toContain("S3");
  });

  it("simulates advancing every match and ends with exactly one final", () => {
    const teams = Array.from({ length: 6 }, (_, i) => `T${i + 1}`);
    const rounds = buildKnockoutBracket(teams);
    expect(rounds[rounds.length - 1].matches).toHaveLength(1);
    // total real (non-bye, non-auto-completed) matches for 6 teams should be 5 (n-1)
    const playedMatches = rounds
      .flatMap((r) => r.matches)
      .filter((m) => m.status === "SCHEDULED").length;
    expect(playedMatches).toBe(teams.length - 1);
  });

  it("returns an empty bracket for fewer than 2 teams", () => {
    expect(buildKnockoutBracket([])).toEqual([]);
    expect(buildKnockoutBracket(["A"])).toEqual([]);
  });
});
