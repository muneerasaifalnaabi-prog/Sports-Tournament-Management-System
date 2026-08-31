"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";

export interface MatchResultFormPlayer {
  id: string;
  name: string;
  teamId: string;
}

export interface MatchResultFormValues {
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  goals: { playerId: string; minute?: number | null; ownGoal: boolean }[];
}

interface MatchResultFormProps {
  homeTeamName: string;
  awayTeamName: string;
  players: MatchResultFormPlayer[];
  isKnockout: boolean;
  canSubmit: boolean;
  initial?: Partial<MatchResultFormValues>;
  onSubmit: (values: MatchResultFormValues) => Promise<void>;
}

export function MatchResultForm({
  homeTeamName,
  awayTeamName,
  players,
  isKnockout,
  canSubmit,
  initial,
  onSubmit,
}: MatchResultFormProps) {
  const [homeScore, setHomeScore] = useState(initial?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(initial?.awayScore ?? 0);
  const [homePenalty, setHomePenalty] = useState(initial?.homePenaltyScore ?? "");
  const [awayPenalty, setAwayPenalty] = useState(initial?.awayPenaltyScore ?? "");
  const [goals, setGoals] = useState<MatchResultFormValues["goals"]>(initial?.goals ?? []);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isDraw = homeScore === awayScore;
  const needsPenalties = isKnockout && isDraw;

  const addGoal = () => {
    if (!players[0]) return;
    setGoals([...goals, { playerId: players[0].id, minute: null, ownGoal: false }]);
  };

  const updateGoal = (idx: number, patch: Partial<MatchResultFormValues["goals"][number]>) => {
    setGoals(goals.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const removeGoal = (idx: number) => setGoals(goals.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsPenalties) {
      const hp = Number(homePenalty);
      const ap = Number(awayPenalty);
      if (homePenalty === "" || awayPenalty === "" || hp === ap) {
        setError("Knockout matches can't end in a draw — enter a decisive penalty shootout score.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        homeScore,
        awayScore,
        homePenaltyScore: needsPenalties ? Number(homePenalty) : null,
        awayPenaltyScore: needsPenalties ? Number(awayPenalty) : null,
        goals,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!canSubmit) {
    return (
      <p className="text-sm text-muted">
        Only the organizer or assigned referee can record this result.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="homeScore">{homeTeamName}</Label>
          <Input
            id="homeScore"
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="awayScore">{awayTeamName}</Label>
          <Input
            id="awayScore"
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
          />
        </div>
      </div>

      {needsPenalties && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-brand/30 bg-brand-light p-3">
          <div>
            <Label htmlFor="homePenalty">Penalties — {homeTeamName}</Label>
            <Input
              id="homePenalty"
              type="number"
              min={0}
              value={homePenalty}
              onChange={(e) => setHomePenalty(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="awayPenalty">Penalties — {awayTeamName}</Label>
            <Input
              id="awayPenalty"
              type="number"
              min={0}
              value={awayPenalty}
              onChange={(e) => setAwayPenalty(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Goal scorers</Label>
          <button
            type="button"
            onClick={addGoal}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <Plus size={13} />
            Add goal
          </button>
        </div>
        <div className="space-y-2">
          {goals.map((goal, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2">
              <Select
                value={goal.playerId}
                onChange={(e) => updateGoal(idx, { playerId: e.target.value })}
                className="w-40"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min={0}
                max={200}
                placeholder="Min"
                value={goal.minute ?? ""}
                onChange={(e) =>
                  updateGoal(idx, { minute: e.target.value ? Number(e.target.value) : null })
                }
                className="w-20"
              />
              <label className="flex items-center gap-1 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={goal.ownGoal}
                  onChange={(e) => updateGoal(idx, { ownGoal: e.target.checked })}
                />
                Own goal
              </label>
              <button
                type="button"
                onClick={() => removeGoal(idx)}
                className="text-muted hover:text-red-400"
                aria-label="Remove goal"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <FieldError message={error ?? undefined} />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save result"}
      </Button>
    </form>
  );
}
