"use client";

import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Pencil, Play, Shield, Trash2, Trophy, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { PageSpinner, TableSkeleton } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeagueTable } from "@/components/tournaments/LeagueTable";
import { TopScorerTable } from "@/components/tournaments/TopScorerTable";
import { KnockoutBracket, type BracketRound } from "@/components/tournaments/KnockoutBracket";
import { MatchList, type RoundWithMatches } from "@/components/tournaments/MatchList";
import { useSession, hasRole } from "@/lib/session-context";
import type { StandingRow } from "@/lib/standings/calculate";
import type { TopScorerRow } from "@/lib/standings/topScorers";

interface TournamentDetail {
  id: string;
  name: string;
  format: "LEAGUE" | "KNOCKOUT";
  status: "DRAFT" | "ONGOING" | "COMPLETED";
  organizer: { id: string; name: string };
  teams: { id: string; seed: number | null; team: { id: string; name: string; shortName: string | null } }[];
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useSession();

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [rounds, setRounds] = useState<RoundWithMatches[] | null>(null);
  const [standings, setStandings] = useState<StandingRow[] | null>(null);
  const [bracket, setBracket] = useState<BracketRound[] | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorerRow[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = tournament && (hasRole(user, ["ADMIN"]) || tournament.organizer.id === user?.id);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${id}`);
    if (res.ok) setTournament((await res.json()).tournament);

    const fixturesRes = await fetch(`/api/tournaments/${id}/fixtures`);
    if (fixturesRes.ok) setRounds((await fixturesRes.json()).rounds);

    fetch(`/api/tournaments/${id}/top-scorers`)
      .then((r) => (r.ok ? r.json() : { topScorers: [] }))
      .then((d) => setTopScorers(d.topScorers));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!tournament) return;
    if (tournament.format === "LEAGUE") {
      fetch(`/api/tournaments/${id}/standings`)
        .then((r) => (r.ok ? r.json() : { standings: [] }))
        .then((d) => setStandings(d.standings));
    } else {
      fetch(`/api/tournaments/${id}/bracket`)
        .then((r) => (r.ok ? r.json() : { rounds: [] }))
        .then((d) => setBracket(d.rounds));
    }
  }, [tournament, id]);

  const handleGenerateFixtures = async () => {
    setActionError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/fixtures`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Could not generate fixtures");
        return;
      }
      await load();
    } finally {
      setGenerating(false);
    }
  };

  if (!tournament) return <PageSpinner />;

  const historyRounds = (rounds ?? []).map((r) => ({
    ...r,
    matches: r.matches.filter((m) => m.status === "COMPLETED"),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{tournament.name}</h1>
            <p className="text-sm text-muted">
              {tournament.format === "LEAGUE" ? "League" : "Knockout"} · Organized by {tournament.organizer.name}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button href={`/tournaments/${id}/edit`} variant="secondary">
              <Pencil size={15} />
              Edit
            </Button>
            {(rounds ?? []).length === 0 && (
              <Button onClick={handleGenerateFixtures} disabled={generating || tournament.teams.length < 2}>
                <Play size={15} />
                {generating ? "Generating…" : "Generate fixtures"}
              </Button>
            )}
          </div>
        )}
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <Tabs
        items={[
          {
            key: "fixtures",
            label: "Fixtures",
            content: rounds === null ? <Card><TableSkeleton /></Card> : <MatchList rounds={rounds} />,
          },
          {
            key: "table",
            label: tournament.format === "LEAGUE" ? "Table" : "Bracket",
            content:
              tournament.format === "LEAGUE" ? (
                <Card>{standings === null ? <TableSkeleton /> : <LeagueTable standings={standings} />}</Card>
              ) : bracket === null ? (
                <Card><TableSkeleton /></Card>
              ) : (
                <Card><CardBody><KnockoutBracket rounds={bracket} /></CardBody></Card>
              ),
          },
          {
            key: "topscorers",
            label: "Top Scorers",
            content: <Card>{topScorers === null ? <TableSkeleton /> : <TopScorerTable topScorers={topScorers} />}</Card>,
          },
          {
            key: "teams",
            label: "Teams",
            content: (
              <TeamsPanel
                tournamentId={id}
                teams={tournament.teams}
                canManage={!!isOwner && tournament.status === "DRAFT"}
                onChange={load}
              />
            ),
          },
          {
            key: "history",
            label: "History",
            content: <MatchList rounds={historyRounds} />,
          },
        ]}
      />
    </div>
  );
}

function TeamsPanel({
  tournamentId,
  teams,
  canManage,
  onChange,
}: {
  tournamentId: string;
  teams: TournamentDetail["teams"];
  canManage: boolean;
  onChange: () => void;
}) {
  const [allTeams, setAllTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) return;
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => setAllTeams(d.teams));
  }, [canManage]);

  const registeredIds = new Set(teams.map((t) => t.team.id));
  const availableTeams = allTeams.filter((t) => !registeredIds.has(t.id));

  const handleRegister = async () => {
    if (!selectedTeamId) return;
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeamId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not register team");
      return;
    }
    setSelectedTeamId("");
    onChange();
  };

  const handleWithdraw = async (teamId: string) => {
    await fetch(`/api/tournaments/${tournamentId}/teams/${teamId}`, { method: "DELETE" });
    onChange();
  };

  return (
    <Card>
      {canManage && (
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <Select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="sm:max-w-xs">
            <option value="">Select a team to register…</option>
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Button onClick={handleRegister} disabled={!selectedTeamId}>
            <Users size={15} />
            Register team
          </Button>
        </div>
      )}
      {error && <p className="px-4 pt-3 text-sm text-red-600">{error}</p>}
      {teams.length === 0 ? (
        <EmptyState icon={Shield} title="No teams registered" description="Register teams before generating fixtures." />
      ) : (
        <ul className="divide-y divide-border">
          {teams.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/teams/${entry.team.id}`} className="font-medium text-foreground hover:text-brand">
                {entry.team.name}
              </Link>
              {canManage && (
                <button onClick={() => handleWithdraw(entry.team.id)} className="text-muted hover:text-red-600" aria-label="Withdraw team">
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
