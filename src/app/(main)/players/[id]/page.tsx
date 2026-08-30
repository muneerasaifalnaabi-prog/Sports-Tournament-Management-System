"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Target, UserRound } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

interface PlayerDetail {
  id: string;
  name: string;
  jerseyNo: number | null;
  position: string | null;
  team: { id: string; name: string };
  goals: { id: string; ownGoal: boolean; match: { id: string; tournamentId: string } }[];
}

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [player, setPlayer] = useState<PlayerDetail | null>(null);

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((r) => r.json())
      .then((d) => setPlayer(d.player));
  }, [id]);

  if (!player) return <PageSpinner />;

  const scored = player.goals.filter((g) => !g.ownGoal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
          <UserRound size={20} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{player.name}</h1>
          <p className="text-sm text-muted">
            <Link href={`/teams/${player.team.id}`} className="hover:text-brand">
              {player.team.name}
            </Link>
            {player.position && ` · ${player.position}`}
            {player.jerseyNo !== null && ` · #${player.jerseyNo}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Goals scored" value={scored.length} icon={Target} accent="green" />
        <StatCard label="Matches with a goal" value={new Set(scored.map((g) => g.match.id)).size} icon={Target} accent="brand" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal history</CardTitle>
        </CardHeader>
        {player.goals.length === 0 ? (
          <EmptyState icon={Target} title="No goals recorded yet" />
        ) : (
          <ul className="divide-y divide-border">
            {player.goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <Link href={`/matches/${g.match.id}`} className="font-medium text-foreground hover:text-brand">
                  View match
                </Link>
                {g.ownGoal && <span className="text-xs text-muted">Own goal</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
