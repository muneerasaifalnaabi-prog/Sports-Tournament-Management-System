import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeagueTable } from "@/components/tournaments/LeagueTable";
import type { StandingRow } from "@/lib/standings/calculate";

const standings: StandingRow[] = [
  {
    teamId: "t1",
    teamName: "Alpha",
    played: 3,
    wins: 2,
    draws: 1,
    losses: 0,
    goalsFor: 5,
    goalsAgainst: 2,
    goalDifference: 3,
    points: 7,
  },
  {
    teamId: "t2",
    teamName: "Bravo",
    played: 3,
    wins: 1,
    draws: 0,
    losses: 2,
    goalsFor: 2,
    goalsAgainst: 4,
    goalDifference: -2,
    points: 3,
  },
];

describe("LeagueTable", () => {
  it("renders standings rows with correct data", () => {
    render(<LeagueTable standings={standings} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("shows an empty state when there are no standings", () => {
    render(<LeagueTable standings={[]} />);
    expect(screen.getByText("No standings yet")).toBeInTheDocument();
  });
});
