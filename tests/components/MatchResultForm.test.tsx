import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchResultForm } from "@/components/forms/MatchResultForm";

const players = [
  { id: "p1", name: "Home Scorer", teamId: "home" },
  { id: "p2", name: "Away Scorer", teamId: "away" },
];

describe("MatchResultForm", () => {
  it("blocks unauthorized users from seeing the score inputs", () => {
    render(
      <MatchResultForm
        homeTeamName="Home"
        awayTeamName="Away"
        players={players}
        isKnockout={false}
        canSubmit={false}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText(/only the organizer or assigned referee/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Home")).not.toBeInTheDocument();
  });

  it("requires a decisive penalty score for a knockout draw before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MatchResultForm
        homeTeamName="Home"
        awayTeamName="Away"
        players={players}
        isKnockout
        canSubmit
        initial={{ homeScore: 1, awayScore: 1 }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save result/i }));

    expect(screen.getByText(/can't end in a draw/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the entered scores for a league match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <MatchResultForm
        homeTeamName="Home"
        awayTeamName="Away"
        players={players}
        isKnockout={false}
        canSubmit
        initial={{ homeScore: 0, awayScore: 0 }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save result/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ homeScore: 0, awayScore: 0, goals: [] }),
    );
  });
});
