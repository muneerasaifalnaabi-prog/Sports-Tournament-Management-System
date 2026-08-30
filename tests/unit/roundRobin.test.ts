import { describe, it, expect } from "vitest";
import { generateRoundRobin } from "@/lib/fixtures/roundRobin";

describe("generateRoundRobin", () => {
  it("produces N-1 rounds for an even number of teams, each with N/2 matches", () => {
    const teams = ["A", "B", "C", "D"];
    const rounds = generateRoundRobin(teams);
    expect(rounds).toHaveLength(3);
    rounds.forEach((r) => expect(r.pairings).toHaveLength(2));
  });

  it("handles an odd number of teams via a bye, giving one fewer match per round", () => {
    const teams = ["A", "B", "C"];
    const rounds = generateRoundRobin(teams);
    expect(rounds).toHaveLength(3);
    rounds.forEach((r) => expect(r.pairings.length).toBeLessThanOrEqual(1));
  });

  it("never pairs a team against itself", () => {
    const teams = ["A", "B", "C", "D", "E"];
    const rounds = generateRoundRobin(teams);
    for (const round of rounds) {
      for (const p of round.pairings) {
        expect(p.homeTeamId).not.toBe(p.awayTeamId);
      }
    }
  });

  it("has every team play every other team exactly once (single round robin)", () => {
    const teams = ["A", "B", "C", "D"];
    const rounds = generateRoundRobin(teams);
    const seenPairs = new Set<string>();
    for (const round of rounds) {
      for (const p of round.pairings) {
        const key = [p.homeTeamId, p.awayTeamId].sort().join("-");
        expect(seenPairs.has(key)).toBe(false);
        seenPairs.add(key);
      }
    }
    // 4 teams -> C(4,2) = 6 unique pairings
    expect(seenPairs.size).toBe(6);
  });

  it("doubles fixtures and reverses home/away for doubleRoundRobin", () => {
    const teams = ["A", "B", "C", "D"];
    const single = generateRoundRobin(teams);
    const double = generateRoundRobin(teams, { doubleRoundRobin: true });
    expect(double).toHaveLength(single.length * 2);

    const secondLegFirstPairing = double[single.length].pairings[0];
    const firstLegFirstPairing = single[0].pairings[0];
    expect(secondLegFirstPairing.homeTeamId).toBe(firstLegFirstPairing.awayTeamId);
    expect(secondLegFirstPairing.awayTeamId).toBe(firstLegFirstPairing.homeTeamId);
  });

  it("returns an empty schedule for fewer than 2 teams", () => {
    expect(generateRoundRobin([])).toEqual([]);
    expect(generateRoundRobin(["A"])).toEqual([]);
  });

  it("balances home and away appearances reasonably", () => {
    const teams = ["A", "B", "C", "D", "E", "F"];
    const rounds = generateRoundRobin(teams);
    const homeCount = new Map<string, number>();
    for (const round of rounds) {
      for (const p of round.pairings) {
        homeCount.set(p.homeTeamId, (homeCount.get(p.homeTeamId) ?? 0) + 1);
      }
    }
    for (const count of homeCount.values()) {
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(4);
    }
  });
});
